// ═══════════════════════════════════════════════════════
//  NINJA LANGUAGE RUNNER — Game Engine (All 4 Modes)
// ═══════════════════════════════════════════════════════

const Game = {
  mode: null,
  lang: null,
  score: 0,
  streak: 0,
  maxStreak: 0,
  lives: 3,
  level: 1,
  xp: 0,
  startTime: null,
  wordQueue: [],
  currentWord: null,
  timer: null,
  gameTimer: null,
  gameRunning: false,
  correct: 0,
  wrong: 0,
  wordStartTime: null,
  enemies: [],        // for ninja mode
  animFrame: null,

  // ── Start a game ─────────────────────────────────────
  start(mode, lang) {
    this.mode = mode;
    this.lang = lang;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lives = mode === "dictation" ? 5 : 3;
    this.correct = 0;
    this.wrong = 0;
    this.gameRunning = true;
    this.startTime = Date.now();
    this.enemies = [];

    // Build word queue from player memory (prioritize weak words)
    const weakWords = Memory.getWeakWords(lang, 5);
    const tier = Memory.getSuggestedTier(lang);
    const tierWords = getWordsByTier(lang, Math.max(1, tier));
    const allWords = getAllWords(lang);

    // Shuffle and weight toward weak words
    let pool = [...tierWords, ...tierWords]; // double tier words
    weakWords.forEach(w => {
      const found = allWords.find(x => x.en === w || x.tr === w);
      if (found) pool.unshift(found, found, found); // triple weak words
    });
    pool = this._shuffle(pool);
    this.wordQueue = pool;

    UI.showGame(mode);
    this._modeInit[mode]?.call(this);
  },

  stop(win = false) {
    this.gameRunning = false;
    clearInterval(this.timer);
    clearInterval(this.gameTimer);
    cancelAnimationFrame(this.animFrame);

    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const accuracy = this.correct + this.wrong > 0
      ? Math.round((this.correct / (this.correct + this.wrong)) * 100)
      : 0;
    const xpEarned = this.score + this.streak * 5;

    Memory.recordSession(this.mode, this.lang, this.score, accuracy, xpEarned, duration);
    Audio.beep("levelup");
    UI.showResults(this.score, accuracy, xpEarned, this.correct, this.wrong, this.maxStreak);
  },

  nextWord() {
    if (!this.wordQueue.length) this.wordQueue = this._shuffle(getAllWords(this.lang));
    this.currentWord = this.wordQueue.shift();
    this.wordStartTime = Date.now();
    return this.currentWord;
  },

  checkAnswer(input) {
    if (!this.currentWord) return false;
    const timeMs = Date.now() - this.wordStartTime;
    const answer = input.trim().toLowerCase();
    const correct = this.currentWord.tr.toLowerCase();
    const isCorrect = answer === correct ||
      this._normalize(answer) === this._normalize(correct);

    Memory.recordWord(this.lang, this.currentWord.en, isCorrect, timeMs);

    if (isCorrect) {
      this.correct++;
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      this.score += 10 + (this.streak > 3 ? this.streak * 2 : 0);
      Audio.beep("correct");
      Audio.speak(this.currentWord.tr, this.lang);
      return true;
    } else {
      this.wrong++;
      this.streak = 0;
      this.lives--;
      Audio.beep("wrong");
      return false;
    }
  },

  _normalize(s) {
    return s.replace(/[^\w\u0080-\uFFFF]/g, "").toLowerCase();
  },
  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // ── Mode initializers ────────────────────────────────
  _modeInit: {

    // ── REFLEX MODE ─────────────────────────────────────
    reflex() {
      let timeLeft = 60;
      UI.updateGameHUD(this);
      const w = this.nextWord();
      UI.showReflexWord(w, this.lang);

      this.gameTimer = setInterval(() => {
        timeLeft--;
        UI.updateTimer(timeLeft);
        Audio.beep("tick");
        if (timeLeft <= 0) this.stop();
      }, 1000);

      UI.onAnswer((input) => {
        if (!this.gameRunning) return;
        const ok = this.checkAnswer(input);
        UI.flashFeedback(ok);
        UI.updateGameHUD(this);
        if (this.lives <= 0) { this.stop(); return; }
        const w = this.nextWord();
        UI.showReflexWord(w, this.lang);
      });
    },

    // ── NINJA (Word Fall) MODE ──────────────────────────
    ninja() {
      const canvas = document.getElementById("ninja-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      let spawnTimer = 0;
      let spawnRate = 120; // frames between spawns
      let frameCount = 0;
      const ENEMY_COLORS = ["#ff4444","#ff8800","#ffdd00","#44aaff","#aa44ff"];

      const spawnEnemy = () => {
        const w = this.nextWord();
        this.enemies.push({
          word: w,
          x: 60 + Math.random() * (canvas.width - 120),
          y: -30,
          speed: 0.5 + this.score / 500,
          color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
          size: 28 + w.en.length,
          wobble: Math.random() * Math.PI * 2,
          hit: false,
          hitAnim: 0,
        });
      };

      const loop = () => {
        if (!this.gameRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        frameCount++;
        spawnTimer++;
        if (spawnTimer >= spawnRate) {
          spawnEnemy();
          spawnTimer = 0;
          spawnRate = Math.max(40, spawnRate - 1);
        }

        // Draw enemies
        this.enemies = this.enemies.filter(e => e.y < canvas.height + 60);
        this.enemies.forEach(e => {
          if (!e.hit) {
            e.y += e.speed;
            e.wobble += 0.02;
          } else {
            e.hitAnim++;
          }

          // Enemy body (blob)
          const wobX = Math.sin(e.wobble) * 4;
          ctx.save();
          ctx.translate(e.x + wobX, e.y);

          if (e.hit) {
            ctx.globalAlpha = 1 - e.hitAnim / 20;
            ctx.scale(1 + e.hitAnim * 0.1, 1 + e.hitAnim * 0.1);
          }

          // Glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = e.color;

          // Blob shape
          ctx.beginPath();
          ctx.ellipse(0, 0, e.size, e.size * 0.85, 0, 0, Math.PI * 2);
          ctx.fillStyle = e.color + "33";
          ctx.fill();
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Word text
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold 14px 'Courier New'`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(e.word.en, 0, -6);
          ctx.fillStyle = e.color;
          ctx.font = "11px 'Courier New'";
          ctx.fillText(e.word.cat, 0, 10);
          ctx.restore();

          // Reached bottom
          if (!e.hit && e.y > canvas.height - 20) {
            this.lives--;
            this.streak = 0;
            e.hit = true;
            Audio.beep("wrong");
            UI.flashLives(this.lives);
            UI.updateGameHUD(this);
            if (this.lives <= 0) { this.stop(); return; }
          }

          // Remove hit enemies
          if (e.hit && e.hitAnim > 20) e._remove = true;
        });
        this.enemies = this.enemies.filter(e => !e._remove);

        UI.updateGameHUD(this);
        this.animFrame = requestAnimationFrame(loop);
      };

      spawnEnemy();
      this.animFrame = requestAnimationFrame(loop);

      UI.onAnswer((input) => {
        if (!this.gameRunning) return;
        const answer = input.trim().toLowerCase();
        const idx = this.enemies.findIndex(e =>
          !e.hit && (e.word.tr.toLowerCase() === answer ||
          this._normalize(e.word.tr) === this._normalize(answer))
        );
        if (idx !== -1) {
          const enemy = this.enemies[idx];
          const timeMs = Date.now() - this.wordStartTime;
          Memory.recordWord(this.lang, enemy.word.en, true, timeMs || 2000);
          enemy.hit = true;
          this.correct++;
          this.streak++;
          this.maxStreak = Math.max(this.maxStreak, this.streak);
          this.score += 10 + (this.streak > 3 ? this.streak * 2 : 0);
          Audio.beep("correct");
          Audio.speak(enemy.word.tr, this.lang);
        } else {
          this.wrong++;
          this.streak = 0;
          Audio.beep("wrong");
          UI.shakeInput();
        }
        UI.updateGameHUD(this);
      });
    },

    // ── SYNTAX (Sentence Building) MODE ─────────────────
    syntax() {
      const sentences = WORD_DB[this.lang]?.sentences || [];
      if (!sentences.length) { alert("No sentences for this language yet."); return; }
      let idx = 0;

      const showSentence = () => {
        if (idx >= sentences.length) { this.stop(); return; }
        const s = sentences[idx % sentences.length];
        const words = s.tr.split(" ");
        const shuffled = this._shuffle([...words]);
        UI.showSyntaxPuzzle(s.en, shuffled, s.tr, this.lang, (correct) => {
          if (correct) {
            this.correct++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            this.score += 20;
            Audio.beep("correct");
            Audio.speak(s.tr, this.lang);
          } else {
            this.wrong++;
            this.streak = 0;
            this.lives--;
            Audio.beep("wrong");
          }
          UI.updateGameHUD(this);
          if (this.lives <= 0) { this.stop(); return; }
          idx++;
          setTimeout(showSentence, 800);
        });
      };

      UI.updateGameHUD(this);
      showSentence();
    },

    // ── DICTATION MODE ──────────────────────────────────
    async dictation() {
      UI.updateGameHUD(this);
      const runRound = async () => {
        if (!this.gameRunning || this.lives <= 0) { this.stop(); return; }
        const w = this.nextWord();
        UI.showDictationPrompt(w, this.lang);
        await Audio.speakAndWait(w.tr, this.lang);
        UI.enableDictationInput();

        UI.onAnswer(async (input) => {
          if (!this.gameRunning) return;
          UI.disableDictationInput();
          const ok = this.checkAnswer(input);
          UI.showDictationResult(ok, w.tr);
          UI.flashFeedback(ok);
          UI.updateGameHUD(this);
          if (this.lives <= 0) { this.stop(); return; }
          await new Promise(r => setTimeout(r, 1200));
          runRound();
        });
      };
      runRound();
    }
  }
};
