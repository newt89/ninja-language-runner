// ═══════════════════════════════════════════════════════
//  NINJA LANGUAGE RUNNER — Player Memory & Auth System
// ═══════════════════════════════════════════════════════

const NLR_KEY = "ninja_lang_runner_v1";

// ── Auth ─────────────────────────────────────────────────
const Auth = {
  getAll() {
    return JSON.parse(localStorage.getItem(NLR_KEY + "_users") || "{}");
  },
  saveAll(users) {
    localStorage.setItem(NLR_KEY + "_users", JSON.stringify(users));
  },
  register(username, password) {
    const users = this.getAll();
    if (users[username]) return { ok: false, err: "Username taken" };
    const salt = Math.random().toString(36).slice(2);
    users[username] = {
      hash: btoa(password + salt),
      salt,
      created: Date.now(),
      profile: this._defaultProfile(username),
    };
    this.saveAll(users);
    return { ok: true };
  },
  login(username, password) {
    const users = this.getAll();
    const u = users[username];
    if (!u) return { ok: false, err: "User not found" };
    if (btoa(password + u.salt) !== u.hash) return { ok: false, err: "Wrong password" };
    sessionStorage.setItem(NLR_KEY + "_session", username);
    return { ok: true, profile: u.profile };
  },
  logout() {
    sessionStorage.removeItem(NLR_KEY + "_session");
  },
  current() {
    return sessionStorage.getItem(NLR_KEY + "_session");
  },
  getProfile(username) {
    const users = this.getAll();
    return users[username]?.profile || null;
  },
  saveProfile(username, profile) {
    const users = this.getAll();
    if (!users[username]) return;
    users[username].profile = profile;
    this.saveAll(users);
  },
  _defaultProfile(username) {
    return {
      username,
      xp: 0,
      level: 1,
      rank: "Initiate",
      selectedLang: "spanish",
      totalGames: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalTime: 0,
      streakMax: 0,
      history: [],       // [{date, mode, lang, score, accuracy, xp}]
      wordMemory: {},    // {lang: {word: {correct,wrong,avgTime,lastSeen}}}
      achievements: [],
      stats: {
        byMode: { reflex:{}, ninja:{}, syntax:{}, dictation:{} },
        byLang: {},
      }
    };
  }
};

