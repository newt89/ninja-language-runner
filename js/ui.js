// ═══════════════════════════════════════════════════════
//  NINJA LANGUAGE RUNNER — UI Controller
// ═══════════════════════════════════════════════════════

const UI = {
  _answerCb: null,

  // ── Navigation ───────────────────────────────────────
  showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  },

  // ── Auth Screens ─────────────────────────────────────
  showAuth() { this.showScreen("screen-auth"); },

  showLogin() {
    document.getElementById("auth-title").textContent = "LOGIN";
    document.getElementById("auth-btn").textContent = "LOGIN";
    document.getElementById("auth-btn").onclick = () => this._doLogin();
    document.getElementById("auth-toggle").onclick = () => this.showRegister();
    document.getElementById("auth-toggle").textContent = "No account? Register";
    document.getElementById("auth-error").textContent = "";
  },

  showRegister() {
    document.getElementById("auth-title").textContent = "REGISTER";
    document.getElementById("auth-btn").textContent = "CREATE ACCOUNT";
    document.getElementById("auth-btn").onclick = () => this._doRegister();
    document.getElementById("auth-toggle").onclick = () => this.showLogin();
    document.getElementById("auth-toggle").textContent = "Have account? Login";
    document.getElementById("auth-error").textContent = "";
  },

  _doLogin() {
    const u = document.getElementById("auth-user").value.trim();
    const p = document.getElementById("auth-pass").value;
    if (!u || !p) { document.getElementById("auth-error").textContent = "Fill all fields"; return; }
    const r = Auth.login(u, p);
    if (!r.ok) { document.getElementById("auth-error").textContent = r.err; return; }
    Memory.load();
    this.showDashboard();
  },

  _doRegister() {
    const u = document.getElementById("auth-user").value.trim();
    const p = document.getElementById("auth-pass").value;
    if (!u || !p) { document.getElementById("auth-error").textContent = "Fill all fields"; return; }
    if (u.length < 3) { document.getElementById("auth-error").textContent = "Username too short"; return; }
    if (p.length < 4) { document.getElementById("auth-error").textContent = "Password too short (min 4)"; return; }
    const r = Auth.register(u, p);
    if (!r.ok) { document.getElementById("auth-error").textContent = r.err; return; }
    Auth.login(u, p);
    Memory.load();
    this.showDashboard();
  },

  // ── Dashboard ────────────────────────────────────────
  showDashboard() {
    const p = Memory.profile;
    if (!p) { this.showAuth(); return; }

    document.getElementById("dash-username").textContent = p.username;
    document.getElementById("dash-rank").textContent = p.rank;
    document.getElementById("dash-level").textContent = `LVL ${p.level}`;
    document.getElementById("dash-xp").textContent = `${p.xp} XP`;
    document.getElementById("dash-games").textContent = p.totalGames;
    document.getElementById("dash-correct").textContent = p.totalCorrect;
    document.getElementById("dash-streak").textContent = p.streakMax || 0;
    const acc = p.totalCorrect + p.totalWrong > 0
      ? Math.round(p.totalCorrect / (p.totalCorrect + p.totalWrong) * 100)
      : 0;
    document.getElementById("dash-acc").textContent = acc + "%";

    // Language selector
    const langSel = document.getElementById("lang-select");
    if (langSel) langSel.value = p.selectedLang || "spanish";

    this.showScreen("screen-dashboard");
    setTimeout(() => this._renderDashCharts(), 100);
  },

  _renderDashCharts() {
    const p = Memory.profile;
    if (!p) return;

    // Weekly activity
    const weekly = Memory.getWeeklyActivity();
    const wc = document.getElementById("chart-weekly");
    if (wc) {
      Charts.bar(wc, weekly.map(d => d.label), weekly.map(d => d.xp),
        { color: "#00f5c4", pad: 30 });
    }

    // Mode breakdown
    const modes = Memory.getModeBreakdown();
    const mc = document.getElementById("chart-modes");
    if (mc) {
      const colors = ["#00f5c4","#ff8800","#aa44ff","#44aaff"];
      Charts.donut(mc,
        modes.map((m, i) => ({ label: m.label, value: Math.max(m.games, 0.01), color: colors[i] })),
        { centerText: "MODES", center: "#0a0f1e" }
      );
    }

    // Skill radar
    const rc = document.getElementById("chart-radar");
    if (rc) {
      const modes2 = Memory.getModeBreakdown();
      Charts.radar(rc,
        modes2.map(m => m.label),
        modes2.map(m => m.acc || 0),
        { color: "#ff8800" }
      );
    }

    // Lang breakdown
    const langs = Memory.getLangBreakdown();
    const lc = document.getElementById("chart-langs");
    if (lc && langs.length) {
      Charts.bar(lc, langs.map(l => l.flag), langs.map(l => l.xp),
        { color: "#aa44ff", pad: 25 });
    }
  },

  // ── Mode Select ──────────────────────────────────────
  showModeSelect() {
    const langSel = document.getElementById("lang-select");
    if (langSel && Memory.profile) {
      Memory.profile.selectedLang = langSel.value;
      Memory.save();
    }
    this.showScreen("screen-modes");
  },

  // ── In-Game HUD ──────────────────────────────────────
  showGame(mode) {
    this.showScreen("screen-game");
    const modeEl = document.getElementById("hud-mode");
    if (modeEl) modeEl.textContent = mode.toUpperCase() + " MODE";

    // Show correct game panel
    ["reflex","ninja","syntax","dictation"].forEach(m => {
      const el = document.getElementById(`panel-${m}`);
      if (el) el.style.display = m === mode ? "flex" : "none";
    });

    // Focus input
    setTimeout(() => {
      const inp = document.getElementById(`input-${mode}`);
      if (inp) inp.focus();
    }, 100);
  },

  updateGameHUD(game) {
    const el = id => document.getElementById(id);
    if (el("hud-score"))  el("hud-score").textContent  = game.score;
    if (el("hud-streak")) el("hud-streak").textContent = "🔥 " + game.streak;
    if (el("hud-lives"))  el("hud-lives").textContent  = "❤️".repeat(Math.max(0, game.lives)) || "💀";
    if (el("hud-lang"))   el("hud-lang").textContent   = WORD_DB[game.lang]?.flag + " " + WORD_DB[game.lang]?.name;
  },

  updateTimer(t) {
    const el = document.getElementById("hud-timer");
    if (el) {
      el.textContent = t + "s";
      el.style.color = t < 10 ? "#ff4444" : t < 20 ? "#ff8800" : "#00f5c4";
    }
  },

  flashFeedback(correct) {
    const el = document.getElementById("feedback-flash");
    if (!el) return;
    el.textContent = correct ? "✓ CORRECT" : "✗ WRONG";
    el.style.color = correct ? "#00f5c4" : "#ff4444";
    el.style.opacity = "1";
    setTimeout(() => el.style.opacity = "0", 600);
  },

  flashLives(lives) {
    const el = document.getElementById("hud-lives");
    if (!el) return;
    el.style.transform = "scale(1.4)";
    el.style.color = "#ff4444";
    setTimeout(() => { el.style.transform = ""; el.style.color = ""; }, 300);
  },

  shakeInput() {
    const inputs = document.querySelectorAll(".answer-input");
    inputs.forEach(inp => {
      inp.classList.add("shake");
      setTimeout(() => inp.classList.remove("shake"), 400);
    });
  },

  // ── Reflex Mode ──────────────────────────────────────
  showReflexWord(word, lang) {
    const el = document.getElementById("reflex-word");
    const sub = document.getElementById("reflex-sub");
    const cat = document.getElementById("reflex-cat");
    const pinyin = document.getElementById("reflex-pinyin");
    if (!el) return;
    el.textContent = word.en;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "wordPop 0.3s ease";
    if (sub) sub.textContent = word.cat;
    if (cat) cat.textContent = word.cat.toUpperCase();
    if (pinyin) {
      pinyin.textContent = word.pinyin || word.roman || "";
      pinyin.style.display = (word.pinyin || word.roman) ? "block" : "none";
    }
    const inp = document.getElementById("input-reflex");
    if (inp) { inp.value = ""; inp.focus(); }
    // Auto-play audio
    Audio.speak(word.en, "en-US");
  },

  // ── Syntax Mode ──────────────────────────────────────
  showSyntaxPuzzle(english, shuffledWords, correctAnswer, lang, onDone) {
    const area = document.getElementById("panel-syntax");
    if (!area) return;

    const enEl = document.getElementById("syntax-english");
    const wordBankEl = document.getElementById("syntax-bank");
    const answerEl = document.getElementById("syntax-answer");
    const checkBtn = document.getElementById("syntax-check");

    if (enEl) enEl.textContent = english;
    if (wordBankEl) {
      wordBankEl.innerHTML = "";
      shuffledWords.forEach(w => {
        const tile = document.createElement("button");
        tile.className = "word-tile";
        tile.textContent = w;
        tile.onclick = () => {
          tile.classList.toggle("selected");
          this._updateSyntaxAnswer();
        };
        wordBankEl.appendChild(tile);
      });
    }
    if (answerEl) answerEl.innerHTML = "";

    const checkAnswer = () => {
      const selected = [...document.querySelectorAll(".word-tile.selected")]
        .map(t => t.textContent).join(" ");
      const correct = selected.trim() === correctAnswer.trim();
      onDone(correct);
      // Reset tiles
      document.querySelectorAll(".word-tile").forEach(t => t.classList.remove("selected"));
    };

    if (checkBtn) {
      checkBtn.onclick = checkAnswer;
    }

    // Also allow keyboard enter
    document.getElementById("input-syntax-hidden") &&
      (document.getElementById("input-syntax-hidden").onkeydown = e => {
        if (e.key === "Enter") checkAnswer();
      });
  },

  _updateSyntaxAnswer() {
    const answerEl = document.getElementById("syntax-answer");
    if (!answerEl) return;
    const selected = [...document.querySelectorAll(".word-tile.selected")]
      .map(t => t.textContent);
    answerEl.textContent = selected.join(" ") || "— tap words above —";
  },

  // ── Dictation Mode ───────────────────────────────────
  showDictationPrompt(word, lang) {
    const el = document.getElementById("dictation-prompt");
    const cat = document.getElementById("dictation-cat");
    if (el) el.textContent = "🔊 Listen and type...";
    if (cat) cat.textContent = word.cat.toUpperCase() + " • " + (WORD_DB[lang]?.name || lang);
    const inp = document.getElementById("input-dictation");
    if (inp) { inp.value = ""; inp.disabled = true; }
  },

  enableDictationInput() {
    const inp = document.getElementById("input-dictation");
    if (inp) { inp.disabled = false; inp.focus(); }
    const btn = document.getElementById("dictation-replay");
    if (btn) btn.disabled = false;
  },

  disableDictationInput() {
    const inp = document.getElementById("input-dictation");
    if (inp) inp.disabled = true;
  },

  showDictationResult(correct, answer) {
    const el = document.getElementById("dictation-result");
    if (!el) return;
    el.textContent = correct ? `✓ ${answer}` : `✗ Answer: ${answer}`;
    el.style.color = correct ? "#00f5c4" : "#ff4444";
    el.style.opacity = "1";
    setTimeout(() => el.style.opacity = "0", 1000);
  },

  // ── Answer handler ───────────────────────────────────
  onAnswer(cb) {
    this._answerCb = cb;
    ["reflex","dictation"].forEach(mode => {
      const inp = document.getElementById(`input-${mode}`);
      if (!inp) return;
      inp.onkeydown = null;
      inp.onkeydown = (e) => {
        if (e.key === "Enter" && inp.value.trim()) {
          const val = inp.value;
          inp.value = "";
          cb(val);
        }
      };
    });
  },

  // ── Results Screen ───────────────────────────────────
  showResults(score, accuracy, xp, correct, wrong, maxStreak) {
    const p = Memory.profile;
    document.getElementById("result-score").textContent   = score;
    document.getElementById("result-acc").textContent     = accuracy + "%";
    document.getElementById("result-xp").textContent      = "+" + xp + " XP";
    document.getElementById("result-correct").textContent = correct;
    document.getElementById("result-wrong").textContent   = wrong;
    document.getElementById("result-streak").textContent  = maxStreak;
    document.getElementById("result-rank").textContent    = p?.rank || "–";
    document.getElementById("result-level").textContent   = "Level " + (p?.level || 1);
    this.showScreen("screen-results");
  },

  // ── Stats / History ──────────────────────────────────
  showStats() {
    const p = Memory.profile;
    if (!p) return;

    // History table
    const tbody = document.getElementById("history-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      (p.history || []).slice(0, 20).forEach(h => {
        const tr = document.createElement("tr");
        const lang = WORD_DB[h.lang];
        tr.innerHTML = `
          <td>${new Date(h.date).toLocaleDateString()}</td>
          <td>${h.mode}</td>
          <td>${lang ? lang.flag + " " + lang.name : h.lang}</td>
          <td class="accent">${h.score}</td>
          <td>${h.accuracy}%</td>
          <td class="xp-cell">+${h.xp}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Word mastery table
    const wmTbody = document.getElementById("mastery-tbody");
    if (wmTbody && p.wordMemory) {
      wmTbody.innerHTML = "";
      Object.entries(p.wordMemory).forEach(([lang, words]) => {
        Object.entries(words).slice(0, 15).forEach(([word, data]) => {
          const tr = document.createElement("tr");
          const bar = "█".repeat(Math.round(data.familiarity / 10)) +
                      "░".repeat(10 - Math.round(data.familiarity / 10));
          const color = data.familiarity > 70 ? "#00f5c4" : data.familiarity > 40 ? "#ff8800" : "#ff4444";
          tr.innerHTML = `
            <td>${WORD_DB[lang]?.flag || "🌐"}</td>
            <td>${word}</td>
            <td><span style="color:${color};font-family:monospace;font-size:10px">${bar}</span></td>
            <td style="color:${color}">${data.familiarity}%</td>
            <td>${data.correct}/${data.correct+data.wrong}</td>
          `;
          wmTbody.appendChild(tr);
        });
      });
    }

    this.showScreen("screen-stats");
    setTimeout(() => this._renderStatsCharts(), 100);
  },

  _renderStatsCharts() {
    const weekly = Memory.getWeeklyActivity();
    const sc = document.getElementById("stats-chart-line");
    if (sc) {
      Charts.line(sc,
        weekly.map(d => d.label),
        [
          { values: weekly.map(d => d.xp),   color: "#00f5c4", label: "XP" },
          { values: weekly.map(d => d.games * 20), color: "#ff8800", label: "Games" }
        ]
      );
    }
  }
};
