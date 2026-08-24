import { ProjectData, Entity } from "./types/engine";

export const DEFAULT_PACKAGES = [
  {
    packageName: "@greenblox/character-controller",
    displayName: "AAA Character Controller",
    version: "2.4.1",
    description: "Production kinematic slope handling, variable jump heights, sprint inertia, and third-person orbital camera setup.",
    author: "GreenBlox Core Team",
    category: "Physics",
    downloads: 142850,
    sourceCode: `-- Character Controller package source\nlocal player = Workspace:FindFirstChild("Player")\nprint("[CharController] Initialized smoothly.")`,
    documentation: `# @greenblox/character-controller\nImport this module into any LocalScript to enable AAA player movement and air control.`
  },
  {
    packageName: "@greenblox/ragdoll-physics",
    displayName: "Ragdoll Physics & Break Constraints",
    version: "1.8.0",
    description: "Automatic joint disarticulation upon high velocity impacts, explosions, or fall triggers with buoyancy recovery.",
    author: "GreenBlox Labs",
    category: "Physics",
    downloads: 98400,
    sourceCode: `local function triggerRagdoll(part)\n  print("[Ragdoll] Simulating limb joint elasticity for " .. part.Name)\nend`,
    documentation: `# @greenblox/ragdoll-physics\nAttach to Humanoid models for dynamic physics collision feedback.`
  },
  {
    packageName: "@greenblox/tween-service-pro",
    displayName: "TweenService Pro & Bezier Easing",
    version: "3.1.0",
    description: "High performance interpolation for camera cinematic transitions, UI popups, and floating platform motion.",
    author: "Studio Pro FX",
    category: "VFX",
    downloads: 215000,
    sourceCode: `local tween = game:GetService("TweenService")\nprint("[TweenServicePro] Easing engines ready.")`,
    documentation: `# @greenblox/tween-service-pro\nSupports Elastic, Quad, Bounce, and Exponential interpolation curves.`
  },
  {
    packageName: "@greenblox/inventory-gui",
    displayName: "Responsive Flex Inventory UI",
    version: "1.5.2",
    description: "Grid-based item inventory with rarity color glows, icon badges, and drag-and-drop slots.",
    author: "UI Architects",
    category: "UI",
    downloads: 76300,
    sourceCode: `-- UI Module setup\nprint("[InventoryGUI] Mounted canvas to screen overlay.")`,
    documentation: `# @greenblox/inventory-gui\nConnects directly to RemoteEvents for verified server-side asset drops.`
  },
  {
    packageName: "@greenblox/pathfinding-astar",
    displayName: "NavMesh A* Pathfinding Agent",
    version: "2.0.4",
    description: "Real-time obstacle avoidance and behavior tree steering for RPG monsters and guards.",
    author: "AI Guild",
    category: "AI",
    downloads: 89120,
    sourceCode: `-- Pathfinding agent execution\nprint("[Pathfinding] NavMesh baked over terrain grid.")`,
    documentation: `# @greenblox/pathfinding-astar\nCall PathfindingService:CreatePath() to guide NPCs across platforms.`
  }
];

