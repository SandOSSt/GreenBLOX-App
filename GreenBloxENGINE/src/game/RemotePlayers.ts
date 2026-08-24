import * as THREE from "three";

/** Standalone GreenBloxENGINE stub — multiplayer is a launcher-only feature.
 *  Kept here so the shared RobloxEngine.ts compiles unchanged. */
export class RemotePlayers {
  constructor(_scene: THREE.Scene) {}
  update(_players: unknown[]): void {}
  remove(_userId: number): void {}
  clear(): void {}
  step(_dt: number): void {}
  dispose(): void {}
  get count(): number { return 0; }
}
