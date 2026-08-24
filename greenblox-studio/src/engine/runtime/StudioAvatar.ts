// Roblox-style blocky R6 avatar for Studio play mode.
// Mirrors the launcher's Avatar.ts — same SCALE, same proportions, same face —
// so pressing Play in Studio shows the SAME character (same size, same look)
// as the one you play with in the launcher, in your chosen colors. The colors
// are pushed from the launcher account over the "gb-token" postMessage channel
// (see StudioAccountBar + launcher App.openStudio).

import * as THREE from "three";

export interface AvatarHexColors {
  head: string;
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
  shirt: string;
}

export const DEFAULT_AVATAR_HEX: AvatarHexColors = {
  head: "#f5cd30",    // classic yellow head
  torso: "#0a52a0",   // blue torso
  leftArm: "#f5cd30",
  rightArm: "#f5cd30",
  leftLeg: "#4b6b3b", // green legs (classic)
  rightLeg: "#4b6b3b",
  shirt: "#0a52a0",
};

/** Live avatar colors used by the Studio play-mode character. Filled from the
 *  launcher account via the "gb-token" message; defaults to the classic look. */
export const studioAvatarColors: AvatarHexColors = { ...DEFAULT_AVATAR_HEX };

export function applyStudioAvatarColors(patch?: Partial<AvatarHexColors> | null): void {
  if (!patch || typeof patch !== "object") return;
  for (const key of Object.keys(DEFAULT_AVATAR_HEX) as (keyof AvatarHexColors)[]) {
    const value = patch[key];
    if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) {
      studioAvatarColors[key] = value;
    }
  }
}

// Identical to the launcher Avatar: R6 proportions (Roblox studs), torso
// center at 0, legs hang to -3u, head top at +2.245u → total height ≈ 5.245u.
// SCALE is the launcher's constant (0.34), so the Studio play character is
// EXACTLY the same size as the in-game avatar (~1.783 world units tall) and
// stands on the same physics capsule (height 2.4, radius ~0.45).
const SCALE = 0.34;
const TOTAL_UNITS = 5.245;

export class StudioAvatar {
  readonly group = new THREE.Group();
  head: THREE.Mesh;
  torso: THREE.Mesh;
  shirt: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;

  /** Local y of the feet bottom relative to the group origin (torso center).
   *  Matches the launcher Avatar's feetLocalY (-3 * SCALE). */
  readonly feetLocalY = -3 * SCALE;
  /** Physics capsule half-height the avatar is placed onto — matches the
   *  launcher engine (playerHeight 2.4). */
  readonly halfHeight = 1.2;

  private walkPhase = 0;

