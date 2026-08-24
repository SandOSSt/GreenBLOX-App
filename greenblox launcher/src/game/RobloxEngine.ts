// GreenBlox engine — Roblox-style third person controller.
// Camera: orbit with RIGHT-MOUSE drag (no pointer lock needed).
// Movement: WASD always works, direction relative to camera.
// Jump: Space. Gravity + AABB collision.

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Avatar, DEFAULT_AVATAR, AvatarColors } from "./Avatar";
import { Part, GameStats, MATERIAL_PROPS, PartMaterial } from "./types";
import { buildObby, shapeGeometry, BuiltWorld } from "./WorldBuilder";
import { RemotePlayers } from "./RemotePlayers";
import { SpatialGrid } from "./SpatialGrid";

export interface EngineCallbacks {
  onStats: (s: GameStats) => void;
  onCheckpoint: (stage: number) => void;
  onCoin: (total: number) => void;
  onDeath: () => void;
  onWin: () => void;
  onLocked: (locked: boolean) => void;
}

export interface SceneSettings {
  skyColor?: string;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  voidLevel?: number;
}

interface BuildState {
  active: boolean;
  color: number;
  material: PartMaterial;
}

// Pre-compute AABB for each part so we don't clone() every frame.
interface CachedAABB { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number; }

// The raycast hit "face" carries just what the camera/build ghost needs —
// declared locally because the legacy THREE.Face type was removed from three.
interface RayHitFaceLike {
  a: number;
  b: number;
  c: number;
  normal: THREE.Vector3;
  materialIndex: number;
}

/** Shared result of an AABB raycast (one reusable object, zero allocations). */
interface RayHitResult {
  distance: number;
  point: THREE.Vector3;
  face: RayHitFaceLike | null;
  object: THREE.Object3D;
}