// ── Player Memory Engine ─────────────────────────────────
const Memory = {
  _p: null,

  load() {
    const u = Auth.current();
    if (!u) return null;
    this._p = Auth.getProfile(u);
    return this._p;
  },

  save() {
    const u = Auth.current();
    if (!u || !this._p) return;
    Auth.saveProfile(u, this._p);
  },

  get profile() { return this._p; },

  // Track a word result
  recordWord(lang, word, correct, timeMs) {
    if (!this._p) return;
    if (!this._p.wordMemory[lang]) this._p.wordMemory[lang] = {};
    const wm = this._p.wordMemory[lang];
    if (!wm[word]) wm[word] = { correct: 0, wrong: 0, avgTime: 0, lastSeen: 0, familiarity: 0 };
    const w = wm[word];
    if (correct) {
      w.correct++;
      this._p.totalCorrect++;
    } else {
      w.wrong++;
      this._p.totalWrong++;
    }
    // Rolling average time
    const n = w.correct + w.wrong;
    w.avgTime = Math.round((w.avgTime * (n - 1) + timeMs) / n);
    w.lastSeen = Date.now();
    // Familiarity 0-100
    const acc = w.correct / n;
    const speedBonus = timeMs < 2000 ? 10 : timeMs < 4000 ? 5 : 0;
    w.familiarity = Math.min(100, Math.round(acc * 80 + speedBonus));
    this.save();
  },

  // Get weakest words for a language (sorted by familiarity asc)
  getWeakWords(lang, limit = 10) {
    if (!this._p?.wordMemory?.[lang]) return [];
    return Object.entries(this._p.wordMemory[lang])
      .sort((a, b) => a[1].familiarity - b[1].familiarity)
      .slice(0, limit)
      .map(([word]) => word);
  },

  // Get familiarity for a word
  getFamiliarity(lang, word) {
    return this._p?.wordMemory?.[lang]?.[word]?.familiarity ?? 0;
  },

  // Record a completed game session
  recordSession(mode, lang, score, accuracy, xpEarned, durationSec) {
    if (!this._p) return;
    this._p.xp += xpEarned;
    this._p.totalGames++;
    this._p.totalTime += durationSec;
    this._p.level = this._calcLevel(this._p.xp);
    this._p.rank = this._calcRank(this._p.level);

    this._p.history.unshift({
      date: new Date().toISOString(),
      mode, lang, score, accuracy, xp: xpEarned, duration: durationSec
    });
    if (this._p.history.length > 100) this._p.history.pop();

    // Per-mode stats
    const ms = this._p.stats.byMode[mode] || {};
    ms.gamesPlayed = (ms.gamesPlayed || 0) + 1;
    ms.bestScore   = Math.max(ms.bestScore || 0, score);
    ms.avgAccuracy = Math.round(((ms.avgAccuracy || 0) * (ms.gamesPlayed - 1) + accuracy) / ms.gamesPlayed);
    this._p.stats.byMode[mode] = ms;

    // Per-lang stats
    const ls = this._p.stats.byLang[lang] || {};
    ls.gamesPlayed = (ls.gamesPlayed || 0) + 1;
    ls.xpEarned    = (ls.xpEarned || 0) + xpEarned;
    this._p.stats.byLang[lang] = ls;

    this._checkAchievements();
    this.save();
  },

  _calcLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  },

  _calcRank(level) {
    if (level < 5)  return "Initiate";
    if (level < 10) return "Decoder";
    if (level < 20) return "Synthesizer";
    if (level < 35) return "Architect";
    return "Fluent Entity";
  },

  _checkAchievements() {
    const p = this._p;
    const earned = p.achievements;
    const add = (id, label) => { if (!earned.includes(id)) earned.push(id); };

    if (p.totalCorrect >= 10)   add("correct_10",   "First 10 Correct");
    if (p.totalCorrect >= 100)  add("correct_100",  "Century Scholar");
    if (p.totalCorrect >= 1000) add("correct_1000", "Word Master");
    if (p.totalGames >= 10)     add("games_10",     "Dedicated Runner");
    if (p.level >= 5)           add("level_5",      "Decoder Unlocked");
    if (p.level >= 10)          add("level_10",     "Synthesizer Unlocked");
    if (Object.keys(p.stats.byLang).length >= 3) add("trilingual", "Trilingual");
    if (Object.keys(p.stats.byLang).length >= 6) add("polyglot",   "Polyglot");
  },

  // Dynamic difficulty: returns suggested tier based on accuracy
  getSuggestedTier(lang) {
    if (!this._p?.wordMemory?.[lang]) return 1;
    const words = Object.values(this._p.wordMemory[lang]);
    if (!words.length) return 1;
    const avgFam = words.reduce((a, b) => a + b.familiarity, 0) / words.length;
    if (avgFam > 75) return 4;
    if (avgFam > 50) return 3;
    if (avgFam > 25) return 2;
    return 1;
  },

  // Stats for chart rendering
  getWeeklyActivity() {
    if (!this._p) return [];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const sessions = (this._p.history || []).filter(h => h.date.slice(0, 10) === key);
      days.push({
        label: d.toLocaleDateString("en", { weekday: "short" }),
        xp: sessions.reduce((a, b) => a + b.xp, 0),
        games: sessions.length,
      });
    }
    return days;
  },

  getLangBreakdown() {
    if (!this._p) return [];
    return Object.entries(this._p.stats.byLang).map(([lang, s]) => ({
      lang,
      flag: WORD_DB[lang]?.flag || "🌐",
      name: WORD_DB[lang]?.name || lang,
      xp: s.xpEarned || 0,
      games: s.gamesPlayed || 0,
    }));
  },

  getModeBreakdown() {
    if (!this._p) return [];
    const modes = ["reflex", "ninja", "syntax", "dictation"];
    return modes.map(m => ({
      mode: m,
      label: m.charAt(0).toUpperCase() + m.slice(1),
      games: this._p.stats.byMode[m]?.gamesPlayed || 0,
      best:  this._p.stats.byMode[m]?.bestScore || 0,
      acc:   this._p.stats.byMode[m]?.avgAccuracy || 0,
    }));
  },
};
