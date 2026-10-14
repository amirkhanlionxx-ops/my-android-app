// Web Audio API Sound Synthesizer & Vocal Announcer for Android and Flutter Platform Selection

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Pronounce platform name ("Android" / "Flutter") in clear speech
 */
export function speakPlatformName(name: 'Android' | 'Flutter') {
  if (typeof window === 'undefined') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.lang = 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = name === 'Flutter' ? 1.15 : 0.95;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn('Speech synthesis unavailable:', err);
  }
}

/**
 * Modern Android Futuristic Chime Sound & Voice
 * High-tech dual-sine chime with harmonic bloom + speaks "Android"
 */
export function playAndroidSound() {
  speakPlatformName('Android');
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Primary modern android chime (D5 -> A5 -> D6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Harmonic bell layer (A5 octave overtone)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880.00, now);
    osc2.frequency.linearRampToValueAtTime(1320.00, now + 0.2);

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
}

/**
 * Sleek Flutter Cyber Harp Flutter / Swoosh Sound & Voice
 * Rapid ascending high-tech flutter arpeggio (C# -> E -> G# -> B -> E6) + speaks "Flutter"
 */
export function playFlutterSound() {
  speakPlatformName('Flutter');
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [554.37, 659.25, 830.61, 987.77, 1318.51]; // C#5, E5, G#5, B5, E6
    const stepDuration = 0.05;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * stepDuration);

      const noteStart = now + idx * stepDuration;
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.4);
    });
  } catch (err) {
    console.warn('Flutter audio play failed:', err);
  }
}