/** Tiny WebAudio synth for gameplay SFX (coin ping, death, checkpoint, win) — no external assets. */
export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;
  volume = 0.8;

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Coin pickup — bright short ping. */
  coin() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1320, t);
    osc.frequency.setValueAtTime(1760, t + 0.06);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.32 * this.volume, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  /** Death / fall into the void — descending buzz. */
  death() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.28);
    gain.gain.setValueAtTime(0.18 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  /** Checkpoint flag — quick two-note chime. */
  checkpoint() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const [freq, at] of [[660, 0], [880, 0.09]] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + at);
      gain.gain.setValueAtTime(0.0001, t + at);
      gain.gain.exponentialRampToValueAtTime(0.24 * this.volume, t + at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + at);
      osc.stop(t + at + 0.2);
    }
  }

  /** Win fanfare — rising arpeggio. */
  win() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const at = t + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.26 * this.volume, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.32);
    });
  }

  dispose() {
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export class RobloxEngine {
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  container: HTMLElement;
  cb: EngineCallbacks;

  avatar: Avatar;
  world: BuiltWorld;
  parts: Part[] = [];
  aabbs: CachedAABB[] = []; // parallel to parts
  /** Parallel to parts: the individual mesh for animated parts (coins), else
   *  null. Static parts are merged into `batchGroup` and have no per-part
   *  mesh — that is what turns thousands of Studio parts into a handful of
   *  draw calls instead of one per part (the #1 slideshow cause). */
  meshRefs: (THREE.Mesh | null)[] = [];
  /** Animated coin meshes (spin + bob) — kept out of the static batch. */
  partGroup = new THREE.Group();
  /** Merged static world geometry: one mesh per (shape, material, color). */
  batchGroup = new THREE.Group();
  /** The actual merged meshes (cast shadows, receive shadows, raycast targets). */
  private batchMeshes: THREE.Mesh[] = [];
  /** Player-built parts (runtime placement) — rendered individually. */
  buildGroup = new THREE.Group();
  /** Coin meshes + their bob data — animation iterates ONLY these instead of
   *  scanning the full part list every frame (O(all parts) → O(coins)). */
  private coinMeshes: THREE.Mesh[] = [];
  private coinBaseYs: number[] = [];
  private coinIds: number[] = [];

  // Multiplayer: remote players rendered in the shared scene.
  remotePlayers: RemotePlayers;

  // Player physics
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  grounded = false;
  facing = 0;

  // Camera (current values are smoothed; *Target are raw mouse targets)
  camYaw = 0;
  camPitch = 0.3;
  camDist = 10;
  rightDown = false; // is right mouse held

  // User-facing settings, tunable live from the in-game menu.
  cameraSensitivity = 0.0018;
  pixelRatioCap = 1.5;
  cloudsVisible = true;
  /** Adaptive quality dropped to low when the machine can't hold ~40 FPS. */
  private qualityDropped = false;
  private qualityFrames = 0;
  private qualityTime = 0;
  /** Low-end heuristic (weak laptop / Edge with integrated GPU / low RAM). */
  private lowEnd: boolean;


  /** Freeze gameplay+motion while a UI overlay (menu/chat) is open. */
  paused = false;

  // Sound
  sfx = new Sfx();

  // Input
  keys = new Set<string>();

  // Time (performance.now-based to avoid deprecated THREE.Clock in r184+)
  private lastFrameTime = 0;
  fpsAcc = 0; fpsFrames = 0; fpsValue = 0;
  elapsed = 0;
  statsAcc = 0;

  // Gameplay
  stage = 0;
  coins = 0;
  collectedCoins = new Set<number>();
  deaths = 0;
  won = false;

  // Build mode
  build: BuildState = { active: false, color: 0xc4281c, material: "plastic" };
  ghostMesh: THREE.Mesh;
  raycaster = new THREE.Raycaster();
  buildSize = new THREE.Vector3(4, 1, 4);

  // Player dimensions
  playerRadius = 0.45;
  playerHeight = 2.4;

  /** Part the player is currently standing on (feet contact) — drives ice/surface feel. */
  groundPart: Part | null = null;

  // Coyote time + jump buffering (modern Roblox obby feel).
  //   Coyote: after walking off a ledge the player may still jump for
  //   COYOTE_TIME seconds — forgiving edge falls.
  //   Buffer: pressing Space up to JUMP_BUFFER seconds BEFORE landing queues
  //   the jump, so it fires the instant the feet touch ground.
  private static readonly COYOTE_TIME = 0.12;   // seconds after leaving ground
  private static readonly JUMP_BUFFER = 0.12;   // seconds a jump press is remembered
  /** Sprint multiplier applied to walk speed while Shift is held. */
  private static readonly SPRINT_MULT = 1.45;
  private coyoteTime = 0;
  private jumpBuffer = 0;

  /** Spatial hash grid — keeps physics/zone/camera queries O(region) instead of
   *  O(all parts), which matters most in big Studio worlds (thousands of parts). */
  private spatialGrid = new SpatialGrid(8);
  /** Reusable query scratch buffers (filled by the grid, zero per-frame allocs). */
  private queryBuf: number[] = [];
  /** Reusable end-point vector for the AABB camera/build raycast (zero allocs). */
  private rayEnd = new THREE.Vector3();
  /** Shared hit-result buffers — the camera/build raycast returns these without
   *  allocating vectors every frame. updateGhost clones its point before using
   *  it, so reusing the same objects across frames is safe. */
  private rayHitPoint = new THREE.Vector3();
  private rayHitNormal = new THREE.Vector3();
  private rayHitFace: RayHitFaceLike = { a: 0, b: 0, c: 0, normal: this.rayHitNormal, materialIndex: 0 };
  private rayHitTarget = new THREE.Group();
  /** Shared materials: one MeshStandardMaterial per (material, color, texture)
   *  triplet instead of one per part — thousands of parts were creating
   *  thousands of program switches per frame (a big GPU stall on Studio
   *  worlds). Texture URLs are part of the key so parts that use different
   *  Studio textures never share a material. */
  private materialCache = new Map<string, THREE.MeshStandardMaterial>();
  /** Texture loader + URL cache: one texture per (data: or path) URL, shared
   *  by every part/material that uses it — loaded and GPU-resident once. */
  private textureLoader = new THREE.TextureLoader();
  private textureCache = new Map<string, THREE.Texture>();

  settings: SceneSettings = {};

  constructor(
    container: HTMLElement,
    cb: EngineCallbacks,
    colors: AvatarColors = DEFAULT_AVATAR,
    customWorld?: BuiltWorld,
    settings?: SceneSettings
  ) {
    this.container = container;
    this.cb = cb;
    this.settings = settings ?? this.settings;

    const sky = new THREE.Color(settings?.skyColor ?? 0x87ceeb);
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(
      settings?.fogColor ?? 0x87ceeb,
      settings?.fogNear ?? 80,
      settings?.fogFar ?? 250
    );

    // Rough low-end detection (same heuristic as Studio): few cores or low RAM
    // budget → default renderer without MSAA and with pixelRatio 1. Weak
    // laptops (especially with Edge and HiDPI screens) were running 4K
    // supersampling + antialiasing for no visible gain — a huge FPS hit.
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const cores = nav?.hardwareConcurrency ?? 8;
    const mem = (nav as unknown as { deviceMemory?: number })?.deviceMemory ?? 8;
    this.lowEnd = cores <= 4 || mem <= 4;

    this.camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 600);
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.lowEnd,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio, this.pixelRatioCap);
    this.renderer.setPixelRatio(this.lowEnd ? Math.min(dpr, 1) : dpr);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.lowEnd ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // Lighting — half-res shadow map on low-end machines (2048→1024 halves
    // the directional shadow render cost, the biggest fixed cost per frame).
    const shadowSize = this.lowEnd ? 1024 : 2048;
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(40, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(shadowSize, shadowSize);

    const sc = sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80;
    sc.near = 1; sc.far = 300;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);
    this.scene.add(new THREE.HemisphereLight(0xcfeeff, 0x6a7d52, 0.8));

    this.addClouds();

    // Build world
    this.world = customWorld ?? buildObby();
    this.parts = this.world.parts;
    this.rebuildAABBs();
    this.buildPartMeshes();
    this.flushStaticBatch();
    this.scene.add(this.partGroup);
    this.scene.add(this.batchGroup);
    this.scene.add(this.buildGroup);

    // Avatar
    this.avatar = new Avatar(colors);
    this.scene.add(this.avatar.group);
    this.pos.copy(this.world.spawnPos);

    // Remote players (multiplayer)
    this.remotePlayers = new RemotePlayers(this.scene);

    // Build ghost
    const ghostGeo = new THREE.BoxGeometry(1, 1, 1);
    const ghostMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false });
    this.ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
    this.ghostMesh.visible = false;
    this.scene.add(this.ghostMesh);

    this.attach();
    this.start();
  }

  // --- AABB cache ---
  private rebuildAABBs() {
    this.aabbs = this.parts.map(p => {
      const hx = p.size.x / 2, hy = p.size.y / 2, hz = p.size.z / 2;
      return {
        minX: p.pos.x - hx, minY: p.pos.y - hy, minZ: p.pos.z - hz,
        maxX: p.pos.x + hx, maxY: p.pos.y + hy, maxZ: p.pos.z + hz,
      };
    });
    this.spatialGrid.rebuild(this.aabbs);
  }

  // List of cloud meshes to animate (drift) in the game loop.
  private cloudMeshes: THREE.Group[] = [];

  private addClouds() {
    // We create realistic, volumetric, fluffy 3D clouds made of merged flattened spheres.
    // They look exactly like Roblox Classic clouds, placed high up in the sky (Y = 55).
    const cloudCount = 12;
    const cloudColor = 0xffffff;

    // Shared simple materials for volumetric clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      color: cloudColor,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.82,
      depthWrite: false, // Prevents ugly transparency clipping borders
    });

    const sphereGeo = new THREE.SphereGeometry(1, 10, 8);

    for (let i = 0; i < cloudCount; i++) {
      const cloudGroup = new THREE.Group();

      // Each cloud is a cluster of 4-6 overlapping squashed spheres
      const bubbleCount = 4 + Math.floor(Math.random() * 3);
      for (let b = 0; b < bubbleCount; b++) {
        const bubble = new THREE.Mesh(sphereGeo, cloudMat);

        // Random local offset within the cloud cluster
        const lx = (Math.random() - 0.5) * 8;
        const ly = (Math.random() - 0.5) * 1.5;
        const lz = (Math.random() - 0.5) * 6;
        bubble.position.set(lx, ly, lz);

        // Squash the spheres vertically to make them flat-bottomed
        const sx = 4 + Math.random() * 6;
        const sy = 2 + Math.random() * 2;
        const sz = 4 + Math.random() * 6;
        bubble.scale.set(sx, sy, sz);

        cloudGroup.add(bubble);
      }

      // Position the cloud cluster high in the sky
      const cx = (Math.random() - 0.5) * 400;
      const cy = 52 + Math.random() * 8; // high up in the air
      const cz = (Math.random() - 0.5) * 400;
      cloudGroup.position.set(cx, cy, cz);

      this.scene.add(cloudGroup);
      this.cloudMeshes.push(cloudGroup);
    }
  }

  /**
   * Quantize a color to a coarse 4-bit-per-channel grid (step 0x40, ≤64
   * variants). Studio worlds commonly carry THOUSANDS of near-unique hex
   * colors; without quantization every unique color becomes its own merged
   * mesh = its own draw call (plus shadow passes) — a slideshow on weak
   * laptops / Edge even with texture batching. On blocky Roblox-style geometry
   * the ≤12.5% per-channel shift is visually negligible, but it collapses
   * 1000s of colors into a handful of material variants.
   */
  private static quantizeColor(color: number): number {
    const q = (c: number) => Math.min(255, Math.round(c / 0x40) * 0x40);
    return (q((color >> 16) & 0xff) << 16) | (q((color >> 8) & 0xff) << 8) | q(color & 0xff);
  }

  /** Load a Studio texture (data: URL or path) once per URL — shared by every
   *  part/material that uses it, exactly like the Studio renderer. */
  private loadTexture(url: string | undefined): THREE.Texture | null {
    if (!url) return null;
    const cached = this.textureCache.get(url);
    if (cached) return cached;
    try {
      const texture = this.textureLoader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = this.renderer?.capabilities.getMaxAnisotropy() || 4;
      texture.needsUpdate = true;
      this.textureCache.set(url, texture);
      return texture;
    } catch {
      return null;
    }
  }

  private materialFor(part: Part): THREE.Material {
    const props = MATERIAL_PROPS[part.material];
    const color = RobloxEngine.quantizeColor(part.color);
    const key = `${part.material}:${color.toString(16)}:${part.textureUrl || ""}:${part.normalMapUrl || ""}`;
    const cached = this.materialCache.get(key);
    if (cached) return cached;
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: props.roughness,
      metalness: props.metalness,
      emissive: props.emissive > 0 ? color : 0x000000,
      emissiveIntensity: props.emissive,
    });

    // Studio textures: diffuse map + normal map. When a texture is set it is
    // rendered instead of the flat color (the color tints the texture).
    const map = this.loadTexture(part.textureUrl);
    if (map) {
      mat.map = map;
      // A low emissive neon + a texture would wash the texture out — keep the
      // emissive tint only for untextured parts.
      if (props.emissive > 0) {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
    const normalMap = this.loadTexture(part.normalMapUrl);
    if (normalMap) {
      mat.normalMap = normalMap;
      mat.normalScale = new THREE.Vector2(1, 1);
    }

    this.materialCache.set(key, mat);
    return mat;
  }

  private buildPartMeshes() {
    this.meshRefs = new Array(this.parts.length).fill(null);
    for (let i = 0; i < this.parts.length; i++) {
      const part = this.parts[i];
      // Animated coins keep an individual mesh (spin + bob); everything else
      // is static and gets merged into the batch below.
      if (part.kind === "coin") {
        const geo = shapeGeometry(part.shape, part.size);
        const mat = this.materialFor(part);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(part.pos);
        if (part.shape === "cylinder") mesh.rotation.x = Math.PI / 2;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        part.mesh = mesh;
        this.meshRefs[i] = mesh;
        this.partGroup.add(mesh);
        this.coinMeshes.push(mesh);
        this.coinBaseYs.push((part.meta?.baseY as number) ?? part.pos.y);
        this.coinIds.push(part.id);
      }
    }
  }

  /** Размер пространственного региона для батчинга (мировые единицы). Части
   *  группируются в merged-меши ПО РЕГИОНАМ, а не по всему миру: merged-меш
   *  всего мира лишает three.js возможности фрустум-куллинга — GPU рисует
   *  ВСЕ части мира даже когда камера смотрит в одну сторону (главный лаг
   *  больших студийных миров). С регионами ~80 юнитов невидимые области
   *  мира отсекаются целиком, а draw calls остаются низкими. */
  private static readonly BATCH_REGION = 80;

  /**
   * Merge every static part into one mesh per (shape, material, color, region).
   * Before: N parts = N meshes = N draw calls. After: N parts = a handful of
   * merged meshes. This is the single biggest rendering win for Studio worlds
   * with thousands of parts (they were a slideshow on low-end machines even
   * with the SpatialGrid + material cache). Colors are quantized (see
   * quantizeColor) so Studio worlds with thousands of near-unique hex colors
   * collapse into ≤64 color variants instead of one draw call per color.
   */
  private flushStaticBatch() {
    // Clear old batches (keeps re-flush idempotent).
    for (const m of this.batchMeshes) {
      this.batchGroup.remove(m);
      m.geometry.dispose();
    }
    this.batchMeshes = [];

    const REGION = RobloxEngine.BATCH_REGION;
    const groups = new Map<string, { mat: THREE.Material; geos: THREE.BufferGeometry[] }>();
    for (let i = 0; i < this.parts.length; i++) {
      const part = this.parts[i];
      if (part.kind === "coin" || !part.collidable) continue;
      // Region index computed from the part center → each merged mesh covers a
      // bounded ~80×80 world area, so THREE's frustum culler can skip whole
      // regions that are off-screen.
      const rx = Math.floor(part.pos.x / REGION);
      const rz = Math.floor(part.pos.z / REGION);
      const key = `${rx}:${rz}:${part.shape}:${part.material}:${RobloxEngine.quantizeColor(part.color).toString(16)}:${part.kind}:${part.textureUrl || ""}:${part.normalMapUrl || ""}`;
      let g = groups.get(key);
      if (!g) {
        g = { mat: this.materialFor(part), geos: [] };
        groups.set(key, g);
      }
      if (part.shape === "cylinder") {
        // Coin-like decorative cylinders spin as a group; standalone static
        // cylinders keep their original Z-up orientation.
        const geo = shapeGeometry(part.shape, part.size);
        geo.rotateX(Math.PI / 2);
        if (part.rotation) {
          const rotMat = new THREE.Matrix4().makeRotationFromEuler(part.rotation);
          geo.applyMatrix4(rotMat);
        }
        geo.translate(part.pos.x, part.pos.y, part.pos.z);
        g.geos.push(geo);
      } else {
        const geo = shapeGeometry(part.shape, part.size);
        if (part.rotation) {
          const rotMat = new THREE.Matrix4().makeRotationFromEuler(part.rotation);
          geo.applyMatrix4(rotMat);
        }
        geo.translate(part.pos.x, part.pos.y, part.pos.z);
        g.geos.push(geo);
      }
    }

    for (const g of groups.values()) {
      if (g.geos.length === 0) continue;
      const merged = mergeGeometries(g.geos);
      // Source geometries are consumed by mergeGeometries — dispose leftovers.
      for (const geo of g.geos) geo.dispose();
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, g.mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.batchGroup.add(mesh);
      this.batchMeshes.push(mesh);
    }
  }

  // =========== INPUT (Roblox-style) ===========
  // Camera rotates ONLY while right mouse is held (no pointer lock).
  // WASD always moves the character. Space always jumps.

  private onContextMenu = (e: MouseEvent) => e.preventDefault();

  private attach() {
    const el = this.renderer.domElement;
    el.addEventListener("mousedown", this.onMouseDown);
    el.addEventListener("contextmenu", this.onContextMenu);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("blur", this.onBlur);
    el.addEventListener("wheel", this.onWheel, { passive: true });
    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
    if (e.code === "KeyB") this.toggleBuild();
    if (e.code === "KeyR") this.respawn(false);
    // Jump input buffer: remember the press even when airborne so it fires the
    // instant the feet touch ground (modern Roblox obbies forgive this).
    if (e.code === "Space") {
      this.jumpBuffer = RobloxEngine.JUMP_BUFFER;
      e.preventDefault();
    }
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);

  /** Window focus loss (Alt-Tab etc.) must not leave keys "stuck" — otherwise
   *  the character keeps walking in the background. Roblox clears input on
   *  blur too. */
  private onBlur = () => {
    this.keys.clear();
    this.rightDown = false;
  };


  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 2) {
      this.rightDown = true;
      this.renderer.domElement.requestPointerLock();
    }
    if (e.button === 0 && this.build.active) this.placeBuildPart();
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 2) {
      this.rightDown = false;
      document.exitPointerLock();
    }
  };

  // Smoothed camera yaw/pitch (raw input goes into target, actual values lerp toward them).
  camYawTarget = 0;
  camPitchTarget = 0.3;
  /** Smoothed camera FOV (base 65, widens up to +8 while sprinting). */
  private camFov = 65;

  private onMouseMove = (e: MouseEvent) => {
    if (!this.rightDown) return;
    if (this.paused) return;
    // Softer Roblox-like sensitivity. Lower = smoother long sweeps.
    const s = this.cameraSensitivity;
    this.camYawTarget -= e.movementX * s;
    this.camPitchTarget = Math.max(-0.35, Math.min(1.3, this.camPitchTarget - e.movementY * s));
  };

  private onWheel = (e: WheelEvent) => {
    this.camDist = Math.max(3, Math.min(22, this.camDist + Math.sign(e.deltaY) * 1.2));
  };

  // =========== BUILD ===========
  toggleBuild() { this.build.active = !this.build.active; this.ghostMesh.visible = this.build.active; }
  setBuildColor(c: number) { this.build.color = c; }
  setBuildMaterial(m: PartMaterial) { this.build.material = m; }

  private updateGhost() {
    if (!this.build.active) return;
    this.raycaster.setFromCamera(this.cameraCenter, this.camera);
    const origin = this.raycaster.ray.origin;
    const dir = this.raycaster.ray.direction;
    const hit = this.raycastWorldAabb(origin, dir, 500);
    if (hit && hit.face) {
      const p = hit.point.clone().addScaledVector(hit.face.normal, 0.5);
      const snap = (v: number, g: number) => Math.round(v / g) * g;
      this.ghostMesh.position.set(snap(p.x, 1), snap(p.y, 0.5) + this.buildSize.y / 2, snap(p.z, 1));
      this.ghostMesh.scale.copy(this.buildSize);
      (this.ghostMesh.material as THREE.MeshStandardMaterial).color.set(this.build.color);
      this.ghostMesh.visible = true;
    } else {
      this.ghostMesh.visible = false;
    }
  }

  private placeBuildPart() {
    if (!this.ghostMesh.visible) return;
    const part: Part = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      pos: this.ghostMesh.position.clone(),
      size: this.buildSize.clone(),
      color: this.build.color,
      material: this.build.material,
      shape: "block", collidable: true, anchored: true, kind: "user",
    };
    this.parts.push(part);
    const hx = part.size.x / 2, hy = part.size.y / 2, hz = part.size.z / 2;
    this.aabbs.push({
      minX: part.pos.x - hx, minY: part.pos.y - hy, minZ: part.pos.z - hz,
      maxX: part.pos.x + hx, maxY: part.pos.y + hy, maxZ: part.pos.z + hz,
    });
    this.spatialGrid.add(this.parts.length - 1, this.aabbs[this.aabbs.length - 1]);
    // Player-built parts render individually (they could be removed/re-coloured
    // at runtime; merging them would force a full batch rebuild each time).
    this.meshRefs.push(null);
    const geo = shapeGeometry(part.shape, part.size);
    const mat = this.materialFor(part);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(part.pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    part.mesh = mesh;
    this.meshRefs[this.parts.length - 1] = mesh;
    this.buildGroup.add(mesh);
  }

  // =========== GAMEPLAY ===========
  respawn(death: boolean) {
    if (death) { this.deaths++; this.cb.onDeath(); this.sfx.death(); }
    const cp = this.world.checkpoints[this.stage] ?? this.world.spawnPos;
    this.pos.copy(cp);
    this.vel.set(0, 0, 0);
    this.grounded = false;
    // A death/respawn must not inherit a buffered jump or coyote window.
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
  }

  fullReset() {
    this.stage = 0; this.coins = 0; this.collectedCoins.clear();
    this.deaths = 0; this.won = false;
    for (const mesh of this.coinMeshes) mesh.visible = true;
    this.pos.copy(this.world.spawnPos);
    this.vel.set(0, 0, 0);
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
  }

  // =========== GAME LOOP ===========
  private _raf = 0;
  start() {
    this.lastFrameTime = performance.now();
    const tick = () => {
      this.update();
      this.renderer.render(this.scene, this.camera);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    const el = this.renderer.domElement;
    el.removeEventListener("mousedown", this.onMouseDown);
    el.removeEventListener("contextmenu", this.onContextMenu);
    el.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("blur", this.onBlur);
    window.removeEventListener("resize", this.onResize);

    // Полное освобождение GPU-ресурсов: меши мира, аватар, ghost, облака.
    // Геометрии и материалы защищены сетами — облака и face-текстуры шалятся
    // между множеством мешей, поэтому каждый ресурс диспозится ровно один раз.
    const freed = new Set<THREE.BufferGeometry>();
    const freedMats = new Set<THREE.Material>();
    const release = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.geometry) return;
        if (!freed.has(mesh.geometry)) {
          freed.add(mesh.geometry);
          mesh.geometry.dispose();
        }
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          if (!(m instanceof THREE.Material) || freedMats.has(m)) continue;
          freedMats.add(m);
          m.dispose();
          // CanvasTexture on the avatar face must be released too.
          const map = (m as THREE.MeshStandardMaterial).map;
          if (map) map.dispose();
        }
      });
    };
    release(this.partGroup);
    release(this.batchGroup);
    release(this.buildGroup);
    release(this.avatar.group);
    release(this.ghostMesh);
    for (const cloud of this.cloudMeshes) release(cloud);
    this.batchMeshes = [];
    this.coinMeshes = [];
    this.coinBaseYs = [];
    this.coinIds = [];

    // Release shared material/texture caches — these were deliberately never
    // disposed per-mesh in release() above (one part must not kill the texture
    // of every other part sharing the same URL). At full engine teardown we
    // own them all, so dispose them here.
    for (const mat of this.materialCache.values()) mat.dispose();
    this.materialCache.clear();
    for (const tex of this.textureCache.values()) tex.dispose();
    this.textureCache.clear();

    this.remotePlayers.dispose();
    this.sfx.dispose();
    this.renderer.dispose();
    if (el.parentElement === this.container) this.container.removeChild(el);
  }

  private update() {
    const now = performance.now();
    let dt = Math.min(0.033, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;
    if (dt < 0) dt = 0;

    // Menu/overlay open → freeze gameplay, but keep rendering the dimmed world.
    if (this.paused) {
      // Keys pressed before the pause must not "stick" — after closing the
      // menu the character has to stand still until the player presses again.
      this.keys.clear();
      // A buffered jump press from before the pause must not fire the moment
      // the menu closes (the player wasn't holding Space, the world doesn't
      // move while paused — only a brand-new press after resume may jump).
      this.jumpBuffer = 0;
      this.coyoteTime = 0;
      return;
    }

    this.elapsed += dt;

    this.fpsAcc += dt; this.fpsFrames++;
    if (this.fpsAcc >= 0.5) { this.fpsValue = this.fpsFrames / this.fpsAcc; this.fpsAcc = 0; this.fpsFrames = 0; }

    this.physics(dt);
    this.checkZones();
    this.updateCamera(dt);
    if (this.build.active) this.updateGhost();
    this.animateParts(dt);

    // Run user-installed import updaters (Lua NPC, 1C ledger, etc.)
    const userUpd = (this as any).__userUpdaters as Array<(dt: number) => void> | undefined;
    if (userUpd) for (const fn of userUpd) fn(dt);

    // Avatar visual
    const feetY = this.pos.y - this.playerHeight / 2;
    this.avatar.group.position.set(this.pos.x, feetY + 1.05, this.pos.z);
    this.avatar.group.rotation.y = this.facing;
    const speed = Math.hypot(this.vel.x, this.vel.z);
    this.avatar.animate(speed / 16, dt, this.grounded);

    // Remote players (multiplayer)
    this.remotePlayers.step(dt);

    // Stats
    this.statsAcc += dt;
    if (this.statsAcc >= 0.12) {
      this.statsAcc = 0;
      this.cb.onStats({
        fps: Math.round(this.fpsValue),
        parts: this.parts.length,
        stage: this.stage,
        totalStages: this.world.totalStages,
        coins: this.coins,
        totalCoins: this.world.totalCoins,
        deaths: this.deaths,
        time: this.elapsed,
        position: { x: this.pos.x, y: this.pos.y, z: this.pos.z },
        won: this.won,
      });
    }
  }

  // =========== PHYSICS (authentic Roblox Humanoid values) ===========
  // Source: Roblox API docs + DevForum.
  //   WalkSpeed   = 16  studs/sec  (instant on ground)
  //   JumpPower   = 50  studs/sec  (set as initial Y velocity)
  //   Gravity     = 196.2 studs/sec²
  //   JumpHeight  = JumpPower² / (2·Gravity) ≈ 6.37 studs
  //   On ground: velocity is OVERWRITTEN (not accelerated) — instant turning
  //   In air: very limited control (Roblox keeps your air velocity nearly fixed)

  private physics(dt: number) {
    // Proportional physical constants scaled down to match Three.js body heights (2.4 units tall).
    // Adjusted slightly to feel more floaty, elegant, and "soft" during obby jumps.
    // Base values, then apply optional multipliers set by imported modules (e.g. 1C shop perks).
    const wMul = (this as any).__walkSpeedMult ?? 1;
    const jMul = (this as any).__jumpMult ?? 1;
    const gMul = (this as any).__gravMult ?? 1;
    // Sprint: hold Shift for a Roblox-like speed boost (works on ground, ice
    // and air steering alike).
    const sprinting = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    const WALK_SPEED = 7.5 * wMul * (sprinting ? RobloxEngine.SPRINT_MULT : 1);
    const JUMP_POWER = 21.0 * jMul;
    const GRAVITY = 76.0 * gMul;

    // --- Input direction ---
    let ix = 0, iz = 0;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp"))    iz -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown"))  iz += 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft"))  ix -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) ix += 1;

    const moving = ix !== 0 || iz !== 0;
    let wx = 0, wz = 0;

    if (moving) {
      const len = Math.hypot(ix, iz);
      ix /= len; iz /= len;

      // Camera-relative movement.
      // W (iz=-1) = forward, D (ix=+1) = right.
      const sinY = Math.sin(this.camYaw);
      const cosY = Math.cos(this.camYaw);
      wx = ix * cosY + iz * sinY;
      wz = -ix * sinY + iz * cosY;
    }

    // Grounded surface feel: ice is frictionless — velocity keeps sliding.
    const onIce = this.grounded && this.groundPart?.material === "ice";

    if (this.grounded) {
      // Ice: slow acceleration toward the input direction + weak friction,
      // so the player slides (Roblox IceMaterial feel).
      if (onIce) {
        const iceAccel = 1 - Math.pow(0.0001, dt / 0.5);   // sluggish accel
        const iceFriction = 1 - Math.pow(0.0001, dt / 0.8); // little friction
        this.vel.x += (wx * WALK_SPEED - this.vel.x) * iceAccel;
        this.vel.z += (wz * WALK_SPEED - this.vel.z) * iceAccel;
        this.vel.x -= this.vel.x * iceFriction;
        this.vel.z -= this.vel.z * iceFriction;
      } else {
        // Extremely fast but smooth damping instead of instant snappy snap.
        // This eliminates visual jitter/clipping during abrupt key shifts.
        // Half-life ≈ 35ms.
        const accelT = 1 - Math.pow(0.0001, dt / 0.045);
        this.vel.x += (wx * WALK_SPEED - this.vel.x) * accelT;
        this.vel.z += (wz * WALK_SPEED - this.vel.z) * accelT;
      }
    } else if (moving) {
      // In air: slightly more lenient steering (half-life ≈ 120ms) for smoother micro-adjusts.
      const targetX = wx * WALK_SPEED;
      const targetZ = wz * WALK_SPEED;
      const airT = 1 - Math.pow(0.0001, dt / 0.12);
      this.vel.x += (targetX - this.vel.x) * airT;
      this.vel.z += (targetZ - this.vel.z) * airT;
    } else {
      // Smooth deceleration mid-air if keys are released (helps land precisely on thin pillars).
      const airDecelT = 1 - Math.pow(0.0001, dt / 0.28);
      this.vel.x -= this.vel.x * airDecelT;
      this.vel.z -= this.vel.z * airDecelT;
    }

    // --- AutoRotate: smooth body alignment with limited angular velocity (like Roblox) ---
    if (moving) {
      const targetAngle = Math.atan2(wx, wz);
      let diff = targetAngle - this.facing;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      // Limit max turn speed to 9.5 rad/s to make turns smooth and avoid snapping.
      const maxTurnSpeed = 9.5;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), maxTurnSpeed * dt);
      this.facing += step;
    }

    // --- Jump (coyote time + buffering) ---
    // Buffered press: Space pressed slightly BEFORE landing fires the jump the
    // instant the feet touch ground — the "1-frame-late" jump is forgiven
    // (standard in modern Roblox obbies).
    const bufferedJump = this.jumpBuffer > 0;
    // Coyote jump: after walking off a ledge the player can still jump for
    // COYOTE_TIME seconds. Like Roblox, we don't punish a 2-frame edge slip.
    const canJump = this.grounded || this.coyoteTime > 0;
    if (bufferedJump && canJump) {
      this.vel.y = JUMP_POWER;
      this.grounded = false;
      this.coyoteTime = 0;
      this.jumpBuffer = 0;
    } else if (this.keys.has("Space") && this.grounded) {
      // Held Space on the ground — instant jump (classic behaviour kept).
      this.vel.y = JUMP_POWER;
      this.grounded = false;
      this.coyoteTime = 0;
      this.jumpBuffer = 0;
    }

    // --- Gravity ---
    this.vel.y -= GRAVITY * dt;
    if (this.vel.y < -150) this.vel.y = -150;

    // --- Integrate with collision ---
    this.grounded = false;

    // Sub-step Y to prevent tunneling at high fall speeds.
    const yMove = this.vel.y * dt;
    const ySteps = Math.max(1, Math.ceil(Math.abs(yMove) / 0.35));
    const yStep = yMove / ySteps;

    this.moveAxis(0, this.vel.x * dt);
    this.moveAxis(2, this.vel.z * dt);
    for (let i = 0; i < ySteps; i++) {
      this.moveAxis(1, yStep);
      if (this.grounded) break;
    }

    // --- Coyote/buffer timers (after the collision pass so the values below
    // reflect this frame's landing state) ---
    if (this.grounded) {
      // Standing on something → full coyote window re-arms.
      this.coyoteTime = RobloxEngine.COYOTE_TIME;
    } else {
      // In the air → coyote window counts down; jump buffer remembers the last
      // Space press for JUMP_BUFFER seconds before expiring.
      this.coyoteTime = Math.max(0, this.coyoteTime - dt);
    }
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    // Void death
    const voidLevel = this.settings.voidLevel ?? -30;
    if (this.pos.y < voidLevel) this.respawn(true);
  }

  /**
   * Height of a part's walkable surface at a world (x, z). For wedge parts the
   * surface follows the slope (low at -X, high at +X); everything else uses the
   * flat AABB top.
   */
  private surfaceHeightAt(part: Part, x: number, z: number): number {
    if (part.shape === "wedge") {
      const hw = part.size.x / 2;
      const t = Math.max(0, Math.min(1, (x - (part.pos.x - hw)) / part.size.x));
      return part.pos.y - part.size.y / 2 + t * part.size.y;
    }
    return part.pos.y + part.size.y / 2;
  }

  /**
   * Distance (in world units) by which the player's feet may dip into the top
   * surface of a part before it starts counting as a wall. Without this, the
   * floating-point rounding of `surface + height/2 - height/2` keeps the feet
   * ~1e-16 *under* the platform, the AABB overlap test fires every frame, and
   * horizontal movement is cancelled — the avatar "freezes" on flat ground.
   */
  private static readonly COLLISION_EPS = 0.001;

  /** Maximum ledge height (world units) a grounded player can climb onto
   *  automatically without jumping — Roblox Humanoid steps up ledges up to
   *  ~0.5 studs. Blocky obby stairs and low curbs rely on this; without it
   *  every 1-unit step is an impassable wall. */
  private static readonly STEP_UP_HEIGHT = 0.5;

  // axis: 0=x, 1=y, 2=z
  private moveAxis(axis: number, amount: number) {
    if (Math.abs(amount) < 1e-8) return;

    const r = this.playerRadius;
    const hh = this.playerHeight / 2;
    const EPS = RobloxEngine.COLLISION_EPS;

    // Proposed position
    const px = axis === 0 ? this.pos.x + amount : this.pos.x;
    const py = axis === 1 ? this.pos.y + amount : this.pos.y;
    const pz = axis === 2 ? this.pos.z + amount : this.pos.z;

    // Player AABB after move
    const pMinX = px - r, pMaxX = px + r;
    const pMinY = py - hh, pMaxY = py + hh;
    const pMinZ = pz - r, pMaxZ = pz + r;

    // Candidate parts from the spatial grid (only cells overlapping the player's
    // volume — a handful per frame even in worlds with thousands of parts).
    const cand = this.queryBuf;
    const count = this.spatialGrid.query(pMinX, pMinY, pMinZ, pMaxX, pMaxY, pMaxZ, cand);

    const overlaps = (b: CachedAABB) =>
      pMaxX > b.minX && pMinX < b.maxX &&
      pMaxY > b.minY && pMinY < b.maxY &&
      pMaxZ > b.minZ && pMinZ < b.maxZ;

    // --- Vertical movement ---
    if (axis === 1) {
      if (amount < 0) {
        // Falling: land on the HIGHEST support surface that is actually under
        // the player's feet. Iterate ALL overlaps instead of `break`-ing on the
        // first one: a part whose AABB crosses the torso may be a ceiling or a
        // neighbouring wall, not a floor. Landing on the wrong one teleports
        // the avatar inside another part → it gets stuck.
        const currentFeet = this.pos.y - hh;
        let bestIndex = -1;
        let bestSurface = -Infinity;
        for (let k = 0; k < count; k++) {
          const i = cand[k];
          if (!this.parts[i].collidable || !overlaps(this.aabbs[i])) continue;
          const surf = this.surfaceHeightAt(this.parts[i], px, pz);
          // A real floor is below the feet; a ceiling/overhang is above them.
          if (surf <= currentFeet + EPS && surf > bestSurface) {
            bestSurface = surf;
            bestIndex = i;
          }
        }
        if (bestIndex >= 0) {
          this.grounded = true;
          // Remember what the feet are resting on (ice detection).
          this.groundPart = this.parts[bestIndex];
          this.pos.y = bestSurface + hh;
          this.vel.y = 0;
          return;
        }
        this.pos.y = py;
        return;
      }

      // Rising (jump): hit a ceiling → cancel upward velocity, don't move.
      for (let k = 0; k < count; k++) {
        const i = cand[k];
        if (!this.parts[i].collidable || !overlaps(this.aabbs[i])) continue;
        this.vel.y = 0;
        return;
      }
      this.pos.y = py;
      return;
    }

    // --- Horizontal movement ---
    const feet = this.pos.y - hh; // feet height before this frame's vertical pass
    // Step-up: Roblox Humanoids automatically climb onto low ledges (up to
    // STEP_UP_HEIGHT) instead of treating them as walls. Roblox stairs and
    // low curbs rely on this; without it each 1-unit step was impassable.
    // We allow it ONLY while grounded so an airborne player heading into a
    // tall wall doesn't get teleported onto its top by a side-step.
    let steppedUp = false;
    let steppedSurface = 0;
    for (let k = 0; k < count; k++) {
      const i = cand[k];
      if (!this.parts[i].collidable || !overlaps(this.aabbs[i])) continue;
      const part = this.parts[i];
      const surf = this.surfaceHeightAt(part, px, pz);

      // Floor/support: the part's surface is at or below the feet (within the
      // epsilon) — walking across it must NOT cancel horizontal velocity.
      if (surf <= feet + EPS) continue;

      // Wedge slope: walk up OR slide down the incline instead of stopping
      // (climbing up goes through here because surf > feet; going downhill the
      // surface drops below the feet and the part is treated as a support, so
      // the next vertical pass settles the avatar onto the slope). The incline
      // is continuous — the surface under the new position is the new height,
      // so ramps stay walkable at any frame rate.
      if (part.shape === "wedge") {
        this.pos.y = surf + hh;
        if (axis === 0) this.pos.x = px;
        else this.pos.z = pz;
        return;
      }

      // Block collision: a ledge is climbable only up to STEP_UP_HEIGHT. Any
      // higher surface is a real wall — cancel this axis (classic behaviour).
      if (surf > feet + RobloxEngine.STEP_UP_HEIGHT) {
        if (axis === 0) this.vel.x = 0;
        else this.vel.z = 0;
        return;
      }

      // A low ledge: record the highest candidate surface we could step onto;
      // after the loop we lift the avatar only if NO high wall blocked us.
      if (surf > steppedSurface) {
        steppedSurface = surf;
        steppedUp = true;
      }
    }

    if (steppedUp && this.grounded) {
      // Climb the low step: lift the avatar and commit the horizontal move.
      this.pos.y = steppedSurface + hh;
      this.pos.x = px;
      this.pos.z = pz;
      return;
    }

    // No collision: apply movement.
    if (axis === 0) this.pos.x = px;
    else this.pos.z = pz;
  }

  private checkZones() {
    const r = this.playerRadius;
    const hh = this.playerHeight / 2;
    const M = 0.3; // expansion for triggers
    // Coins use a separate distance check (< 2.5 from the center) and may sit
    // outside the tight trigger box, so query a region expanded by the pickup
    // radius too — keeps the original pickup behaviour bit-for-bit.
    const PICKUP = 2.5;
    const px0 = this.pos.x - r - M - PICKUP, px1 = this.pos.x + r + M + PICKUP;
    const py0 = this.pos.y - hh - M - PICKUP, py1 = this.pos.y + hh + M + PICKUP;
    const pz0 = this.pos.z - r - M - PICKUP, pz1 = this.pos.z + r + M + PICKUP;

    const cand = this.queryBuf;
    const count = this.spatialGrid.query(px0, py0, pz0, px1, py1, pz1, cand);

    for (let k = 0; k < count; k++) {
      const i = cand[k];
      const part = this.parts[i];
      if (part.kind === "coin") {
        const dx = this.pos.x - part.pos.x, dy = this.pos.y - part.pos.y, dz = this.pos.z - part.pos.z;
        if (dx * dx + dy * dy + dz * dz < 2.5 && !this.collectedCoins.has(part.id)) {
          this.collectedCoins.add(part.id);
          this.coins++;
          if (part.mesh) part.mesh.visible = false;
          this.sfx.coin();
          this.cb.onCoin(this.coins);
        }
        continue;
      }

      // Exact trigger test against the tight box (grid cells are coarser).
      const b = this.aabbs[i];
      if (!(px1 - PICKUP > b.minX && px0 + PICKUP < b.maxX &&
            py1 - PICKUP > b.minY && py0 + PICKUP < b.maxY &&
            pz1 - PICKUP > b.minZ && pz0 + PICKUP < b.maxZ)) continue;

      if (part.kind === "kill") { this.respawn(true); return; }
      if (part.kind === "checkpoint") {
        const stg = (part.meta?.stage as number) ?? this.stage;
        if (stg > this.stage) { this.stage = stg; this.sfx.checkpoint(); this.cb.onCheckpoint(stg); }
      }
      if (part.kind === "win" && !this.won) { this.won = true; this.sfx.win(); this.cb.onWin(); }
    }
  }

  private animateParts(dt: number) {
    // Animate ONLY the coin meshes. The old loop scanned every part every
    // frame — O(all world parts) even when only a handful of coins existed.
    // Studio worlds with thousands of static parts no longer pay for this.
    const t = this.elapsed;
    for (let i = 0; i < this.coinMeshes.length; i++) {
      const mesh = this.coinMeshes[i];
      if (!mesh.visible) continue;
      mesh.rotation.z += dt * 2.5;
      mesh.position.y = this.coinBaseYs[i] + Math.sin(t * 2 + this.coinIds[i]) * 0.2;
    }

    // Volumetric cloud drift animation (Roblox style wind).
    // They slowly drift to the right (+X). If they exit the boundary, wrap around.
    const windSpeed = 1.6; // studs per second
    for (const cloud of this.cloudMeshes) {
      cloud.position.x += windSpeed * dt;
      if (cloud.position.x > 220) {
        cloud.position.x = -220;
      }
    }
  }

  // =========== CAMERA (Roblox-style — smooth but not laggy) ===========
  private camTargetSmooth = new THREE.Vector3();
  private camPosSmooth = new THREE.Vector3();
  private camInitialized = false;
  // Preallocated vectors for updateCamera (avoids ~4 Vector3 allocations/frame).
  private camTarget = new THREE.Vector3();
  private camDir = new THREE.Vector3();
  private camDesired = new THREE.Vector3();
  private cameraCenter = new THREE.Vector2(0, 0);

  private updateCamera(dt: number) {
    // SOFT camera rotation — gentle, cinematic damping.
    // Half-life ~140ms — visible easing on every flick, no harshness.
    const rotT = 1 - Math.pow(0.0001, dt / 0.14);
    this.camYaw += (this.camYawTarget - this.camYaw) * rotT;
    this.camPitch += (this.camPitchTarget - this.camPitch) * rotT;

    this.camTarget.set(this.pos.x, this.pos.y + 0.8, this.pos.z);
    const cp = Math.cos(this.camPitch);
    const sp = Math.sin(this.camPitch);
    const sy = Math.sin(this.camYaw);
    const cy = Math.cos(this.camYaw);
    this.camDir.set(sy * cp, sp, cy * cp);

    // Camera collision — shorten distance if a part is in the way. The spatial
    // grid limits the test to parts whose AABB actually crosses the ray
    // segment (a handful per frame), and we resolve against those AABBs
    // directly — no per-frame triangle raycast over the whole merged world.
    const hit = this.raycastWorldAabb(this.camTarget, this.camDir, this.camDist);
    let dist = this.camDist;
    if (hit && hit.distance < this.camDist) {
      dist = Math.max(1.5, hit.distance - 0.2);
    }

    this.camDesired.copy(this.camTarget).addScaledVector(this.camDir, dist);

    if (!this.camInitialized) {
      this.camTargetSmooth.copy(this.camTarget);
      this.camPosSmooth.copy(this.camDesired);
      this.camInitialized = true;
    } else {
      // Softer camera follow — gentle inertia.
      // Half-life ~160ms for position, ~90ms for look-at target.
      const posT = 1 - Math.pow(0.0001, dt / 0.16);
      const tgtT = 1 - Math.pow(0.0001, dt / 0.09);
      this.camPosSmooth.lerp(this.camDesired, posT);
      this.camTargetSmooth.lerp(this.camTarget, tgtT);
    }

    // Sprint FOV kick — subtle speed feel: FOV widens slightly above base walk
    // speed and eases back when slowing down (half-life ~180ms).
    const baseSpeed = 7.5 * ((this as any).__walkSpeedMult ?? 1);
    const hSpeed = Math.hypot(this.vel.x, this.vel.z);
    const targetFov = 65 + Math.max(0, Math.min(8, (hSpeed - baseSpeed) * 1.2));
    this.camFov += (targetFov - this.camFov) * (1 - Math.pow(0.0001, dt / 0.18));
    if (Math.abs(this.camera.fov - this.camFov) > 0.01) {
      this.camera.fov = this.camFov;
      this.camera.updateProjectionMatrix();
    }

    this.camera.position.copy(this.camPosSmooth);
    this.camera.lookAt(this.camTargetSmooth);
  }

  /**
   * Raycast against the parts' AABBs using the spatial grid as a prefilter.
   * Replaces the old ray-against-merged-mesh pass: batches contain geometry
   * for thousands of parts, so raycasting them every frame swept the whole
   * world (the old code actually hit-tested ALL collidable meshes regardless
   * of the grid prefilter). AABB resolution is exact for the blocky gameplay
   * geometry and yields the entry point + face normal the camera and build
   * ghost need, at O(region) cost instead of O(world). Returns a shared hit
   * object (zero allocations per frame) — valid only until the next call.
   */
  private raycastWorldAabb(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): RayHitResult | null {
    this.rayEnd.set(origin.x + dir.x * maxDist, origin.y + dir.y * maxDist, origin.z + dir.z * maxDist);
    const minX = Math.min(origin.x, this.rayEnd.x), maxX = Math.max(origin.x, this.rayEnd.x);
    const minY = Math.min(origin.y, this.rayEnd.y), maxY = Math.max(origin.y, this.rayEnd.y);
    const minZ = Math.min(origin.z, this.rayEnd.z), maxZ = Math.max(origin.z, this.rayEnd.z);

    const cand = this.queryBuf;
    const count = this.spatialGrid.query(minX, minY, minZ, maxX, maxY, maxZ, cand);

    // Slab-test the ray against each candidate part's AABB and track the
    // closest entry surface (position + axis + sign of the face normal).
    const ox = origin.x, oy = origin.y, oz = origin.z;
    const dx = dir.x, dy = dir.y, dz = dir.z;
    let bestT = Infinity;
    let bestIdx = -1;
    let bestAxis = 0;
    let bestSign = 1;

    for (let k = 0; k < count; k++) {
      const i = cand[k];
      if (!this.parts[i].collidable) continue;
      const b = this.aabbs[i];

      let tMin = -Infinity, tMax = Infinity;
      let axis = 0;

      // X slab
      if (Math.abs(dx) < 1e-12) {
        if (ox < b.minX || ox > b.maxX) continue;
      } else {
        const inv = 1 / dx;
        let t1 = (b.minX - ox) * inv;
        let t2 = (b.maxX - ox) * inv;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        if (t1 > tMin) { tMin = t1; axis = 0; }
        if (t2 < tMax) tMax = t2;
      }
      // Y slab
      if (Math.abs(dy) < 1e-12) {
        if (oy < b.minY || oy > b.maxY) continue;
      } else {
        const inv = 1 / dy;
        let t1 = (b.minY - oy) * inv;
        let t2 = (b.maxY - oy) * inv;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        if (t1 > tMin) { tMin = t1; axis = 1; }
        if (t2 < tMax) tMax = t2;
      }
      // Z slab
      if (Math.abs(dz) < 1e-12) {
        if (oz < b.minZ || oz > b.maxZ) continue;
      } else {
        const inv = 1 / dz;
        let t1 = (b.minZ - oz) * inv;
        let t2 = (b.maxZ - oz) * inv;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        if (t1 > tMin) { tMin = t1; axis = 2; }
        if (t2 < tMax) tMax = t2;
      }

      // Entry clamped to >= 0: when the origin is inside the box (camera fully
      // inside a part), the visible surface is the exit face at t >= 0.
      const tEntry = Math.max(0, tMin);
      if (tMax <= tEntry || tEntry > maxDist) continue;
      if (tEntry < bestT) {
        bestT = tEntry;
        bestIdx = i;
        bestAxis = axis;
        // The entering face is on the negative or positive side of the center
        // of the box along the slab axis that produced the max t1.
        const bmin = bestAxis === 0 ? b.minX : bestAxis === 1 ? b.minY : b.minZ;
        const bmax = bestAxis === 0 ? b.maxX : bestAxis === 1 ? b.maxY : b.maxZ;
        const center = (bmin + bmax) / 2;
        const entryPos = (bestAxis === 0 ? ox + dx * tEntry : bestAxis === 1 ? oy + dy * tEntry : oz + dz * tEntry);
        bestSign = entryPos >= center ? 1 : -1;
      }
    }

    if (bestIdx < 0) return null;
    const px = ox + dx * bestT;
    const py = oy + dy * bestT;
    const pz = oz + dz * bestT;
    this.rayHitPoint.set(px, py, pz);
    if (bestAxis === 0) this.rayHitNormal.set(bestSign, 0, 0);
    else if (bestAxis === 1) this.rayHitNormal.set(0, bestSign, 0);
    else this.rayHitNormal.set(0, 0, bestSign);
    this.rayHitFace.a = 0; this.rayHitFace.b = 0; this.rayHitFace.c = 0;
    return {
      distance: bestT,
      point: this.rayHitPoint,
      face: this.rayHitFace,
      object: this.rayHitTarget,
    };
  }

  setAvatarColors(colors: AvatarColors) { this.avatar.setColors(colors); }

  /** Toggle game sound effects (coin/checkpoint/death/win). */
  setSoundFxEnabled(enabled: boolean) {
    this.sfx.enabled = enabled;
  }

  /** Master volume for game sound effects. 0..1 */
  setSoundVolume(volume: number) {
    this.sfx.volume = Math.max(0, Math.min(1, volume));
  }

  /** Apply a graphics-quality preset at runtime (1 = low, 2 = medium, 3 = high). */
  setGraphicsQuality(level: 1 | 2 | 3) {
    // Cap devicePixelRatio to keep rendering fast at low quality.
    this.pixelRatioCap = level === 1 ? 0.75 : level === 2 ? 1 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.pixelRatioCap));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    // Low quality also turns off shadows — the cheapest big win.
    this.renderer.shadowMap.enabled = level !== 1;
  }

  /** Toggle the volumetric clouds in the sky. */
  setCloudsVisible(visible: boolean) {
    this.cloudsVisible = visible;
    for (const cloud of this.cloudMeshes) cloud.visible = visible;
  }
}
