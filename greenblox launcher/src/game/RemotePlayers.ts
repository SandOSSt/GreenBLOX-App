import * as THREE from "three";
import { Avatar, avatarColorsFromHex, hexToNumber } from "./Avatar";
import type { RemotePlayer } from "../social/api";

interface RemoteAvatar {
  userId: number;
  name: string;
  nameSprite: THREE.Sprite;
  avatar: Avatar;
  /** Latest server snapshot — the destination of this interpolation window. */
  targetPos: THREE.Vector3;
  /** Position the avatar occupied when the current snapshot arrived. */
  startPos: THREE.Vector3;
  /** Time (performance.now) the current snapshot arrived — interpolation runs
   *  from startPos to targetPos over exactly one snapshot window (50 ms). */
  snapshotAt: number;
  currentPos: THREE.Vector3;
  lastPosition: THREE.Vector3;
  targetFace: number;
  currentFace: number;
  grounded: boolean;
  lastUpdate: number;
  /** Last applied custom colors (to re-apply only when they change). */
  lastColorsKey: string;
}

/**
 * Renders other players' blocky avatars in the shared scene.
 * Positions are smoothed (lerped) toward the latest server snapshot.
 * Name labels are billboard sprites attached directly to the scene so they
 * stay upright and readable while the avatar rotates (Roblox-style).
 */
