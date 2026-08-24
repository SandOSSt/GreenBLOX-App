/**
 * GreenBlox Engine Core: High-Performance Signals, Events, Coroutines, and Profiling
 */

export type SignalCallback<T = any> = (arg?: T, arg2?: any, arg3?: any) => void | Promise<void>;

export class Signal<T = any> {
  private listeners: { id: string; callback: SignalCallback<T>; once: boolean }[] = [];
  private nextId: number = 1;

  public connect(callback: SignalCallback<T>): { disconnect: () => void; id: string } {
    const id = `sig_${this.nextId++}`;
    this.listeners.push({ id, callback, once: false });
    return {
      id,
      disconnect: () => this.disconnectById(id),
    };
  }

  public once(callback: SignalCallback<T>): { disconnect: () => void; id: string } {
    const id = `sig_${this.nextId++}`;
    this.listeners.push({ id, callback, once: true });
    return {
      id,
      disconnect: () => this.disconnectById(id),
    };
  }

  private disconnectById(id: string): void {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }

  public fire(arg1?: T, arg2?: any, arg3?: any): void {
    // Slice copy to prevent iteration errors if listener removes itself during callback
    const copy = [...this.listeners];
    for (const listener of copy) {
      try {
        listener.callback(arg1, arg2, arg3);
        if (listener.once) {
          this.disconnectById(listener.id);
        }
      } catch (err) {
        console.error("Error in Signal callback execution:", err);
      }
    }
  }

  public getListenerCount(): number {
    return this.listeners.length;
  }

  public clear(): void {
    this.listeners = [];
  }
}

export interface CoroutineTask {
  id: string;
  fn: () => Generator<number | void, void, any> | void | Promise<void>;
  iterator?: Generator<number | void, void, any>;
  resumeTime: number; // engine elapsed time in seconds when this task should continue
  state: "running" | "suspended" | "dead";
  name: string;
}

export class CoroutineScheduler {
  private tasks: Map<string, CoroutineTask> = new Map();
  private taskId = 0;

  public spawn(name: string, fn: () => Generator<number | void, void, any> | void | Promise<void>, delaySeconds: number = 0, currentEngineTime: number = 0): string {
    const id = `coro_${++this.taskId}`;
    const task: CoroutineTask = {
      id,
      name,
      fn,
      resumeTime: currentEngineTime + delaySeconds,
      state: "suspended"
    };
    this.tasks.set(id, task);
    return id;
  }

  public step(currentEngineTime: number): void {
    const activeTasks = Array.from(this.tasks.values());
    for (const task of activeTasks) {
      if (task.state === "dead") {
        this.tasks.delete(task.id);
        continue;
      }
      if (currentEngineTime >= task.resumeTime) {
        if (!task.iterator) {
          const res = task.fn();
          if (res && typeof (res as any).next === "function") {
            task.iterator = res as Generator<number | void, void, any>;
            task.state = "running";
          } else {
            // Completed immediately or async promise initiated
            task.state = "dead";
            this.tasks.delete(task.id);
            continue;
          }
        }

        if (task.iterator) {
          try {
            const stepResult = task.iterator.next();
            if (stepResult.done) {
              task.state = "dead";
              this.tasks.delete(task.id);
            } else {
              const yieldDuration = typeof stepResult.value === "number" ? stepResult.value : 0;
              task.resumeTime = currentEngineTime + yieldDuration;
              task.state = "suspended";
            }
          } catch (e) {
            console.error(`Coroutine error in task [${task.name}]:`, e);
            task.state = "dead";
            this.tasks.delete(task.id);
          }
        }
      }
    }
  }

  public getActiveCount(): number {
    return this.tasks.size;
  }

  public clear(): void {
    this.tasks.clear();
  }
}

export class EngineTimer {
  public elapsedSeconds = 0;
  public deltaTime = 0.016;
  public fps = 60;
  private lastTimestamp = typeof performance !== "undefined" ? performance.now() : 0;
  private frameCount = 0;
  private fpsAccumulator = 0;

  public update(now: number = typeof performance !== "undefined" ? performance.now() : 0): number {
    let dt = (now - this.lastTimestamp) / 1000.0;
    // Clamp huge delta times (e.g., tab backgrounded)
    if (dt > 0.2) dt = 0.016;
    if (dt < 0.0001) dt = 0.0001;

    this.deltaTime = dt;
    this.elapsedSeconds += dt;
    this.lastTimestamp = now;

    this.frameCount++;
    this.fpsAccumulator += dt;
    if (this.fpsAccumulator >= 0.5) {
      this.fps = Math.round(this.frameCount / this.fpsAccumulator);
      this.frameCount = 0;
      this.fpsAccumulator = 0;
    }

    return dt;
  }
}

export class MemoryProfiler {
  private allocatedObjects = 0;
  private estimatedMB = 32.4;

  public registerAllocation(sizeBytes = 1024): void {
    this.allocatedObjects++;
    this.estimatedMB += sizeBytes / (1024 * 1024);
  }

  public registerDeallocation(sizeBytes = 1024): void {
    if (this.allocatedObjects > 0) this.allocatedObjects--;
    this.estimatedMB = Math.max(16.0, this.estimatedMB - (sizeBytes / (1024 * 1024)));
  }

  public getStats(): { objectsCount: number; heapMB: number } {
    // Check real JS heap if available in V8 browser extension
    let heapMB = parseFloat(this.estimatedMB.toFixed(1));
    if (typeof window !== "undefined" && (window.performance as any)?.memory) {
      const v8mem = (window.performance as any).memory;
      if (v8mem && v8mem.usedJSHeapSize) {
        heapMB = Math.round((v8mem.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
      }
    }
    return { objectsCount: this.allocatedObjects + 1240, heapMB };
  }
}
