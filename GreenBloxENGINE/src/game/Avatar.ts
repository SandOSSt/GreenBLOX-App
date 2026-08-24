// Classic blocky Roblox-style avatar (R6 proportions).
// Built from simple boxes: head, torso, two arms, two legs.

import * as THREE from "three";

export interface AvatarColors {
  head: number;
  torso: number;
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  shirt: number;
}

export const DEFAULT_AVATAR: AvatarColors = {
  head: 0xf5cd30,    // classic yellow head
  torso: 0x0a52a0,   // blue torso
  leftArm: 0xf5cd30,
  rightArm: 0xf5cd30,
  leftLeg: 0x4b6b3b, // green legs (classic)
  rightLeg: 0x4b6b3b,
  shirt: 0x0a52a0,
};

// R6 dimensions (Roblox studs ~ our world units).
// Total height ≈ 5 studs. We scale to ~ 2.7 world units tall.
const SCALE = 0.34;

export class Avatar {
  group = new THREE.Group();
  head: THREE.Mesh;
  torso: THREE.Mesh;
  /** Shirt mesh — a slightly larger box over the torso, coloured from
   *  colors.shirt. The backend stores and syncs 7 avatar colors (incl. shirt);
   *  without a real shirt mesh the server-side shirt color was silently
   *  ignored by every player's client. */
  shirt: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  // Collision capsule dimensions (in world units).
  radius = 0.5;
  height = 2.4;
  walkPhase = 0;
  // Local y of the feet bottom relative to the group origin (torso center).
  feetLocalY = -3 * SCALE; // legs hang ~3 studs below torso center

  constructor(colors: AvatarColors = DEFAULT_AVATAR) {
    const mat = (c: number, emissive = 0) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.0, emissiveIntensity: emissive, emissive: emissive ? c : 0x000000 });

    // Torso: 2 wide x 2 tall x 1 deep studs.
    const torsoGeo = new THREE.BoxGeometry(2 * SCALE, 2 * SCALE, 1 * SCALE);
    this.torso = new THREE.Mesh(torsoGeo, mat(colors.torso));
    this.torso.position.y = 0;
    this.torso.castShadow = true;

    // Shirt sits on top of the torso (slightly smaller so it looks like a
    // fitted shirt wrapping the body, not a bigger shell).
    const shirtGeo = new THREE.BoxGeometry(1.94 * SCALE, 1.92 * SCALE, 0.96 * SCALE);
    this.shirt = new THREE.Mesh(shirtGeo, mat(colors.shirt));
    this.shirt.position.y = 0;
    this.shirt.castShadow = true;
    this.torso.add(this.shirt);

    // Head: 2x1x1 (roundish) — slightly bigger cube + face.
    const headGeo = new THREE.BoxGeometry(1.25 * SCALE, 1.25 * SCALE, 1.25 * SCALE);
    this.head = new THREE.Mesh(headGeo, mat(colors.head));
    this.head.position.y = 1 * SCALE + 0.62 * SCALE;
    this.head.castShadow = true;
    this.addFace(this.head);

    // Arms (1x2x1) — pivot at shoulder for swinging.
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
    // Position so feet are at group origin's bottom.
    this.group.position.y = 0;
  }

  private makeLimb(color: number, mat: (c: number) => THREE.Material): THREE.Group {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(1 * SCALE, 2 * SCALE, 1 * SCALE);
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.position.y = -1 * SCALE; // hang below pivot
    mesh.castShadow = true;
    g.add(mesh);
    return g;
  }

  private addFace(head: THREE.Mesh) {
    // Simple smiley face drawn on a canvas texture, placed on +Z.
    const canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 128;
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

  // Animate walk cycle. `speed` 0..1 (0 = idle), dt seconds.
  animate(speed: number, dt: number, grounded: boolean) {
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

  setColors(colors: AvatarColors) {
    (this.head.material as THREE.MeshStandardMaterial).color.set(colors.head);
    (this.torso.material as THREE.MeshStandardMaterial).color.set(colors.torso);
    (this.shirt.material as THREE.MeshStandardMaterial).color.set(colors.shirt);
    ((this.leftArm.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(colors.leftArm);
    ((this.rightArm.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(colors.rightArm);
    ((this.leftLeg.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(colors.leftLeg);
    ((this.rightLeg.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(colors.rightLeg);
  }
}

export { SCALE as AVATAR_SCALE };

// ---- Color conversion helpers (RGB number <-> "#rrggbb" string) ----
// Used to sync the custom avatar colors with the backend so friends see
// your actual look, not just the account accent color.

export function hexToNumber(hex: string): number {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return Number.isNaN(value) ? 0x0a52a0 : value;
}

export function numberToHex(color: number): string {
  return "#" + (color >>> 0).toString(16).padStart(6, "0");
}

export function avatarColorsToHex(colors: AvatarColors): {
  head: string;
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
  shirt: string;
} {
  return {
    head: numberToHex(colors.head),
    torso: numberToHex(colors.torso),
    leftArm: numberToHex(colors.leftArm),
    rightArm: numberToHex(colors.rightArm),
    leftLeg: numberToHex(colors.leftLeg),
    rightLeg: numberToHex(colors.rightLeg),
    shirt: numberToHex(colors.shirt),
  };
}

/** Build SDK colors from a remote player's hex snapshot (with sane fallbacks). */
export function avatarColorsFromHex(hex?: {
  head?: string;
  torso?: string;
  leftArm?: string;
  rightArm?: string;
  leftLeg?: string;
  rightLeg?: string;
  shirt?: string;
}): AvatarColors | null {
  if (!hex) return null;
  const parts: (keyof AvatarColors)[] = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg", "shirt"];
  if (!parts.every((p) => typeof hex[p] === "string" && /^#[0-9a-fA-F]{6}$/.test(hex[p]!))) return null;
  return {
    head: hexToNumber(hex.head!),
    torso: hexToNumber(hex.torso!),
    leftArm: hexToNumber(hex.leftArm!),
    rightArm: hexToNumber(hex.rightArm!),
    leftLeg: hexToNumber(hex.leftLeg!),
    rightLeg: hexToNumber(hex.rightLeg!),
    shirt: hexToNumber(hex.shirt!),
  };
}