export class RemotePlayers {
  private scene: THREE.Scene;
  private map = new Map<number, RemoteAvatar>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  private makeNameSprite(name: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = "bold 30px -apple-system, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Dark outline for readability over any background.
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(0,0,0,0.75)";
    ctx.strokeText(name, 128, 32);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, depthWrite: false, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3.2, 0.8, 1);
    return sprite;
  }

  // Snapshot interpolation window. The client syncs at 20 Hz (50 ms per tick),
  // so a remote player should take ~50 ms to arrive at the latest snapshot —
  // constant-speed movement with NO exponential decay. The old exponential lerp
  // started fast and then crawled: after every snapshot the avatar visibly
  // "pulsed" (fast start → slow finish → fast start), which looked exactly like
  // rubber-banding / a high ping while the remote player walked.
  private static readonly ARRIVAL_TIME = 0.05; // seconds (one sync tick)
  private static readonly ARRIVAL_MS = RemotePlayers.ARRIVAL_TIME * 1000;

  private upsert(player: RemotePlayer): RemoteAvatar {
    const existing = this.map.get(player.userId);
    if (existing) {
      existing.name = player.name;
      existing.targetPos.set(player.pos.x, player.pos.y, player.pos.z);
      existing.targetFace = player.face ?? existing.targetFace;
      existing.grounded = player.grounded ?? existing.grounded;
      existing.lastUpdate = Date.now();
      this.applyColors(existing, player);
      return existing;
    }

    const torsoColor = hexToNumber(player.avatarColor);
    const avatar = new Avatar({
      head: 0xf5cd30,
      torso: torsoColor,
      leftArm: 0xf5cd30,
      rightArm: 0xf5cd30,
      leftLeg: 0x4b6b3b,
      rightLeg: 0x4b6b3b,
      shirt: torsoColor,
    });
    // Remote avatars are rendered by the camera, never cast shadows onto gameplay.
    avatar.group.traverse((obj) => {
      obj.castShadow = false;
    });
    this.scene.add(avatar.group);

    // Name label lives directly in the scene (not inside the avatar group) so
    // it stays upright and readable while the avatar rotates (billboard sprite).
    const nameSprite = this.makeNameSprite(player.name);
    this.scene.add(nameSprite);
    nameSprite.position.set(player.pos.x, player.pos.y + 1.9, player.pos.z);

    const pos = new THREE.Vector3(player.pos.x, player.pos.y, player.pos.z);
    const startFace = player.face ?? 0;
    const entry: RemoteAvatar = {
      userId: player.userId,
      name: player.name,
      avatar,
      nameSprite,
      targetPos: pos.clone(),
      startPos: pos.clone(),
      // First snapshot: start==target → no interpolation motion this window.
      snapshotAt: performance.now(),
      currentPos: pos.clone(),
      lastPosition: pos.clone(),
      targetFace: startFace,
      currentFace: startFace,
      grounded: player.grounded ?? true,
      lastUpdate: Date.now(),
      lastColorsKey: "",
    };
    // Immediately apply the remote player's custom look (fallback to defaults).
    this.applyColors(entry, player);
    this.map.set(player.userId, entry);
    return entry;
  }

  /** Apply (or refresh) a remote player's custom avatar colors. */
  private applyColors(entry: RemoteAvatar, player: RemotePlayer): void {
    const colors = avatarColorsFromHex(player.avatarColors);
    if (!colors) return;
    const key = [
      colors.head,
      colors.torso,
      colors.leftArm,
      colors.rightArm,
      colors.leftLeg,
      colors.rightLeg,
      colors.shirt,
    ].join(":");
    if (key === entry.lastColorsKey) return;
    entry.lastColorsKey = key;
    entry.avatar.setColors(colors);
  }

  /** Reconcile against the latest server snapshot: add/update/remove avatars. */
  update(players: RemotePlayer[]): void {
    const seen = new Set<number>();
    for (const player of players) {
      seen.add(player.userId);
      this.upsert(player);
    }
    for (const userId of this.map.keys()) {
      if (!seen.has(userId)) this.remove(userId);
    }
  }

  remove(userId: number): void {
    const entry = this.map.get(userId);
    if (!entry) return;
    this.scene.remove(entry.avatar.group);
    this.scene.remove(entry.nameSprite);

    // Single-dispose sets (same pattern as RobloxEngine.dispose): geometries,
    // materials and textures are freed exactly once even if several meshes
    // share them. Without this, repeated join/leave cycles leak GPU resources
    // (canvas face textures, sprite textures) on every removed remote player.
    const freed = new Set<THREE.BufferGeometry>();
    const freedMats = new Set<THREE.Material>();
    const freedTextures = new Set<THREE.Texture>();
    const freeTexture = (tex: THREE.Texture | null) => {
      if (tex && !freedTextures.has(tex)) {
        freedTextures.add(tex);
        tex.dispose();
      }
    };

    // Free the sprite texture + material.
    if (entry.nameSprite.material instanceof THREE.SpriteMaterial) {
      freeTexture(entry.nameSprite.material.map);
      if (!freedMats.has(entry.nameSprite.material)) {
        freedMats.add(entry.nameSprite.material);
        entry.nameSprite.material.dispose();
      }
    }

    // Free the avatar's geometries, materials and canvas face textures.
    entry.avatar.group.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh) || !obj.geometry) return;
      if (!freed.has(obj.geometry)) {
        freed.add(obj.geometry);
        obj.geometry.dispose();
      }
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (!(m instanceof THREE.Material) || freedMats.has(m)) continue;
        freedMats.add(m);
        m.dispose();
        if (m instanceof THREE.MeshStandardMaterial) freeTexture(m.map);
      }
    });
    this.map.delete(userId);
  }

  clear(): void {
    for (const userId of [...this.map.keys()]) this.remove(userId);
  }

  /** Smoothly move every remote avatar toward its target; idle bob animation. */
  step(dt: number): void {
    const nowMs = performance.now();
    for (const entry of this.map.values()) {
      // Truly constant-speed interpolation: the avatar's rendered position is a
      // LINEAR function of wall-clock time between the snapshot start and the
      // 50 ms arrival — `currentPos = lerp(startPos, targetPos, t)` with
      // `t = elapsed / ARRIVAL_MS`. Unlike `lerp(k)` (which is exponential:
      // fast start → crawl → fast start, readable as rubber-banding), this
      // covers the whole gap at a constant rate and arrives exactly when the
      // next snapshot is expected. Time-based (not frame-based) so the motion
      // stays smooth even at 30 / 60 / 144 fps.
      const t = Math.min(1, Math.max(0, (nowMs - entry.snapshotAt) / RemotePlayers.ARRIVAL_MS));
      entry.currentPos.set(
        entry.startPos.x + (entry.targetPos.x - entry.startPos.x) * t,
        entry.startPos.y + (entry.targetPos.y - entry.startPos.y) * t,
        entry.startPos.z + (entry.targetPos.z - entry.startPos.z) * t
      );


      const avatar = entry.avatar;
      // Same foot anchoring as the local player
      // (RobloxEngine.update: avatar.group.y = feetY + 1.05, feetY = pos.y - height/2
      //  => group.y = pos.y - 1.2 + 1.05 = pos.y - 0.15).
      // The tiny idle bob keeps remote players feeling alive without lifting feet.
      const bob = Math.sin(nowMs / 450 + entry.userId) * 0.02;
      const baseY = entry.currentPos.y - 0.15 + bob;
      avatar.group.position.set(entry.currentPos.x, baseY, entry.currentPos.z);

      // Keep the name label floating above the head while the avatar turns.
      entry.nameSprite.position.set(entry.currentPos.x, baseY + 1.9, entry.currentPos.z);

      // Rotate toward the direction the remote player is facing (in the shortest arc).
      let diff = entry.targetFace - entry.currentFace;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      entry.currentFace += diff * Math.min(1, dt * 10);
      avatar.group.rotation.y = entry.currentFace;

      const speed = entry.currentPos.distanceTo(entry.lastPosition) / Math.max(dt, 0.001);
      avatar.animate(Math.min(1, speed / 16), dt, entry.grounded);
      entry.lastPosition.copy(entry.currentPos);
    }
  }

  get count(): number {
    return this.map.size;
  }

  dispose(): void {
    this.clear();
  }
}
