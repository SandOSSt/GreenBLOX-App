import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { Entity, TransformComponent, MeshComponent, RigidBodyComponent, SceneData } from "../types/engine";
import { ECSWorld } from "../core/ecs";
import { Signal } from "../core/signals";
import { StudioAvatar, studioAvatarColors } from "../runtime/StudioAvatar";

export class GreenBloxRenderer {
  private container: HTMLElement | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private ecs: ECSWorld;
  private entityMeshes: Map<string, THREE.Mesh | THREE.Group> = new Map();
  private selectedEntityId: string | null = null;
  private selectedEntityIds: string[] = [];
  private selectionBox: THREE.BoxHelper | null = null;
  private selectionBoxes: Map<string, THREE.BoxHelper> = new Map();
  private selectionOutlines: Map<string, THREE.LineSegments> = new Map();
  private originalEmissive = new Map<string, { color: number; intensity: number }>();
  private waterMesh: THREE.Mesh | null = null;
  private dirLight: THREE.DirectionalLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private hemisphereLight: THREE.HemisphereLight | null = null;
  private gridHelper: THREE.GridHelper | null = null;
  private checkerTexture: THREE.CanvasTexture | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private transformControls: TransformControls | null = null;
  private transformControlsHelper: THREE.Object3D | null = null;
  private transformControlDragging = false;
  private transformPivot = new THREE.Object3D();
  private transformStartPivot = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(1, 1, 1),
  };
  private transformStartObjects = new Map<string, { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }>();
  private activeGizmoMode: string = "select";
  private gridSnapEnabled = true;
  private translationSnap = 0.5;
  /** True while Ctrl/Cmd is held during a gizmo drag — snap is temporarily
   *  disabled (Roblox Studio behaviour: hold Ctrl to fine-position). */
  private snapOverrideActive = false;
  private onSnapOverrideKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private onSnapOverrideKeyUp: ((e: KeyboardEvent) => void) | null = null;

  public onEntitySelected = new Signal<string | null>();
  public onSelectionChanged = new Signal<string[]>();
  public onTransformStarted = new Signal<string>();
  public onTransformFinished = new Signal<string>();
  public drawCalls = 0;
  public triangleCount = 0;

  private isOrbiting = false;
  private isPanning = false;
  private previousMousePosition = { x: 0, y: 0 };
  private cameraTarget = new THREE.Vector3(0, 3, 0);
  private spherical = new THREE.Spherical(28, Math.PI / 3.15, Math.PI / 4);
  private runtimeFollowEntityId: string | null = null;
  /** Runtime play-mode avatar (Roblox R6) shown instead of the blue cube.
   *  Owned by the "Player" entity; colored from the launcher account. */
  private runtimeAvatar: StudioAvatar | null = null;
  private runtimeAvatarOwnerId: string | null = null;
  /** Grounded flag driven by the physics engine each frame in play mode
   *  (page.tsx copies physics.isGrounded here) — used by the walk cycle. */
  public runtimeGrounded = false;

  /** Обработчики событий, навешенные на renderer.domElement — храним, чтобы снять их в dispose. */
  private domEventHandlers: { type: string; handler: (event: any) => void; options?: boolean | AddEventListenerOptions }[] = [];

  // =====================================================================
  // Performance: shared materials & dirty-transform tracking
  // =====================================================================

  /** Material cache — one MeshStandardMaterial per (geometry, color, metalness,
   *  roughness, emissive, map) key. Studio worlds have thousands of parts; a
   *  fresh material per part caused thousands of GPU program switches per
   *  frame (the #1 slideshow cause on weak laptops / Edge). Same approach the
   *  game engine already uses. */
  private materialCache = new Map<string, THREE.MeshStandardMaterial>();
  /** Fast membership check for dispose: materials in the cache are SHARED
   *  between many parts and must never be disposed by a single mesh. */
  private cachedMaterialSet = new Set<THREE.Material>();
  /** Textures owned by cached materials (checker map is shared, not owned). */
  private ownedTextures = new Set<THREE.Texture>();
  /** Кэш текстур по URL (data URL или относительный путь) — одна и та же
   *  текстура может быть назначена многим частям; грузим её один раз.
   *  Используется и для diffuse (textureUrl) и для normal map. */
  private textureCache = new Map<string, THREE.Texture>();
  /** Текстуры, совместно используемые множеством shared-материалов кэша —
   *  их НЕЛЬЗЯ диспозить из disposeObject одного меша. */
  private sharedTextureSet = new Set<THREE.Texture>();
  /** Entities whose Transform changed since the last frame — only these get
   *  their matrices rewritten (static worlds then cost ~0 per frame instead
   *  of O(all parts)). */
  private dirtyEntities = new Set<string>();
  /** While true the render loop is skipped entirely (non-viewport tabs). */
  private renderEnabled = true;
  /** While true the per-frame full scan is on (play mode) because physics
   *  mutates ECS Transforms directly without firing the change signal. */
  private simulationActive = false;
  /** Adaptive quality: measure average FPS, drop quality once below target. */
  private qualityDropped = false;
  private qualityFrames = 0;
  private qualityTime = 0;
  /** Render-on-demand (edit mode): the WebGL frame is only redrawn when
   *  something actually changed (camera, selection, ECS edit). A static Studio
   *  scene then costs ~0 GPU/CPU frames per second instead of a full render
   *  every rAF — the #1 battery/heat/мicro-stutter win on weak laptops and
   *  Edge (HiDPI + integrated GPU). Play mode always renders (live physics). */
  private needsRender = true;
  /** Frames since the user last interacted (orbit/pan/zoom). While positive,
   *  the adaptive-quality probe may measure real FPS; in a fully static scene
   *  it stays silent so it never "detects" a low FPS from deliberately skipped
   *  frames. */
  private interactiveFrames = 0;

  /** Low-end heuristic (weak laptop / browser like Edge on low VRAM). */
  private lowEnd: boolean;

  constructor(ecs: ECSWorld) {
    this.ecs = ecs;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#151821");
    this.scene.fog = new THREE.FogExp2("#151821", 0.011);
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1500);
    this.updateCameraPosition();

    // Mark transforms dirty the moment they change — no per-frame full scan.
    ecs.onComponentChanged.connect((change) => {
      if (change && change.componentType === "Transform") this.dirtyEntities.add(change.entityId);
    });

    // Rough low-end detection: few cores or small RAM budget => cheaper
    // default renderer (no MSAA, pixelRatio 1). This is what makes Studio
    // usable in Edge/laptops out of the box.
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const cores = nav?.hardwareConcurrency ?? 8;
    const mem = (nav as unknown as { deviceMemory?: number })?.deviceMemory ?? 8;
    this.lowEnd = cores <= 4 || mem <= 4;
  }

  /** Enable/disable the per-frame render (used when a non-viewport tab is active). */
  public setRenderEnabled(enabled: boolean): void {
    if (enabled && !this.renderEnabled) {
      // Returning to the viewport from another tab must redraw at least once —
      // needsRender may have been consumed by the last frame before the switch.
      this.needsRender = true;
    }
    this.renderEnabled = enabled;
  }


  /** Play/pause simulation mode: switches between dirty-transform sync (edit)
   *  and full per-frame sync (play, where physics mutates ECS directly). */
  public setSimulationActive(active: boolean): void {
    this.simulationActive = active;
    if (active) {
      // Entering play mode: re-render the "Player" entity as the Roblox R6
      // avatar (in the launcher account's colors) instead of the blue cube.
      const player = this.ecs.getEntityByName("Player");
      if (player) this.createOrUpdateMesh(player);
    } else if (this.runtimeAvatar) {
      // Leaving play mode: remove the runtime avatar so it never lingers in
      // the edit scene (the blue cube is rebuilt normally on the next edit).
      this.scene.remove(this.runtimeAvatar.group);
      this.runtimeAvatar.dispose();
      this.runtimeAvatar = null;
      this.runtimeAvatarOwnerId = null;
      this.appliedAvatarColorKey = null;
      // Restore the cube mesh that was hidden under the avatar.
      const player = this.ecs.getEntityByName("Player");
      if (player) {
        const cube = this.entityMeshes.get(player.id);
        if (cube) cube.visible = !player.isHidden;
      }
    }
  }

  /** Key of the avatar colors last applied to the live runtime avatar.
   *  The launcher can push new colors via postMessage AFTER play started — the
   *  render loop compares this cheap string and recolors the avatar in place. */
  private appliedAvatarColorKey: string | null = null;

  private avatarColorKey(colors: { head: string; torso: string; shirt: string }): string {
    return `${colors.head}:${colors.torso}:${colors.shirt}`;
  }

  /** Lazily create / take ownership of the R6 runtime avatar for a Player. */
  private ensureRuntimeAvatar(entity: Entity): void {
    if (this.runtimeAvatar && this.runtimeAvatarOwnerId === entity.id) {
      // Colors may have arrived after play started (launcher postMessage) —
      // recolor cheaply in place, no rebuild.
      this.runtimeAvatar.setColors(studioAvatarColors);
      this.appliedAvatarColorKey = this.avatarColorKey(studioAvatarColors);
      return;
    }
    if (this.runtimeAvatar) {
      this.scene.remove(this.runtimeAvatar.group);
      this.runtimeAvatar.dispose();
    }
    this.runtimeAvatar = new StudioAvatar({ ...studioAvatarColors });
    this.scene.add(this.runtimeAvatar.group);
    this.runtimeAvatarOwnerId = entity.id;
    this.appliedAvatarColorKey = this.avatarColorKey(studioAvatarColors);
  }

  /** Remove & release the runtime avatar if it belongs to the given entity. */
  private releaseRuntimeAvatarIfOwned(entityId: string): void {
    if (this.runtimeAvatarOwnerId !== entityId) return;
    if (this.runtimeAvatar) {
      this.scene.remove(this.runtimeAvatar.group);
      this.runtimeAvatar.dispose();
    }
    this.runtimeAvatar = null;
    this.runtimeAvatarOwnerId = null;
    this.appliedAvatarColorKey = null;
  }

  /** Mark the scene dirty so the next rAF actually redraws. Also starts the
   *  interaction window for the adaptive-quality probe: while the user moves
   *  the camera/gizmo we REALLY render, so measuring FPS then is meaningful. */
  private markRender(): void {
    this.needsRender = true;
    this.interactiveFrames = 90; // ~1.5 s at 60 fps of real rendering
  }

  /** Пометить shadow map для перегенерации на СЛЕДУЮЩЕМ кадре. При
   *  autoUpdate=false three.js перерисует тень ровно один раз (по
   *  needsUpdate), затем она остаётся закэшированной — вращение/панорама
   *  камеры больше НЕ пересчитывают тень всех частей мира. */
  private markShadowDirty(): void {
    if (this.dirLight) this.dirLight.shadow.needsUpdate = true;
  }


  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Shadow map tuned for the machine: big casters on low-end machines get a
   * half-res shadow atlas. Directional shadow passes are the most expensive
   * part of the Studio frame after the water; cutting map size 2048→1024
   * roughly halves the shadow render cost.
   */
  private applyAdaptiveShadowMap(): void {
    if (!this.dirLight || !this.renderer) return;
    const size = this.lowEnd || this.qualityDropped ? 1024 : 2048;
    if (this.dirLight.shadow.mapSize.x !== size) {
      this.dirLight.shadow.mapSize.set(size, size);
      this.dirLight.shadow.map?.dispose();
      this.dirLight.shadow.map = null;
    }
  }

  public mount(container: HTMLElement, sceneData: SceneData): void {
    this.container = container;
    const width = Math.max(1, container.clientWidth || 800);
    const height = Math.max(1, container.clientHeight || 600);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (!this.renderer) {
      // Adaptive quality: weak machines (laptops, browsers like Edge) get a
      // cheaper renderer — no MSAA, pixelRatio 1, softer shadows. This alone
      // removes the 4K supersampling that made Studio crawl on HiDPI laptops.
      this.renderer = new THREE.WebGLRenderer({
        antialias: !this.lowEnd,
        alpha: false,
        powerPreference: "high-performance",
      });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.lowEnd ? 1 : 1.75));
      this.renderer.setSize(width, height, false);
      this.renderer.domElement.style.width = "100%";
      this.renderer.domElement.style.height = "100%";
      this.renderer.domElement.style.display = "block";
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = this.lowEnd ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      // Тень пересчитывается ТОЛЬКО когда сцена/свет реально изменились, а не
      // на каждый кадр орбиты камеры. Солнце статично — при вращении/панораме
      // shadow map не меняется, а её перегенерация рендерит ВСЕ части мира из
      // перспективы света: на студийных мирах с тысячами частей это половина
      // стоимости каждого кадра. Геометрия/свет помечаются markShadowDirty().
      this.renderer.shadowMap.autoUpdate = false;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.02;
      container.appendChild(this.renderer.domElement);
      this.setupEventListeners();
      this.applyAdaptiveShadowMap();
    } else if (this.renderer.domElement.parentElement !== container) {
      container.appendChild(this.renderer.domElement);
      this.renderer.setSize(width, height, false);
    }

    if (!this.transformControls && this.renderer) {
      this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
      this.transformControls.setSpace("world");
      this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
      this.transformControls.setScaleSnap(0.1);

      this.transformControls.addEventListener("dragging-changed", (event: any) => {
        this.transformControlDragging = Boolean(event.value);
        this.isOrbiting = false;
        this.isPanning = false;

        if (event.value) {
          this.captureTransformStart();
          if (this.selectedEntityId) this.onTransformStarted.fire(this.selectedEntityId);
        } else {
          this.transformStartObjects.clear();
          if (this.selectedEntityId) this.onTransformFinished.fire(this.selectedEntityId);
        }
      });

      this.transformControls.addEventListener("objectChange", () => {
        this.markShadowDirty();
        if (this.selectedEntityIds.length > 1 && this.transformControls?.object === this.transformPivot) {
          this.applyGroupTransform();
          return;
        }

        if (!this.selectedEntityId) return;
        const object = this.entityMeshes.get(this.selectedEntityId);
        const transform = this.ecs.getComponent<TransformComponent>(this.selectedEntityId, "Transform");
        if (!object || !transform) return;

        transform.position = { x: object.position.x, y: object.position.y, z: object.position.z };
        transform.rotation = { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z };
        transform.scale = {
          x: Math.max(0.05, object.scale.x),
          y: Math.max(0.05, object.scale.y),
          z: Math.max(0.05, object.scale.z),
        };
        this.ecs.setComponent(this.selectedEntityId, transform);
        this.updateSelectionHelpers();
      });

      this.transformControlsHelper = this.transformControls.getHelper() as THREE.Object3D;
      this.scene.add(this.transformControlsHelper);
      this.scene.add(this.transformPivot);

      // Hold Ctrl/Cmd while dragging to disable grid snap (fine positioning),
      // like Roblox Studio. Release restores the configured snap.
      if (!this.onSnapOverrideKeyDown) {
        this.onSnapOverrideKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && this.transformControlDragging && this.gridSnapEnabled && !this.snapOverrideActive) {
            this.snapOverrideActive = true;
            this.transformControls?.setTranslationSnap(null);
          }
        };
        this.onSnapOverrideKeyUp = (e: KeyboardEvent) => {
          if (this.snapOverrideActive && !e.ctrlKey && !e.metaKey) {
            this.snapOverrideActive = false;
            this.transformControls?.setTranslationSnap(this.translationSnap);
          }
        };
        window.addEventListener("keydown", this.onSnapOverrideKeyDown);
        window.addEventListener("keyup", this.onSnapOverrideKeyUp);
      }
    }

    this.applyEnvironment(sceneData.environment);
    this.rebuildScene();
  }

  public resize(width: number, height: number): void {
    if (!this.renderer || height <= 0) return;
    this.camera.aspect = Math.max(0.1, width / height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.markRender();
  }


  public applyEnvironment(env: SceneData["environment"]): void {
    const skyColors: Record<string, string> = {
      Morning: "#9dbbd7",
      Sunset: "#d98b71",
      SciFi: "#1d2a55",
      Cloudy: "#7b8795",
      Midnight: "#090c17",
    };
    const bgHex = skyColors[env.skybox] || "#151821";
    const skyColor = new THREE.Color(env.fogColor || bgHex);

    this.scene.background = new THREE.Color(bgHex);
    this.scene.fog = new THREE.FogExp2(skyColor, Math.max(0.001, env.fogDensity || 0.01));

    if (!this.ambientLight) {
      this.ambientLight = new THREE.AmbientLight(env.ambientColor || "#cbd5e1", (env.ambientIntensity || 0.55) * 0.58);
      this.scene.add(this.ambientLight);
    } else {
      this.ambientLight.color.set(env.ambientColor || "#cbd5e1");
      this.ambientLight.intensity = (env.ambientIntensity || 0.55) * 0.58;
    }

    if (!this.hemisphereLight) {
      this.hemisphereLight = new THREE.HemisphereLight(skyColor, new THREE.Color("#252831"), 0.58);
      this.hemisphereLight.position.set(0, 60, 0);
      this.scene.add(this.hemisphereLight);
    } else {
      this.hemisphereLight.color.copy(skyColor);
      this.hemisphereLight.intensity = 0.45 + (env.ambientIntensity || 0.55) * 0.18;
    }

    if (!this.dirLight) {
      this.dirLight = new THREE.DirectionalLight(env.sunColor || "#fff7ed", env.sunIntensity || 1.45);
      this.dirLight.position.set(30, 46, 26);
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.set(2048, 2048);
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 260;
      this.dirLight.shadow.camera.left = -70;
      this.dirLight.shadow.camera.right = 70;
      this.dirLight.shadow.camera.top = 70;
      this.dirLight.shadow.camera.bottom = -70;
      this.dirLight.shadow.bias = -0.00018;
      this.dirLight.shadow.normalBias = 0.035;
      this.scene.add(this.dirLight);
      this.scene.add(this.dirLight.target);
    } else {
      this.dirLight.color.set(env.sunColor || "#fff7ed");
      this.dirLight.intensity = env.sunIntensity || 1.45;
    }

    if (typeof env.timeOfDay === "number" && this.dirLight) {
      const hour = THREE.MathUtils.euclideanModulo(env.timeOfDay, 24);
      const sunAngle = ((hour - 6) / 12) * Math.PI;
      const daylight = THREE.MathUtils.clamp(Math.sin(sunAngle), 0.08, 1);
      const azimuth = ((hour - 12) / 24) * Math.PI * 2;
      this.dirLight.position.set(Math.cos(azimuth) * 55, 10 + daylight * 55, Math.sin(azimuth) * 55);
      this.dirLight.intensity = (env.sunIntensity || 1.45) * (0.52 + daylight * 0.48);
      this.dirLight.target.position.set(0, 0, 0);
      this.dirLight.target.updateMatrixWorld();
    }

    if (!this.gridHelper) {
      this.gridHelper = new THREE.GridHelper(220, 110, "#303541", "#22262f");
      this.gridHelper.position.y = -0.015;
      this.gridHelper.material.transparent = true;
      this.gridHelper.material.opacity = 0.5;
      this.scene.add(this.gridHelper);
    }

    if (!this.waterMesh) {
      const geometry = new THREE.PlaneGeometry(520, 520, 1, 1);
      geometry.rotateX(-Math.PI / 2);
      // Cheap water: MeshStandardMaterial with transparency instead of the old
      // MeshPhysicalMaterial(transmission: 0.42). Transmission renders the
      // whole scene into a second buffer every frame — the single most
      // expensive material in three.js. Weak laptops / Edge drop to ~10 FPS
      // solely because of it. The look (translucent blue surface) is kept.
      const material = new THREE.MeshStandardMaterial({
        color: env.waterColor || "#0a8bd8",
        transparent: true,
        opacity: 0.72,
        roughness: 0.18,
        metalness: 0.1,
      });
      this.waterMesh = new THREE.Mesh(geometry, material);
      this.waterMesh.receiveShadow = true;
      this.scene.add(this.waterMesh);
    }

    this.waterMesh.position.y = env.waterLevel;
    this.waterMesh.visible = env.waterLevel > -50;
    if (this.waterMesh.material instanceof THREE.MeshStandardMaterial) {
      this.waterMesh.material.color.set(env.waterColor || "#0a8bd8");
    }
    this.markShadowDirty();
  }

  public rebuildScene(): void {
    const previousSelection = [...this.selectedEntityIds];
    this.transformControls?.detach();
    this.clearSelectionHelpers();

    for (const [id, object] of this.entityMeshes.entries()) {
      this.scene.remove(object);
      this.disposeObject(object);
      this.entityMeshes.delete(id);
    }

    for (const entity of this.ecs.getAllEntities()) {
      this.createOrUpdateMesh(entity);
    }

    const restoredSelection = previousSelection.filter((id) => this.entityMeshes.has(id));
    if (restoredSelection.length > 0) {
      this.selectEntities(restoredSelection, false);
      this.setGizmoMode(this.activeGizmoMode);
    }
    this.markShadowDirty();
    this.markRender();
  }

  public createOrUpdateMesh(entity: Entity): void {
    const transform = this.ecs.getComponent<TransformComponent>(entity.id, "Transform");
    const meshComponent = this.ecs.getComponent<MeshComponent>(entity.id, "Mesh");
    if (!transform || !meshComponent) return;

    // Play mode: the "Player" entity renders as the Roblox R6 avatar (in the
    // launcher account colors) instead of its cube mesh. The cube stays alive
    // in entityMeshes (it is the selectable physics object) but is hidden.
    if (this.simulationActive && entity.name === "Player") {
      this.ensureRuntimeAvatar(entity);
      const cube = this.entityMeshes.get(entity.id);
      if (cube) cube.visible = false;
      return;
    }
    // The Play session ended but a rebuild still runs for the Player (e.g. a
    // script-triggered edit while exiting): clean up the dangling avatar.
    if (!this.simulationActive && this.runtimeAvatarOwnerId === entity.id) {
      this.releaseRuntimeAvatarIfOwned(entity.id);
    }

    let object = this.entityMeshes.get(entity.id);

    // Material/geometry change: rebuild the mesh from the shared cache. The
    // cache key already covers color/metalness/roughness/emissive, so a paint
    // change simply reuses (or creates) one shared material instead of a new
    // material per part per edit.
    if (
      object instanceof THREE.Mesh &&
      (object.userData.geometry !== meshComponent.geometry || object.userData.materialVersion !== this.materialVersion(meshComponent))
    ) {
      this.scene.remove(object);
      this.disposeObject(object);
      this.entityMeshes.delete(entity.id);
      object = undefined;
    }

    if (!object) {
      const geometry = this.createGeometry(meshComponent.geometry);
      const material = this.getOrCreateMaterial(meshComponent, transform);
      const mesh = new THREE.Mesh(geometry, material);

      mesh.castShadow = meshComponent.castShadows;
      mesh.receiveShadow = meshComponent.receiveShadows;
      mesh.frustumCulled = true;
      mesh.userData = {
        entityId: entity.id,
        entityName: entity.name,
        geometry: meshComponent.geometry,
        materialVersion: this.materialVersion(meshComponent),
      };

      this.scene.add(mesh);
      this.entityMeshes.set(entity.id, mesh);
      object = mesh;
      this.markShadowDirty();
    }

    object.position.set(transform.position.x, transform.position.y, transform.position.z);
    object.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    object.scale.set(transform.scale.x || 1, transform.scale.y || 1, transform.scale.z || 1);
    object.visible = !entity.isHidden;

    if (this.selectedEntityId === entity.id && this.selectionBox && object instanceof THREE.Mesh) {
      this.selectionBox.update();
    }
  }

  /** Инкрементальное удаление меша сущности — БЕЗ полного rebuildScene().
   *  Полный пересоздавал ВСЕ меши мира при добавлении/удалении ОДНОЙ части:
   *  на больших студийных мирах это секундный фриз на каждый клик. */
  public removeEntityMesh(entityId: string): void {
    const object = this.entityMeshes.get(entityId);
    if (object) {
      this.scene.remove(object);
      this.disposeObject(object);
      this.entityMeshes.delete(entityId);
    }
    if (this.selectedEntityIds.includes(entityId)) {
      const kept = this.selectedEntityIds.filter((id) => id !== entityId);
      this.selectEntities(kept, true);
    } else if (this.selectedEntityId === entityId) {
      this.selectedEntityId = null;
    }
    this.markRender();
  }

  public render(_dt: number): void {
    if (!this.renderer || !this.renderEnabled) return;

    // Render-on-demand (edit mode): a static Studio scene (nothing moved,
    // nothing selected/deselected, no ECS edit) must NOT redraw at 60 fps —
    // that is pure GPU/CPU waste and the #1 heat/battery/micro-stutter source
    // on laptops and Edge (HiDPI + integrated GPU). Play mode always renders
    // because physics mutates the scene every frame.
    if (!this.simulationActive && !this.needsRender && this.dirtyEntities.size === 0) {
      // While idle, the adaptive-quality probe must stay silent — otherwise it
      // would measure "0 FPS" from deliberately skipped frames and falsely
      // trigger the low-FPS downgrade. Only count frames the user is actually
      // interacting with (camera, gizmo, selection).
      this.interactiveFrames = Math.max(0, this.interactiveFrames - 1);
      if (this.interactiveFrames === 0) {
        this.qualityFrames = 0;
        this.qualityTime = 0;
      }
      return;
    }

    const now = performance.now();

    // Transform sync. Edit mode: only rewrite meshes whose ECS Transform
    // actually changed since the last frame (static worlds cost ~0 CPU).
    // Play mode: physics mutates ECS Transforms directly without firing the
    // change signal, so a full per-frame pass is required there.
    if (this.simulationActive) {
      for (const entity of this.ecs.getAllEntities()) {
        const object = this.entityMeshes.get(entity.id);
        if (!object) continue;
        const transform = this.ecs.getComponent<TransformComponent>(entity.id, "Transform");
        if (!transform) continue;
        object.position.set(transform.position.x, transform.position.y, transform.position.z);
        object.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        object.scale.set(transform.scale.x || 1, transform.scale.y || 1, transform.scale.z || 1);
        object.visible = !entity.isHidden;
      }
    } else if (this.dirtyEntities.size > 0) {
      for (const id of this.dirtyEntities) {
        const entity = this.ecs.getEntity(id);
        const object = this.entityMeshes.get(id);
        if (!entity || !object) continue;
        const transform = this.ecs.getComponent<TransformComponent>(id, "Transform");
        if (!transform) continue;
        object.position.set(transform.position.x, transform.position.y, transform.position.z);
        object.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        object.scale.set(transform.scale.x || 1, transform.scale.y || 1, transform.scale.z || 1);
      }
      this.dirtyEntities.clear();
    }

    // Play mode: sync the R6 avatar to the Player entity's transform and
    // animate the walk cycle. The avatar is NOT in entityMeshes (only the
    // cube is), so this is a dedicated pass.
    if (this.runtimeAvatar && this.runtimeAvatarOwnerId) {
      const playerEntity = this.ecs.getEntity(this.runtimeAvatarOwnerId);
      const playerTransform = playerEntity
        ? this.ecs.getComponent<TransformComponent>(this.runtimeAvatarOwnerId, "Transform")
        : undefined;
      if (playerEntity && playerTransform) {
        // Feet placement = the launcher engine's rule: the physics box is the
        // capsule center (feet at position - halfHeight), the visual avatar
        // group origin is the torso center whose feet hang to feetLocalY.
        // group.y = pos.y - halfHeight - feetLocalY puts the feet EXACTLY on
        // the physics capsule bottom — same character footprint as in-game.
        const feetY = playerTransform.position.y - this.runtimeAvatar.halfHeight;
        this.runtimeAvatar.group.position.set(
          playerTransform.position.x,
          feetY - this.runtimeAvatar.feetLocalY,
          playerTransform.position.z,
        );
        this.runtimeAvatar.group.rotation.set(0, playerTransform.rotation.y, 0);

        // Launcher may push color changes via postMessage AFTER play started —
        // recolor the live avatar in place when the shared palette changed.
        const colorKey = this.avatarColorKey(studioAvatarColors);
        if (colorKey !== this.appliedAvatarColorKey) {
          this.runtimeAvatar.setColors(studioAvatarColors);
          this.appliedAvatarColorKey = colorKey;
        }

        const body = this.ecs.getComponent<RigidBodyComponent>(this.runtimeAvatarOwnerId, "RigidBody");
        const speed = body?.velocity
          ? Math.min(1, Math.hypot(body.velocity.x, body.velocity.z) / 16)
          : 0;
        this.runtimeAvatar.animate(speed, Math.max(0.001, _dt), this.runtimeGrounded);
      }
    }

    // Adaptive quality: measure real FPS ONLY while the user is interacting
    // (camera/gizmo/selection). In a static scene the frame is skipped above,
    // so this probe never "sees" 0 FPS from an idle editor.
    if (!this.qualityDropped && this.interactiveFrames > 0) {
      this.qualityFrames++;
      this.qualityTime += _dt;
      if (this.qualityTime >= 4) {
        const fps = this.qualityFrames / this.qualityTime;
        if (fps < 45) {
          this.qualityDropped = true;
          this.renderer.setPixelRatio(1);
          this.applyAdaptiveShadowMap();
        }
        this.qualityFrames = 0;
        this.qualityTime = 0;
      }
    }


    // Rebuild selection helpers each frame from the live set so they always match selectedEntityIds
    this.refreshSelectionBoxesFromSet();

    if (this.runtimeFollowEntityId) {
      const targetTransform = this.ecs.getComponent<TransformComponent>(this.runtimeFollowEntityId, "Transform");
      if (targetTransform) {
        // Follow at the avatar's torso height (the visual center of mass),
        // matching the launcher camera look-at (pos.y + 0.8 for a 2.4 capsule).
        const followOffset = this.runtimeAvatar ? -this.runtimeAvatar.feetLocalY - this.runtimeAvatar.halfHeight + 0.8 : 1.4;
        const target = new THREE.Vector3(targetTransform.position.x, targetTransform.position.y + followOffset, targetTransform.position.z);
        this.cameraTarget.lerp(target, 0.12);
        this.updateCameraPosition();
      }
    }

    if (this.waterMesh?.visible) {
      const wave = Math.sin(now * 0.0013) * 0.018;
      this.waterMesh.position.y += wave * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
    this.drawCalls = this.renderer.info.render.calls || this.entityMeshes.size + 3;
    this.triangleCount = this.renderer.info.render.triangles || this.entityMeshes.size * 24;
    // One rendered frame consumed the need — the next rAF only redraws when
    // something marks the scene dirty again (camera/selection/ECS edit).
    this.needsRender = false;
  }

  private captureTransformStart(): void {

    this.transformStartObjects.clear();
    this.transformStartPivot.position.copy(this.transformPivot.position);
    this.transformStartPivot.quaternion.copy(this.transformPivot.quaternion);
    this.transformStartPivot.scale.copy(this.transformPivot.scale);

    for (const id of this.selectedEntityIds) {
      const object = this.entityMeshes.get(id);
      if (!object) continue;
      this.transformStartObjects.set(id, {
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
        scale: object.scale.clone(),
      });
    }
  }

  private applyGroupTransform(): void {
    const startPivotPosition = this.transformStartPivot.position;
    const deltaPosition = this.transformPivot.position.clone().sub(startPivotPosition);
    const deltaRotation = this.transformPivot.quaternion.clone().multiply(this.transformStartPivot.quaternion.clone().invert());
    const scaleRatio = new THREE.Vector3(
      this.transformPivot.scale.x / (this.transformStartPivot.scale.x || 1),
      this.transformPivot.scale.y / (this.transformStartPivot.scale.y || 1),
      this.transformPivot.scale.z / (this.transformStartPivot.scale.z || 1),
    );

    for (const [id, start] of this.transformStartObjects.entries()) {
      const object = this.entityMeshes.get(id);
      const transform = this.ecs.getComponent<TransformComponent>(id, "Transform");
      if (!object || !transform) continue;

      let nextPosition: THREE.Vector3;
      let nextQuaternion: THREE.Quaternion;
      let nextScale: THREE.Vector3;

      if (this.activeGizmoMode === "move") {
        nextPosition = start.position.clone().add(deltaPosition);
        nextQuaternion = start.quaternion.clone();
        nextScale = start.scale.clone();
      } else if (this.activeGizmoMode === "rotate") {
        const relative = start.position.clone().sub(startPivotPosition).applyQuaternion(deltaRotation);
        nextPosition = this.transformPivot.position.clone().add(relative);
        nextQuaternion = deltaRotation.clone().multiply(start.quaternion);
        nextScale = start.scale.clone();
      } else {
        const relative = start.position.clone().sub(startPivotPosition).multiply(scaleRatio);
        nextPosition = this.transformPivot.position.clone().add(relative);
        nextQuaternion = start.quaternion.clone();
        nextScale = start.scale.clone().multiply(scaleRatio).max(new THREE.Vector3(0.05, 0.05, 0.05));
      }

      object.position.copy(nextPosition);
      object.quaternion.copy(nextQuaternion);
      object.scale.copy(nextScale);
      transform.position = { x: nextPosition.x, y: nextPosition.y, z: nextPosition.z };
      transform.rotation = { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z };
      transform.scale = { x: nextScale.x, y: nextScale.y, z: nextScale.z };
      this.ecs.setComponent(id, transform);
    }
    this.updateSelectionHelpers();
  }

  private updatePivotToSelection(): void {
    const box = new THREE.Box3();
    let hasObject = false;
    for (const id of this.selectedEntityIds) {
      const object = this.entityMeshes.get(id);
      if (!object) continue;
      box.expandByObject(object);
      hasObject = true;
    }
    if (!hasObject) return;

    const center = new THREE.Vector3();
    box.getCenter(center);
    this.transformPivot.position.copy(center);
    this.transformPivot.rotation.set(0, 0, 0);
    this.transformPivot.scale.set(1, 1, 1);
  }

  private clearSelectionHelpers(): void {
    for (const helper of this.selectionBoxes.values()) this.scene.remove(helper);
    for (const outline of this.selectionOutlines.values()) {
      this.scene.remove(outline);
      outline.geometry.dispose();
      (outline.material as THREE.Material).dispose();
    }
    this.selectionBoxes.clear();
    this.selectionOutlines.clear();
    this.selectionBox = null;
    this.restoreAllEmissive();
  }

  public clearAllSelection(): void {
    this.selectedEntityIds = [];
    this.selectedEntityId = null;
    this.clearSelectionHelpers();
    this.attachTransformControlsToSelection();
    this.onSelectionChanged.fire([]);
    this.markRender();
  }


  private updateSelectionHelpers(): void {
    this.refreshSelectionBoxesFromSet();
  }

  private restoreAllEmissive(): void {
    for (const [id, original] of this.originalEmissive.entries()) {
      const object = this.entityMeshes.get(id);
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.emissive.setHex(original.color);
        object.material.emissiveIntensity = original.intensity;
      }
    }
    this.originalEmissive.clear();
  }

  private applySelectionHighlight(id: string, object: THREE.Mesh, isPrimary: boolean): void {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      if (!this.originalEmissive.has(id)) {
        this.originalEmissive.set(id, {
          color: material.emissive.getHex(),
          intensity: material.emissiveIntensity,
        });
      }
      material.emissive.set(isPrimary ? "#1d8f74" : "#2b4fbf");
      material.emissiveIntensity = isPrimary ? 0.55 : 0.38;
    }
  }

  private ensureOutline(id: string, object: THREE.Mesh, isPrimary: boolean): void {
    let outline = this.selectionOutlines.get(id);
    if (!outline) {
      const edges = new THREE.EdgesGeometry(object.geometry, 22);
      edges.userData.sourceUuid = object.geometry.uuid;
      const material = new THREE.LineBasicMaterial({
        color: isPrimary ? "#7cf3d4" : "#8db0ff",
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: isPrimary ? 1 : 0.95,
        linewidth: 2,
      });
      outline = new THREE.LineSegments(edges, material);
      outline.renderOrder = 999;
      outline.frustumCulled = false;
      this.scene.add(outline);
      this.selectionOutlines.set(id, outline);
    } else {
      // Пересоздаём рёбра ТОЛЬКО когда исходная геометрия реально сменилась
      // (прежний код спамил new EdgesGeometry() каждый кадр → утечка GPU-памяти).
      const existing = outline.geometry as THREE.EdgesGeometry;
      if (existing.userData.sourceUuid !== object.geometry.uuid) {
        outline.geometry.dispose();
        const edges = new THREE.EdgesGeometry(object.geometry, 22);
        edges.userData.sourceUuid = object.geometry.uuid;
        outline.geometry = edges;
      }
    }

    outline.position.copy(object.position);
    outline.rotation.copy(object.rotation);
    outline.scale.copy(object.scale).multiplyScalar(1.02);
    const mat = outline.material as THREE.LineBasicMaterial;
    mat.color.set(isPrimary ? "#7cf3d4" : "#8db0ff");
    mat.opacity = isPrimary ? 1 : 0.95;
    outline.visible = true;
  }

  /** Keep helpers and emissive highlights in sync every frame. */
  private refreshSelectionBoxesFromSet(): void {
    // Remove stale outlines
    for (const [id, outline] of this.selectionOutlines.entries()) {
      if (!this.selectedEntityIds.includes(id)) {
        this.scene.remove(outline);
        outline.geometry.dispose();
        (outline.material as THREE.Material).dispose();
        this.selectionOutlines.delete(id);
      }
    }
    // Restore emissive for deselected
    for (const id of Array.from(this.originalEmissive.keys())) {
      if (!this.selectedEntityIds.includes(id)) {
        const object = this.entityMeshes.get(id);
        const original = this.originalEmissive.get(id);
        if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial && original) {
          object.material.emissive.setHex(original.color);
          object.material.emissiveIntensity = original.intensity;
        }
        this.originalEmissive.delete(id);
      }
    }

    this.selectionBox = null;
    for (const id of this.selectedEntityIds) {
      const object = this.entityMeshes.get(id);
      if (!(object instanceof THREE.Mesh)) continue;
      const isPrimary = id === this.selectedEntityId;
      this.applySelectionHighlight(id, object, isPrimary);
      this.ensureOutline(id, object, isPrimary);
      if (isPrimary) {
        // Keep a lightweight box helper only for primary object as a fallback marker
        let helper = this.selectionBoxes.get(id);
        if (!helper) {
          helper = new THREE.BoxHelper(object, "#7cf3d4");
          const mat = helper.material as THREE.LineBasicMaterial;
          mat.depthTest = false;
          mat.transparent = true;
          mat.opacity = 0.9;
          helper.renderOrder = 12;
          this.scene.add(helper);
          this.selectionBoxes.set(id, helper);
        }
        helper.update();
        this.selectionBox = helper;
      }
    }

    // Remove primary-only box helpers for non-primary ids
    for (const [id, helper] of this.selectionBoxes.entries()) {
      if (id !== this.selectedEntityId) {
        this.scene.remove(helper);
        this.selectionBoxes.delete(id);
      }
    }
  }

  private attachTransformControlsToSelection(): void {
    if (!this.transformControls) return;
    if (this.runtimeFollowEntityId || ["select", "paint_material", "terrain"].includes(this.activeGizmoMode) || this.selectedEntityIds.length === 0) {
      this.transformControls.detach();
      return;
    }

    const modeMap: Record<string, "translate" | "rotate" | "scale"> = { move: "translate", rotate: "rotate", scale: "scale" };
    this.transformControls.setMode(modeMap[this.activeGizmoMode] || "translate");

    if (this.selectedEntityIds.length > 1) {
      this.updatePivotToSelection();
      this.transformControls.attach(this.transformPivot as any);
    } else {
      const object = this.entityMeshes.get(this.selectedEntityIds[0]);
      if (object) this.transformControls.attach(object as any);
    }
  }

  public setGridSnap(enabled: boolean, step = this.translationSnap): void {
    this.gridSnapEnabled = enabled;
    this.translationSnap = Math.max(0.05, step);
    this.transformControls?.setTranslationSnap(enabled ? this.translationSnap : null);
    this.transformControls?.setRotationSnap(enabled ? THREE.MathUtils.degToRad(15) : null);
    this.transformControls?.setScaleSnap(enabled ? 0.1 : null);
  }

  public setGridVisible(visible: boolean): void {
    if (this.gridHelper) this.gridHelper.visible = visible;
  }

  public setTransformSpace(space: "world" | "local"): void {
    this.transformControls?.setSpace(space);
  }

  public setCameraView(view: "perspective" | "top" | "front" | "right"): void {
    const radius = Math.max(10, this.spherical.radius);
    if (view === "top") {
      this.camera.position.set(this.cameraTarget.x, this.cameraTarget.y + radius, this.cameraTarget.z + 0.01);
      this.camera.up.set(0, 0, -1);
    } else if (view === "front") {
      this.camera.position.set(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z + radius);
      this.camera.up.set(0, 1, 0);
    } else if (view === "right") {
      this.camera.position.set(this.cameraTarget.x + radius, this.cameraTarget.y, this.cameraTarget.z);
      this.camera.up.set(0, 1, 0);
    } else {
      this.camera.up.set(0, 1, 0);
      this.spherical.set(radius, Math.PI / 3.15, Math.PI / 4);
      this.updateCameraPosition();
      return;
    }
    this.camera.lookAt(this.cameraTarget);
    this.markRender();
  }


  public setGizmoMode(mode: string): void {
    this.activeGizmoMode = mode;
    this.attachTransformControlsToSelection();
  }

  public selectEntity(entityId: string | null, notify = false): void {
    this.selectEntities(entityId ? [entityId] : [], notify);
  }

  public selectEntities(entityIds: string[], notify = true): void {
    const uniqueIds = Array.from(new Set(entityIds.filter((id) => this.entityMeshes.has(id))));
    const previousIds = this.selectedEntityIds.join(",");
    const nextIds = uniqueIds.join(",");

    this.selectedEntityIds = uniqueIds;
    this.selectedEntityId = uniqueIds[uniqueIds.length - 1] ?? null;

    if (previousIds !== nextIds) {
      this.clearSelectionHelpers();
      this.refreshSelectionBoxesFromSet();
    } else {
      this.refreshSelectionBoxesFromSet();
    }
    this.attachTransformControlsToSelection();

    if (notify) this.onSelectionChanged.fire([...this.selectedEntityIds]);
    this.markRender();
  }


  public toggleEntitySelection(entityId: string, notify = true): void {
    if (!this.entityMeshes.has(entityId)) return;
    const nextSelection = this.selectedEntityIds.includes(entityId)
      ? this.selectedEntityIds.filter((id) => id !== entityId)
      : [...this.selectedEntityIds, entityId];
    this.selectEntities(nextSelection, notify);
  }

  public getSelectedEntityIds(): string[] {
    return [...this.selectedEntityIds];
  }

  public setRuntimeFollowEntity(entityId: string | null): void {
    this.runtimeFollowEntityId = entityId;
    if (entityId) {
      this.transformControls?.detach();
      this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius, 8, 14);
      this.spherical.phi = Math.PI / 2.55;
    } else if (this.selectedEntityIds.length > 0) {
      this.setGizmoMode(this.activeGizmoMode);
    }
  }

  public focusEntity(entityId: string): void {
    const transform = this.ecs.getComponent<TransformComponent>(entityId, "Transform");
    if (!transform) return;
    this.cameraTarget.set(transform.position.x, transform.position.y, transform.position.z);
    this.updateCameraPosition();
    this.markRender();
  }

  public resetEditorCamera(): void {
    this.cameraTarget.set(0, 3, 0);
    this.spherical.set(28, Math.PI / 3.15, Math.PI / 4);
    this.updateCameraPosition();
    this.markRender();
  }


  /**
   * Позиция для размещения нового объекта ПЕРЕД КАМЕРОЙ (по лучу взгляда),
   * как в Roblox Studio: примитив появляется в центре вьюпорта, а не в одной
   * и той же точке сцены. Расстояние зависит от радиуса орбиты — объект
   * всегда оказывается между камерой и точкой фокуса.
   */
  public getPlacementPosition(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    if (direction.lengthSq() < 1e-6) direction.set(0, 0, -1);
    direction.normalize();
    const distance = Math.max(8, this.spherical.radius * 0.55);
    return this.camera.position.clone().addScaledVector(direction, distance);
  }

  /**
   * Editor fly-cam: move the orbit target along the camera-relative axes.
   * dir components are -1..1 (right, up, forward). Called every frame while
   * WASD/QE are held in edit mode.
   */
  public flyCamera(dir: { right: number; up: number; forward: number }, dt: number): void {
    if (this.runtimeFollowEntityId) return;
    if (dir.right === 0 && dir.up === 0 && dir.forward === 0) return;

    const speed = THREE.MathUtils.clamp(this.spherical.radius * 0.9, 8, 60);
    const step = speed * dt;

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    this.cameraTarget.addScaledVector(forward, dir.forward * step);
    this.cameraTarget.addScaledVector(right, dir.right * step);
    this.cameraTarget.y += dir.up * step;
    this.updateCameraPosition();
    this.markRender();
  }


  public getScreenshot(): string {

    if (!this.renderer) return "";
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL("image/png");
  }

  public dispose(): void {
    this.removeEventListeners();
    if (this.onSnapOverrideKeyDown) window.removeEventListener("keydown", this.onSnapOverrideKeyDown);
    if (this.onSnapOverrideKeyUp) window.removeEventListener("keyup", this.onSnapOverrideKeyUp);
    this.onSnapOverrideKeyDown = null;
    this.onSnapOverrideKeyUp = null;
    this.transformControls?.dispose();
    this.transformControls = null;
    this.transformControlsHelper = null;
    this.clearSelectionHelpers();
    if (this.runtimeAvatar) {
      this.scene.remove(this.runtimeAvatar.group);
      this.runtimeAvatar.dispose();
      this.runtimeAvatar = null;
      this.runtimeAvatarOwnerId = null;
      this.appliedAvatarColorKey = null;
    }
    for (const [, object] of this.entityMeshes) {
      this.scene.remove(object);
      this.disposeObject(object);
    }
    this.entityMeshes.clear();
    if (this.waterMesh) {
      this.scene.remove(this.waterMesh);
      this.waterMesh.geometry.dispose();
      (this.waterMesh.material as THREE.Material).dispose();
      this.waterMesh = null;
    }
    this.checkerTexture?.dispose();
    this.checkerTexture = null;

    // Release the SHARED material/texture caches — these are renderer-owned
    // and were deliberately never disposed by per-mesh disposeObject() (one
    // part must not break every other part sharing the look). At full teardown
    // we own them all, so dispose them here. Materials first, then textures.
    for (const material of this.materialCache.values()) {
      material.dispose();
    }
    this.materialCache.clear();
    this.cachedMaterialSet.clear();

    for (const texture of this.textureCache.values()) {
      texture.dispose();
    }
    this.textureCache.clear();
    this.sharedTextureSet.clear();
    this.ownedTextures.clear();

    this.renderer?.domElement.parentElement?.removeChild(this.renderer.domElement);
    this.renderer?.dispose();
    this.renderer = null;
  }

  private createGeometry(type: MeshComponent["geometry"]): THREE.BufferGeometry {
    switch (type) {
      // Deliberately LOW-poly: Roblox-style blocky look. Studio worlds contain
      // thousands of parts; a 32-segment sphere per part instantly becomes
      // millions of triangles on weak laptops / Edge. 14×10 sphere, 14-side
      // cylinder/cone and 5×12 capsule keep the classic blocky silhouette at
      // ~¾ the triangle count of before.
      case "sphere":
        return new THREE.SphereGeometry(0.5, 14, 10);
      case "cylinder":
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
      case "capsule":
        return new THREE.CapsuleGeometry(0.5, 1, 5, 12);
      case "cone":
        return new THREE.ConeGeometry(0.55, 1, 14);

      case "plane": {
        // Flat ground/stage plane, unit-sized (1×1), laid horizontally in the
        // XZ plane — matches the other primitives (scale applied by Transform).
        const g = new THREE.PlaneGeometry(1, 1);
        g.rotateX(-Math.PI / 2);
        return g;
      }
      case "wedge": {
        // Real sloped wedge, unit-sized like the other Studio primitives.
        // Matches the game engine's Part wedge convention: centered on the
        // origin (bottom at y=-0.5, top at y=+0.5), slope rising from -X to +X.
        // After Transform.scale it produces exactly the same shape as the
        // engine's shapeGeometry("wedge", size).
        const g = new THREE.BufferGeometry();
        const positions = new Float32Array([
          // Sloped top (quad 1)
          -0.5, -0.5, -0.5,   0.5, 0.5, -0.5,   0.5, 0.5, 0.5,
          -0.5, -0.5, -0.5,   0.5, 0.5, 0.5,   -0.5, -0.5, 0.5,
          // Bottom
          -0.5, -0.5, -0.5,   -0.5, -0.5, 0.5,  0.5, -0.5, 0.5,
          -0.5, -0.5, -0.5,   0.5, -0.5, 0.5,   0.5, -0.5, -0.5,
          // Left face (low triangle)
          -0.5, -0.5, -0.5,   -0.5, -0.5, 0.5,  -0.5, 0.5, -0.5,
          -0.5, -0.5, 0.5,    -0.5, 0.5, 0.5,   -0.5, 0.5, -0.5,
          // Right face (high triangle)
          0.5, -0.5, -0.5,    0.5, 0.5, -0.5,   0.5, -0.5, 0.5,
          0.5, -0.5, 0.5,     0.5, 0.5, -0.5,   0.5, 0.5, 0.5,
          // Back face (tall triangle)
          0.5, 0.5, -0.5,     -0.5, 0.5, -0.5,  -0.5, -0.5, -0.5,
          0.5, 0.5, -0.5,     -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
          // Front face (tall triangle)
          -0.5, -0.5, 0.5,    -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,
          -0.5, -0.5, 0.5,    0.5, 0.5, 0.5,    0.5, -0.5, 0.5,
        ]);
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        // Planar UV for the wedge — same approach as WorldBuilder.ts.
        // Without this, textures (material.map) are invisible in the Studio
        // viewport because three.js silently skips the map when a geometry
        // has no "uv" attribute. The launcher already had UVs via
        // shapeGeometry("wedge"); this brings the editor to parity.
        const uv = new Float32Array((positions.length / 3) * 2);
        for (let i = 0; i < positions.length; i += 3) {
          uv[(i / 3) * 2]     = 0.5 + positions[i];      // u: x ∈ [-0.5,0.5] → [0,1]
          uv[(i / 3) * 2 + 1] = 0.5 + positions[i + 1];  // v: y ∈ [-0.5,0.5] → [0,1]
        }
        g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        g.computeVertexNormals();
        return g;
      }
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  /** Cache key for a part's rendered look (color/metalness/roughness/emissive
   *  + texture/normal-map URLs). Пользовательская текстура даёт уникальный
   *  ключ — части с разными текстурами не делят один материал. */
  private materialKey(meshComponent: MeshComponent, transform: TransformComponent): string {
    const map = this.isLargeGroundPlane(meshComponent, transform) ? "checker" : "none";
    return `${meshComponent.color || "#d0d3d7"}:${meshComponent.metalness ?? 0.12}:${meshComponent.roughness ?? 0.52}:${meshComponent.emissive || ""}:${meshComponent.emissiveIntensity ?? 0}:${map}:${meshComponent.textureUrl || ""}:${meshComponent.normalMapUrl || ""}`;
  }

  /** Загрузка текстуры из URL (data URL или относительный путь) с кэшем — одна
   *  и та же текстура на многих частях грузится и живёт в GPU один раз. */
  private loadTexture(url: string | undefined): THREE.Texture | null {
    if (!url) return null;
    const cached = this.textureCache.get(url);
    if (cached) return cached;

    try {
      const texture = new THREE.TextureLoader().load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = this.renderer?.capabilities.getMaxAnisotropy() || 4;
      texture.needsUpdate = true;
      this.textureCache.set(url, texture);
      this.sharedTextureSet.add(texture);
      return texture;
    } catch {
      return null;
    }
  }

  /** Shared cached material for a part look — thousands of parts now use a
   *  handful of materials instead of thousands (biggest GPU win for Studio). */
  private getOrCreateMaterial(meshComponent: MeshComponent, transform: TransformComponent): THREE.MeshStandardMaterial {
    const key = this.materialKey(meshComponent, transform);
    const cached = this.materialCache.get(key);
    if (cached) return cached;

    const isGround = this.isLargeGroundPlane(meshComponent, transform);
    const material = new THREE.MeshStandardMaterial({
      color: isGround ? "#d0d3d7" : meshComponent.color || "#d0d3d7",
      roughness: meshComponent.roughness ?? 0.52,
      metalness: meshComponent.metalness ?? 0.12,
      emissive: meshComponent.emissive ? new THREE.Color(meshComponent.emissive) : new THREE.Color(0x000000),
      emissiveIntensity: meshComponent.emissiveIntensity ?? 0,
    });

    // Пользовательская текстура поверхности (textureUrl) перекрывает шахматку
    // для больших земель — виден свой рисунок вместо плоского цвета.
    const customMap = this.loadTexture(meshComponent.textureUrl);
    if (customMap) {
      material.map = customMap;
    } else {
      const map = this.resolveMaterialMap(meshComponent, transform);
      if (map) {
        material.map = map;
        this.ownedTextures.add(map);
      }
    }

    // Карта нормалей — поверхность выглядит объёмной.
    const normalMap = this.loadTexture(meshComponent.normalMapUrl);
    if (normalMap) {
      material.normalMap = normalMap;
      material.normalScale = new THREE.Vector2(1, 1);
    }

    this.materialCache.set(key, material);
    this.cachedMaterialSet.add(material);
    return material;
  }

  private isLargeGroundPlane(meshComponent: MeshComponent, transform: TransformComponent): boolean {
    return meshComponent.geometry === "plane" && Math.abs(transform.scale.x) >= 20 && Math.abs(transform.scale.z) >= 20;
  }

  private resolveMaterialMap(meshComponent: MeshComponent, transform: TransformComponent): THREE.CanvasTexture | null {
    if (!this.isLargeGroundPlane(meshComponent, transform)) return null;
    const texture = this.getCheckerTexture();
    if (texture) {
      const repeat = Math.max(10, Math.round(Math.max(Math.abs(transform.scale.x), Math.abs(transform.scale.z)) / 6));
      texture.repeat.set(repeat, repeat);
    }
    return texture;
  }

  private getCheckerTexture(): THREE.CanvasTexture | null {
    if (this.checkerTexture) return this.checkerTexture;
    if (typeof document === "undefined") return null;

    const size = 512;
    const cells = 16;
    const cell = size / cells;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;

    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        context.fillStyle = (x + y) % 2 === 0 ? "#34373d" : "#42454b";
        context.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    this.checkerTexture = new THREE.CanvasTexture(canvas);
    this.checkerTexture.wrapS = THREE.RepeatWrapping;
    this.checkerTexture.wrapT = THREE.RepeatWrapping;
    this.checkerTexture.anisotropy = this.renderer?.capabilities.getMaxAnisotropy() || 8;
    this.checkerTexture.colorSpace = THREE.SRGBColorSpace;
    this.checkerTexture.needsUpdate = true;
    return this.checkerTexture;
  }

  private setupEventListeners(): void {
    if (!this.renderer) return;
    const dom = this.renderer.domElement;

    const wrap = (type: string, handler: (event: any) => void, options?: boolean | AddEventListenerOptions) => {
      dom.addEventListener(type, handler as EventListener, options);
      this.domEventHandlers.push({ type, handler, options });
    };

    wrap("mousedown", (event: MouseEvent) => {
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
      if (event.button === 0) {
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (this.transformControlDragging) return;
        this.raycastSelect(event.shiftKey);
      } else if (event.button === 1) {
        event.preventDefault();
        this.isPanning = true;
      } else if (event.button === 2) {
        this.isOrbiting = true;
      }
    });

    wrap("mousemove", (event: MouseEvent) => {
      const deltaX = event.clientX - this.previousMousePosition.x;
      const deltaY = event.clientY - this.previousMousePosition.y;
      this.previousMousePosition = { x: event.clientX, y: event.clientY };

      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isOrbiting) {
        this.spherical.theta -= deltaX * 0.0072;
        this.spherical.phi = Math.max(0.12, Math.min(Math.PI - 0.12, this.spherical.phi - deltaY * 0.0072));
        this.updateCameraPosition();
        this.markRender();
      } else if (this.isPanning) {
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
        this.cameraTarget.addScaledVector(right, -deltaX * Math.max(0.005, this.spherical.radius * 0.0012));
        this.cameraTarget.addScaledVector(up, deltaY * Math.max(0.005, this.spherical.radius * 0.0012));
        this.updateCameraPosition();
        this.markRender();
      }
    });


    const stopMotion = () => {
      this.isOrbiting = false;
      this.isPanning = false;
    };

    wrap("mouseup", stopMotion);
    wrap("mouseleave", stopMotion);
    wrap("contextmenu", (event: MouseEvent) => event.preventDefault());
    wrap(
      "wheel",
      (event: WheelEvent) => {
        event.preventDefault();
        this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius + event.deltaY * 0.028, 4, 260);
        this.updateCameraPosition();
        this.markRender();
      },
      { passive: false },
    );

  }

  private removeEventListeners(): void {
    if (!this.renderer) return;
    const dom = this.renderer.domElement;
    for (const { type, handler, options } of this.domEventHandlers) {
      dom.removeEventListener(type, handler as EventListener, options);
    }
    this.domEventHandlers = [];
  }

  private raycastSelect(additive = false): void {
    if (!this.renderer) return;
    if (this.transformControlDragging) return;

    this.raycaster.near = 0;
    this.raycaster.far = Infinity;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.entityMeshes.values()).filter(
      (object): object is THREE.Mesh => object instanceof THREE.Mesh,
    );
    const intersections = this.raycaster.intersectObjects(meshes, false);
    const entityId = intersections[0]?.object.userData?.entityId as string | undefined;

    if (additive) {
      // Shift+click: if we hit an object, toggle it; if not, do NOT clear selection
      if (entityId) this.toggleEntitySelection(entityId, true);
    } else {
      if (entityId) this.selectEntities([entityId], true);
      else this.selectEntities([], true);
    }
  }

  private updateCameraPosition(): void {
    const desiredPosition = new THREE.Vector3().setFromSpherical(this.spherical).add(this.cameraTarget);

    if (this.runtimeFollowEntityId) {
      const direction = desiredPosition.clone().sub(this.cameraTarget);
      const distance = direction.length();
      direction.normalize();
      this.raycaster.set(this.cameraTarget, direction);
      this.raycaster.near = 0.35;
      this.raycaster.far = distance;
      const blockers = Array.from(this.entityMeshes.entries())
        .filter(([id, object]) => id !== this.runtimeFollowEntityId && object.visible)
        .map(([, object]) => object);
      const hit = this.raycaster.intersectObjects(blockers, false)[0];
      if (hit && hit.distance < distance) {
        desiredPosition.copy(this.cameraTarget).addScaledVector(direction, Math.max(1.25, hit.distance - 0.45));
      }
    }

    this.camera.position.copy(desiredPosition);
    this.camera.lookAt(this.cameraTarget);
  }

  private materialVersion(meshComponent: MeshComponent): string {
    return `${meshComponent.geometry}:${meshComponent.color}:${meshComponent.metalness}:${meshComponent.roughness}:${meshComponent.emissive || ""}:${meshComponent.emissiveIntensity || 0}:${meshComponent.textureUrl || ""}:${meshComponent.normalMapUrl || ""}`;
  }

  /** Release a single object's GPU resources. Shared cached materials are NEVER
   *  disposed here — they belong to the materialCache and are owned by every
   *  part using that look (disposing one would break all the others). The same
   *  applies to textures: user textures (data URL / path) are cached in
   *  textureCache and SHARED by every part/material using that URL — disposing
   *  one would blank them all. Only textures the renderer itself owns (the
   *  checker canvas) are released here. The full caches are released in
   *  dispose() when the whole renderer is torn down. */
  private disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial) || !this.cachedMaterialSet.has(material)) {
          material.dispose();
        }
      }
    });
  }
}
