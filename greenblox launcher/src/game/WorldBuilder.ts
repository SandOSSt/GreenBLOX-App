// Builds the Roblox-style obby (obstacle course) level out of Parts.
// Each "stage" is a section ending with a checkpoint. Reach the finish to win.

import * as THREE from "three";
import { Part, PartKind, PartMaterial, PartShape } from "./types";

let nextId = 1;

function makePart(
  pos: [number, number, number],
  size: [number, number, number],
  color: number,
  kind: PartKind,
  opts: Partial<Pick<Part, "material" | "shape" | "collidable" | "anchored" | "meta">> = {}
): Part {
  return {
    id: nextId++,
    pos: new THREE.Vector3(pos[0], pos[1], pos[2]),
    size: new THREE.Vector3(size[0], size[1], size[2]),
    color,
    material: opts.material ?? "plastic",
    shape: opts.shape ?? "block",
    collidable: opts.collidable ?? true,
    anchored: opts.anchored ?? true,
    kind,
    meta: opts.meta,
  };
}

export interface BuiltWorld {
  parts: Part[];
  spawnPos: THREE.Vector3;
  checkpoints: THREE.Vector3[]; // index 0 = spawn
  totalStages: number;
  totalCoins: number;
}

// Stage colors cycle through a cheerful palette.
const STAGE_COLORS = [0x4b974b, 0x0a52a0, 0xf5cd30, 0xd87c3b, 0x6b327c, 0x12a89d, 0xc4281c, 0xa1c823];

export function buildObby(): BuiltWorld {
  nextId = 1;
  const parts: Part[] = [];
  const checkpoints: THREE.Vector3[] = [];
  let coinCount = 0;

  const addCoin = (x: number, y: number, z: number) => {
    parts.push(
      makePart([x, y, z], [0.9, 0.9, 0.25], 0xf5cd30, "coin", {
        material: "neon",
        shape: "cylinder",
        collidable: false,
        meta: { spin: true, baseY: y },
      })
    );
    coinCount++;
  };

  // --- Spawn island ---
  const spawnZ = 0;
  parts.push(makePart([0, 0, spawnZ], [16, 1, 16], 0x6aa84f, "spawn", { material: "grass" }));
  parts.push(makePart([0, 1.3, spawnZ], [4, 0.6, 4], 0x35c1ff, "decor", { material: "neon" }));
  const spawnPos = new THREE.Vector3(0, 3.5, spawnZ); // Spawn well above spawn platform (3.5 units up)
  checkpoints.push(new THREE.Vector3(0, 3.5, spawnZ));

  let z = 12; // running z offset for the path

  const stages: ((cx: number) => void)[] = [];

  // Stage 1: simple jumps across gaps.
  stages.push(() => {
    const col = STAGE_COLORS[0];
    for (let i = 0; i < 4; i++) {
      const px = (i % 2 === 0 ? -2 : 2);
      parts.push(makePart([px, 0.5 + i * 0.6, z], [3, 1, 3], col, "platform", { material: "plastic" }));
      if (i === 1) addCoin(px, 2.4 + i * 0.6, z);
      z += 5;
    }
  });

  // Stage 2: moving-ish narrow beams (we render static narrow beams) over lava.
  stages.push(() => {
    const col = STAGE_COLORS[1];
    // Lava pit underneath.
    parts.push(makePart([0, -2, z + 8], [10, 1, 22], 0xd83a17, "kill", { material: "lava" }));
    for (let i = 0; i < 4; i++) {
      parts.push(makePart([0, 1, z], [2, 0.6, 4], col, "platform", { material: "metal" }));
      if (i === 2) addCoin(0, 3, z);
      z += 5;
    }
  });

  // Stage 3: zig-zag thin platforms.
  stages.push(() => {
    const col = STAGE_COLORS[2];
    const xs = [-4, 4, -4, 4, 0];
    for (let i = 0; i < xs.length; i++) {
      parts.push(makePart([xs[i], 1.5 + i * 0.4, z], [2.5, 0.6, 2.5], col, "platform", { material: "plastic" }));
      if (i === 2) addCoin(xs[i], 3.5 + i * 0.4, z);
      z += 4.5;
    }
  });

  // Stage 4: ice slide (slippery) ramp.
  stages.push(() => {
    const col = 0xbfe9ff;
    for (let i = 0; i < 5; i++) {
      parts.push(makePart([0, 2 + i * 0.5, z], [5, 0.6, 4], col, "platform", { material: "ice", meta: { ice: true } }));
      z += 4;
    }
    addCoin(0, 5.5, z - 8);
  });

  // Stage 5: pillars you must hop across, lava below.
  stages.push(() => {
    const col = STAGE_COLORS[4];
    parts.push(makePart([0, -2, z + 10], [14, 1, 26], 0xd83a17, "kill", { material: "lava" }));
    const offs = [-3, 3, -3, 3, 0, 0];
    for (let i = 0; i < offs.length; i++) {
      parts.push(makePart([offs[i], 1 + (i % 2) * 1.2, z], [2, 0.6, 2], col, "platform", { material: "neon" }));
      if (i === 3) addCoin(offs[i], 3 + (i % 2) * 1.2, z);
      z += 4.2;
    }
  });

  // Stage 6: final stretch to the finish pad.
  stages.push(() => {
    const col = STAGE_COLORS[5];
    for (let i = 0; i < 3; i++) {
      parts.push(makePart([0, 2, z], [4, 0.6, 4], col, "platform", { material: "plastic" }));
      z += 5;
    }
    addCoin(0, 4, z - 10);
  });

  // Build each stage, drop a checkpoint after it.
  for (let s = 0; s < stages.length; s++) {
    stages[s](0);
    // Checkpoint platform.
    const cpY = parts.length ? 2 : 2;
    parts.push(makePart([0, 1.0, z], [5, 1, 3], 0x35c1ff, "checkpoint", { material: "neon", meta: { stage: s + 1 } }));
    // Flag pole on checkpoint.
    parts.push(makePart([1.8, 2.6, z], [0.2, 2.4, 0.2], 0xcccccc, "decor", { material: "metal" }));
    parts.push(makePart([1.2, 3.4, z], [1.4, 0.9, 0.1], 0x35c1ff, "decor", { material: "neon" }));
    checkpoints.push(new THREE.Vector3(0, cpY + 1.5, z));
    z += 7;
  }

  // --- Finish island ---
  parts.push(makePart([0, 0, z + 2], [12, 1, 12], 0xffd23f, "win", { material: "neon", meta: { finish: true } }));
  parts.push(makePart([0, 2.5, z + 2], [0.4, 4, 0.4], 0xcccccc, "decor", { material: "metal" }));
  parts.push(makePart([0, 4.6, z + 2], [3, 0.3, 3], 0xc4281c, "decor", { material: "plastic" }));

  return {
    parts,
    spawnPos,
    checkpoints,
    totalStages: stages.length,
    totalCoins: coinCount,
  };
}

