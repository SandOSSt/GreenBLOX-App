import { Signal } from "../core/signals";
import { ECSWorld } from "../core/ecs";
import { DebugLog, ProjectData } from "../types/engine";

export type StudioToolMode = "select" | "move" | "rotate" | "scale" | "terrain" | "paint_material" | "ui_draw";
export type WorkspacePreset = "Default" | "Scripting" | "Level Design" | "Animation & FX" | "Multiplayer Debug";

export interface EditorHistoryStep {
  description: string;
  timestamp: number;
  serializedEntities: any[];
}

export class GreenBloxEditorState {
  private ecs: ECSWorld;
  public activeTool: StudioToolMode = "select";
  public workspacePreset: WorkspacePreset = "Default";
  public selectedEntityId: string | null = null;
  public activeScriptTabId: string | null = null;
  public activeTab: "viewport" | "script" | "ui" | "anim" | "packages" | "plugins" | "multiplayer" = "viewport";
  
  // Undo / Redo history
  private undoStack: EditorHistoryStep[] = [];
  private redoStack: EditorHistoryStep[] = [];
  
  // Console log stream
  public logs: DebugLog[] = [];
  public onLogAdded = new Signal<DebugLog>();
  public onToolChanged = new Signal<StudioToolMode>();
  public onSelectionChanged = new Signal<string | null>();
  public onHistoryChanged = new Signal<void>();

  // Live simulation play states
  public playMode: "edit" | "play" | "pause" = "edit";

  constructor(ecs: ECSWorld) {
    this.ecs = ecs;
    this.recordHistory("Initial Project Load");
  }

  public setTool(tool: StudioToolMode): void {
    this.activeTool = tool;
    this.onToolChanged.fire(tool);
  }

  public selectEntity(entityId: string | null): void {
    this.selectedEntityId = entityId;
    this.onSelectionChanged.fire(entityId);
  }

  public setWorkspacePreset(preset: WorkspacePreset): void {
    this.workspacePreset = preset;
    if (preset === "Scripting") this.activeTab = "script";
    else if (preset === "Level Design") this.activeTab = "viewport";
    else if (preset === "Animation & FX") this.activeTab = "anim";
    else if (preset === "Multiplayer Debug") this.activeTab = "multiplayer";
  }

  public addLog(log: DebugLog): void {
    this.logs.unshift(log);
    if (this.logs.length > 500) this.logs.pop();
    this.onLogAdded.fire(log);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public recordHistory(description: string): void {
    const snapshot = this.ecs.serialize();
    this.undoStack.push({
      description,
      timestamp: Date.now(),
      serializedEntities: snapshot
    });
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = []; // Clear redo stack on new action
    this.onHistoryChanged.fire();
  }

  public undo(): boolean {
    if (this.undoStack.length <= 1) return false;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    
    const previous = this.undoStack[this.undoStack.length - 1];
    this.ecs.deserialize(previous.serializedEntities);
    this.onHistoryChanged.fire();
    this.addLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      source: "Editor",
      message: `Undo: Reverted to [${previous.description}]`
    });
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const next = this.redoStack.pop()!;
    this.undoStack.push(next);
    
    this.ecs.deserialize(next.serializedEntities);
    this.onHistoryChanged.fire();
    this.addLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      source: "Editor",
      message: `Redo: Applied [${next.description}]`
    });
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoHistory(): string[] {
    return this.undoStack.map(s => s.description).reverse();
  }
}
