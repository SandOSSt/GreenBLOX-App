import { ECSWorld } from "../core/ecs";
import { TransformComponent, MeshComponent, RigidBodyComponent, Vector3Data, DebugLog } from "../types/engine";
import { Signal, CoroutineScheduler } from "../core/signals";

export interface LuaBreakpoint {
  scriptId: string;
  line: number;
  condition?: string;
}

export interface WatchExpressionResult {
  expression: string;
  value: any;
  error?: string;
}

export class LuaRuntimeEngine {
  private ecs: ECSWorld;
  private scheduler: CoroutineScheduler;
  public onDebugLog = new Signal<DebugLog>();
  public onBreakpointHit = new Signal<{ scriptId: string; scriptName: string; line: number; vars: Record<string, any> }>();

  public isPaused: boolean = false;
  private globalScope: Record<string, any> = {};
  private activeBreakpoints: Map<string, Set<number>> = new Map();

  constructor(ecs: ECSWorld, scheduler: CoroutineScheduler) {
    this.ecs = ecs;
    this.scheduler = scheduler;
    this.initStandardLibrary();
  }

  public setBreakpoints(scriptId: string, lines: number[]): void {
    this.activeBreakpoints.set(scriptId, new Set(lines));
  }

  public getBreakpoints(scriptId: string): number[] {
    return Array.from(this.activeBreakpoints.get(scriptId) || []);
  }

