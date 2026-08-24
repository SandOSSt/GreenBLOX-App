import { Entity, TransformComponent, RigidBodyComponent, Vector3Data } from "../types/engine";
import { ECSWorld } from "../core/ecs";
import { Signal } from "../core/signals";

export interface RaycastHit {
  entityId: string;
  entityName: string;
  point: Vector3Data;
  normal: Vector3Data;
  distance: number;
}

export interface CollisionEvent {
  entityA: string;
  entityB: string;
  relativeSpeed: number;
  contactPoint: Vector3Data;
}

export class PhysicsEngine {
  private ecs: ECSWorld;
  public gravity: Vector3Data = { x: 0, y: -19.62, z: 0 }; // Feel robust like Roblox 19.62m/s^2
  public timeScale: number = 1.0;
  public onCollision = new Signal<CollisionEvent>();
  public waterLevel: number = -100;
  public waterDensity: number = 1.0;
  private subSteps: number = 2;

  /**
   * Cached static colliders (mass <= 0 or locked). Rebuilt only when the
   * scene actually changes (notifySceneChanged) instead of every physics
   * substep scanning the whole ECS — Studio worlds with thousands of parts
   * were paying O(all entities) × 2 substeps × 60fps in play mode.
   */
  private staticColliders: { ent: Entity; trans: TransformComponent; body?: RigidBodyComponent }[] = [];
  private staticCollidersValid = false;
  /** Scratch list of dynamic rigid bodies (rebuilt per substep — few). */
  private dynamicScratch: { ent: Entity; trans: TransformComponent; body: RigidBodyComponent }[] = [];

  // Player Character kinematic states
  public playerEntityId: string | null = null;
  public playerVelocity: Vector3Data = { x: 0, y: 0, z: 0 };
  public isGrounded: boolean = false;
  private groundedGraceSeconds = 0;
  private jumpBufferSeconds = 0;

  constructor(ecs: ECSWorld, gravity: Vector3Data = { x: 0, y: -19.62, z: 0 }, waterLevel = -100) {
    this.ecs = ecs;
    this.gravity = gravity;
    this.waterLevel = waterLevel;
  }

  /** Invalidate the static-collider cache after any scene edit (add/remove/
   *  re-anchor). Called on every ECS component change / entity add-remove, so
   *  the cache can never go stale. */
  public notifySceneChanged(): void {
    this.staticCollidersValid = false;
  }

  /** Rebuild the static-collider cache (if dirty). O(N) only on scene change,
   *  then O(1) per frame in the hot path. */
  private refreshStaticColliders(): void {
    if (this.staticCollidersValid) return;
    this.staticColliders = [];
    for (const ent of this.ecs.getAllEntities()) {
      const trans = this.ecs.getComponent<TransformComponent>(ent.id, "Transform");
      const body = this.ecs.getComponent<RigidBodyComponent>(ent.id, "RigidBody");
      if (!trans) continue;
      if (!body || !body.enabled) continue;
      // mass <= 0 or locked = static; dynamic bodies are collected per substep.
      if (body.mass > 0 && !ent.isLocked) continue;
      this.staticColliders.push({ ent, trans, body });
    }
    this.staticCollidersValid = true;
  }

  public step(deltaTime: number): void {
    if (deltaTime <= 0 || this.timeScale <= 0) return;
    const dt = Math.min(0.1, deltaTime * this.timeScale);
    const subDt = dt / this.subSteps;

    for (let step = 0; step < this.subSteps; step++) {
      this.simulateSubstep(subDt);
    }
  }

