"use client";

/* The engine instances (ecs/physics/renderer/luaEngine) are imperative
   singletons created once via useMemo, not React state. They are configured
   by mutating their fields (gravity, waterLevel, etc.) and by calling methods
   like applyEnvironment/rebuildScene after render — this is the whole point of
   the Studio architecture. The react-hooks guards (immutability /
   set-state-in-effect) are meant for React state, not external imperative
   engines. */
/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AnimationClip, DebugLog, Entity, ProjectData, TransformComponent, UICanvasElement, Vector3Data } from "@/engine/types/engine";
import { ECSWorld } from "@/engine/core/ecs";
import { GreenBloxRenderer } from "@/engine/renderer/rendererScene";
import { PhysicsEngine } from "@/engine/physics/physicsWorld";
import { CoroutineScheduler } from "@/engine/core/signals";
import { inputState } from "@/engine/core/input";
import * as THREE from "three";
import { LuaRuntimeEngine } from "@/engine/lua/luaRuntime";
import { AudioEngine } from "@/engine/audio/audioMixer";
import type { StudioToolMode } from "@/engine/editor/editorState";
import { StudioHomeScreen } from "@/components/greenblox/StudioHomeScreen";
import { NewExperienceDialog, type NewExperienceConfig } from "@/components/greenblox/NewExperienceDialog";
import { StudioEditorShell } from "@/components/greenblox/StudioEditorShell";
import type { StudioWorkspaceTab } from "@/components/greenblox/StudioRibbon";
import { getStudioToken } from "@/components/greenblox/StudioAccountBar";

