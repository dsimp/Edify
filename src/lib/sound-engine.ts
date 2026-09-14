"use client";

/**
 * Therapeutic Web Audio API Synthesizer for Edify
 * 
 * Creates a soothing 432Hz ambient sunset drone, gentle ocean breath waves,
 * and singing bowl / crystal chimes on interactions.
 * 100% synthesized in real-time, zero external asset dependencies.
 */

class EdifySoundEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = true; // start muted, user unmutes gracefully
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private waveGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];

  private initContext() {
    if (typeof window === "undefined") return;
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient Drone Bus
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.droneGain.connect(this.masterGain);

      // Ocean Wave Bus
      this.waveGain = this.ctx.createGain();
      this.waveGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.waveGain.connect(this.masterGain);

      this.startAmbientDrone();
      this.startOceanBreath();
      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.droneGain) return;

    // Pentatonic base frequencies tuned to A=432Hz
    const baseFreqs = [216, 216.5, 324, 432, 433, 540];

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(480, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    filter.connect(this.droneGain);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    baseFreqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      oscGain.gain.setValueAtTime(0.08 / (i + 1), this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.oscillators.push(osc);
    });
  }

  private startOceanBreath() {
    if (!this.ctx || !this.waveGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(320, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const swellLfo = this.ctx.createOscillator();
    const swellGain = this.ctx.createGain();
    swellLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    swellGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    const waveVol = this.ctx.createGain();
    waveVol.gain.setValueAtTime(0.06, this.ctx.currentTime);

    swellLfo.connect(swellGain);
    swellGain.connect(waveVol.gain);

    whiteNoise.connect(bandpass);
    bandpass.connect(waveVol);
    waveVol.connect(this.waveGain);

    whiteNoise.start();
    swellLfo.start();
  }

  public playChime(freq = 528, duration = 3.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration);
    subOsc.stop(now + duration);
  }

  public playAnteSpark(amountCents = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const scale = [432, 486, 540, 648, 720, 864, 972];
    const baseIdx = Math.min(amountCents - 1, scale.length - 3);

    [0, 1, 2].forEach((step, i) => {
      const freq = scale[baseIdx + step];
      setTimeout(() => {
        this.playChime(freq, 2.2);
      }, i * 70);
    });
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.35,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const soundEngine = new EdifySoundEngine();
