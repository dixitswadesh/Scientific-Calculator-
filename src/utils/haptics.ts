// Web Audio API Synthesized Haptic Sound & Native Vibration Engine

class SoundHapticService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem('calc_sound_enabled');
      const savedVibrate = localStorage.getItem('calc_vibrate_enabled');
      this.soundEnabled = savedSound !== null ? savedSound === 'true' : true;
      this.vibrationEnabled = savedVibrate !== null ? savedVibrate === 'true' : true;
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('calc_sound_enabled', String(enabled));
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVibrationEnabled(enabled: boolean) {
    this.vibrationEnabled = enabled;
    localStorage.setItem('calc_vibrate_enabled', String(enabled));
  }

  public getVibrationEnabled(): boolean {
    return this.vibrationEnabled;
  }

  // Play subtle Android Material tactile click sound
  public playKeyFeedback(type: 'number' | 'operator' | 'action' | 'equals' | 'delete' = 'number') {
    // 1. Mobile Physical Vibration
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'equals') {
          navigator.vibrate([18, 20, 18]);
        } else if (type === 'action' || type === 'delete') {
          navigator.vibrate(15);
        } else {
          navigator.vibrate(8);
        }
      } catch {
        // Ignore vibration errors if restricted
      }
    }

    // 2. Synthesized Mechanical/Soft Tone
    if (!this.soundEnabled) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      let freq = 600;
      let duration = 0.04;
      let wave: OscillatorType = 'sine';

      if (type === 'number') {
        freq = 780;
        duration = 0.035;
      } else if (type === 'operator') {
        freq = 920;
        duration = 0.045;
      } else if (type === 'action') {
        freq = 450;
        duration = 0.06;
      } else if (type === 'delete') {
        freq = 380;
        duration = 0.05;
      } else if (type === 'equals') {
        freq = 1040;
        duration = 0.07;
        wave = 'triangle';
      }

      osc.type = wave;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      // Slight pitch bend for tactile snap
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const hapticEngine = new SoundHapticService();