export const DEFAULT_PLUGINS = [
  {
    name: "Procedural Dungeon & Arena Builder",
    description: "Generate randomized combat chambers, interconnecting halls, and loot spawners in 1 click.",
    version: "1.2.0",
    author: "GreenBlox Official",
    targetSystem: "Terrain",
    isActiveByDefault: true,
    executionCode: `print("[Plugin] Dungeon Builder tool registered to Level Design shelf.")`,
    icon: "Boxes",
    uiHooks: { buttonText: "Generate Arena", tooltip: "Build randomized combat map" }
  },
  {
    name: "Material Painter Pro (PBR + Neon Glass)",
    description: "Brush tool to instantly paint metallic surfaces, reflective water mirrors, and cyberpunk neon glow.",
    version: "2.1.0",
    author: "ShaderFX Studio",
    targetSystem: "Rendering",
    isActiveByDefault: true,
    executionCode: `print("[Plugin] Material Painter shaders loaded into Three.js pipeline.")`,
    icon: "Palette",
    uiHooks: { buttonText: "PBR Paint", tooltip: "Apply materials by clicking objects" }
  },
  {
    name: "NetLag & Ping Simulator 3000",
    description: "Simulate dedicated server lag compensation, 150ms latency jitter, and rollback interpolation in Editor Play Mode.",
    version: "3.0.0",
    author: "Network Architects",
    targetSystem: "Networking",
    isActiveByDefault: false,
    executionCode: `print("[Plugin] NetLag simulator active: injecting synthetic jitter.")`,
    icon: "Wifi",
    uiHooks: { buttonText: "Simulate 150ms", tooltip: "Test net lag & rollback" }
  },
  {
    name: "Lua Debugger & Memory Watcher",
    description: "Deep inspection tool for active coroutine yield counts, heap consumption, and variable expression watches.",
    version: "4.0.0",
    author: "DevTools Team",
    targetSystem: "Lua",
    isActiveByDefault: true,
    executionCode: `print("[Plugin] Live memory diagnostics engaged.")`,
    icon: "Cpu",
    uiHooks: { buttonText: "Inspect Stack", tooltip: "View active Lua frames" }
  }
];

