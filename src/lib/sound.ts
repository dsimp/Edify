"use client";

/**
 * Perspectives — therapeutic harmonic sound engine.
 * Synthesizes crystal-cup coin drops, gentle location harmonics, and a soft 432Hz ambient pad.
 */

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private enabled = true;

  private ensure() {
    if (typeof window === "undefined") return;
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 0.5 : 0;
    this.master.connect(this.ctx.destination);
    this.startPad();
  }

  private startPad() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const pad = ctx.createGain();
    pad.gain.value = 0.028;
    this.padGain = pad;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 480;
    filter.connect(pad);
    pad.connect(this.master);

    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.045;
    lfoDepth.gain.value = 110;
    lfo.connect(lfoDepth).connect(filter.frequency);
    lfo.start();

    [108, 162, 216, 324].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i % 2 ? "triangle" : "sine";
      osc.frequency.value = f;
      g.gain.value = 0.42 / (i + 1);
      osc.connect(g).connect(filter);
      osc.start();
    });
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.ensure();
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(on ? 0.5 : 0, t, 0.35);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  chime(freq = 528, duration = 2.0, level = 0.14) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    g.connect(this.master);

    [1, 2.0, 3.01].forEach((mult, i) => {
      const osc = this.ctx!.createOscillator();
      const og = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      og.gain.value = 1 / (i * 2.6 + 1);
      osc.connect(og).connect(g);
      osc.start(t);
      osc.stop(t + duration);
    });
  }

  /**
   * Crystal Cup coin-drop resonance:
   * Combines a warm water-glass droplet pitch bend with an ascending harmonic shimmer
   * whose pitch scales from 1¢ to 5¢.
   */
  support(cents: number) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx || !this.master) return;

    const baseScale = [432, 486, 540, 648, 720, 864, 972];
    const rootFreq = baseScale[Math.min(Math.max(0, cents - 1), baseScale.length - 1)];
    const t = this.ctx.currentTime;

    // 1. Tactile droplet transient into the Cup
    const dropOsc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();
    dropOsc.type = "sine";
    dropOsc.frequency.setValueAtTime(rootFreq * 0.72, t);
    dropOsc.frequency.exponentialRampToValueAtTime(rootFreq * 1.5, t + 0.085);
    dropGain.gain.setValueAtTime(0.0001, t);
    dropGain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    dropOsc.connect(dropGain).connect(this.master);
    dropOsc.start(t);
    dropOsc.stop(t + 0.17);

    // 2. Ascending crystal harmonic bloom
    for (let i = 0; i < 3; i++) {
      const f = baseScale[Math.min(cents - 1 + i, baseScale.length - 1)];
      setTimeout(() => this.chime(f, 1.9, 0.12), 55 + i * 75);
    }
  }
}

export const sound = new SoundEngine();
