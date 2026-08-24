import { Signal } from "../core/signals";
import { ECSWorld } from "../core/ecs";

export interface NetClient {
  id: string;
  name: string;
  pingMs: number;
  isHost: boolean;
  controlledEntityIds: string[];
}

export interface RPCEvent {
  eventName: string;
  senderId: string;
  targetId: "all" | "server" | string;
  payload: any;
  timestamp: number;
}

export class MultiplayerEngine {
  private ecs: ECSWorld;
  public isServerAuthority: boolean = true;
  public tickRate: number = 60; // 60Hz replication tick
  public connectedClients: NetClient[] = [];
  public onRPCReceived = new Signal<RPCEvent>();
  public onClientJoin = new Signal<NetClient>();
  public onClientLeave = new Signal<string>();

  // Network metrics
  public bandwidthKbps: number = 14.8;
  public simulatedPingMs: number = 32;
  private stateHistory: { timestamp: number; snapshot: any[] }[] = [];

  constructor(ecs: ECSWorld, isServerAuthority = true) {
    this.ecs = ecs;
    this.isServerAuthority = isServerAuthority;

    // Default Local Host Player
    this.connectedClients.push({
      id: "client_local",
      name: "Player_1 (Host)",
      pingMs: 12,
      isHost: true,
      controlledEntityIds: ["player_character_id"]
    });
  }

  public simulateClientConnect(name: string): NetClient {
    const id = `client_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;
    const newClient: NetClient = {
      id,
      name,
      pingMs: Math.floor(Math.random() * 45) + 20,
      isHost: false,
      controlledEntityIds: []
    };
    this.connectedClients.push(newClient);
    this.onClientJoin.fire(newClient);
    return newClient;
  }

  public simulateClientDisconnect(clientId: string): void {
    this.connectedClients = this.connectedClients.filter(c => c.id !== clientId);
    this.onClientLeave.fire(clientId);
  }

  public sendRPC(eventName: string, payload: any, targetId: "all" | "server" | string = "server"): void {
    const event: RPCEvent = {
      eventName,
      senderId: "client_local",
      targetId,
      payload,
      timestamp: Date.now()
    };
    // Update simulated bandwidth consumption
    const payloadSize = JSON.stringify(payload).length * 8; // bits
    this.bandwidthKbps = parseFloat((this.bandwidthKbps * 0.9 + (payloadSize / 1024) * 10).toFixed(2));

    setTimeout(() => {
      this.onRPCReceived.fire(event);
    }, this.simulatedPingMs / 2);
  }

  public stepReplication(dt: number, totalTime: number): void {
    // Record history snapshot every 100ms for Lag Compensation rollbacks
    if (this.stateHistory.length === 0 || (totalTime - this.stateHistory[this.stateHistory.length - 1].timestamp) >= 0.1) {
      this.stateHistory.push({
        timestamp: totalTime,
        snapshot: this.ecs.serialize()
      });
      // Keep last 5 seconds of lag compensation buffer
      if (this.stateHistory.length > 50) {
        this.stateHistory.shift();
      }
    }

    // Vary bandwidth slightly to simulate real packet heartbeats
    this.bandwidthKbps = parseFloat((12.5 + Math.sin(totalTime * 4) * 3.2 + this.connectedClients.length * 4.5).toFixed(1));
  }

  public getLagCompensationState(targetTime: number): any[] | null {
    if (this.stateHistory.length === 0) return null;
    let closest = this.stateHistory[0];
    let minDiff = Math.abs(closest.timestamp - targetTime);

    for (const item of this.stateHistory) {
      const diff = Math.abs(item.timestamp - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    return closest.snapshot;
  }

  public getNetProfilerStats(): { activePeers: number; bandwidthKbps: number; avgPingMs: number; tickRate: number } {
    const totalPing = this.connectedClients.reduce((acc, c) => acc + c.pingMs, 0);
    const avgPing = this.connectedClients.length > 0 ? Math.round(totalPing / this.connectedClients.length) : 0;
    return {
      activePeers: this.connectedClients.length,
      bandwidthKbps: this.bandwidthKbps,
      avgPingMs: avgPing,
      tickRate: this.tickRate
    };
  }
}
