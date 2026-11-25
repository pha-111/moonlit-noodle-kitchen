// Tiny kitchen sounds made with the WebAudio API — no audio files,
// so the game stays fully offline. Each helper is safe to call before
// the first user gesture; the context simply stays silent until then.

let sharedContext = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!sharedContext) sharedContext = new AudioCtor();
  if (sharedContext.state === "suspended") sharedContext.resume();
  return sharedContext;
}

function tone(freq, startOffset, duration, type = "sine", volume = 0.12) {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + startOffset;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  pop() {
    tone(520, 0, 0.08, "triangle", 0.1);
  },
  serveSuccess() {
    tone(523, 0, 0.12, "triangle", 0.12);
    tone(659, 0.09, 0.12, "triangle", 0.12);
    tone(784, 0.18, 0.22, "triangle", 0.12);
  },
  mistake() {
    tone(160, 0, 0.18, "sawtooth", 0.07);
    tone(120, 0.05, 0.2, "sawtooth", 0.06);
  },
  tick() {
    tone(880, 0, 0.05, "square", 0.04);
  },
  gameOver() {
    tone(392, 0, 0.16, "triangle", 0.11);
    tone(330, 0.14, 0.16, "triangle", 0.11);
    tone(262, 0.28, 0.3, "triangle", 0.11);
  },
};
