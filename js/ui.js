// ═══════════════════════════════════════
//  NLR — UI Controller
// ═══════════════════════════════════════
const UI={
  showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));const el=document.getElementById(id);if(el)el.classList.add("active");},
  showAuth(){this.showScreen("screen-auth");},
  showLogin(){
    document.getElementById("auth-title").textContent="LOGIN";
    document.getElementById("auth-btn").textContent="LOGIN";
    document.getElementById("auth-btn").onclick=()=>this._doLogin();
    document.getElementById("auth-toggle").onclick=()=>this.showRegister();
    document.getElementById("auth-toggle").textContent="No account? Register";
    document.getElementById("auth-error").textContent="";
  },
  showRegister(){
    document.getElementById("auth-title").textContent="REGISTER";
    document.getElementById("auth-btn").textContent="CREATE ACCOUNT";
    document.getElementById("auth-btn").onclick=()=>this._doRegister();
    document.getElementById("auth-toggle").onclick=()=>this.showLogin();
    document.getElementById("auth-toggle").textContent="Have account? Login";
    document.getElementById("auth-error").textContent="";
  },
  _doLogin(){
    const u=document.getElementById("auth-user").value.trim(),p=document.getElementById("auth-pass").value;
    if(!u||!p){document.getElementById("auth-error").textContent="Fill all fields";return;}
    const r=Auth.login(u,p);
    if(!r.ok){document.getElementById("auth-error").textContent=r.err;return;}
    Memory.load(); this.showDashboard();
  },
  _doRegister(){
    const u=document.getElementById("auth-user").value.trim(),p=document.getElementById("auth-pass").value;
    if(!u||!p){document.getElementById("auth-error").textContent="Fill all fields";return;}
    if(u.length<3){document.getElementById("auth-error").textContent="Username min 3 chars";return;}
    if(p.length<4){document.getElementById("auth-error").textContent="Password min 4 chars";return;}
    const r=Auth.register(u,p);
    if(!r.ok){document.getElementById("auth-error").textContent=r.err;return;}
    Auth.login(u,p); Memory.load(); this.showDashboard();
  },

  showDashboard(){
    const p=Memory.profile; if(!p){this.showAuth();return;}
    document.getElementById("dash-username").textContent=p.username;
    document.getElementById("dash-rank").textContent=p.rank;
    document.getElementById("dash-level").textContent="LVL "+p.level;
    document.getElementById("dash-xp").textContent=p.xp+" XP";
    document.getElementById("dash-games").textContent=p.totalGames;
    document.getElementById("dash-correct").textContent=p.totalCorrect;
    document.getElementById("dash-streak").textContent=p.streakMax||0;
    const acc=p.totalCorrect+p.totalWrong>0?Math.round(p.totalCorrect/(p.totalCorrect+p.totalWrong)*100):0;
    document.getElementById("dash-acc").textContent=acc+"%";
    const levelXp=(p.level-1)**2*100,nextXp=p.level**2*100;
    const pct=Math.min(100,((p.xp-levelXp)/Math.max(nextXp-levelXp,1))*100);
    setTimeout(()=>{const b=document.getElementById("xp-bar");if(b)b.style.width=pct+"%";},200);
    this.showScreen("screen-dashboard");
    setTimeout(()=>this._renderDashCharts(),150);
  },
  _renderDashCharts(){
    const weekly=Memory.getWeeklyActivity();
    const wc=document.getElementById("chart-weekly");
    if(wc) Charts.bar(wc,weekly.map(d=>d.label),weekly.map(d=>d.xp),{color:"#00f5c4",pad:32});
    const modes=Memory.getModeBreakdown();
    const mc=document.getElementById("chart-modes");
    if(mc) Charts.donut(mc,modes.map((m,i)=>({label:m.label.slice(0,3),value:Math.max(m.games,.01),color:["#00f5c4","#ff4444","#ff8800","#aa44ff"][i]})),{centerText:"MODES",center:"#0a0f1e"});
    const rc=document.getElementById("chart-radar");
    if(rc) Charts.radar(rc,modes.map(m=>m.label.slice(0,3)),modes.map(m=>m.acc||0),{color:"#ff8800"});
    const langs=Memory.getLangBreakdown();
    const lc=document.getElementById("chart-langs");
    if(lc&&langs.length) Charts.bar(lc,langs.map(l=>l.flag),langs.map(l=>l.xp),{color:"#aa44ff",pad:28});
  },

  showModeSelect(){
    const p=Memory.profile; if(!p) return;
    const lang=WORD_DB[p.selectedLang];
    const el=document.getElementById("mode-lang-display");
    if(el&&lang) el.textContent=lang.flag+" "+lang.name;
    this.showScreen("screen-modes");
  },

  showGame(mode){
    this.showScreen("screen-game");
    const me=document.getElementById("hud-mode"); if(me) me.textContent=mode.toUpperCase()+" MODE";
    ["reflex","ninja","syntax","dictation"].forEach(m=>{
      const el=document.getElementById("panel-"+m); if(el) el.style.display=m===mode?"flex":"none";
    });
    setTimeout(()=>{const inp=document.getElementById("input-"+mode);if(inp)inp.focus();},100);
  },

  updateGameHUD(game){
    const el=id=>document.getElementById(id);
    if(el("hud-score")) el("hud-score").textContent=game.score;
    if(el("hud-streak")) el("hud-streak").textContent="🔥 "+game.streak;
    if(el("hud-lives")) el("hud-lives").textContent="❤️".repeat(Math.max(0,game.lives))||"💀";
    if(el("hud-lang")) el("hud-lang").textContent=(WORD_DB[game.lang]?.flag||"")+" "+(WORD_DB[game.lang]?.name||"");
    const bp=el("biome-progress-fill");
    if(bp) bp.style.width=(game.biomeProgress||0)+"%";
  },
  updateTimer(t){
    const el=document.getElementById("hud-timer"); if(!el) return;
    el.textContent=t+"s"; el.style.color=t<10?"#ff4444":t<20?"#ff8800":"#00f5c4";
  },
  showBiomeTransition(name,level){
    const ov=document.getElementById("biome-transition"); if(!ov) return;
    document.getElementById("biome-name").textContent=name;
    document.getElementById("biome-sublabel").textContent="PROC LEVEL "+level+" — DIFFICULTY SCALING UP";
    ov.style.display="flex";
    setTimeout(()=>ov.style.display="none",2400);
  },
  flashFeedback(ok){
    const el=document.getElementById("feedback-flash"); if(!el) return;
    el.textContent=ok?"✓ CORRECT":"✗ WRONG"; el.style.color=ok?"#00f5c4":"#ff4444";
    el.style.opacity="1"; setTimeout(()=>el.style.opacity="0",600);
  },
  flashLives(lives){
    const el=document.getElementById("hud-lives"); if(!el) return;
    el.style.transform="scale(1.4)"; el.style.color="#ff4444";
    setTimeout(()=>{el.style.transform="";el.style.color="";},300);
  },
  shakeInput(){
    document.querySelectorAll(".answer-input").forEach(inp=>{inp.classList.add("shake");setTimeout(()=>inp.classList.remove("shake"),400);});
  },
  showReflexWord(word,lang){
    const el=document.getElementById("reflex-word"); if(!el) return;
    el.textContent=word.en; el.style.animation="none"; void el.offsetWidth; el.style.animation="wordPop .3s ease";
    const cat=document.getElementById("reflex-cat"); if(cat) cat.textContent=word.cat.toUpperCase();
    const pinyin=document.getElementById("reflex-pinyin");
    if(pinyin){pinyin.textContent=word.pinyin||word.roman||"";pinyin.style.display=(word.pinyin||word.roman)?"block":"none";}
    const inp=document.getElementById("input-reflex"); if(inp){inp.value="";inp.focus();}
    Audio.speak(word.en,"en-US");
  },
  showSyntaxPuzzle(english,shuffled,correct,lang,onDone){
    const enEl=document.getElementById("syntax-english"),bankEl=document.getElementById("syntax-bank"),answerEl=document.getElementById("syntax-answer"),checkBtn=document.getElementById("syntax-check");
    if(enEl) enEl.textContent=english;
    if(bankEl){bankEl.innerHTML="";shuffled.forEach(w=>{const t=document.createElement("button");t.className="word-tile";t.textContent=w;t.onclick=()=>{t.classList.toggle("selected");this._updateSyntaxAnswer();};bankEl.appendChild(t);});}
    if(answerEl) answerEl.textContent="— tap words above —";
    if(checkBtn) checkBtn.onclick=()=>{
      const sel=[...document.querySelectorAll(".word-tile.selected")].map(t=>t.textContent).join(" ");
      onDone(sel.trim()===correct.trim());
      document.querySelectorAll(".word-tile").forEach(t=>t.classList.remove("selected"));
    };
  },
  _updateSyntaxAnswer(){
    const el=document.getElementById("syntax-answer"); if(!el) return;
    el.textContent=[...document.querySelectorAll(".word-tile.selected")].map(t=>t.textContent).join(" ")||"— tap words above —";
  },
  showDictationPrompt(word,lang){
    const el=document.getElementById("dictation-prompt"),cat=document.getElementById("dictation-cat");
    if(el) el.textContent="🔊 Listen carefully...";
    if(cat) cat.textContent=word.cat.toUpperCase()+" · "+(WORD_DB[lang]?.name||lang);
    const inp=document.getElementById("input-dictation"); if(inp){inp.value="";inp.disabled=true;}
  },
  enableDictationInput(){const inp=document.getElementById("input-dictation");if(inp){inp.disabled=false;inp.focus();}},
  disableDictationInput(){const inp=document.getElementById("input-dictation");if(inp)inp.disabled=true;},
  showDictationResult(ok,ans){
    const el=document.getElementById("dictation-result"); if(!el) return;
    el.textContent=ok?"✓ "+ans:"✗ Answer: "+ans; el.style.color=ok?"#00f5c4":"#ff4444";
    el.style.opacity="1"; setTimeout(()=>el.style.opacity="0",1100);
  },
  onAnswer(cb){
    ["reflex","dictation"].forEach(mode=>{
      const inp=document.getElementById("input-"+mode); if(!inp) return;
      inp.onkeydown=null;
      inp.onkeydown=e=>{if(e.key==="Enter"&&inp.value.trim()){const v=inp.value;inp.value="";cb(v);}};
    });
    Game._answerCb=cb;
  },
  showResults(score,acc,xp,correct,wrong,streak){
    const p=Memory.profile;
    document.getElementById("result-score").textContent=score;
    document.getElementById("result-acc").textContent=acc+"%";
    document.getElementById("result-xp").textContent="+"+xp+" XP";
    document.getElementById("result-correct").textContent=correct;
    document.getElementById("result-wrong").textContent=wrong;
    document.getElementById("result-streak").textContent=streak;
    document.getElementById("result-rank").textContent=p?.rank||"–";
    document.getElementById("result-level").textContent="Level "+(p?.level||1);
    this.showScreen("screen-results");
  },
  showStats(){
    const p=Memory.profile; if(!p) return;
    const tbody=document.getElementById("history-tbody");
    if(tbody){tbody.innerHTML="";(p.history||[]).slice(0,20).forEach(h=>{const lang=WORD_DB[h.lang];const tr=document.createElement("tr");tr.innerHTML=`<td>${new Date(h.date).toLocaleDateString()}</td><td>${h.mode}</td><td>${lang?lang.flag+" "+lang.name:h.lang}</td><td class="accent">${h.score}</td><td>${h.accuracy}%</td><td class="xp-cell">+${h.xp}</td>`;tbody.appendChild(tr);});}
    const wmTbody=document.getElementById("mastery-tbody");
    if(wmTbody&&p.wordMemory){wmTbody.innerHTML="";Object.entries(p.wordMemory).forEach(([lang,words])=>{Object.entries(words).slice(0,12).forEach(([word,data])=>{const tr2=document.createElement("tr");const bar="█".repeat(Math.round(data.familiarity/10))+"░".repeat(10-Math.round(data.familiarity/10));const color=data.familiarity>70?"#00f5c4":data.familiarity>40?"#ff8800":"#ff4444";tr2.innerHTML=`<td>${WORD_DB[lang]?.flag||"🌐"}</td><td>${word}</td><td><span style="color:${color};font-family:monospace;font-size:9px">${bar}</span></td><td style="color:${color}">${data.familiarity}%</td><td>${data.correct}/${data.correct+data.wrong}</td>`;wmTbody.appendChild(tr2);});});}
    const mTbody=document.getElementById("mode-stats-tbody");
    if(mTbody){mTbody.innerHTML="";Memory.getModeBreakdown().forEach(m=>{const tr3=document.createElement("tr");tr3.innerHTML=`<td style="text-transform:uppercase;color:var(--accent2)">${m.mode}</td><td>${m.games}</td><td class="accent">${m.best}</td><td>${m.acc}%</td>`;mTbody.appendChild(tr3);});}
    this.showScreen("screen-stats");
    setTimeout(()=>{const sc=document.getElementById("stats-chart-line");const w=Memory.getWeeklyActivity();if(sc)Charts.line(sc,w.map(d=>d.label),[{values:w.map(d=>d.xp),color:"#00f5c4"},{values:w.map(d=>d.games*20),color:"#ff8800"}]);},150);
  }
};
