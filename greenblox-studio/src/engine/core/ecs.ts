import { Entity, ComponentData, TransformComponent, MeshComponent, RigidBodyComponent, LuaScriptComponent, LightComponent, ParticleEmitterComponent, AudioSourceComponent, Vector3Data } from "../types/engine";
import { Signal } from "./signals";

export class ECSWorld {
  private entities: Map<string, Entity> = new Map();
  public onEntityAdded = new Signal<Entity>();
  public onEntityRemoved = new Signal<string>();
  public onEntityUpdated = new Signal<Entity>();
  public onComponentChanged = new Signal<{ entityId: string; componentType: string }>();

  /**
   * Cached array of all entities. Physics + renderer call getAllEntities many
   * times per frame (renderer full-sync, dynamic-body scan, grounded check);
   * Array.from() on every call allocated a fresh array of N entity refs dozens
   * of times per second. The cache is invalidated only when the entity SET
   * changes (add/remove/update/deserialize) — in-place component mutations
   * (physics velocities/positions) keep the array valid.
   */
  private entityCache: Entity[] = [];
  private entityCacheValid = false;

  constructor(initialEntities: Entity[] = []) {
    for (const ent of initialEntities) {
      this.entities.set(ent.id, ent);
    }
  }

  public getAllEntities(): Entity[] {
    if (!this.entityCacheValid) {
      this.entityCache = Array.from(this.entities.values());
      this.entityCacheValid = true;
    }
    return this.entityCache;
  }

  private invalidateCache(): void {
    this.entityCacheValid = false;
  }

  public getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  public getEntityByName(name: string): Entity | undefined {
    for (const ent of this.entities.values()) {
      if (ent.name === name) return ent;
    }
    return undefined;
  }

  public getEntitiesByClassName(className: string): Entity[] {
    const list: Entity[] = [];
    for (const ent of this.entities.values()) {
      if (ent.className === className) list.push(ent);
    }
    return list;
  }

  public addEntity(entity: Entity): Entity {
    this.entities.set(entity.id, entity);
    this.invalidateCache();
    this.onEntityAdded.fire(entity);
    return entity;
  }

  public removeEntity(id: string): boolean {
    const existing = this.entities.get(id);
    if (!existing) return false;

    // Remove children recursively
    for (const childId of existing.children) {
      this.removeEntity(childId);
    }

    this.entities.delete(id);
    this.invalidateCache();
    this.onEntityRemoved.fire(id);
    return true;
  }

  public updateEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
    this.invalidateCache();
    this.onEntityUpdated.fire(entity);
  }

  public getComponent<T extends ComponentData>(entityId: string, type: T["type"]): T | undefined {
    const entity = this.entities.get(entityId);
    if (!entity) return undefined;
    return entity.components.find(c => c.type === type) as T | undefined;
  }

  public setComponent<T extends ComponentData>(entityId: string, component: T): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    const idx = entity.components.findIndex(c => c.type === component.type);
    if (idx >= 0) {
      entity.components[idx] = component;
    } else {
      entity.components.push(component);
    }
    this.onComponentChanged.fire({ entityId, componentType: component.type });
  }

  public createPart(name = "Part", geometry: "cube" | "sphere" | "cylinder" | "plane" = "cube", pos: Vector3Data = { x: 0, y: 5, z: 0 }, color = "#3b82f6", mass = 1.0): Entity {
    const id = `ent_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const transform: TransformComponent = {
      type: "Transform",
      enabled: true,
      position: { ...pos },
      rotation: { x: 0, y: 0, z: 0 },
      scale: geometry === "plane" ? { x: 20, y: 0.2, z: 20 } : { x: 2, y: 2, z: 2 },
      parentEntityId: null
    };
    const mesh: MeshComponent = {
      type: "Mesh",
      enabled: true,
      geometry,
      color,
      metalness: 0.2,
      roughness: 0.5,
      castShadows: true,
      receiveShadows: true
    };
    const body: RigidBodyComponent = {
      type: "RigidBody",
      enabled: true,
      mass,
      friction: 0.6,
      bounciness: 0.2,
      collisionLayer: "Default",
      isTrigger: false,
      useGravity: mass > 0,
      buoyancyFactor: 1.0,
      velocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 }
    };

    const newEnt: Entity = {
      id,
      name,
      className: "Part",
      components: [transform, mesh, body],
      children: []
    };
    return this.addEntity(newEnt);
  }

  public duplicateEntity(entityId: string, offset: Vector3Data = { x: 2.5, y: 0, z: 2.5 }): Entity | undefined {
    const original = this.entities.get(entityId);
    if (!original) return undefined;

    // Глубокая копия ВСЕГО поддерева (родитель + рекурсивно все дети), как в
    // Ctrl+C/V. Раньше duplicateEntity копировал только корневой объект — у
    // моделей с дочерними деталями дубликаты получались без детей.
    const idMap = new Map<string, string>();
    const cloneEntity = (source: Entity, parentNewId: string | null): Entity => {
      const newId = `ent_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      idMap.set(source.id, newId);

      const clonedComponents: ComponentData[] = source.components.map(comp => {
        const copy = JSON.parse(JSON.stringify(comp)) as ComponentData;
        if (copy.type === "Transform") {
          const transform = copy as TransformComponent;
          transform.position = { ...transform.position };
          transform.rotation = { ...transform.rotation };
          transform.scale = { ...transform.scale };
          // Только корневые объекты сдвигаются; дети двигаются вместе с
          // родителем через parentEntityId (как в pasteClipboard).
          if (!parentNewId) {
            transform.position.x += offset.x;
            transform.position.y += offset.y;
            transform.position.z += offset.z;
          }
          if (transform.parentEntityId) {
            transform.parentEntityId = parentNewId;
          }
        }
        return copy;
      });

      const clone: Entity = {
        id: newId,
        name: parentNewId ? source.name : `${source.name}_Copy`,
        className: source.className,
        tag: source.tag,
        components: clonedComponents,
        children: source.children.map((childId) => {
          const child = this.entities.get(childId);
          if (!child) return "";
          return cloneEntity(child, newId).id;
        }).filter((id) => id !== ""),
        isLocked: false,
      };

      this.entities.set(newId, clone);
      return clone;
    };

    const root = cloneEntity(original, null);
    // Инвалидируем кэш списка сущностей и уведомляем о добавлении.
    this.invalidateCache();
    this.onEntityAdded.fire(root);
    return root;
  }

  public serialize(): Entity[] {
    return JSON.parse(JSON.stringify(Array.from(this.entities.values())));
  }

  public deserialize(data: Entity[]): void {
    this.entities.clear();
    for (const ent of data) {
      this.entities.set(ent.id, ent);
    }
    this.invalidateCache();
  }
}
