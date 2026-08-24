import { AnimationClip, Vector3Data } from "../types/engine";
import { ECSWorld } from "../core/ecs";

export interface AnimationState {
  name: string;
  clipId: string;
  playbackSpeed: number;
  loop: boolean;
}

export class AnimationEngine {
  private ecs: ECSWorld;
  private activeClips: Map<string, { clip: AnimationClip; currentTime: number; speed: number }> = new Map();
  public currentAnimState: string = "Idle";

  constructor(ecs: ECSWorld) {
    this.ecs = ecs;
  }

  public playClip(clip: AnimationClip, speed = 1.0): void {
    this.activeClips.set(clip.id, { clip, currentTime: 0, speed });
  }

  public stopClip(clipId: string): void {
    this.activeClips.delete(clipId);
  }

  public step(dt: number): void {
    if (this.activeClips.size === 0) return;

    const clipsToStop: string[] = [];
    for (const [id, anim] of this.activeClips.entries()) {
      anim.currentTime += dt * anim.speed;

      if (anim.currentTime > anim.clip.duration) {
        if (anim.clip.loop) {
          anim.currentTime %= anim.clip.duration;
        } else {
          anim.currentTime = anim.clip.duration;
          clipsToStop.push(id);
        }
      }

      this.applyKeyframes(anim.clip, anim.currentTime);
    }

    for (const id of clipsToStop) {
      this.activeClips.delete(id);
    }
  }

  private applyKeyframes(clip: AnimationClip, time: number): void {
    const keyframes = clip.keyframes;
    if (!keyframes || keyframes.length === 0) return;

    // Sort by time just in case
    for (let i = 0; i < keyframes.length - 1; i++) {
      const kfA = keyframes[i];
      const kfB = keyframes[i + 1];

      if (time >= kfA.time && time <= kfB.time) {
        const span = kfB.time - kfA.time;
        const t = span > 0 ? (time - kfA.time) / span : 0;

        const trans = this.ecs.getComponent(kfA.entityId, "Transform") as any;
        if (trans) {
          trans.position = this.lerpVector(kfA.position, kfB.position, t);
          trans.rotation = this.lerpVector(kfA.rotation, kfB.rotation, t);
          trans.scale = this.lerpVector(kfA.scale, kfB.scale, t);
          this.ecs.setComponent(kfA.entityId, trans);
        }
        break;
      }
    }
  }

  private lerpVector(a: Vector3Data, b: Vector3Data, t: number): Vector3Data {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t
    };
  }

  // Two-Bone Inverse Kinematics (IK) solver helper for limb reach
  public solveTwoBoneIK(rootPos: Vector3Data, targetPos: Vector3Data, boneLen1 = 1.5, boneLen2 = 1.5): { jointAngle: number; stretch: number } {
    const dist = Math.hypot(targetPos.x - rootPos.x, targetPos.y - rootPos.y, targetPos.z - rootPos.z);
    const clampDist = Math.min(dist, boneLen1 + boneLen2 - 0.01);
    const angle = Math.acos((boneLen1 * boneLen1 + clampDist * clampDist - boneLen2 * boneLen2) / (2 * boneLen1 * clampDist || 1));
    return { jointAngle: isNaN(angle) ? 0 : angle, stretch: clampDist / (boneLen1 + boneLen2) };
  }
}
