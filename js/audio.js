// ═══════════════════════════════════════════════════════
//  NINJA LANGUAGE RUNNER — Audio Engine
//  Uses Web Speech API (SpeechSynthesis) — no files needed
// ═══════════════════════════════════════════════════════

const Audio = {
  _enabled: true,
  _voices: [],
  _ready: false,

  init() {
    if (!window.speechSynthesis) { this._ready = false; return; }
    const load = () => {
      this._voices = window.speechSynthesis.getVoices();
      this._ready = this._voices.length > 0;
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  },

  toggle() {
    this._enabled = !this._enabled;
    return this._enabled;
  },

  isEnabled() { return this._enabled; },

  // Speak a word in target language
  speak(text, lang, rate = 0.85) {
    if (!this._enabled || !this._ready) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANG_CODES[lang] || "en-US";
    utter.rate = rate;
    utter.pitch = 1;
    utter.volume = 0.9;

    // Try to find a matching voice
    const match = this._voices.find(v => v.lang.startsWith(utter.lang.slice(0, 2)));
    if (match) utter.voice = match;

    window.speechSynthesis.speak(utter);
  },

  // Play a UI sound via oscillator (no files needed)
  beep(type = "correct") {
    if (!this._enabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.frequency.setValueAtTime(523, ctx.currentTime);        // C5
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "wrong") {
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.type = "sawtooth";
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "boss") {
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.type = "square";
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === "levelup") {
        const freqs = [392, 523, 659, 784, 1046];
        freqs.forEach((f, i) => {
          const o2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.value = f;
          g2.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
          g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
          o2.start(ctx.currentTime + i * 0.1);
          o2.stop(ctx.currentTime + i * 0.1 + 0.2);
        });
      } else if (type === "tick") {
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch(e) { /* AudioContext blocked */ }
  },

  // Dictation: speak and wait, return promise
  speakAndWait(text, lang) {
    return new Promise((resolve) => {
      if (!this._enabled || !this._ready) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = LANG_CODES[lang] || "en-US";
      utter.rate = 0.75; // slower for dictation
      utter.onend = resolve;
      utter.onerror = resolve;
      const match = this._voices.find(v => v.lang.startsWith(utter.lang.slice(0, 2)));
      if (match) utter.voice = match;
      window.speechSynthesis.speak(utter);
    });
  }
};
