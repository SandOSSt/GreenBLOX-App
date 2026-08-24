export type Vector3Data = { x: number; y: number; z: number };
export type Color3Data = { r: number; g: number; b: number; hex?: string };
export type RotationData = { x: number; y: number; z: number; w?: number };

export type ComponentType =
  | "Transform"
  | "Mesh"
  | "RigidBody"
  | "LuaScript"
  | "Light"
  | "Camera"
  | "AudioSource"
  | "ParticleEmitter"
  | "UIAnchor"
  | "NavMeshAgent"
  | "Vehicle"
  | "WaterZone"
  | "TriggerZone";

export interface ComponentData {
  type: ComponentType;
  enabled: boolean;
  [key: string]: any;
}

export interface TransformComponent extends ComponentData {
  type: "Transform";
  position: Vector3Data;
  rotation: Vector3Data;
  scale: Vector3Data;
  parentEntityId: string | null;
}

export interface MeshComponent extends ComponentData {
  type: "Mesh";
  geometry: "cube" | "sphere" | "cylinder" | "plane" | "capsule" | "cone" | "custom" | "terrain" | "wedge";
  color: string;
  metalness: number;
  roughness: number;
  emissive?: string;
  emissiveIntensity?: number;
  castShadows: boolean;
  receiveShadows: boolean;
  /** URL текстуры поверхности (диффузная карта). Поддерживает data: и относительные пути. */
  textureUrl?: string;
  /** URL карты нормалей (bump). Игнорируется без textureUrl. */
  normalMapUrl?: string;
  lodLevels?: number;
}

export interface RigidBodyComponent extends ComponentData {
  type: "RigidBody";
  mass: number; // 0 = static / anchored
  friction: number;
  bounciness: number;
  collisionLayer: "Default" | "Player" | "Vehicle" | "Terrain" | "Trigger";
  isTrigger: boolean;
  useGravity: boolean;
  buoyancyFactor: number;
  velocity?: Vector3Data;
  angularVelocity?: Vector3Data;
}

export interface LuaScriptComponent extends ComponentData {
  type: "LuaScript";
  scriptId: string;
  scriptName: string;
  runOnServer: boolean;
  runOnClient: boolean;
}

export interface LightComponent extends ComponentData {
  type: "Light";
  lightType: "point" | "spot" | "directional";
  color: string;
  intensity: number;
  range: number;
  castShadow: boolean;
}

export interface ParticleEmitterComponent extends ComponentData {
  type: "ParticleEmitter";
  rate: number; // particles per second
  speed: number;
  lifetime: number;
  startColor: string;
  endColor: string;
  size: number;
  shape: "sphere" | "cone" | "box";
  active: boolean;
}

export interface AudioSourceComponent extends ComponentData {
  type: "AudioSource";
  audioUrl: string;
  volume: number;
  pitch: number;
  loop: boolean;
  spatial3D: boolean;
  maxDistance: number;
  reverbZone: "None" | "Cave" | "Hall" | "Forest" | "Arena";
}

export interface Entity {
  id: string;
  name: string;
  className: "Part" | "Model" | "Script" | "Light" | "SpawnLocation" | "Camera" | "Vehicle" | "Folder" | "Water" | "NPC";
  tag?: string;
  components: ComponentData[];
  children: string[]; // IDs of child entities
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface LuaScriptFile {
  id: string;
  name: string;
  type: "Script" | "LocalScript" | "ModuleScript";
  code: string;
  description?: string;
  breakpoints?: number[];
}

export interface UICanvasElement {
  id: string;
  name: string;
  elementType: "Frame" | "TextLabel" | "TextButton" | "ImageLabel" | "ProgressBar" | "InputBox";
  x: number;
  y: number;
  width: number;
  height: number;
  anchor: "top-left" | "top-right" | "center" | "bottom-left" | "bottom-right";
  backgroundColor: string;
  textColor?: string;
  text?: string;
  fontSize?: number;
  borderRadius: number;
  opacity: number;
  visible: boolean;
  onClickScript?: string;
}

export interface AnimationClip {
  id: string;
  name: string;
  duration: number; // in seconds
  loop: boolean;
  keyframes: {
    time: number; // 0.0 to duration
    entityId: string; // bone or part
    position: Vector3Data;
    rotation: Vector3Data;
    scale: Vector3Data;
  }[];
}

export interface SceneData {
  rootEntities: Entity[];
  environment: {
    skybox: "Morning" | "Sunset" | "SciFi" | "Cloudy" | "Midnight";
    ambientColor: string;
    ambientIntensity: number;
    sunColor: string;
    sunIntensity: number;
    sunDirection: Vector3Data;
    fogColor: string;
    fogDensity: number;
    waterLevel: number;
    waterColor: string;
    enableBloom: boolean;
    enableSSAO: boolean;
    enableHDR: boolean;
    timeOfDay?: number;
    worldSize?: {
      width: number;
      depth: number;
      height: number;
    };
    renderQuality?: "performance" | "balanced" | "quality";
  };
  physics: {
    gravity: Vector3Data;
    timeScale: number;
    enableSubStepping: boolean;
    airResistance: number;
  };
}

export interface ProjectData {
  id?: number;
  title: string;
  description: string;
  author: string;
  thumbnail: string;
  version: string;
  isPublished: boolean;
  genre: string;
  sceneData: SceneData;
  luaScripts: LuaScriptFile[];
  uiCanvases: UICanvasElement[];
  animationsData: AnimationClip[];
  installedPackages?: string[];
  installedPlugins?: string[];
  multiplayerConfig?: {
    tickRate?: number;
    dedicatedServer?: boolean;
    p2pFallback?: boolean;
    maxPlayers?: number;
  };
  viewsCount?: number;
  likesCount?: number;
}

export interface ProfilerStats {
  fps: number;
  frameTimeMs: number;
  gpuDrawCalls: number;
  triangleCount: number;
  physicsStepsPerSec: number;
  luaExecutionTimeMs: number;
  memoryAllocatedMB: number;
  networkBandwidthKbps: number;
  pingMs: number;
}

export interface DebugLog {
  id: string;
  timestamp: string;
  type: "info" | "warn" | "error" | "lua" | "network";
  source: string;
  message: string;
  line?: number;
}
