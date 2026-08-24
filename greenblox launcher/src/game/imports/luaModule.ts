// `import Lua` — spawns a friendly NPC that wanders the spawn island and
// reacts to the player (waves, taunts, gives hints). Modeled after a Roblox
// NPC scripted in Lua.
//
// This is a real, working module that hooks into the live engine.

import * as THREE from "three";
import { registerImport, pushLog } from "./registry";
import type { RobloxEngine } from "../RobloxEngine";

registerImport({
  language: "Lua",
  name: "WelcomeNPC.lua",
  description: "Adds an NPC that wanders near spawn and greets the player.",
  version: "1.0.3",
  color: "#4b9bff",
  install: (engine: RobloxEngine) => {
    // --- Build the NPC body (mini blocky avatar) ---
    const group = new THREE.Group();
    const mat = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.35), mat(0x2563eb));
    torso.position.y = 0;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), mat(0xf5cd30));
    head.position.y = 0.6;
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), mat(0xf5cd30));
    lArm.position.set(-0.5, 0, 0);
    const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), mat(0xf5cd30));
    rArm.position.set(0.5, 0, 0);
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), mat(0x14532d));
    lLeg.position.set(-0.18, -0.7, 0);
    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), mat(0x14532d));
    rLeg.position.set(0.18, -0.7, 0);
    [torso, head, lArm, rArm, lLeg, rLeg].forEach((m) => { m.castShadow = true; });
    group.add(torso, head, lArm, rArm, lLeg, rLeg);

    // Floating nameplate
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 256; labelCanvas.height = 64;
    const ctx = labelCanvas.getContext("2d")!;
    ctx.font = "bold 32px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#4b9bff";
    ctx.fillText("● NPC", 128, 42);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthTest: false });
    const label = new THREE.Sprite(labelMat);
    label.scale.set(2.4, 0.6, 1);
    label.position.y = 1.4;
    group.add(label);

    // Place him near spawn (in front of the spawn pad)
    const spawn = engine.world.spawnPos;
    group.position.set(spawn.x + 3, spawn.y - 0.2, spawn.z + 2);
    engine.scene.add(group);

    // Module state
    const state = {
      origin: group.position.clone(),
      phase: Math.random() * Math.PI * 2,
      greeted: false,
    };

    const inst: any = {
      id: "Lua_WelcomeNPC",
      language: "Lua" as const,
      name: "WelcomeNPC.lua",
      description: "Adds an NPC that wanders near spawn and greets the player.",
      version: "1.0.3",
      color: "#4b9bff",
      logs: [],
      data: state,
      detach: () => {
        engine.scene.remove(group);
        // Stop the per-frame hook by removing it from the engine's user updaters.
        const arr = (engine as any).__userUpdaters as Array<(dt: number) => void> | undefined;
        if (arr) {
          const i = arr.indexOf(updater);
          if (i >= 0) arr.splice(i, 1);
        }
      },
    };

    pushLog(inst, "Lua VM initialized · CharacterAdded fired", "ok");
    pushLog(inst, "spawned NPC at (" + group.position.x.toFixed(1) + ", " + group.position.z.toFixed(1) + ")");

    // Per-frame behavior: wander in a small circle, wave arm, greet player when close
    const updater = (dt: number) => {
      state.phase += dt * 0.7;
      // Wander pattern
      const wx = state.origin.x + Math.cos(state.phase) * 2.5;
      const wz = state.origin.z + Math.sin(state.phase * 1.3) * 2.5;
      group.position.x += (wx - group.position.x) * Math.min(1, 2 * dt);
      group.position.z += (wz - group.position.z) * Math.min(1, 2 * dt);
      // Face the player if nearby, otherwise face walk direction
      const dx = engine.pos.x - group.position.x;
      const dz = engine.pos.z - group.position.z;
      const distSq = dx * dx + dz * dz;
      let face: number;
      if (distSq < 64) {
        face = Math.atan2(dx, dz);
        // Wave one arm energetically
        rArm.rotation.x = -Math.PI / 2 + Math.sin(state.phase * 8) * 0.4;
        if (!state.greeted) {
          state.greeted = true;
          pushLog(inst, "player detected · saying 'Welcome to GreenBlox!'", "ok");
        }
      } else {
        face = Math.atan2(wx - group.position.x, wz - group.position.z);
        rArm.rotation.x += (-rArm.rotation.x) * Math.min(1, 4 * dt);
        if (state.greeted && distSq > 200) {
          state.greeted = false;
        }
      }
      group.rotation.y += (face - group.rotation.y) * Math.min(1, 6 * dt);
      // Tiny bobbing while walking
      group.position.y = state.origin.y + Math.sin(state.phase * 4) * 0.08;
    };

    // Engine exposes a public user-updater array we patched on first import use.
    const arr = ((engine as any).__userUpdaters ||= []) as Array<(dt: number) => void>;
    arr.push(updater);

    return inst;
  },
});
