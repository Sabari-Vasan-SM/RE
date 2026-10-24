// Web Audio API synthesizer for focus and break notifications

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant upward chime when a focus session starts
 */
export function playFocusStartChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25]; // A4, C#5, E5 (Major triad)
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.1 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.1);
    osc.stop(ctx.currentTime + index * 0.1 + 0.5);
  });
}

/**
 * Plays a double celebration chime when a Pomodoro completes
 */
export function playPomodoroCompleteChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + index * 0.12 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.12);
    osc.stop(ctx.currentTime + index * 0.12 + 0.8);
  });
}

/**
 * Plays a calming reminder tone when a break completes
 */
export function playBreakEndChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [659.25, 523.25]; // E5 -> C5
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.18);

    gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.18);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.18 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.18 + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.18);
    osc.stop(ctx.currentTime + index * 0.18 + 0.6);
  });
}
