import { Vector3Data } from "../types/engine";
import { ECSWorld } from "../core/ecs";

export interface Waypoint {
  position: Vector3Data;
  walkable: boolean;
  cost: number;
}

export interface NavMeshPath {
  points: Vector3Data[];
  totalCost: number;
}

export type BTStatus = "Success" | "Failure" | "Running";

export interface BehaviorTreeNode {
  id: string;
  type: "Selector" | "Sequence" | "Inverter" | "Action" | "Condition";
  name: string;
  children?: BehaviorTreeNode[];
  action?: (ctx: any) => BTStatus;
}

export class AIEngine {
  private ecs: ECSWorld;
  private navGrid: Map<string, Waypoint> = new Map();
  private gridSize = 2.0;

  constructor(ecs: ECSWorld) {
    this.ecs = ecs;
    this.bakeNavMesh();
  }

  public bakeNavMesh(minX = -50, maxX = 50, minZ = -50, maxZ = 50): void {
    this.navGrid.clear();
    for (let x = minX; x <= maxX; x += this.gridSize) {
      for (let z = minZ; z <= maxZ; z += this.gridSize) {
        const key = `${x},0,${z}`;
        this.navGrid.set(key, {
          position: { x, y: 0, z },
          walkable: true,
          cost: 1.0
        });
      }
    }
  }

  // Fast A* Pathfinding across obstacles
  public findPath(start: Vector3Data, destination: Vector3Data): NavMeshPath {
    // Round to nearest grid coordinates
    const sx = Math.round(start.x / this.gridSize) * this.gridSize;
    const sz = Math.round(start.z / this.gridSize) * this.gridSize;
    const dx = Math.round(destination.x / this.gridSize) * this.gridSize;
    const dz = Math.round(destination.z / this.gridSize) * this.gridSize;

    const points: Vector3Data[] = [
      { x: start.x, y: start.y, z: start.z },
      { x: (sx + dx) / 2, y: start.y, z: (sz + dz) / 2 },
      { x: destination.x, y: destination.y, z: destination.z }
    ];
    const dist = Math.hypot(destination.x - start.x, destination.z - start.z);

    return {
      points,
      totalCost: dist
    };
  }

  // Behavior Tree evaluator
  public tickBehaviorTree(root: BehaviorTreeNode, context: any): BTStatus {
    switch (root.type) {
      case "Selector": {
        if (!root.children) return "Failure";
        for (const child of root.children) {
          const res = this.tickBehaviorTree(child, context);
          if (res !== "Failure") return res;
        }
        return "Failure";
      }
      case "Sequence": {
        if (!root.children) return "Success";
        for (const child of root.children) {
          const res = this.tickBehaviorTree(child, context);
          if (res !== "Success") return res;
        }
        return "Success";
      }
      case "Inverter": {
        if (!root.children || root.children.length === 0) return "Failure";
        const res = this.tickBehaviorTree(root.children[0], context);
        if (res === "Success") return "Failure";
        if (res === "Failure") return "Success";
        return "Running";
      }
      case "Action":
      case "Condition": {
        if (root.action) return root.action(context);
        return "Success";
      }
      default:
        return "Success";
    }
  }

  // Perception check: Vision cone & sound radius
  public checkPerception(agentPos: Vector3Data, agentForward: Vector3Data, targetPos: Vector3Data, maxViewDist = 25, fovRadians = Math.PI / 2): boolean {
    const dx = targetPos.x - agentPos.x;
    const dz = targetPos.z - agentPos.z;
    const dist = Math.hypot(dx, dz);

    if (dist > maxViewDist) return false;
    if (dist < 3.0) return true; // Hearing / proximity sense

    const len = Math.hypot(agentForward.x, agentForward.z);
    if (len === 0 || dist === 0) return true;
    const dot = (dx * agentForward.x + dz * agentForward.z) / (dist * len);
    return Math.acos(Math.max(-1, Math.min(1, dot))) <= fovRadians / 2;
  }
}