export const DEFAULT_ASSETS = [
  { name: "Cyber Armor Helmet (PBR)", type: "model", category: "Props", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop", author: "GreenBlox Official", fileSize: 480 },
  { name: "Neon Plasma Rifle", type: "model", category: "Weapons", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop", author: "Sci-Fi Foundry", fileSize: 320 },
  { name: "Medieval Castle Tower", type: "prefab", category: "Architecture", thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop", author: "World Builders", fileSize: 1240 },
  { name: "Drift Supercar Frame", type: "model", category: "Vehicles", thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop", author: "Apex Racing", fileSize: 890 },
  { name: "Spatial Reverb Ambient Audio", type: "audio", category: "Sound Effects", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop", author: "Audio Guild", fileSize: 640 },
  { name: "Health Bar & Stamina UI Template", type: "ui", category: "GUI", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&auto=format&fit=crop", author: "UI Architects", fileSize: 45 }
];

export function generateDefaultProjects(): ProjectData[] {
  const pvpArena: ProjectData = {
    title: "Cyber-Strike PvP Arena [Multiplayer AAA]",
    description: "High-octane dedicated server tactical FPS arena featuring neon volumetric lighting, weapons remote events, and lag compensation rollback test arenas.",
    author: "GreenBlox Engine Lead",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop",
    version: "2.1.0-RELEASE",
    isPublished: true,
    genre: "Action / FPS",
    installedPackages: ["@greenblox/character-controller", "@greenblox/inventory-gui", "@greenblox/tween-service-pro"],
    installedPlugins: ["Procedural Dungeon & Arena Builder", "Material Painter Pro (PBR + Neon Glass)"],
    viewsCount: 42910,
    likesCount: 8915,
    sceneData: {
      rootEntities: [
        {
          id: "ent_base_floor",
          name: "Arena_Baseplate",
          className: "Part",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 80, y: 1, z: 80 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "plane", color: "#1e293b", metalness: 0.8, roughness: 0.3, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0.8, bounciness: 0.1, collisionLayer: "Terrain", isTrigger: false, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_center_tower",
          name: "Neon_Monolith_Core",
          className: "Model",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 8, z: 0 }, rotation: { x: 0, y: 0.785, z: 0 }, scale: { x: 8, y: 16, z: 8 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cube", color: "#06b6d4", metalness: 0.9, roughness: 0.1, emissive: "#06b6d4", emissiveIntensity: 0.8, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0.5, bounciness: 0.3, collisionLayer: "Default", isTrigger: false, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_spawn_blue",
          name: "Team_Spawn_Blue",
          className: "SpawnLocation",
          components: [
            { type: "Transform", enabled: true, position: { x: -25, y: 1, z: -25 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 0.4, z: 6 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cylinder", color: "#3b82f6", metalness: 0.5, roughness: 0.5, emissive: "#2563eb", emissiveIntensity: 0.4, castShadows: false, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0.7, bounciness: 0, collisionLayer: "Trigger", isTrigger: true, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_spawn_red",
          name: "Team_Spawn_Red",
          className: "SpawnLocation",
          components: [
            { type: "Transform", enabled: true, position: { x: 25, y: 1, z: 25 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 0.4, z: 6 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cylinder", color: "#ef4444", metalness: 0.5, roughness: 0.5, emissive: "#dc2626", emissiveIntensity: 0.4, castShadows: false, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0.7, bounciness: 0, collisionLayer: "Trigger", isTrigger: true, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_player_char",
          name: "Player",
          className: "Model",
          components: [
            { type: "Transform", enabled: true, position: { x: -20, y: 3, z: -20 }, rotation: { x: 0, y: 0.5, z: 0 }, scale: { x: 2, y: 4, z: 2 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "capsule", color: "#10b981", metalness: 0.3, roughness: 0.4, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 75.0, friction: 0.8, bounciness: 0.1, collisionLayer: "Player", isTrigger: false, useGravity: true, buoyancyFactor: 1.0, velocity: { x: 0, y: 0, z: 0 } }
          ],
          children: []
        }
      ],
      environment: {
        skybox: "SciFi",
        ambientColor: "#38bdf8",
        ambientIntensity: 0.5,
        sunColor: "#f472b6",
        sunIntensity: 1.6,
        sunDirection: { x: 15, y: 30, z: 20 },
        fogColor: "#0f172a",
        fogDensity: 0.015,
        waterLevel: -100,
        waterColor: "#0369a1",
        enableBloom: true,
        enableSSAO: true,
        enableHDR: true
      },
      physics: {
        gravity: { x: 0, y: -19.62, z: 0 },
        timeScale: 1.0,
        enableSubStepping: true,
        airResistance: 0.01
      }
    },
    luaScripts: [
      {
        id: "script_arena_manager",
        name: "ArenaGameLoop.lua",
        type: "Script",
        code: `-- GreenBlox Dedicated Server Game Loop & Scoring
local Workspace = game:GetService("Workspace")
local TweenService = game:GetService("TweenService")
local RemoteEvent = game:GetService("RemoteEvent")

print("[Server] Cyber-Strike Arena Session Online. Tick Rate: 60Hz.")

-- Find Core Monolith and animate rotating glowing tower
local core = Workspace:FindFirstChild("Neon_Monolith_Core")
if core then
  print("[Arena] Located Core Monolith. Initiating rotation effect.")
end

-- Create scoreboard RemoteEvent
local scoreEvent = RemoteEvent.new("OnTeamScore")
scoreEvent:FireAllClients("Blue", 10)

print("[Server] Ready for player matchmaking.")`,
        description: "Main server game mode loop"
      },
      {
        id: "script_weapon_controller",
        name: "WeaponCombat.lua",
        type: "LocalScript",
        code: `-- Client-Side Weapons Raycast & Muzzle FX
local player = Workspace:FindFirstChild("Player")
print("[Weapons] Mounted Pulse Rifle to Player armor right arm bone.")

local function fireWeapon(targetPos)
  print("[Raycasting] Projectile fired toward coordinate vector.")
end

fireWeapon(Vector3.new(0, 5, 0))`,
        description: "Client gun shooting logic"
      }
    ],
    uiCanvases: [
      { id: "ui_score", name: "ScoreHUD", elementType: "Frame", x: 20, y: 20, width: 240, height: 60, anchor: "top-left", backgroundColor: "rgba(15, 23, 42, 0.85)", text: "BLUE: 10  |  RED: 0", textColor: "#38bdf8", fontSize: 20, borderRadius: 8, opacity: 1, visible: true },
      { id: "ui_ammo", name: "AmmoCounter", elementType: "Frame", x: 20, y: 20, width: 180, height: 50, anchor: "bottom-right", backgroundColor: "rgba(6, 182, 212, 0.9)", text: "PLASMA: 45 / ∞", textColor: "#ffffff", fontSize: 18, borderRadius: 12, opacity: 1, visible: true }
    ],
    animationsData: [
      {
        id: "anim_rifle_idle",
        name: "Rifle_Combat_Idle",
        duration: 2.0,
        loop: true,
        keyframes: [
          { time: 0, entityId: "ent_player_char", position: { x: -20, y: 3, z: -20 }, rotation: { x: 0, y: 0.5, z: 0 }, scale: { x: 2, y: 4, z: 2 } },
          { time: 1.0, entityId: "ent_player_char", position: { x: -20, y: 3.15, z: -20 }, rotation: { x: 0.05, y: 0.5, z: 0 }, scale: { x: 2, y: 4, z: 2 } },
          { time: 2.0, entityId: "ent_player_char", position: { x: -20, y: 3, z: -20 }, rotation: { x: 0, y: 0.5, z: 0 }, scale: { x: 2, y: 4, z: 2 } }
        ]
      }
    ]
  };

  const rpgOdyssey: ProjectData = {
    title: "Open-World RPG Odyssey [Terrain & Quests]",
    description: "Vast exploration world with procedural water buoyancy simulation, NavMesh AI village monsters, quest dialog trees, and customizable RPG inventories.",
    author: "Fantasy Realm Guild",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",
    version: "1.4.0",
    isPublished: true,
    genre: "Adventure / RPG",
    installedPackages: ["@greenblox/character-controller", "@greenblox/pathfinding-astar", "@greenblox/inventory-gui"],
    installedPlugins: ["Procedural Dungeon & Arena Builder"],
    viewsCount: 68140,
    likesCount: 15420,
    sceneData: {
      rootEntities: [
        {
          id: "ent_rpg_floor",
          name: "Meadow_Terrain",
          className: "Part",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 120, y: 2, z: 120 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "plane", color: "#15803d", metalness: 0.1, roughness: 0.9, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0.9, bounciness: 0.05, collisionLayer: "Terrain", isTrigger: false, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_npc_guard",
          name: "Village_Guard_NPC",
          className: "NPC",
          components: [
            { type: "Transform", enabled: true, position: { x: 8, y: 3, z: -10 }, rotation: { x: 0, y: 3.14, z: 0 }, scale: { x: 2, y: 4, z: 2 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "capsule", color: "#f59e0b", metalness: 0.6, roughness: 0.3, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 80, friction: 0.8, bounciness: 0.1, collisionLayer: "Player", isTrigger: false, useGravity: true, buoyancyFactor: 1.0 }
          ],
          children: []
        },
        {
          id: "ent_magic_crystal",
          name: "Ancient_Mana_Crystal",
          className: "Model",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 5, z: -25 }, rotation: { x: 0.3, y: 0.4, z: 0.2 }, scale: { x: 3, y: 5, z: 3 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cylinder", color: "#a855f7", metalness: 0.9, roughness: 0.1, emissive: "#9333ea", emissiveIntensity: 0.9, castShadows: true, receiveShadows: true }
          ],
          children: []
        }
      ],
      environment: {
        skybox: "Morning",
        ambientColor: "#fef08a",
        ambientIntensity: 0.7,
        sunColor: "#ffffff",
        sunIntensity: 2.0,
        sunDirection: { x: 25, y: 40, z: -15 },
        fogColor: "#dcfce7",
        fogDensity: 0.008,
        waterLevel: 0.5, // Realistic river buoyancy water
        waterColor: "#0284c7",
        enableBloom: true,
        enableSSAO: true,
        enableHDR: true
      },
      physics: {
        gravity: { x: 0, y: -19.62, z: 0 },
        timeScale: 1.0,
        enableSubStepping: true,
        airResistance: 0.02
      }
    },
    luaScripts: [
      {
        id: "script_quest_npc",
        name: "QuestGiverDialog.lua",
        type: "Script",
        code: `-- NPC Quest & Interactive Dialog Engine
local npc = Workspace:FindFirstChild("Village_Guard_NPC")
print("[QuestEngine] Registered Village Guard NPC interactivity.")
print("[Dialog] 'Greetings Traveler! Will you cleanse the Ancient Mana Crystal?'")`,
        description: "NPC dialogue tree trigger"
      }
    ],
    uiCanvases: [
      { id: "ui_quest", name: "QuestTracker", elementType: "Frame", x: 20, y: 90, width: 260, height: 75, anchor: "top-right", backgroundColor: "rgba(23, 23, 23, 0.85)", text: "QUEST: Examine Mana Crystal\nReward: 500 Gold & EXP", textColor: "#fbbf24", fontSize: 15, borderRadius: 10, opacity: 1, visible: true }
    ],
    animationsData: []
  };

  const driftCircuit: ProjectData = {
    title: "High-Speed Drift Circuit [Physics & Vehicles]",
    description: "Realistic vehicle suspension physics with impulse acceleration torque, check points, and lap timer leaderboard scripts.",
    author: "Apex Racing Team",
    thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
    version: "3.0.0",
    isPublished: true,
    genre: "Racing / Simulation",
    installedPackages: ["@greenblox/tween-service-pro"],
    installedPlugins: ["Material Painter Pro (PBR + Neon Glass)"],
    viewsCount: 31200,
    likesCount: 6110,
    sceneData: {
      rootEntities: [
        {
          id: "ent_track_asphalt",
          name: "Asphalt_Circuit",
          className: "Part",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 150, y: 1, z: 150 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "plane", color: "#334155", metalness: 0.4, roughness: 0.7, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0.95, bounciness: 0.05, collisionLayer: "Terrain", isTrigger: false, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_drift_car",
          name: "Turbo_Drifter_Vehicle",
          className: "Vehicle",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 4, y: 2, z: 8 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cube", color: "#ea580c", metalness: 0.8, roughness: 0.2, emissive: "#9a3412", emissiveIntensity: 0.2, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 1200, friction: 0.8, bounciness: 0.15, collisionLayer: "Vehicle", isTrigger: false, useGravity: true, buoyancyFactor: 0.3 }
          ],
          children: []
        }
      ],
      environment: {
        skybox: "Sunset",
        ambientColor: "#fdba74",
        ambientIntensity: 0.6,
        sunColor: "#fb923c",
        sunIntensity: 2.2,
        sunDirection: { x: -30, y: 25, z: -40 },
        fogColor: "#7c2d12",
        fogDensity: 0.01,
        waterLevel: -100,
        waterColor: "#0284c7",
        enableBloom: true,
        enableSSAO: true,
        enableHDR: true
      },
      physics: {
        gravity: { x: 0, y: -19.62, z: 0 },
        timeScale: 1.0,
        enableSubStepping: true,
        airResistance: 0.03
      }
    },
    luaScripts: [
      {
        id: "script_lap_timer",
        name: "LapLeaderboard.lua",
        type: "Script",
        code: `-- Vehicle Telemetry & Lap Timer Engine
print("[VehicleEngine] Suspension springs calibrated at 4000N/m.")
print("[Leaderboard] Current Best Lap: 42.15 seconds.")`,
        description: "Lap checkpoint script"
      }
    ],
    uiCanvases: [
      { id: "ui_speedometer", name: "SpeedHUD", elementType: "Frame", x: 30, y: 30, width: 200, height: 70, anchor: "bottom-right", backgroundColor: "rgba(154, 52, 18, 0.9)", text: "SPEED: 142 MPH\nGEAR: 4th [TURBO]", textColor: "#ffffff", fontSize: 18, borderRadius: 16, opacity: 1, visible: true }
    ],
    animationsData: []
  };

  const obbyPro: ProjectData = {
    title: "Obby Master Pro [Ragdoll & Parkour]",
    description: "Roblox-inspired high agility obstacle course featuring spinning lasers, falling platforms, ragdoll trigger events, and triumph checkpoints.",
    author: "Obby Kings",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop",
    version: "1.1.0",
    isPublished: true,
    genre: "Obby / Platformer",
    installedPackages: ["@greenblox/ragdoll-physics", "@greenblox/character-controller"],
    installedPlugins: ["Procedural Dungeon & Arena Builder"],
    viewsCount: 95400,
    likesCount: 22100,
    sceneData: {
      rootEntities: [
        {
          id: "ent_obby_start",
          name: "Start_Platform",
          className: "Part",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 12, y: 2, z: 12 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cube", color: "#22c55e", metalness: 0.2, roughness: 0.6, castShadows: true, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0.8, bounciness: 0.1, collisionLayer: "Terrain", isTrigger: false, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_spinning_laser",
          name: "Deadly_Spinning_Laser",
          className: "Part",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 7.5, z: -20 }, rotation: { x: 0, y: 0.78, z: 0 }, scale: { x: 18, y: 0.5, z: 0.5 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cylinder", color: "#ef4444", metalness: 0.9, roughness: 0.1, emissive: "#ff0000", emissiveIntensity: 1.5, castShadows: false, receiveShadows: true },
            { type: "RigidBody", enabled: true, mass: 0, friction: 0, bounciness: 0, collisionLayer: "Trigger", isTrigger: true, useGravity: false, buoyancyFactor: 0 }
          ],
          children: []
        },
        {
          id: "ent_obby_goal",
          name: "Triumph_Goal_Badge",
          className: "SpawnLocation",
          components: [
            { type: "Transform", enabled: true, position: { x: 0, y: 5, z: -45 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 14, y: 2, z: 14 }, parentEntityId: null },
            { type: "Mesh", enabled: true, geometry: "cube", color: "#eab308", metalness: 0.8, roughness: 0.2, emissive: "#ca8a04", emissiveIntensity: 0.6, castShadows: true, receiveShadows: true }
          ],
          children: []
        }
      ],
      environment: {
        skybox: "Cloudy",
        ambientColor: "#e2e8f0",
        ambientIntensity: 0.8,
        sunColor: "#f8fafc",
        sunIntensity: 1.5,
        sunDirection: { x: 10, y: 50, z: 10 },
        fogColor: "#64748b",
        fogDensity: 0.012,
        waterLevel: -30,
        waterColor: "#0284c7",
        enableBloom: true,
        enableSSAO: false,
        enableHDR: true
      },
      physics: {
        gravity: { x: 0, y: -19.62, z: 0 },
        timeScale: 1.0,
        enableSubStepping: true,
        airResistance: 0.005
      }
    },
    luaScripts: [
      {
        id: "script_laser_spin",
        name: "LaserRotateAndKill.lua",
        type: "Script",
        code: `-- Animate spinning obstacle laser and attach trigger kill event
local Workspace = game:GetService("Workspace")
local laser = Workspace:FindFirstChild("Deadly_Spinning_Laser")

if laser then
  print("[Obby Engine] Armed Spinning Laser obstacle.")
end

print("[Parkour] Ready for players to test reflexes!")`,
        description: "Obstacle collision handler"
      }
    ],
    uiCanvases: [
      { id: "ui_stage", name: "StageHUD", elementType: "Frame", x: 20, y: 20, width: 220, height: 50, anchor: "top-left", backgroundColor: "rgba(34, 197, 94, 0.9)", text: "STAGE 4 / 25 [Pro]", textColor: "#ffffff", fontSize: 18, borderRadius: 10, opacity: 1, visible: true }
    ],
    animationsData: []
  };

  return [pvpArena, rpgOdyssey, driftCircuit, obbyPro];
}
