// LunaScript-style shared types for the Roblox-like sandbox.
// Mirrors std::vec, std::color, std::physics concepts.

import * as THREE from "three";

export type Vec3Like = { x: number; y: number; z: number };

// A "Part" is the fundamental building block in Roblox.
export interface Part {
  id: number;
  pos: THREE.Vector3;      // center position
  size: THREE.Vector3;     // dimensions
  color: number;           // hex color
  material: PartMaterial;
  shape: PartShape;
  collidable: boolean;
  anchored: boolean;       // immovable
  kind: PartKind;          // gameplay role
  /** Diffuse texture URL (data: or path) set in Studio — rendered by materialFor. */
  textureUrl?: string;
  /** Normal map URL set in Studio — rendered by materialFor. */
  normalMapUrl?: string;
  /** Euler rotation in radians (x, y, z) — applied to visual mesh. */
  rotation?: THREE.Euler;
  meta?: Record<string, unknown>;
  mesh?: THREE.Mesh;
}

export type PartShape = "block" | "sphere" | "cylinder" | "wedge" | "capsule" | "cone";
export type PartMaterial = "plastic" | "neon" | "metal" | "grass" | "wood" | "brick" | "ice" | "lava";

export type PartKind =
  | "baseplate"
  | "platform"
  | "spawn"
  | "checkpoint"
  | "coin"
  | "kill"        // lava / killbrick
  | "win"         // finish pad
  | "decor"
  | "user";       // player-placed

export interface GameStats {
  fps: number;
  parts: number;
  stage: number;
  totalStages: number;
  coins: number;
  totalCoins: number;
  deaths: number;
  time: number;
  position: Vec3Like;
  won: boolean;
}

export const MATERIAL_PROPS: Record<PartMaterial, { roughness: number; metalness: number; emissive: number }> = {
  plastic: { roughness: 0.6, metalness: 0.0, emissive: 0 },
  neon:    { roughness: 0.3, metalness: 0.0, emissive: 1 },
  metal:   { roughness: 0.25, metalness: 0.85, emissive: 0 },
  grass:   { roughness: 0.95, metalness: 0.0, emissive: 0 },
  wood:    { roughness: 0.8, metalness: 0.0, emissive: 0 },
  brick:   { roughness: 0.9, metalness: 0.0, emissive: 0 },
  ice:     { roughness: 0.1, metalness: 0.1, emissive: 0 },
  lava:    { roughness: 0.5, metalness: 0.0, emissive: 0.6 },
};

// Roblox-classic palette.
export const PALETTE: { name: string; hex: number }[] = [
  { name: "Bright red", hex: 0xc4281c },
  { name: "Bright blue", hex: 0x0a52a0 },
  { name: "Bright yellow", hex: 0xf5cd30 },
  { name: "Bright green", hex: 0x4b974b },
  { name: "Bright orange", hex: 0xd87c3b },
  { name: "Bright violet", hex: 0x6b327c },
  { name: "Lime green", hex: 0xa1c823 },
  { name: "Cyan", hex: 0x12a89d },
  { name: "Pink", hex: 0xe8a1c4 },
  { name: "White", hex: 0xf2f3f3 },
  { name: "Medium stone grey", hex: 0xa3a2a5 },
  { name: "Really black", hex: 0x1b2a35 },
];

export const BUILD_MATERIALS: PartMaterial[] = ["plastic", "neon", "metal", "wood", "brick", "ice"];