  constructor(colors: AvatarHexColors = { ...studioAvatarColors }) {
    const mat = (hex: string) =>
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.55, metalness: 0 });

    // Torso: 2 wide x 2 tall x 1 deep units.
    const torsoGeo = new THREE.BoxGeometry(2 * SCALE, 2 * SCALE, 1 * SCALE);
    this.torso = new THREE.Mesh(torsoGeo, mat(colors.torso));
    this.torso.position.y = 0;
    this.torso.castShadow = true;

    // Shirt sits on top of the torso (slightly smaller than the torso shell).
    const shirtGeo = new THREE.BoxGeometry(1.94 * SCALE, 1.92 * SCALE, 0.96 * SCALE);
    this.shirt = new THREE.Mesh(shirtGeo, mat(colors.shirt));
    this.shirt.position.y = 0;
    this.shirt.castShadow = true;
    this.torso.add(this.shirt);

    // Head with a smiley face.
    const headGeo = new THREE.BoxGeometry(1.25 * SCALE, 1.25 * SCALE, 1.25 * SCALE);
    this.head = new THREE.Mesh(headGeo, mat(colors.head));
    this.head.position.y = 1 * SCALE + 0.62 * SCALE; // 1.62 * SCALE, as the launcher
    this.head.castShadow = true;
    this.addFace(this.head);

    // Arms (1x2x1) — pivot at shoulder.
    this.leftArm = this.makeLimb(colors.leftArm, mat);
    this.leftArm.position.set(-1.5 * SCALE, 1 * SCALE, 0);
    this.rightArm = this.makeLimb(colors.rightArm, mat);
    this.rightArm.position.set(1.5 * SCALE, 1 * SCALE, 0);

    // Legs (1x2x1) — pivot at hip.
    this.leftLeg = this.makeLimb(colors.leftLeg, mat);
    this.leftLeg.position.set(-0.5 * SCALE, -1 * SCALE, 0);
    this.rightLeg = this.makeLimb(colors.rightLeg, mat);
    this.rightLeg.position.set(0.5 * SCALE, -1 * SCALE, 0);

    this.group.add(this.torso, this.head, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
    // Group origin = torso center. Feet hang down to -3 * SCALE (feetLocalY);
    // the renderer places the group so the feet sit on the physics capsule bottom.
    this.group.position.y = 0;
  }

  private makeLimb(hex: string, mat: (h: string) => THREE.MeshStandardMaterial): THREE.Group {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(1 * SCALE, 2 * SCALE, 1 * SCALE);
    const mesh = new THREE.Mesh(geo, mat(hex));
    mesh.position.y = -1 * SCALE; // hang below pivot
    mesh.castShadow = true;
    g.add(mesh);
    return g;
  }

  private addFace(head: THREE.Mesh): void {
    // Simple smiley face drawn on a canvas texture, placed on +Z.
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 128, 128);
    // Eyes
    ctx.fillStyle = "#1b2a35";
    ctx.beginPath(); ctx.ellipse(44, 52, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(84, 52, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
    // Smile
    ctx.strokeStyle = "#1b2a35";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(64, 70, 22, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    const faceMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true });
    const faceGeo = new THREE.PlaneGeometry(1.25 * SCALE, 1.25 * SCALE);
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.63 * SCALE;
    head.add(face);
  }

  /** Recolor from a hex palette (all 7 parts). Cheap material writes — no rebuild. */
  setColors(colors: Partial<AvatarHexColors>): void {
    const set = (mesh: THREE.Mesh, hex?: string) => {
      if (mesh && hex) (mesh.material as THREE.MeshStandardMaterial).color.set(hex);
    };
    set(this.head, colors.head);
    set(this.torso, colors.torso);
    set(this.shirt, colors.shirt);
    set(this.leftArm.children[0] as THREE.Mesh, colors.leftArm);
    set(this.rightArm.children[0] as THREE.Mesh, colors.rightArm);
    set(this.leftLeg.children[0] as THREE.Mesh, colors.leftLeg);
    set(this.rightLeg.children[0] as THREE.Mesh, colors.rightLeg);
  }

  /** Release GPU resources (geometries/materials of every limb). The face
   *  texture is disposed too. Called when the play session ends. */
  dispose(): void {
    const visited = new Set<THREE.MeshStandardMaterial>();
    this.group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        if (visited.has(material)) continue;
        visited.add(material);
        material.map?.dispose();
        material.dispose();
      }
    });
  }

  /** Walk cycle. `speed` 0..1 (0 = idle), dt seconds, grounded = on the floor. */
  animate(speed: number, dt: number, grounded: boolean): void {
    if (speed > 0.05 && grounded) {
      this.walkPhase += dt * 9 * Math.min(1, speed + 0.4);
      const swing = Math.sin(this.walkPhase) * 0.6 * Math.min(1, speed);
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;
    } else if (!grounded) {
      // Jump pose: arms up a bit, legs tucked.
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, -0.3, 0.2);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0.3, 0.2);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, -0.8, 0.2);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.8, 0.2);
    } else {
      // Idle: return to rest.
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.15);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.15);
    }
  }
}

/** Export the shared scale so the renderer and physics can stay in sync with
 *  the launcher avatar without magic numbers. */
export { SCALE as AVATAR_SCALE };
