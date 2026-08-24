// Converts a GreenBlox Studio project (ECS entity graph) into the launcher
// engine's Part-based world so published Studio experiences can be played
// directly from the launcher.

import * as THREE from "three";
import { BuiltWorld } from "./WorldBuilder";
import { Part, PartKind, PartMaterial, PartShape } from "./types";
import { SceneSettings } from "./RobloxEngine";

// ---- Minimal projection of the Studio project types (kept local on purpose) ----
export interface StudioVector3 {
  x: number;
  y: number;
  z: number;
}

export interface StudioMesh {
  type: string;
  geometry?: string;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface StudioTransform {
  type: string;
  position?: StudioVector3;
  scale?: StudioVector3;
  rotation?: StudioVector3;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface StudioRigidBody {
  type: string;
  mass?: number;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface StudioComponent {
  type: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface StudioEntity {
  id: string;
  name: string;
  className: string;
  components: StudioComponent[];
  children?: string[];
}

export interface StudioEnvironment {
  skybox?: string;
  ambientColor?: string;
  sunColor?: string;
  fogColor?: string;
  fogDensity?: number;
  waterLevel?: number;
}

export interface StudioPhysics {
  gravity?: StudioVector3;
}

export interface StudioSceneData {
  rootEntities?: StudioEntity[];
  environment?: StudioEnvironment;
  physics?: StudioPhysics;
}

export interface StudioProject {
  id?: number;
  title: string;
  description?: string;
  author?: string;
  thumbnail?: string;
  genre?: string;
  version?: string;
  sceneData: StudioSceneData;
  luaScripts?: unknown[];
  uiCanvases?: unknown[];
  animationsData?: unknown[];
}

function hexColor(color: string | undefined, fallback: number): number {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return parseInt(trimmed.slice(1), 16);
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1], g = trimmed[2], b = trimmed[3];
    return parseInt(`${r}${r}${g}${g}${b}${b}`, 16);
  }
  // Very small named-color fallback for the most common Studio palette.
  const named: Record<string, number> = {
    red: 0xef4444, green: 0x22c55e, blue: 0x3b82f6, yellow: 0xf5cd30, orange: 0xf97316,
    purple: 0xa855f7, cyan: 0x06b6d4, pink: 0xec4899, white: 0xf2f3f3, black: 0x0a0a0a,
  };
  return named[trimmed.toLowerCase()] ?? fallback;
}

function findComponent<T extends StudioComponent>(entity: StudioEntity, type: string): T | undefined {
  return entity.components.find((c) => c.type === type && c.enabled !== false) as T | undefined;
}

function classifyEntity(entity: StudioEntity): {
  kind: PartKind;
  collidable: boolean;
} {
  const name = entity.name.toLowerCase();
  const className = entity.className.toLowerCase();

  if (name.includes("coin") || name.includes("gem") || name.includes("orb") || name.includes("монет")) {
    return { kind: "coin", collidable: false };
  }
  if (name.includes("win") || name.includes("finish") || name.includes("goal") || name.includes("triumph") || name.includes("финиш")) {
    return { kind: "win", collidable: true };
  }
  if (name.includes("lava") || name.includes("kill") || name.includes("danger") || name.includes("death")) {
    return { kind: "kill", collidable: true };
  }
  // "Player"/"Start"/"SpawnLocation" with a plain Part class MUST classify as a
  // checkpoint so the spawn-detection branch below actually runs. Otherwise the
  // entity falls through to "platform" and the spawn point is silently lost.
  if (className.includes("spawn") || name === "spawn" || name === "start" || name.includes("spawn") || name === "player") {
    return { kind: "checkpoint", collidable: true };
  }
  if (name.includes("checkpoint") || name.includes("stage") || name.includes("этап")) {
    return { kind: "checkpoint", collidable: true };
  }
  return { kind: "platform", collidable: true };
}

const SKYBOX_COLORS: Record<string, string> = {
  Morning: "#87ceeb",
  Sunset: "#fdba74",
  SciFi: "#1e293b",
  Cloudy: "#94a3b8",
  Midnight: "#0f172a",
};

export function studioProjectToWorld(project: StudioProject): {
  world: BuiltWorld;
  settings: SceneSettings;
} {
  const entities = project.sceneData.rootEntities ?? [];
  const env = project.sceneData.environment ?? {};

  let nextId = 1;
  const parts: Part[] = [];
  const spawnParts: THREE.Vector3[] = [];
  const checkpointLocs: THREE.Vector3[] = [];
  let coinCount = 0;
  let checkpointStage = 0;

  for (const entity of entities) {
    const transform = findComponent<StudioTransform>(entity, "Transform");
    if (!transform) continue;
    const mesh = findComponent<StudioMesh>(entity, "Mesh");
    if (!mesh) continue;

    const pos = transform.position ?? { x: 0, y: 0, z: 0 };
    const scale = transform.scale ?? { x: 2, y: 2, z: 2 };
    // Keep scale sane: Studio entities often encode world size in Transform scale.
    const size = new THREE.Vector3(Math.max(0.2, scale.x), Math.max(0.2, scale.y), Math.max(0.2, scale.z));

    let shape: PartShape = "block";
    const geometry = mesh.geometry ?? "cube";
    if (geometry === "sphere") shape = "sphere";
    else if (geometry === "cylinder") shape = "cylinder";
    else if (geometry === "wedge") shape = "wedge";
    else if (geometry === "capsule") shape = "capsule";
    else if (geometry === "cone") shape = "cone";
    // "plane" (Studio ground) has no engine equivalent — a thin block keeps
    // the same footprint and stays walkable/collidable in the game world.
    else if (geometry === "plane") {
      size.y = Math.max(0.2, size.y);
      shape = "block";
    }

    // Convert Studio rotation (radians) to engine Euler.
    const rot = transform.rotation ?? { x: 0, y: 0, z: 0 };
    const hasRotation = rot.x !== 0 || rot.y !== 0 || rot.z !== 0;

    const { kind, collidable } = classifyEntity(entity);
    const body = findComponent<StudioRigidBody>(entity, "RigidBody");
    const isStatic = !body || body.mass === 0 || body.mass === undefined;

    // Emissive Studio materials map to the engine's "neon" material.
    const emissive = mesh.emissive && (mesh.emissiveIntensity ?? 0) > 0.3;
    const material: PartMaterial = emissive ? "neon" : "plastic";
    const color = hexColor(mesh.color, kind === "win" ? 0xffd23f : kind === "kill" ? 0xd83a17 : kind === "checkpoint" ? 0x35c1ff : 0x9ca3af);

    const part: Part = {
      id: nextId++,
      pos: new THREE.Vector3(pos.x, pos.y, pos.z),
      size,
      color,
      material,
      shape,
      collidable: kind !== "coin" && collidable,
      anchored: isStatic,
      kind,
      // Textures assigned in Studio (textureUrl/normalMapUrl) travel to the
      // game world — the engine's materialFor applies them as diffuse/normal
      // map, so a textured part looks the same in the launcher game.
      textureUrl: typeof mesh.textureUrl === "string" && mesh.textureUrl ? mesh.textureUrl : undefined,
      normalMapUrl: typeof mesh.normalMapUrl === "string" && mesh.normalMapUrl ? mesh.normalMapUrl : undefined,
      meta: {},
    };

    if (hasRotation) {
      part.rotation = new THREE.Euler(rot.x, rot.y, rot.z, "XYZ");
    }

    if (kind === "coin") {
      part.meta = { ...part.meta, baseY: pos.y, spin: true };
      coinCount++;
    }
    if (kind === "checkpoint") {
      // First checkpoint-like object (usually a SpawnLocation or "Player") is the spawn.
      // The className may be just "Part" — detect by NAME too: "Spawn", "Start",
      // "SpawnLocation", any name containing "spawn". Otherwise the start point
      // silently lands into checkpointLocs and the player spawns on stage 1.
      const nameLower = entity.name.toLowerCase();
      const classNameLower = entity.className.toLowerCase();
      const isSpawnLike =
        classNameLower.includes("spawn") ||
        nameLower === "spawn" ||
        nameLower === "start" ||
        nameLower.includes("spawn") ||
        nameLower === "player";
      const loc = new THREE.Vector3(pos.x, pos.y + Math.max(1, size.y / 2) + 1, pos.z);
      if (isSpawnLike) spawnParts.push(loc);
      else {
        // Stage number drives the engine's checkpoint progression. Without it
        // the engine sees stg = this.stage and the level never advances.
        checkpointStage++;
        checkpointLocs.push(loc);
        part.meta = { ...part.meta, stage: checkpointStage };
      }
    }

    parts.push(part);
  }

  const fallbackSpawn = new THREE.Vector3(0, 5, 0);
  const spawnPos = spawnParts[0] ?? checkpointLocs[0] ?? fallbackSpawn;
  const checkpoints = [spawnPos, ...checkpointLocs];
  const totalStages = Math.max(1, checkpoints.length - 1);

  const waterLevel = env.waterLevel ?? -100;
  const settings: SceneSettings = {
    skyColor: SKYBOX_COLORS[env.skybox ?? "Morning"] ?? "#87ceeb",
    fogColor: env.fogColor ?? "#87ceeb",
    fogNear: 60,
    fogFar: 320,
    voidLevel: waterLevel > -50 ? waterLevel - 12 : -40,
  };

  // If the scene has no win part, synthesize a win pad a short walk from the
  // spawn at the SAME height — the player must actually be able to reach it.
  // (The old +90 offset was unreachable: a jump is ~2.4 units, so Studio
  // worlds without a finish object were unbeatable.)
  if (!parts.some((p) => p.kind === "win")) {
    parts.push({
      id: nextId++,
      pos: new THREE.Vector3(spawnPos.x + 12, spawnPos.y, spawnPos.z),
      size: new THREE.Vector3(10, 1, 10),
      color: 0xffd23f,
      material: "neon",
      shape: "block",
      collidable: true,
      anchored: true,
      kind: "win",
      meta: { synth: true },
    });
  }

  return {
    world: {
      parts,
      spawnPos,
      checkpoints,
      totalStages,
      totalCoins: coinCount,
    },
    settings,
  };
}
