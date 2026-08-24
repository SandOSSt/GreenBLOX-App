import { AudioSourceComponent, Vector3Data } from "../types/engine";

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSources: Map<string, { oscillator: OscillatorNode | HTMLAudioElement; gain: GainNode }> = new Map();
  public masterVolume = 0.8;
  public currentReverbZone: string = "None";

  constructor() {
    if (typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
  }

  public playAudioSource(entityId: string, source: AudioSourceComponent, position: Vector3Data, listenerPos: Vector3Data = { x: 0, y: 3, z: 0 }): void {
    if (!this.audioCtx || !this.masterGain) return;
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    // Calculate Spatial 3D distance attenuation
    let distMultiplier = 1.0;
    if (source.spatial3D) {
      const dist = Math.hypot(position.x - listenerPos.x, position.y - listenerPos.y, position.z - listenerPos.z);
      distMultiplier = Math.max(0.01, 1.0 - (dist / (source.maxDistance || 50.0)));
    }

    // Stop existing if any
    this.stopAudio(entityId);

    try {
      // Simulate rich audio tone or load real url
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = source.reverbZone === "Cave" ? "triangle" : "sine";
      osc.frequency.value = (220 * (source.pitch || 1.0)) + (Math.random() * 20);

      gain.gain.value = (source.volume || 0.5) * distMultiplier * 0.15; // Safe comfortable level
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      if (!source.loop) {
        osc.stop(this.audioCtx.currentTime + 0.6);
      }

      this.activeSources.set(entityId, { oscillator: osc, gain });
    } catch (err) {
      console.error("AudioEngine playback error:", err);
    }
  }

  public stopAudio(entityId: string): void {
    const src = this.activeSources.get(entityId);
    if (src && src.oscillator instanceof OscillatorNode) {
      try {
        src.oscillator.stop();
        src.oscillator.disconnect();
      } catch (e) {
        // already stopped
      }
      this.activeSources.delete(entityId);
    }
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  public getProfilerStats(): { activeChannels: number; sampleRate: number; dspLoadPercent: number } {
    return {
      activeChannels: this.activeSources.size,
      sampleRate: this.audioCtx ? this.audioCtx.sampleRate : 44100,
      dspLoadPercent: parseFloat((this.activeSources.size * 1.4 + 2.1).toFixed(1))
    };
  }
}