  private simulateSubstep(dt: number): void {
    this.refreshStaticColliders();
    const entities = this.ecs.getAllEntities();

    // Dynamic bodies are few; collect them fresh each substep.
    const dynamicObjects = this.dynamicScratch;
    dynamicObjects.length = 0;
    for (const ent of entities) {
      const trans = this.ecs.getComponent<TransformComponent>(ent.id, "Transform");
      const body = this.ecs.getComponent<RigidBodyComponent>(ent.id, "RigidBody");
      if (!trans) continue;

      // No RigidBody => purely visual object, it must never collide with anything.
      if (!body || !body.enabled) continue;

      if (body.mass > 0 && !ent.isLocked) {
        dynamicObjects.push({ ent, trans, body });
      }
    }
    const staticObjects = this.staticColliders;

    // Integrate forces & gravity
    for (const obj of dynamicObjects) {
      const { trans, body } = obj;
      if (!body.velocity) body.velocity = { x: 0, y: 0, z: 0 };
      if (!body.angularVelocity) body.angularVelocity = { x: 0, y: 0, z: 0 };

      // Apply Gravity
      if (body.useGravity) {
        body.velocity.x += this.gravity.x * dt;
        body.velocity.y += this.gravity.y * dt;
        body.velocity.z += this.gravity.z * dt;
      }

      // Check Buoyancy in water
      if (trans.position.y <= this.waterLevel) {
        const submersionDepth = this.waterLevel - trans.position.y + 1.0;
        const buoyantForceY = submersionDepth * body.buoyancyFactor * 25.0;
        body.velocity.y += buoyantForceY * dt;
        // Water viscous damping
        body.velocity.x *= 0.95;
        body.velocity.y *= 0.96;
        body.velocity.z *= 0.95;
      }

      // Air resistance damping
      body.velocity.x *= 0.998;
      body.velocity.y *= 0.998;
      body.velocity.z *= 0.998;

      // Move positions by velocity
      trans.position.x += body.velocity.x * dt;
      trans.position.y += body.velocity.y * dt;
      trans.position.z += body.velocity.z * dt;

      // Rotate by angular velocity
      trans.rotation.x += body.angularVelocity.x * dt;
      trans.rotation.y += body.angularVelocity.y * dt;
      trans.rotation.z += body.angularVelocity.z * dt;
    }

    // Resolve Collisions
    for (const dyn of dynamicObjects) {
      const { ent: dynEnt, trans: dynTrans, body: dynBody } = dyn;
      const dynHalfY = (dynTrans.scale.y || 1) / 2;

      // Floor / static objects collision
      for (const stat of staticObjects) {
        const { ent: statEnt, trans: statTrans } = stat;
        const statHalfX = (statTrans.scale.x || 1) / 2;
        const statHalfY = (statTrans.scale.y || 1) / 2;
        const statHalfZ = (statTrans.scale.z || 1) / 2;

        // Simple AABB overlap check
        const dx = dynTrans.position.x - statTrans.position.x;
        const dy = dynTrans.position.y - statTrans.position.y;
        const dz = dynTrans.position.z - statTrans.position.z;

        const dynHalfX = (dynTrans.scale.x || 1) / 2;
        const dynHalfZ = (dynTrans.scale.z || 1) / 2;

        const overlapX = (dynHalfX + statHalfX) - Math.abs(dx);
        const overlapY = (dynHalfY + statHalfY) - Math.abs(dy);
        const overlapZ = (dynHalfZ + statHalfZ) - Math.abs(dz);

        if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
          if (dynBody.isTrigger || (stat.body && stat.body.isTrigger)) {
            this.onCollision.fire({
              entityA: dynEnt.id,
              entityB: statEnt.id,
              relativeSpeed: Math.hypot(dynBody.velocity!.x, dynBody.velocity!.y, dynBody.velocity!.z),
              contactPoint: { ...dynTrans.position }
            });
            continue;
          }

          // Strict continuous resolution: push out along the axis of least penetration
          if (overlapY <= overlapX && overlapY <= overlapZ) {
            // Y-axis resolution (Floor or Ceiling)
            if (dy > 0) {
              dynTrans.position.y += overlapY;
              if (dynBody.velocity!.y < 0) {
                dynBody.velocity!.y = -dynBody.velocity!.y * dynBody.bounciness;
                dynBody.velocity!.x *= Math.max(0, 1 - dynBody.friction * 0.1);
                dynBody.velocity!.z *= Math.max(0, 1 - dynBody.friction * 0.1);
              }
            } else {
              dynTrans.position.y -= overlapY;
              if (dynBody.velocity!.y > 0) dynBody.velocity!.y = -dynBody.velocity!.y * dynBody.bounciness;
            }
          } else if (overlapX <= overlapZ) {
            // X-axis resolution (Wall)
            dynTrans.position.x += dx > 0 ? overlapX : -overlapX;
            dynBody.velocity!.x = 0; // Completely stop velocity against walls (Roblox style)
          } else {
            // Z-axis resolution (Wall)
            dynTrans.position.z += dz > 0 ? overlapZ : -overlapZ;
            dynBody.velocity!.z = 0;
          }

          this.onCollision.fire({
            entityA: dynEnt.id,
            entityB: statEnt.id,
            relativeSpeed: Math.hypot(dynBody.velocity!.x, dynBody.velocity!.y, dynBody.velocity!.z),
            contactPoint: { ...dynTrans.position }
          });
        }
      }

      // Check minimum safety floor Y
      if (dynTrans.position.y - dynHalfY < 0 && !dynEnt.name.includes("Terrain") && !dynEnt.name.includes("Floor") && !dynEnt.name.includes("Baseplate")) {
        dynTrans.position.y = dynHalfY;
        if (dynBody.velocity!.y < 0) {
          dynBody.velocity!.y = -dynBody.velocity!.y * (dynBody.bounciness ?? 0.2);
          dynBody.velocity!.x *= 0.85;
          dynBody.velocity!.z *= 0.85;
        }
      }
    }
  }

  // Roblox-style Humanoid controller — direct velocity, no floaty interpolation.
  public updatePlayerController(entityId: string, moveDir: { x: number; z: number }, jump: boolean, speed: number, dt: number): void {
    const trans = this.ecs.getComponent<TransformComponent>(entityId, "Transform");
    const body = this.ecs.getComponent<RigidBodyComponent>(entityId, "RigidBody");
    if (!trans || !body) return;

    if (!body.velocity) body.velocity = { x: 0, y: 0, z: 0 };

    const hasInput = Math.hypot(moveDir.x, moveDir.z) > 0.001;

    // Grounded check: baseplate or standing on top of any static object
    let grounded = false;
    const playerHalfY = (trans.scale.y || 3.6) / 2;
    const playerFeetY = trans.position.y - playerHalfY;

    if (playerFeetY <= 0.18) {
      grounded = true;
    } else {
      // Статический коллайдер-кэш вместо O(N) скана всего мира на кадр:
      // на студийных мирах с тысячами частей перебор всех сущностей каждые
      // 16мс был лишним. refreshStaticColliders() дёшев (инвалидируется
      // только при изменении сцены), поэтому grounded-проверка стала O(1).
      this.refreshStaticColliders();
      const playerHalfX = (trans.scale.x || 1) / 2;
      const playerHalfZ = (trans.scale.z || 1) / 2;
      for (const stat of this.staticColliders) {
        const sTrans = stat.trans;
        const sBody = stat.body;
        // Only solid, non-trigger colliders can be stood on.
        if (!sBody || !sBody.enabled || sBody.isTrigger) continue;
        const sHalfX = (sTrans.scale.x || 1) / 2;
        const sHalfY = (sTrans.scale.y || 1) / 2;
        const sHalfZ = (sTrans.scale.z || 1) / 2;
        const dx = Math.abs(trans.position.x - sTrans.position.x);
        const dz = Math.abs(trans.position.z - sTrans.position.z);
        const feetToTop = playerFeetY - (sTrans.position.y + sHalfY);
        if (dx < playerHalfX + sHalfX - 0.02 && dz < playerHalfZ + sHalfZ - 0.02 && feetToTop >= -0.18 && feetToTop <= 0.22) {
          grounded = true;
          break;
        }
      }
    }

    this.isGrounded = grounded;
    if (grounded) this.groundedGraceSeconds = 0.12;
    else this.groundedGraceSeconds = Math.max(0, this.groundedGraceSeconds - dt);

    if (jump) this.jumpBufferSeconds = 0.14;
    else this.jumpBufferSeconds = Math.max(0, this.jumpBufferSeconds - dt);

    // --- Horizontal movement ---
    // On the ground: velocity == input * speed (crisp Roblox feel, no drift).
    // In the air:    keep momentum, allow only weak steering (air control).
    if (grounded) {
      body.velocity.x = moveDir.x * speed;
      body.velocity.z = moveDir.z * speed;
    } else if (hasInput) {
      const airControl = 4.5;
      const alpha = 1 - Math.exp(-airControl * dt);
      body.velocity.x += (moveDir.x * speed - body.velocity.x) * alpha;
      body.velocity.z += (moveDir.z * speed - body.velocity.z) * alpha;
    }

    // Clamp small resting vertical velocity so grounded frames don't jitter
    if (grounded && body.velocity.y < 0) body.velocity.y = 0;

    // Buffered jump + coyote time
    if (this.jumpBufferSeconds > 0 && this.groundedGraceSeconds > 0) {
      body.velocity.y = 16.5;
      this.isGrounded = false;
      this.groundedGraceSeconds = 0;
      this.jumpBufferSeconds = 0;
    }

    // Keep the character upright at all times
    body.angularVelocity = { x: 0, y: 0, z: 0 };
    trans.rotation.x = 0;
    trans.rotation.z = 0;

    // Face movement direction — instantly on the ground, smoothly in the air
    if (hasInput) {
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetAngle - trans.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      const turnAlpha = grounded ? 1 : 1 - Math.exp(-16 * dt);
      trans.rotation.y += diff * turnAlpha;
    }

    // Attach Visor
    const ent = this.ecs.getEntity(entityId);
    if (ent && ent.children.length > 0) {
      for (const childId of ent.children) {
        const childTrans = this.ecs.getComponent<TransformComponent>(childId, "Transform");
        if (childTrans && ent.name === "Player") {
          const s = Math.sin(trans.rotation.y);
          const c = Math.cos(trans.rotation.y);
          // Fixed offset for visor: local (0, 0.8, 0.9)
          childTrans.position.x = trans.position.x + (0 * c + 0.9 * s);
          childTrans.position.y = trans.position.y + 0.8;
          childTrans.position.z = trans.position.z + (-0 * s + 0.9 * c);
          childTrans.rotation.y = trans.rotation.y;
        }
      }
    }
  }

  // Fast Geometric Raycasting API
  public raycast(origin: Vector3Data, direction: Vector3Data, maxDistance = 100.0, ignoreEntityIds: string[] = []): RaycastHit | null {
    let closestHit: RaycastHit | null = null;
    let minDistance = maxDistance;

    // Normalize direction
    const len = Math.hypot(direction.x, direction.y, direction.z);
    if (len === 0) return null;
    const dir = { x: direction.x / len, y: direction.y / len, z: direction.z / len };

    const entities = this.ecs.getAllEntities();
    for (const ent of entities) {
      if (ignoreEntityIds.includes(ent.id)) continue;
      const trans = this.ecs.getComponent<TransformComponent>(ent.id, "Transform");
      if (!trans) continue;

      // Sphere approximation / Bounding box intersection
      const radius = Math.max(trans.scale.x, trans.scale.y, trans.scale.z) / 2;
      const toCenter = {
        x: trans.position.x - origin.x,
        y: trans.position.y - origin.y,
        z: trans.position.z - origin.z
      };
      const proj = toCenter.x * dir.x + toCenter.y * dir.y + toCenter.z * dir.z;
      if (proj < 0 || proj > minDistance + radius) continue;

      const distSq = (toCenter.x * toCenter.x + toCenter.y * toCenter.y + toCenter.z * toCenter.z) - (proj * proj);
      if (distSq <= radius * radius) {
        const hitDist = Math.max(0, proj - Math.sqrt(radius * radius - distSq));
        if (hitDist < minDistance) {
          minDistance = hitDist;
          const hitPoint = {
            x: origin.x + dir.x * hitDist,
            y: origin.y + dir.y * hitDist,
            z: origin.z + dir.z * hitDist
          };
          closestHit = {
            entityId: ent.id,
            entityName: ent.name,
            point: hitPoint,
            normal: { x: 0, y: 1, z: 0 },
            distance: hitDist
          };
        }
      }
    }

    return closestHit;
  }
}