export function materialColorAdjust(_m: PartMaterial, color: number): number {
  return color;
}

export function shapeGeometry(shape: PartShape, size: THREE.Vector3): THREE.BufferGeometry {
  switch (shape) {
    // Deliberately LOW-poly: Roblox-style blocky look. Studio worlds contain
    // thousands of parts; a 32-segment sphere per part instantly becomes
    // millions of triangles on weak laptops / Edge. 14×10 sphere and 14-side
    // cylinder keep the classic blocky silhouette at ~¾ the triangle count.
    case "sphere":
      return new THREE.SphereGeometry(Math.max(size.x, size.y, size.z) / 2, 14, 10);
    case "cylinder":
      return new THREE.CylinderGeometry(size.x / 2, size.x / 2, size.y, 14);
    case "capsule": {
      // CapsuleGeometry(radius, length, capSegments, radialSegments).
      // "length" is the straight cylinder body between the two hemisphere caps.
      // Total height = length + 2·radius, so bodyLength = max(0, y - 2·r).
      const r = Math.min(size.x, size.z) / 2;
      const bodyLen = Math.max(0, size.y - 2 * r);
      return new THREE.CapsuleGeometry(r, bodyLen, 5, 12);
    }
    case "cone":
      return new THREE.ConeGeometry(Math.min(size.x, size.z) / 2, size.y, 14);

    case "wedge": {
      // Real sloped wedge geometry (inclined plane + face + sides + base).
      // A wedge spans the full Z depth, with a flat bottom at y=-h/2 and a
      // slope rising from the -X face (low) to the +X face (high). The mesh is
      // CENTERED on the part origin (like blocks/spheres) so visuals, AABB
      // collision and surfaceHeightAt() all agree with part.pos / part.size.
      const w = size.x / 2, h = size.y, d = size.z / 2, hh = h / 2;
      const g = new THREE.BufferGeometry();
      const positions = new Float32Array([
        // Sloped top (quad 1)
        -w, -hh, -d,   w, hh, -d,   w, hh, d,
        -w, -hh, -d,   w, hh, d,    -w, -hh, d,
        // Bottom
        -w, -hh, -d,   -w, -hh, d,  w, -hh, d,
        -w, -hh, -d,   w, -hh, d,   w, -hh, -d,
        // Left face (low triangle)
        -w, -hh, -d,   -w, -hh, d,  -w, hh, -d,
        -w, -hh, d,    -w, hh, d,   -w, hh, -d,
        // Right face (high triangle)
        w, -hh, -d,    w, hh, -d,   w, -hh, d,
        w, -hh, d,     w, hh, -d,   w, hh, d,
        // Back face (tall triangle)
        w, hh, -d,     -w, hh, -d,  -w, -hh, -d,
        w, hh, -d,     -w, -hh, -d, w, -hh, -d,
        // Front face (tall triangle)
        -w, -hh, d,    -w, hh, d,   w, hh, d,
        -w, -hh, d,    w, hh, d,    w, -hh, d,
      ]);
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      // Planar UV for the slotless wedge — needed for Studio textures to show
      // on the slope (three.js skips the map when a geometry has no UVs).
      const uv = new Float32Array((positions.length / 3) * 2);
      for (let i = 0; i < positions.length; i += 3) {
        uv[(i / 3) * 2] = 0.5 + positions[i] / Math.max(0.001, size.x);
        uv[(i / 3) * 2 + 1] = 0.5 + positions[i + 1] / Math.max(0.001, size.y);
      }
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      g.computeVertexNormals();
      return g;
    }
    default:
      return new THREE.BoxGeometry(size.x, size.y, size.z);
  }
}