export default function GreenBloxPage() {
  // Стартуем на главной странице (как Roblox Studio), а не сразу в редакторе.
  // Пункт девлога «главная страница при входе» был открыт — теперь первое, что
  // видит пользователь, это Home с недавними проектами, а не редактор.
  const [screenMode, setScreenMode] = useState<"home" | "editor">("home");
  const [workspaceTab, setWorkspaceTab] = useState<StudioWorkspaceTab>("Home");
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<StudioToolMode>("select");
  const [playMode, setPlayMode] = useState<"edit" | "play" | "pause">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isNewExperienceOpen, setIsNewExperienceOpen] = useState(false);
  const lastCollisionLogRef = useRef(0);
  const playSnapshotRef = useRef<Entity[] | null>(null);
  const materialPaintIndexRef = useRef(0);
  const undoStackRef = useRef<Entity[][]>([]);
  const redoStackRef = useRef<Entity[][]>([]);
  const transformHistoryOpenRef = useRef(false);
  const clipboardRef = useRef<Entity[] | null>(null);
  /** Счётчик повторных вставок одного буфера: каждый Ctrl+V сдвигает кластер
   *  дальше по диагонали, чтобы копии не ложились точно друг на друга
   *  (старая вставка клала объект В ТУ ЖЕ точку — визуально Ctrl+V «не
   *  работал», копия полностью перекрывала оригинал). */
  const pasteOffsetIndexRef = useRef(0);
  const placementIndexRef = useRef(0);
  const [historyVersion, setHistoryVersion] = useState(0);

  // --- Centralized movement input (WASDQE + Space/Shift), layout-independent ---
  useEffect(() => {
    const getLogicalKey = (code: string): string | null => {
      switch (code) {
        case "KeyW": case "ArrowUp": return "w";
        case "KeyA": case "ArrowLeft": return "a";
        case "KeyS": case "ArrowDown": return "s";
        case "KeyD": case "ArrowRight": return "d";
        case "KeyQ": return "q";
        case "KeyE": return "e";
        case "Space": return " ";
        case "ShiftLeft": case "ShiftRight": return "shift";
        default: return null;
      }
    };

    const isTypingTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const logicalKey = getLogicalKey(event.code);
      if (!logicalKey) return;

      // Prevent page scroll / native behavior for movement keys.
      event.preventDefault();
      if (logicalKey === " " && !event.repeat) {
        inputState.jumpQueued = true;
      }
      inputState.pressed.add(logicalKey);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const logicalKey = getLogicalKey(event.code);
      if (logicalKey) inputState.pressed.delete(logicalKey);
    };

    const handleBlur = () => inputState.pressed.clear();

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      inputState.pressed.clear();
      inputState.jumpQueued = false;
    };
  }, []);

  const scheduler = useMemo(() => new CoroutineScheduler(), []);
  const ecs = useMemo(() => new ECSWorld(), []);
  const renderer = useMemo(() => new GreenBloxRenderer(ecs), [ecs]);
  const physics = useMemo(() => new PhysicsEngine(ecs), [ecs]);
  const luaEngine = useMemo(() => new LuaRuntimeEngine(ecs, scheduler), [ecs, scheduler]);
  const audioEngine = useMemo(() => new AudioEngine(), []);

  const pushLog = (log: DebugLog) => {
    setLogs((prev) => [log, ...prev].slice(0, 250));
  };

  const makeLog = (type: DebugLog["type"], source: string, message: string): DebugLog => ({
    id: `${source}_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    type,
    source,
    message,
  });

  const replaceProjectInList = (nextProject: ProjectData) => {
    setProjects((prev) => {
      const exists = prev.some((project) => project.id === nextProject.id);
      if (!exists) return [nextProject, ...prev];
      return prev.map((project) => (project.id === nextProject.id ? nextProject : project));
    });
  };

  const applyProjectState = (nextProject: ProjectData) => {
    setCurrentProject(nextProject);
    replaceProjectInList(nextProject);
    physics.gravity = nextProject.sceneData.physics?.gravity || { x: 0, y: -19.62, z: 0 };
    physics.timeScale = nextProject.sceneData.physics?.timeScale || 1;
    physics.waterLevel = nextProject.sceneData.environment?.waterLevel ?? -100;
    renderer.applyEnvironment(nextProject.sceneData.environment);
  };

  const syncProjectScene = (project: ProjectData): ProjectData => ({
    ...project,
    sceneData: {
      ...project.sceneData,
      rootEntities: ecs.serialize(),
    },
  });

  const recordHistory = () => {
    const snapshot = ecs.serialize();
    const stack = undoStackRef.current;
    const serialized = JSON.stringify(snapshot);
    if (stack.length === 0 || JSON.stringify(stack[stack.length - 1]) !== serialized) {
      stack.push(snapshot);
      if (stack.length > 80) stack.shift();
    }
    redoStackRef.current = [];
    setHistoryVersion((value) => value + 1);
  };

  const restoreHistorySnapshot = (snapshot: Entity[]) => {
    ecs.deserialize(snapshot);
    setEntities(ecs.getAllEntities());
    renderer.rebuildScene();
    physics.notifySceneChanged();
    const nextSelection = selectedEntityId && ecs.getEntity(selectedEntityId) ? selectedEntityId : null;
    setSelectedEntityId(nextSelection);
    renderer.selectEntity(nextSelection);
    if (currentProject) applyProjectState(syncProjectScene(currentProject));
  };

  const undo = () => {

    const snapshot = undoStackRef.current.pop();
    if (!snapshot) return;
    redoStackRef.current.push(ecs.serialize());
    restoreHistorySnapshot(snapshot);
    setHistoryVersion((value) => value + 1);
    pushLog(makeLog("info", "History", "Undo scene change."));
  };

  const redo = () => {
    const snapshot = redoStackRef.current.pop();
    if (!snapshot) return;
    undoStackRef.current.push(ecs.serialize());
    restoreHistorySnapshot(snapshot);
    setHistoryVersion((value) => value + 1);
    pushLog(makeLog("info", "History", "Redo scene change."));
  };

  const loadProjectIntoEngine = (project: ProjectData, nextMode: "home" | "editor" = "editor") => {
    const normalized = {
      ...project,
      installedPackages: project.installedPackages || [],
      installedPlugins: project.installedPlugins || [],
      luaScripts: project.luaScripts || [],
      uiCanvases: project.uiCanvases || [],
      animationsData: project.animationsData || [],
    };

    ecs.deserialize(normalized.sceneData.rootEntities || []);
    physics.notifySceneChanged();
    undoStackRef.current = [];
    redoStackRef.current = [];
    transformHistoryOpenRef.current = false;

    setHistoryVersion((value) => value + 1);
    setEntities(ecs.getAllEntities());
    setCurrentProject(normalized);
    replaceProjectInList(normalized);
    setActiveScriptId(normalized.luaScripts[0]?.id ?? null);
    setSelectedEntityId(null);
    setSelectedEntityIds([]);
    setWorkspaceTab("Home");
    setActiveTool("select");
    setPlayMode("edit");
    setScreenMode(nextMode);

    physics.gravity = normalized.sceneData.physics?.gravity || { x: 0, y: -19.62, z: 0 };
    physics.timeScale = normalized.sceneData.physics?.timeScale || 1;
    physics.waterLevel = normalized.sceneData.environment?.waterLevel ?? -100;

    renderer.applyEnvironment(normalized.sceneData.environment);
    renderer.rebuildScene();

    pushLog(makeLog("info", "Engine", `Loaded project '${normalized.title}' into GreenBlox runtime.`));
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetch("/api/seed", { method: "POST" });
        const response = await fetch("/api/projects");
        const data = await response.json();
        if (Array.isArray(data)) {
          setProjects(data);
          // Первый проект загружается в движок в фоне, но экран остаётся
          // на главной странице (Roblox Studio behavior). Пользователь
          // открывает редактор явно — кликом по проекту.
          if (data[0]) {
            loadProjectIntoEngine(data[0], "home");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    initialize();
  }, []);

  // Selection subscription is isolated so it never disconnects on project changes.
  useEffect(() => {
    const selectionSub = renderer.onSelectionChanged.connect((ids) => {
      const nextIds = Array.isArray(ids) ? ids : [];
      setSelectedEntityIds([...nextIds]);
      setSelectedEntityId(nextIds[nextIds.length - 1] ?? null);
    });
    return () => selectionSub.disconnect();
  }, [renderer]);

  useEffect(() => {
    const logSub = luaEngine.onDebugLog.connect((log) => {
      if (log) pushLog(log);
    });
    const addSub = ecs.onEntityAdded.connect((entity) => {
      setEntities(ecs.getAllEntities());
      // Инкрементальное добавление: создаём меш ТОЛЬКО новой сущности (сигнал
      // приходит по одному на каждую добавленную сущность, включая детей).
      // Раньше полный rebuildScene() на каждое добавление давал O(N) пересборку
      // на каждый объект вставленного кластера (Ctrl+V с 10 объектами = 10
      // полных пересозданий мира). Для моделей с детьми меши детей создаст
      // отдельный сигнал от каждого addEntity.
      if (entity) renderer.createOrUpdateMesh(entity);
      // Static-collider cache must be rebuilt for the new/removed geometry.
      physics.notifySceneChanged();
    });
    const removeSub = ecs.onEntityRemoved.connect((id) => {
      setEntities(ecs.getAllEntities());
      // Инкрементальное удаление: только меш удалённой сущности, без
      // пересоздания ВСЕХ мешей мира (секундный фриз на больших мирах).
      if (id) renderer.removeEntityMesh(id);
      physics.notifySceneChanged();
    });
    const updateSub = ecs.onEntityUpdated.connect((entity) => {
      setEntities(ecs.getAllEntities());
      if (entity) renderer.createOrUpdateMesh(entity);
      physics.notifySceneChanged();
    });
    const componentSub = ecs.onComponentChanged.connect(() => {
      if (!transformHistoryOpenRef.current) setEntities(ecs.getAllEntities());
      physics.notifySceneChanged();
    });

    const collisionSub = physics.onCollision.connect((event) => {
      if (!event) return;
      const now = performance.now();
      if (now - lastCollisionLogRef.current < 1000) return;
      lastCollisionLogRef.current = now;
      pushLog(makeLog("network", "Physics", `Collision: ${event.entityA} ↔ ${event.entityB}`));
    });
    const transformStartSub = renderer.onTransformStarted.connect(() => {
      if (transformHistoryOpenRef.current) return;
      recordHistory();
      transformHistoryOpenRef.current = true;
    });
    const transformEndSub = renderer.onTransformFinished.connect(() => {
      transformHistoryOpenRef.current = false;
      setEntities(ecs.getAllEntities());
      if (currentProject) applyProjectState(syncProjectScene(currentProject));
    });

    return () => {
      logSub.disconnect();
      addSub.disconnect();
      removeSub.disconnect();
      updateSub.disconnect();
      componentSub.disconnect();
      collisionSub.disconnect();
      transformStartSub.disconnect();
      transformEndSub.disconnect();
    };
  }, [ecs, luaEngine, physics, renderer, currentProject]);

  // Не тратим GPU впустую: когда открыта не-вьюпортная вкладка (Script/UI/
  // Audio/Settings/Plugins/Avatar), 3D-сцена невидима — рендер-цикл
  // пропускает кадры. В play-режиме рендер всегда включён (симуляция).
  useEffect(() => {
    const isViewportTab = workspaceTab === "Home" || workspaceTab === "Model";
    renderer.setRenderEnabled(isViewportTab || playMode === "play");
  }, [workspaceTab, playMode, renderer]);

  useEffect(() => {
    let raf = 0;
    let previous = performance.now();

    const frame = (time: number) => {
      const dt = Math.min(0.05, (time - previous) / 1000);
      previous = time;

      if (playMode === "play") {
        // Drive the player character each physics tick from the shared input state.
        const player = ecs.getEntityByName("Player");
        if (player) {
          const camera = renderer.getCamera();
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.y = 0;
          if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
          forward.normalize();
          const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

          const move = new THREE.Vector3();
          // Map both WASD and Arrow keys to movement vectors
          if (inputState.pressed.has("w") || inputState.pressed.has("arrowup")) move.add(forward);
          if (inputState.pressed.has("s") || inputState.pressed.has("arrowdown")) move.sub(forward);
          if (inputState.pressed.has("d") || inputState.pressed.has("arrowright")) move.add(right);
          if (inputState.pressed.has("a") || inputState.pressed.has("arrowleft")) move.sub(right);

          const moving = move.lengthSq() > 0.001;
          if (moving) move.normalize();

          const sprint = inputState.pressed.has("shift");
          const speed = moving ? (sprint ? 24 : 16) : 0;

          physics.updatePlayerController(
            player.id,
            { x: move.x, z: move.z },
            inputState.jumpQueued,
            speed,
            dt,
          );
          inputState.jumpQueued = false;
        }

        physics.step(dt);
        // Play-mode avatar needs the live grounded flag for its walk cycle
        // (feet on ground → walk anim; airborne → jump pose).
        renderer.runtimeGrounded = physics.isGrounded;
        scheduler.step(time / 1000);
      } else {
        // Editor fly-cam (WASD to pan, Q/E for down/up) — camera-relative.
        const pressed = inputState.pressed;
        const flyDir = {
          right: (pressed.has("d") ? 1 : 0) - (pressed.has("a") ? 1 : 0),
          forward: (pressed.has("w") ? 1 : 0) - (pressed.has("s") ? 1 : 0),
          up: (pressed.has("e") ? 1 : 0) - (pressed.has("q") ? 1 : 0),
        };
        if (flyDir.right || flyDir.forward || flyDir.up) {
          renderer.flyCamera(flyDir, dt);
        }
      }

      renderer.render(dt);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [physics, playMode, renderer, scheduler]);

  const handleCreateProject = async (config: NewExperienceConfig) => {
    const baseplateId = `baseplate_${Date.now()}`;
    const waterLevel = config.waterEnabled ? config.waterLevel : -100;
    const sceneData: ProjectData["sceneData"] = {
      rootEntities: [
        {
          id: baseplateId,
          name: "Baseplate",
          className: "Part",
          components: [
            {
              type: "Transform",
              enabled: true,
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: config.worldWidth, y: 1, z: config.worldDepth },
              parentEntityId: null,
            },
            {
              type: "Mesh",
              enabled: true,
              geometry: "plane",
              color: "#d0d3d7",
              metalness: 0.12,
              roughness: 0.52,
              castShadows: true,
              receiveShadows: true,
            },
            {
              type: "RigidBody",
              enabled: true,
              mass: 0,
              friction: 0.8,
              bounciness: 0.1,
              collisionLayer: "Terrain",
              isTrigger: false,
              useGravity: false,
              buoyancyFactor: 0,
            },
          ],
          children: [],
        },
      ],
      environment: {
        skybox: config.skybox,
        ambientColor: "#cbd5e1",
        ambientIntensity: 0.62,
        sunColor: "#fff7ed",
        sunIntensity: 1.55,
        sunDirection: { x: 25, y: 40, z: 20 },
        fogColor: "#718096",
        fogDensity: 0.008,
        waterLevel,
        waterColor: "#0a8bd8",
        enableBloom: config.renderQuality !== "performance",
        enableSSAO: config.renderQuality === "quality",
        enableHDR: true,
        timeOfDay: config.timeOfDay,
        worldSize: { width: config.worldWidth, depth: config.worldDepth, height: config.worldHeight },
        renderQuality: config.renderQuality,
      },
      physics: {
        gravity: { x: 0, y: -Math.abs(config.gravity), z: 0 },
        timeScale: 1,
        enableSubStepping: true,
        airResistance: 0.01,
      },
    };

    try {
      // Привязка к аккаунту: токен студии (тот же, что у лаунчера) едет в
      // x-gbtoken — сервер запишет ownerId и карта появится в профиле игрока.
      // Без токена (гость) проект останется непривязанным (ownerId = NULL).
      const studioToken = getStudioToken();
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(studioToken ? { "x-gbtoken": studioToken } : {}),
        },
        body: JSON.stringify({
          title: config.title,
          description: config.description,
          genre: config.genre,
          sceneData,
          multiplayerConfig: {
            tickRate: 60,
            dedicatedServer: config.multiplayer,
            p2pFallback: config.multiplayer,
            maxPlayers: config.maxPlayers,
          },
        }),
      });
      const created = await response.json();
      if (created?.id) {
        setIsNewExperienceOpen(false);
        loadProjectIntoEngine(created, "editor");
        pushLog(makeLog("info", "Project", `Created '${config.title}' with ${config.worldWidth} × ${config.worldDepth} world canvas.`));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject?.id) return;
    setIsSaving(true);
    try {
      const nextProject = playSnapshotRef.current
        ? {
            ...currentProject,
            sceneData: {
              ...currentProject.sceneData,
              rootEntities: playSnapshotRef.current,
            },
          }
        : syncProjectScene(currentProject);
      applyProjectState(nextProject);

      // Тот же токен, что и при создании: если проект был создан без входа,
      // первый авторизованный Save привяжет его к аккаунту (ownerId).
      const studioToken = getStudioToken();
      await fetch(`/api/projects/${currentProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(studioToken ? { "x-gbtoken": studioToken } : {}),
        },
        body: JSON.stringify(nextProject),
      });

      pushLog(makeLog("info", "Save", `Project '${nextProject.title}' saved to PostgreSQL.`));
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEntity = (entity: Entity) => {
    // ecs.updateEntity сам триггерит onEntityUpdated → updateSub вызывает
    // renderer.createOrUpdateMesh. Ручной вызов здесь дублировал работу
    // (двойной проход по мешу на каждую правку свойств).
    ecs.updateEntity(entity);
    setEntities(ecs.getAllEntities());

    if (!currentProject) return;
    applyProjectState(syncProjectScene(currentProject));
  };

  /**
   * Позиция нового примитива: строго ПЕРЕД камерой (по лучу взгляда) — как в
   * Roblox Studio. Небольшой каскад-сдвиг от повторных вставок без движения
   * камеры: первый куб встаёт точно в центр вьюпорта, следующие расходятся
   * кольцом (8 слотов на радиус 2 юнита), чтобы не ложились друг в друга.
   */
  const getNextPlacementPosition = (): Vector3Data => {
    const base = renderer.getPlacementPosition();
    const index = placementIndexRef.current;
    const spread = Math.floor(index / 8);
    const angle = (index % 8) * (Math.PI / 4);
    const radius = spread * 2;
    return {
      x: base.x + Math.cos(angle) * radius,
      y: base.y,
      z: base.z + Math.sin(angle) * radius,
    };
  };

  /** Собрать id сущности вместе со всеми детьми (директорий-дерево). */
  const collectSubtreeIds = (entityId: string, visited: Set<string>): string[] => {
    if (visited.has(entityId)) return [];
    visited.add(entityId);
    const entity = ecs.getEntity(entityId);
    if (!entity) return [];
    const ids = [entityId];
    for (const childId of entity.children) {
      ids.push(...collectSubtreeIds(childId, visited));
    }
    return ids;
  };

  /** Ctrl+C: копировать выбранные объекты (с полным поддеревом детей) во внутренний буфер. */
  const copySelectionToClipboard = () => {
    const selected = selectedEntityIds.map((id) => ecs.getEntity(id)).filter((entity): entity is Entity => Boolean(entity));
    if (selected.length === 0) return;

    // Новый буфер — каскад вставки стартует заново (копия ложится рядом с
    // оригиналом, а не уползает далеко после многих Ctrl+V прошлых буферов).
    pasteOffsetIndexRef.current = 0;

    const visited = new Set<string>();
    const idSet = new Set<string>();
    for (const entity of selected) {
      for (const subtreeId of collectSubtreeIds(entity.id, visited)) {
        idSet.add(subtreeId);
      }
    }

    clipboardRef.current = Array.from(idSet)
      .map((id) => ecs.getEntity(id))
      .filter((entity): entity is Entity => Boolean(entity))
      .map((entity) => JSON.parse(JSON.stringify(entity)) as Entity);
    pushLog(makeLog("info", "Editor", `Copied ${clipboardRef.current.length} object(s) to clipboard.`));
  };

  /** Ctrl+V: вставить скопированные объекты, заново связывая детей/родителей
   *  внутри кластера. Кластер сдвигается по диагонали от оригинала: каждая
   *  вставка уходит на +2 единицы по X и +2 по Z от предыдущей — как Roblox
   *  Studio. Без сдвига копия ложится точно на оригинал и кажется, что
   *  Ctrl+V не сработал. */
  const pasteClipboard = () => {
    const clipboard = clipboardRef.current;
    if (!clipboard || clipboard.length === 0) return;

    recordHistory();

    // Каскад смещения: +2 по X и +2 по Z за каждую вставку одного буфера.
    const cascade = pasteOffsetIndexRef.current;
    pasteOffsetIndexRef.current += 1;
    const offsetX = 2 + cascade * 0.5;
    const offsetZ = 2 + cascade * 0.5;

    const idMap = new Map<string, string>();
    const pasted: Entity[] = clipboard.map((source, index) => {
      const newId = `ent_${Date.now()}_${Math.floor(Math.random() * 1000)}_${index}`;
      idMap.set(source.id, newId);
      const copy = JSON.parse(JSON.stringify(source)) as Entity;
      // Сдвиг трансформа вставленной копии (только корневые сущности —
      // дети двигаются вместе с родителем через parentEntityId).
      const transform = copy.components.find((component) => component.type === "Transform") as TransformComponent | undefined;
      if (transform && !transform.parentEntityId) {
        transform.position = {
          x: transform.position.x + offsetX,
          y: transform.position.y,
          z: transform.position.z + offsetZ,
        };
      }
      return {
        ...copy,
        id: newId,
        name: source.name,
        className: source.className,
        isLocked: false,
      };
    });

    // Второй проход: перелинковка детей и parentEntityId внутри вставленного кластера.
    for (const entity of pasted) {
      entity.children = entity.children.map((childId) => idMap.get(childId) ?? childId);
      const transform = entity.components.find((component) => component.type === "Transform") as TransformComponent | undefined;
      if (transform?.parentEntityId && idMap.has(transform.parentEntityId)) {
        transform.parentEntityId = idMap.get(transform.parentEntityId) ?? null;
      }
      ecs.addEntity(entity);
    }

    const pastedIds = pasted.map((entity) => entity.id);
    setSelectedEntityIds(pastedIds);
    setSelectedEntityId(pastedIds[pastedIds.length - 1] ?? null);
    renderer.selectEntities(pastedIds);
    if (currentProject) applyProjectState(syncProjectScene(currentProject));
    pushLog(makeLog("info", "Editor", `Pasted ${pasted.length} object(s) from clipboard.`));
  };

  const handleAddPart = () => {
    recordHistory();
    const placement = getNextPlacementPosition();
    placementIndexRef.current += 1;
    ecs.createPart("Part", "cube", placement, "#d4d4d8", 1);
    const latest = ecs.getAllEntities().at(-1);
    if (latest) {
      setSelectedEntityId(latest.id);
      renderer.selectEntity(latest.id);
    }
    if (currentProject) applyProjectState(syncProjectScene(currentProject));
    pushLog(makeLog("info", "Editor", "Inserted new Part into Workspace."));
  };

  const handleCreateTerrain = () => {
    setActiveTool("terrain");
    renderer.setGizmoMode("terrain");
    const existing = ecs.getEntityByName("Terrain");
    if (existing) {
      setSelectedEntityId(existing.id);
      setActiveTool("terrain");
      renderer.focusEntity(existing.id);
      pushLog(makeLog("info", "Terrain", "Selected existing Terrain instance."));
      return;
    }

    recordHistory();
    const terrain: Entity = {
      id: `terrain_${Date.now()}`,
      name: "Terrain",
      className: "Part",
      components: [
        {
          type: "Transform",
          enabled: true,
          position: { x: 0, y: -2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 96, y: 4, z: 96 },
          parentEntityId: null,
        },
        {
          type: "Mesh",
          enabled: true,
          geometry: "cube",
          color: "#3e5b43",
          metalness: 0.02,
          roughness: 0.96,
          castShadows: true,
          receiveShadows: true,
        },
        {
          type: "RigidBody",
          enabled: true,
          mass: 0,
          friction: 0.92,
          bounciness: 0,
          collisionLayer: "Terrain",
          isTrigger: false,
          useGravity: false,
          buoyancyFactor: 0,
        },
      ],
      children: [],
    };

    ecs.addEntity(terrain);
    setSelectedEntityId(terrain.id);
    setActiveTool("terrain");
    renderer.focusEntity(terrain.id);
    if (currentProject) applyProjectState(syncProjectScene(currentProject));
    pushLog(makeLog("info", "Terrain", "Created terrain volume with a static physics collider."));
  };

  const handleAddSpawnLocation = () => {
    recordHistory();
    const id = `spawn_${Date.now()}`;
    const spawn: Entity = {
      id,
      name: "SpawnLocation",
      className: "SpawnLocation",
      components: [
        {
          type: "Transform",
          enabled: true,
          position: { x: 0, y: 0.4, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 8, y: 0.3, z: 8 },
          parentEntityId: null,
        },
        {
          type: "Mesh",
          enabled: true,
          geometry: "cube",
          color: "#35c1ff",
          metalness: 0.1,
          roughness: 0.4,
          castShadows: true,
          receiveShadows: true,
          emissive: "#35c1ff",
          emissiveIntensity: 0.5,
        },
        {
          type: "RigidBody",
          enabled: true,
          mass: 0,
          friction: 0.8,
          bounciness: 0.1,
          collisionLayer: "Terrain",
          isTrigger: false,
          useGravity: false,
          buoyancyFactor: 0,
        },
      ],
      children: [],
    };

    ecs.addEntity(spawn);
    setSelectedEntityId(spawn.id);
    renderer.selectEntity(spawn.id);
    if (currentProject) applyProjectState(syncProjectScene(currentProject));
    pushLog(makeLog("info", "Editor", "Inserted SpawnLocation into Workspace — Play will start the character here."));
  };

  const handleAddCharacter = () => {
    recordHistory();
    const id = `char_${Date.now()}`;
    const character: Entity = {
      id,
      name: `Character_${entities.filter((item) => item.className === "Model").length + 1}`,
      className: "Model",
      components: [
        {
          type: "Transform",
          enabled: true,
          position: { x: 0, y: 4, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 2, y: 4, z: 2 },
          parentEntityId: null,
        },
        {
          type: "Mesh",
          enabled: true,
          geometry: "capsule",
          color: "#22c55e",
          metalness: 0.2,
          roughness: 0.6,
          castShadows: true,
          receiveShadows: true,
        },
        {
          type: "RigidBody",
          enabled: true,
          mass: 75,
          friction: 0.8,
          bounciness: 0.05,
          collisionLayer: "Player",
          isTrigger: false,
          useGravity: true,
          buoyancyFactor: 1,
          velocity: { x: 0, y: 0, z: 0 },
          angularVelocity: { x: 0, y: 0, z: 0 },
        },
      ],
      children: [],
    };

    ecs.addEntity(character);
    // Меш создаёт подписка onEntityAdded (инкрементально) — отдельный
    // rebuildScene() здесь только пересоздавал весь мир ради одной сущности.
    setSelectedEntityId(character.id);
    renderer.selectEntity(character.id);
    if (currentProject) applyProjectState(syncProjectScene(currentProject));
    pushLog(makeLog("info", "Editor", `Spawned character rig '${character.name}'.`));
  };

  const handleCreateUI = () => {
    if (!currentProject) return;
    const nextUI: UICanvasElement = {
      id: `ui_${Date.now()}`,
      name: `HUD_${currentProject.uiCanvases.length + 1}`,
      elementType: "Frame",
      x: 24,
      y: 24,
      width: 220,
      height: 58,
      anchor: "top-left",
      backgroundColor: "rgba(17, 24, 39, 0.86)",
      textColor: "#ffffff",
      text: "GreenBlox HUD",
      fontSize: 16,
      borderRadius: 10,
      opacity: 1,
      visible: true,
    };

    applyProjectState({ ...currentProject, uiCanvases: [...currentProject.uiCanvases, nextUI] });
    setWorkspaceTab("UI");
    pushLog(makeLog("info", "UI", `Created interface canvas '${nextUI.name}'.`));
  };

  const handleCreateScript = () => {
    if (!currentProject) return;
    const nextScript = {
      id: `script_${Date.now()}`,
      name: `Script_${currentProject.luaScripts.length + 1}.lua`,
      type: "Script" as const,
      code: `print("[GreenBlox] New script created")\nlocal part = Workspace:FindFirstChild("Part")\n`,
      description: "New runtime script",
    };

    applyProjectState({ ...currentProject, luaScripts: [...currentProject.luaScripts, nextScript] });
    setActiveScriptId(nextScript.id);
    setWorkspaceTab("Script");
    pushLog(makeLog("lua", "Script", `Created Lua script '${nextScript.name}'.`));
  };

  const handleRandomizeColor = () => {
    const targets = selectedEntityIds.length > 0 ? selectedEntityIds.map((id) => ecs.getEntity(id)).filter(Boolean) as Entity[] : [];
    if (targets.length === 0) return;
    const color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

    recordHistory();
    for (const target of targets) {
      if (!target.components.some((component) => component.type === "Mesh")) continue;
      handleUpdateEntity({
        ...target,
        components: target.components.map((component) => component.type === "Mesh" ? { ...component, color } : component),
      });
    }
    pushLog(makeLog("info", "Material", `Applied color ${color} to ${targets.length} object(s).`));
  };

  const handleSelectEntity = (entityId: string | null, additive = false) => {
    // Renderer is the single source of truth. It fires onSelectionChanged,
    // which updates React state. This avoids desync/loops entirely.
    if (additive && entityId) {
      renderer.toggleEntitySelection(entityId, true);
      return;
    }

    renderer.selectEntities(entityId ? [entityId] : [], true);

    if (!entityId || activeTool !== "paint_material") return;

    const target = ecs.getEntity(entityId);
    const mesh = target?.components.find((component) => component.type === "Mesh");
    if (!target || !mesh) return;

    const palette = [
      { color: "#6086ff", metalness: 0.65, roughness: 0.26 },
      { color: "#d8b26e", metalness: 0.1, roughness: 0.72 },
      { color: "#4eaa83", metalness: 0.05, roughness: 0.9 },
      { color: "#a064e8", metalness: 0.45, roughness: 0.34 },
      { color: "#d65c58", metalness: 0.32, roughness: 0.46 },
    ];
    const material = palette[materialPaintIndexRef.current % palette.length];
    materialPaintIndexRef.current += 1;

    recordHistory();
    handleUpdateEntity({
      ...target,
      components: target.components.map((component) => (component.type === "Mesh" ? { ...component, ...material } : component)),
    });
    pushLog(makeLog("info", "Material", `Applied PBR paint preset to '${target.name}'.`));
  };

  const handleToggleLock = () => {
    const targets = selectedEntityIds.map((id) => ecs.getEntity(id)).filter(Boolean) as Entity[];
    if (targets.length === 0) return;
    const shouldLock = targets.some((entity) => !entity.isLocked);
    recordHistory();
    for (const entity of targets) handleUpdateEntity({ ...entity, isLocked: shouldLock });
    pushLog(makeLog("info", "Editor", `${shouldLock ? "Locked" : "Unlocked"} ${targets.length} object(s).`));
  };

  const handleToggleAnchor = () => {
    const targets = selectedEntityIds.map((id) => ecs.getEntity(id)).filter(Boolean) as Entity[];
    if (targets.length === 0) return;
    const shouldAnchor = targets.some((entity) => {
      const body = entity.components.find((component) => component.type === "RigidBody") as any;
      return body && body.mass > 0;
    });

    recordHistory();
    for (const entity of targets) {
      handleUpdateEntity({
        ...entity,
        components: entity.components.map((component) => component.type === "RigidBody"
          ? { ...component, mass: shouldAnchor ? 0 : 1, useGravity: !shouldAnchor }
          : component),
      });
    }
    pushLog(makeLog("info", "Physics", `${shouldAnchor ? "Anchored" : "Unanchored"} ${targets.length} object(s).`));
  };

  const ensureRuntimePlayer = (): string => {
    const existingPlayer = ecs.getEntityByName("Player");
    if (existingPlayer) return existingPlayer.id;

    const runtimePlayerId = `runtime_player_${Date.now()}`;
    const visorId = `visor_${Date.now()}`;

    // Позиция рантайм-игрока: берём из SpawnLocation, если он есть в сцене
    // (пункт девлога «создание спавна для персонажа»). Спавн ставится чуть
    // ВЫШЕ верхней грани платформы спавна — физика усадит персонажа на неё.
    const spawnEntity = ecs
      .getAllEntities()
      .find((entity) => entity.className.toLowerCase().includes("spawn"));
    const spawnTransform = spawnEntity
      ? ecs.getComponent<TransformComponent>(spawnEntity.id, "Transform")
      : undefined;
    const spawnHeight = spawnTransform?.scale.y ?? 0.3;
    const initialPosition: Vector3Data = spawnTransform
      ? {
          x: spawnTransform.position.x,
          y: spawnTransform.position.y + spawnHeight / 2 + 1.25,
          z: spawnTransform.position.z,
        }
      : { x: 0, y: 5, z: 0 };

    ecs.addEntity({
      id: runtimePlayerId,
      name: "Player",
      className: "Model",
      components: [
        {
          type: "Transform",
          enabled: true,
          position: initialPosition,
          rotation: { x: 0, y: 0, z: 0 },
          // Физическая капсула идентична лаунчеру: высота 2.4, радиус 0.45
          // (ширина/глубина 0.9). Раньше бокс был 1.8×3.6×1.8 — игрок студии
          // был в 2 раза шире и на треть выше, чем в игре (коллизии, прыжки,
          // проходы под препятствиями не совпадали).
          scale: { x: 0.9, y: 2.4, z: 0.9 },
          parentEntityId: null,
        },
        {
          type: "Mesh",
          enabled: true,
          geometry: "cube",
          color: "#50e2c2",
          metalness: 0.18,
          roughness: 0.48,
          castShadows: true,
          receiveShadows: true,
        },
        {
          type: "RigidBody",
          enabled: true,
          mass: 75,
          friction: 0.8,
          bounciness: 0.05,
          collisionLayer: "Player",
          isTrigger: false,
          useGravity: true,
          buoyancyFactor: 1,
          velocity: { x: 0, y: 0, z: 0 },
          angularVelocity: { x: 0, y: 0, z: 0 },
        },
      ],
      children: [visorId],
    });

    // Add a visor so we know which way the block is facing
    ecs.addEntity({
      id: visorId,
      name: "Player_Visor",
      className: "Part",
      components: [
        {
          type: "Transform",
          enabled: true,
          position: { x: 0, y: 0.8, z: 0.9 }, // Relative to parent
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1.2, y: 0.5, z: 0.2 },
          parentEntityId: runtimePlayerId,
        },
        {
          type: "Mesh",
          enabled: true,
          geometry: "cube",
          color: "#11141a",
          metalness: 0.8,
          roughness: 0.2,
          castShadows: false,
          receiveShadows: false,
        },
      ],
      children: [],
    });

    // Меши Player и Visor создаёт подписка onEntityAdded (инкрементально);
    // полный rebuildScene() здесь лишний — он пересоздавал весь мир ради
    // двух runtime-сущностей. setSimulationActive(true) ниже подменит куб
    // Player на R6-аватара через createOrUpdateMesh.
    setEntities(ecs.getAllEntities());
    pushLog(makeLog("info", "PlayerController", "Runtime Player spawned with block controller and physics body."));
    return runtimePlayerId;
  };

  const handleSetPlayMode = (mode: "edit" | "play" | "pause") => {
    if (mode === "play" && playMode !== "play") {
      const isNewSession = !playSnapshotRef.current;
      if (isNewSession) {
        playSnapshotRef.current = ecs.serialize();
        const runtimePlayerId = ensureRuntimePlayer();

        setWorkspaceTab("Home");
        renderer.setRuntimeFollowEntity(runtimePlayerId);
        renderer.setSimulationActive(true);
        renderer.setGizmoMode("select");
        renderer.selectEntity(null);
        setSelectedEntityId(null);
        setSelectedEntityIds([]);
        renderer.focusEntity(runtimePlayerId);

        for (const script of currentProject?.luaScripts || []) {
          luaEngine.executeScript(script.id, script.name, script.code);
        }

        inputState.pressed.clear();
        inputState.jumpQueued = false;
        pushLog(makeLog("info", "Runtime", "Play session started: Lua, physics and ECS simulation are live."));
      }
    }

    if (mode === "edit" && playSnapshotRef.current) {
      ecs.deserialize(playSnapshotRef.current);
      physics.notifySceneChanged();
      playSnapshotRef.current = null;
      inputState.pressed.clear();
      inputState.jumpQueued = false;
      renderer.setRuntimeFollowEntity(null);

      renderer.setSimulationActive(false);
      renderer.resetEditorCamera();
      setEntities(ecs.getAllEntities());
      renderer.rebuildScene();
      renderer.selectEntity(null);
      setSelectedEntityId(null);
      setSelectedEntityIds([]);
      pushLog(makeLog("info", "Runtime", "Play session stopped: editor snapshot restored."));
    }

    setPlayMode(mode);
  };

  const handleNudgeSelectedEntity = (key: string, shiftKey: boolean) => {
    const selected = entities.find((entity) => entity.id === selectedEntityId);
    if (!selected || selected.isLocked || activeTool === "select") return;
    const transform = selected.components.find((component) => component.type === "Transform");
    if (!transform) return;

    const amount = shiftKey ? 1 : 0.25;
    let nextTransform = { ...transform, position: { ...transform.position }, rotation: { ...transform.rotation }, scale: { ...transform.scale } };

    if (activeTool === "move") {
      if (shiftKey && (key === "arrowup" || key === "arrowdown")) {
        nextTransform.position.y += key === "arrowup" ? amount : -amount;
      } else if (key === "arrowleft") nextTransform.position.x -= amount;
      else if (key === "arrowright") nextTransform.position.x += amount;
      else if (key === "arrowup") nextTransform.position.z -= amount;
      else if (key === "arrowdown") nextTransform.position.z += amount;
    }

    if (activeTool === "rotate") {
      const angle = shiftKey ? 0.25 : 0.08;
      if (key === "arrowleft" || key === "arrowup") nextTransform.rotation.y += angle;
      if (key === "arrowright" || key === "arrowdown") nextTransform.rotation.y -= angle;
    }

    if (activeTool === "scale") {
      const multiplier = key === "arrowup" || key === "arrowright" ? 1.08 : 0.92;
      if (["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
        nextTransform.scale = {
          x: Math.max(0.1, nextTransform.scale.x * multiplier),
          y: Math.max(0.1, nextTransform.scale.y * multiplier),
          z: Math.max(0.1, nextTransform.scale.z * multiplier),
        };
      }
    }

    handleUpdateEntity({
      ...selected,
      components: selected.components.map((component) => (component.type === "Transform" ? nextTransform : component)),
    });
  };

  const handleDeleteSelectedEntity = () => {
    const targets = selectedEntityIds.map((id) => ecs.getEntity(id)).filter(Boolean) as Entity[];
    const deletable = targets.filter((entity) => !entity.isLocked);
    if (targets.length === 0) return;
    if (deletable.length === 0) {
      pushLog(makeLog("warn", "Editor", "All selected objects are locked."));
      return;
    }

    recordHistory();
    for (const entity of deletable) ecs.removeEntity(entity.id);
    setEntities(ecs.getAllEntities());
    renderer.selectEntity(null);
    setSelectedEntityId(null);
    setSelectedEntityIds([]);
    // Инкрементальное удаление: меши удалённых сущностей (вместе с детьми)
    // убирает подписка onEntityRemoved через renderer.removeEntityMesh — сцене
    // не нужно пересоздавать ВСЕ меши мира (секундный фриз на больших мирах).
    if (currentProject) applyProjectState(syncProjectScene(currentProject));
    pushLog(makeLog("info", "Editor", `Deleted ${deletable.length} object(s).`));
  };

  useEffect(() => {
    if (screenMode !== "editor") return;

    const isTextInput = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
    };

    const handleShortcut = (event: KeyboardEvent) => {
      if (isTextInput(event.target)) return;

      // Layout-independent identifiers (KeyC/KeyV etc.) — CRITICAL: event.key
      // returns the character under the cursor, so on a Russian keyboard
      // Ctrl+C produced "с" and Ctrl+V produced "м" — copy/paste silently
      // stopped working whenever the layout was switched to RU.
      const code: string = event.code;

      if ((event.ctrlKey || event.metaKey) && code === "KeyS") {
        event.preventDefault();
        handleSaveProject();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && code === "KeyZ") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && code === "KeyC") {
        event.preventDefault();
        copySelectionToClipboard();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && code === "KeyV") {
        event.preventDefault();
        pasteClipboard();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && code === "KeyD") {
        event.preventDefault();
        const targets = selectedEntityIds.map((id) => ecs.getEntity(id)).filter(Boolean) as Entity[];
        if (targets.length > 0) {
          recordHistory();
          const duplicatedIds: string[] = [];
          targets.forEach((entity, index) => {
            const duplicated = ecs.duplicateEntity(entity.id, { x: 2.5 + index * 0.2, y: 0, z: 2.5 + index * 0.2 });
            if (duplicated) duplicatedIds.push(duplicated.id);
          });
          if (duplicatedIds.length > 0) {
            setSelectedEntityIds(duplicatedIds);
            setSelectedEntityId(duplicatedIds[duplicatedIds.length - 1]);
            renderer.selectEntities(duplicatedIds);
          }
        }
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (playMode === "play") return;
      if (code === "KeyF" && selectedEntityId) {
        event.preventDefault();
        renderer.focusEntity(selectedEntityId);
      }

      // Tool shortcuts on number keys (WASDQE reserved for editor fly-cam)
      if (code === "Digit1") { setActiveTool("select"); renderer.setGizmoMode("select"); }
      if (code === "Digit2" || code === "KeyG") { setActiveTool("move"); renderer.setGizmoMode("move"); }
      if (code === "Digit3" || code === "KeyT") { setActiveTool("scale"); renderer.setGizmoMode("scale"); }
      if (code === "Digit4" || code === "KeyR") { setActiveTool("rotate"); renderer.setGizmoMode("rotate"); }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(code)) {
        event.preventDefault();
        handleNudgeSelectedEntity(code.toLowerCase(), event.shiftKey);
      }
      if (code === "Delete" || code === "Backspace") {
        event.preventDefault();
        handleDeleteSelectedEntity();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [screenMode, selectedEntityId, selectedEntityIds, entities, currentProject, activeTool, playMode]);

  if (!currentProject && projects.length === 0) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-[#0f1014] text-white">
        <div className="text-center">
          <div className="text-2xl font-black">Booting GreenBlox Engine…</div>
          <div className="mt-2 text-sm text-white/45">Preparing runtime, scene data and project registry</div>
        </div>
      </div>
    );
  }

  return screenMode === "home" ? (
    <>
      <StudioHomeScreen
        projects={projects}
        onCreateProject={() => setIsNewExperienceOpen(true)}
        onOpenProject={(project) => loadProjectIntoEngine(project, "editor")}
        onOpenSettings={() => {
          const settingsProject = currentProject || projects[0];
          if (!settingsProject) {
            setIsNewExperienceOpen(true);
            return;
          }
          loadProjectIntoEngine(settingsProject, "editor");
          setWorkspaceTab("Settings");
        }}
      />
      <NewExperienceDialog
        open={isNewExperienceOpen}
        onClose={() => setIsNewExperienceOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  ) : currentProject ? (
    <StudioEditorShell
      currentProject={currentProject}
      entities={entities}
      logs={logs}
      ecs={ecs}
      renderer={renderer}
      physics={physics}
      audioEngine={audioEngine}
      luaEngine={luaEngine}
      workspaceTab={workspaceTab}
      onChangeWorkspaceTab={setWorkspaceTab}
      activeTool={activeTool}
      onSetActiveTool={(tool) => {
        setActiveTool(tool);
        renderer.setGizmoMode(tool);
      }}
      playMode={playMode}
      onSetPlayMode={handleSetPlayMode}
      selectedEntityId={selectedEntityId}
      selectedEntityIds={selectedEntityIds}
      onSelectEntity={handleSelectEntity}
      activeScriptId={activeScriptId}
      onSetActiveScriptId={setActiveScriptId}
      onBackHome={() => setScreenMode("home")}
      onSave={handleSaveProject}
      onUpdateEntity={handleUpdateEntity}
      onUpdateProject={(project) => applyProjectState(project)}
      onAddPart={handleAddPart}
      onEnableTerrain={() => {
        handleCreateTerrain();
        setWorkspaceTab("Model");
      }}
      onAddSpawn={handleAddSpawnLocation}
      onAddCharacter={handleAddCharacter}
      onCreateUI={handleCreateUI}
      onCreateScript={handleCreateScript}
      onRandomizeColor={handleRandomizeColor}
      onToggleLock={handleToggleLock}
      onToggleAnchor={handleToggleAnchor}
      onUndo={undo}
      onRedo={redo}
      onCopy={copySelectionToClipboard}
      onPaste={pasteClipboard}
      /* eslint-disable react-hooks/refs */
      canUndo={historyVersion >= 0 && undoStackRef.current.length > 0}
      canRedo={historyVersion >= 0 && redoStackRef.current.length > 0}
      /* eslint-enable react-hooks/refs */
    />
  ) : null;
}