  private initStandardLibrary(): void {
    const self = this;

    // Vector3
    const Vector3 = {
      new: (x = 0, y = 0, z = 0) => ({ __type: "Vector3", x: Number(x), y: Number(y), z: Number(z) }),
      zero: () => ({ __type: "Vector3", x: 0, y: 0, z: 0 }),
      one: () => ({ __type: "Vector3", x: 1, y: 1, z: 1 })
    };

    // Color3
    const Color3 = {
      fromRGB: (r = 255, g = 255, b = 255) => {
        const hex = `#${Math.min(255, Math.max(0, r)).toString(16).padStart(2, "0")}${Math.min(255, Math.max(0, g)).toString(16).padStart(2, "0")}${Math.min(255, Math.max(0, b)).toString(16).padStart(2, "0")}`;
        return { __type: "Color3", r: r / 255, g: g / 255, b: b / 255, hex };
      },
      new: (r = 1, g = 1, b = 1) => ({ __type: "Color3", r, g, b, hex: "#3b82f6" }),
      fromHex: (hex: string) => ({ __type: "Color3", r: 1, g: 1, b: 1, hex: hex.startsWith("#") ? hex : `#${hex}` })
    };

    // Workspace bridge
    const Workspace = {
      Name: "Workspace",
      FindFirstChild: (name: string) => {
        const ent = self.ecs.getEntityByName(name);
        return ent ? self.wrapEntity(ent.id) : null;
      },
      GetChildren: () => {
        return self.ecs.getAllEntities().map(e => self.wrapEntity(e.id));
      },
      CreatePart: (name = "ScriptPart", geom = "cube", x = 0, y = 5, z = 0, color = "#10b981") => {
        const ent = self.ecs.createPart(name, geom as any, { x, y, z }, color, 1.0);
        self.log("lua", `[Workspace] Created part '${name}' at (${x}, ${y}, ${z})`);
        return self.wrapEntity(ent.id);
      }
    };

    // Instance
    const Instance = {
      new: (className: string, parent?: any) => {
        if (className === "Part" || className === "MeshPart" || className === "SpawnLocation") {
          const ent = self.ecs.createPart(`New_${className}`, "cube", { x: 0, y: 5, z: 0 }, "#3b82f6", 1.0);
          return self.wrapEntity(ent.id);
        }
        return { name: `New_${className}`, className };
      }
    };

    // TweenService
    const TweenService = {
      Create: (target: any, info: any, properties: Record<string, any>) => {
        return {
          Play: () => {
            self.log("lua", `[TweenService] Playing smooth animation transition on target`);
            if (target && target._entityId && properties.Position) {
              const trans = self.ecs.getComponent<TransformComponent>(target._entityId, "Transform");
              if (trans) {
                const startX = trans.position.x;
                const targetX = properties.Position.x ?? startX;
                const startY = trans.position.y;
                const targetY = properties.Position.y ?? startY;
                const startZ = trans.position.z;
                const targetZ = properties.Position.z ?? startZ;
                let steps = 30;
                let currentStep = 0;
                const stepFn = () => {
                  if (currentStep <= steps) {
                    const alpha = currentStep / steps;
                    trans.position.x = startX + (targetX - startX) * alpha;
                    trans.position.y = startY + (targetY - startY) * alpha;
                    trans.position.z = startZ + (targetZ - startZ) * alpha;
                    self.ecs.setComponent(target._entityId, trans);
                    currentStep++;
                    setTimeout(stepFn, 33);
                  }
                };
                stepFn();
              }
            }
          }
        };
      }
    };

    // RemoteEvent
    const RemoteEvent = {
      new: (name: string) => ({
        Name: name,
        FireServer: (...args: any[]) => self.log("network", `[RemoteEvent: ${name}] Fired server with payload: ${JSON.stringify(args)}`),
        FireClient: (client: string, ...args: any[]) => self.log("network", `[RemoteEvent: ${name}] Fired to client ${client}: ${JSON.stringify(args)}`),
        FireAllClients: (...args: any[]) => self.log("network", `[RemoteEvent: ${name}] Broadcast to all clients: ${JSON.stringify(args)}`),
        OnServerEvent: { connect: (cb: any) => self.log("network", `[RemoteEvent: ${name}] Server listener attached`) }
      })
    };

    // HttpService
    const HttpService = {
      JSONEncode: (obj: any) => JSON.stringify(obj),
      JSONDecode: (str: string) => JSON.parse(str)
    };

    // Task Library
    const task = {
      wait: (sec: number = 0.1) => sec,
      spawn: (fn: any) => { if (typeof fn === "function") setTimeout(fn, 10); }
    };

    const GameService: Record<string, any> = {
      Workspace,
      TweenService,
      HttpService,
      RemoteEvent,
      GetService: (name: string) => GameService[name] || Workspace
    };

    this.globalScope = {
      Workspace,
      game: GameService,
      Instance,
      Vector3,
      Color3,
      TweenService,
      RemoteEvent,
      HttpService,
      task,
      math: Math,
      table: {
        insert: (tbl: any[], val: any) => { if (Array.isArray(tbl)) tbl.push(val); },
        remove: (tbl: any[], idx: number) => { if (Array.isArray(tbl)) tbl.splice(idx - 1, 1); },
        concat: (tbl: any[], sep = ",") => Array.isArray(tbl) ? tbl.join(sep) : ""
      },
      print: (...args: any[]) => {
        const msg = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" \t");
        self.log("lua", msg);
      },
      warn: (...args: any[]) => {
        self.log("warn", args.join(" \t"));
      },
      error: (...args: any[]) => {
        self.log("error", args.join(" \t"));
      },
      tostring: (val: any) => String(val),
      tonumber: (val: any) => Number(val),
      pairs: (obj: any) => Object.entries(obj || {}),
      ipairs: (arr: any) => Array.isArray(arr) ? arr.map((val, idx) => [idx + 1, val]) : []
    };
  }

  private wrapEntity(entityId: string): any {
    const ent = this.ecs.getEntity(entityId);
    if (!ent) return null;
    const self = this;

    return new Proxy({
      _entityId: entityId,
      Name: ent.name,
      ClassName: ent.className,
      Destroy: () => {
        self.ecs.removeEntity(entityId);
        self.log("lua", `[Entity Destroyed] Removed entity '${ent.name}' (${entityId})`);
      }
    }, {
      get(target, prop: string) {
        if (prop === "Position" || prop === "Rotation" || prop === "Scale") {
          const trans = self.ecs.getComponent<TransformComponent>(entityId, "Transform");
          if (trans && prop === "Position") return { ...trans.position, __type: "Vector3" };
          if (trans && prop === "Rotation") return { ...trans.rotation, __type: "Vector3" };
          if (trans && prop === "Scale") return { ...trans.scale, __type: "Vector3" };
        }
        if (prop === "BrickColor" || prop === "Color") {
          const mesh = self.ecs.getComponent<MeshComponent>(entityId, "Mesh");
          return mesh ? { hex: mesh.color, __type: "Color3" } : { hex: "#3b82f6" };
        }
        return (target as any)[prop];
      },
      set(target, prop: string, value: any) {
        const trans = self.ecs.getComponent<TransformComponent>(entityId, "Transform");
        if (trans && (prop === "Position" || prop === "Rotation" || prop === "Scale")) {
          if (prop === "Position") trans.position = { x: value.x || 0, y: value.y || 0, z: value.z || 0 };
          if (prop === "Rotation") trans.rotation = { x: value.x || 0, y: value.y || 0, z: value.z || 0 };
          if (prop === "Scale") trans.scale = { x: value.x || 1, y: value.y || 1, z: value.z || 1 };
          self.ecs.setComponent(entityId, trans);
          return true;
        }
        if (prop === "BrickColor" || prop === "Color") {
          const mesh = self.ecs.getComponent<MeshComponent>(entityId, "Mesh");
          if (mesh) {
            mesh.color = value.hex || (typeof value === "string" ? value : "#3b82f6");
            self.ecs.setComponent(entityId, mesh);
          }
          return true;
        }
        (target as any)[prop] = value;
        return true;
      }
    });
  }

  private log(type: DebugLog["type"], message: string, line?: number): void {
    this.onDebugLog.fire({
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      source: "LuaRuntime",
      message,
      line
    });
  }

  public executeScript(scriptId: string, scriptName: string, luaCode: string): void {
    if (!luaCode.trim()) return;
    this.log("info", `Executing script: [${scriptName}]`);

    const breakpoints = this.activeBreakpoints.get(scriptId) || new Set<number>();
    const lines = luaCode.split("\n");

    const localScope: Record<string, any> = { ...this.globalScope };

    for (let idx = 0; idx < lines.length; idx++) {
      const lineNum = idx + 1;
      const rawLine = lines[idx].trim();

      if (!rawLine || rawLine.startsWith("--")) continue;

      if (breakpoints.has(lineNum)) {
        this.isPaused = true;
        this.onBreakpointHit.fire({
          scriptId,
          scriptName,
          line: lineNum,
          vars: { ...localScope }
        });
        this.log("warn", `[Breakpoint Hit] Paused at line ${lineNum} in ${scriptName}`);
        break;
      }

      this.executeLine(rawLine, lineNum, localScope);
    }
  }

  private executeLine(line: string, lineNum: number, scope: Record<string, any>): void {
    try {
      // Clean up Lua syntax for JS execution evaluation
      let jsExpr = line
        .replace(/--.*$/, "") // remove inline comments
        .replace(/^local\s+/g, "var ") // Convert local to var
        .replace(/:([a-zA-Z0-9_]+)\(/g, ".$1(") // Convert Lua method call syntax `:` to `.`
        .replace(/~=/g, "!==" ) // Not equal
        .replace(/==/g, "===") // Equals
        .replace(/\bnil\b/g, "null")
        .replace(/\btrue\b/g, "true")
        .replace(/\bfalse\b/g, "false")
        .replace(/\bif\s+(.*?)\s+then\b/g, "if ($1) {")
        .replace(/\belseif\s+(.*?)\s+then\b/g, "} else if ($1) {")
        .replace(/\belse\b/g, "} else {")
        .replace(/\bend\b/g, "}")
        .replace(/\bwhile\s+(.*?)\s+do\b/g, "while ($1) {")
        .replace(/\bfor\s+([a-zA-Z0-9_]+)\s*=\s*([0-9]+)\s*,\s*([0-9]+)(?:\s*,\s*([0-9]+))?\s+do\b/g, (_m, varName, start, end, step = "1") => {
          return `for (let ${varName} = ${start}; ${varName} <= ${end}; ${varName} += ${step}) {`;
        })
        .replace(/\bfunction\s+([a-zA-Z0-9_]+)\((.*?)\)/g, "function $1($2) {")
        .replace(/(\w+)\.new\(/g, "$1.new(");

      const argNames = Object.keys(scope);
      const argValues = Object.values(scope);

      // Execute statement
      const func = new Function(...argNames, `
        try {
          ${jsExpr}
        } catch(e) {
          throw e;
        }
      `);
      func(...argValues);
    } catch (err: any) {
      this.log("error", `[Line ${lineNum}] Lua Runtime Error: ${err.message || err}`, lineNum);
    }
  }

  public evalWatchExpression(expression: string): WatchExpressionResult {
    try {
      let jsExpr = expression
        .replace(/:([a-zA-Z0-9_]+)\(/g, ".$1(")
        .replace(/~=/g, "!==")
        .replace(/\bnil\b/g, "null");

      const argNames = Object.keys(this.globalScope);
      const argValues = Object.values(this.globalScope);

      const func = new Function(...argNames, `return (${jsExpr});`);
      const val = func(...argValues);

      return { expression, value: val };
    } catch (err: any) {
      return { expression, value: undefined, error: err.message || "Invalid syntax" };
    }
  }
}
