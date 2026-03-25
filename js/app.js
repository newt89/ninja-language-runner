// ═══════════════════════════════════════
//  NLR — App Bootstrap
// ═══════════════════════════════════════
let _currentLang="spanish", _currentMode="reflex";

window.addEventListener("DOMContentLoaded",()=>{
  Audio.init();
  buildLangGrid();
  UI.showLogin();
  const user=Auth.current();
  if(user){Memory.load();UI.showDashboard();}
  else UI.showAuth();

  ["auth-user","auth-pass"].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("auth-btn")?.click();});
  });

  const ninjaInp=document.getElementById("input-ninja");
  if(ninjaInp){
    ninjaInp.addEventListener("keydown",e=>{
      if(e.key==="Enter"&&ninjaInp.value.trim()){
        const v=ninjaInp.value.trim(); ninjaInp.value="";
        if(Game._answerCb) Game._answerCb(v);
      }
    });
  }

  window.addEventListener("resize",()=>{
    if(Game.mode==="ninja"&&Game.gameRunning){
      const c=document.getElementById("ninja-canvas");
      if(c){const dpr=window.devicePixelRatio||1;c.width=Math.round(c.offsetWidth*dpr);c.height=Math.round(c.offsetHeight*dpr);}
    }
  });
});

function buildLangGrid(){
  const grid=document.getElementById("lang-grid"); if(!grid) return;
  grid.innerHTML="";
  Object.entries(WORD_DB).forEach(([code,lang])=>{
    const btn=document.createElement("button");
    btn.className="lang-btn"; btn.dataset.lang=code;
    btn.innerHTML=`<span>${lang.flag}</span><span>${lang.name}</span>`;
    btn.onclick=()=>selectLang(code);
    grid.appendChild(btn);
  });
  selectLang(Memory.profile?.selectedLang||"spanish",false);
}

function selectLang(code,save=true){
  _currentLang=code;
  document.querySelectorAll(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===code));
  const fl=document.getElementById("dash-lang-flag"); if(fl) fl.textContent=WORD_DB[code]?.flag||"🌐";
  if(save&&Memory.profile){Memory.profile.selectedLang=code;Memory.save();}
}

function startGame(mode){
  _currentMode=mode; _currentLang=Memory.profile?.selectedLang||"spanish";
  const el=document.getElementById("mode-lang-display"),lang=WORD_DB[_currentLang];
  if(el&&lang) el.textContent=lang.flag+" "+lang.name;
  Game.start(mode,_currentLang);
}

function restartSameMode(){ Game.start(_currentMode,_currentLang); }

// Override Game.stop
Game.stop=function(){
  this.gameRunning=false;
  clearInterval(this.timer); clearInterval(this.gameTimer); cancelAnimationFrame(this.animFrame);
  const dur=Math.round((Date.now()-this.startTime)/1000);
  const tot=this.correct+this.wrong, acc=tot>0?Math.round(this.correct/tot*100):0;
  const xp=this.score+this.streak*5;
  Memory.recordSession(this.mode,this.lang,this.score,acc,xp,dur);
  Audio.beep("levelup");
  UI.showResults(this.score,acc,xp,this.correct,this.wrong,this.maxStreak);
};

// Dashboard with lang grid rebuild
const _origDash=UI.showDashboard.bind(UI);
UI.showDashboard=function(){_origDash();buildLangGrid();};

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&Game.gameRunning){if(confirm("Quit?"))Game.stop();}
});
window.onerror=(m,s,l,c,err)=>console.error("NLR:",m,s,l,err);
