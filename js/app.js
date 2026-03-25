// ═══════════════════════════════════════════════════════
//  NINJA LANGUAGE RUNNER — App Bootstrap
// ═══════════════════════════════════════════════════════

let _currentLang = "spanish";
let _currentMode = "reflex";

// ── Boot ─────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  Audio.init();

  // Build language button grid
  buildLangGrid();

  // Set up auth flow
  UI.showLogin();

  // Check if already logged in
  const user = Auth.current();
  if (user) {
    Memory.load();
    UI.showDashboard();
  } else {
    UI.showAuth();
  }

  // Enter key on auth inputs
  ["auth-user","auth-pass"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("keydown", e => {
      if (e.key === "Enter") document.getElementById("auth-btn")?.click();
    });
  });

  // Ninja input - needs special handling (answer from canvas input)
  const ninjaInp = document.getElementById("input-ninja");
  if (ninjaInp) {
    ninjaInp.addEventListener("keydown", e => {
      if (e.key === "Enter" && ninjaInp.value.trim()) {
        const val = ninjaInp.value.trim();
        ninjaInp.value = "";
        if (Game._answerCb) Game._answerCb(val);
      }
    });
    // For ninja mode wire up directly in game
    Game._ninjaInput = ninjaInp;
  }

  // Canvas resize on window resize
  window.addEventListener("resize", () => {
    const canvas = document.getElementById("ninja-canvas");
    if (canvas && Game.mode === "ninja" && Game.gameRunning) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  });
});

// ── Language grid ─────────────────────────────────────
function buildLangGrid() {
  const grid = document.getElementById("lang-grid");
  if (!grid) return;
  grid.innerHTML = "";
  Object.entries(WORD_DB).forEach(([code, lang]) => {
    const btn = document.createElement("button");
    btn.className = "lang-btn";
    btn.dataset.lang = code;
    btn.innerHTML = `<span>${lang.flag}</span><span>${lang.name}</span>`;
    btn.onclick = () => selectLang(code);
    grid.appendChild(btn);
  });
  // Activate current
  selectLang(Memory.profile?.selectedLang || "spanish", false);
}

function selectLang(code, save = true) {
  _currentLang = code;
  document.querySelectorAll(".lang-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === code);
  });
  // Update flag in header
  const flagEl = document.getElementById("dash-lang-flag");
  if (flagEl) flagEl.textContent = WORD_DB[code]?.flag || "🌐";

  if (save && Memory.profile) {
    Memory.profile.selectedLang = code;
    Memory.save();
  }
}

// ── Game helpers ──────────────────────────────────────
function startGame(mode) {
  _currentMode = mode;
  _currentLang = Memory.profile?.selectedLang || "spanish";

  // Update mode screen lang display
  const el = document.getElementById("mode-lang-display");
  if (el) {
    const lang = WORD_DB[_currentLang];
    el.textContent = lang ? `${lang.flag} ${lang.name}` : _currentLang;
  }

  Game.start(mode, _currentLang);
}

function restartSameMode() {
  Game.start(_currentMode, _currentLang);
}

// ── Stats screen extra rendering ─────────────────────
const _origShowStats = UI.showStats.bind(UI);
UI.showStats = function() {
  _origShowStats();

  // Mode stats table
  const tbody = document.getElementById("mode-stats-tbody");
  if (tbody) {
    tbody.innerHTML = "";
    Memory.getModeBreakdown().forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-transform:uppercase;color:var(--accent2)">${m.mode}</td>
        <td>${m.games}</td>
        <td class="accent">${m.best}</td>
        <td>${m.acc}%</td>
      `;
      tbody.appendChild(tr);
    });
  }
};

// ── Dashboard XP bar update ───────────────────────────
const _origShowDash = UI.showDashboard.bind(UI);
UI.showDashboard = function() {
  _origShowDash();
  buildLangGrid();

  // XP bar fill
  const p = Memory.profile;
  if (p) {
    const bar = document.getElementById("xp-bar");
    if (bar) {
      const levelXp = (p.level - 1) ** 2 * 100;
      const nextXp  = p.level ** 2 * 100;
      const pct = Math.min(100, ((p.xp - levelXp) / Math.max(nextXp - levelXp, 1)) * 100);
      setTimeout(() => { bar.style.width = pct + "%"; }, 200);
    }
  }
};

// ── Global keyboard shortcuts ─────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && Game.gameRunning) {
    if (confirm("Quit current game?")) Game.stop();
  }
});

// ── Game.stop override to show results ────────────────
const _origStop = Game.stop.bind(Game);
Game.stop = function(win) {
  const duration = Math.round((Date.now() - this.startTime) / 1000);
  const accuracy = this.correct + this.wrong > 0
    ? Math.round((this.correct / (this.correct + this.wrong)) * 100)
    : 0;
  const xpEarned = this.score + this.streak * 5;

  this.gameRunning = false;
  clearInterval(this.timer);
  clearInterval(this.gameTimer);
  cancelAnimationFrame(this.animFrame);

  Memory.recordSession(this.mode, this.lang, this.score, accuracy, xpEarned, duration);
  Audio.beep("levelup");
  UI.showResults(this.score, accuracy, xpEarned, this.correct, this.wrong, this.maxStreak);
};

// ── Error guard ───────────────────────────────────────
window.onerror = (msg, src, line, col, err) => {
  console.error("NLR Error:", msg, src, line, err);
};
