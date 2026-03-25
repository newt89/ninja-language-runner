// ═══════════════════════════════════════
//  NLR — Auth & Memory System
// ═══════════════════════════════════════
const NLR_KEY = "nlr_v2";

const Auth = {
  _users(){ return JSON.parse(localStorage.getItem(NLR_KEY+"_u")||"{}"); },
  _save(u){ localStorage.setItem(NLR_KEY+"_u", JSON.stringify(u)); },
  register(name,pass){
    const users=this._users();
    if(users[name]) return{ok:false,err:"Username taken"};
    const salt=Math.random().toString(36).slice(2);
    users[name]={hash:btoa(pass+salt),salt,profile:this._blank(name)};
    this._save(users); return{ok:true};
  },
  login(name,pass){
    const users=this._users(), u=users[name];
    if(!u) return{ok:false,err:"Not found"};
    if(btoa(pass+u.salt)!==u.hash) return{ok:false,err:"Wrong password"};
    sessionStorage.setItem(NLR_KEY+"_s",name);
    return{ok:true};
  },
  logout(){ sessionStorage.removeItem(NLR_KEY+"_s"); },
  current(){ return sessionStorage.getItem(NLR_KEY+"_s"); },
  getProfile(name){ return this._users()[name]?.profile||null; },
  saveProfile(name,p){ const u=this._users(); if(u[name]) u[name].profile=p; this._save(u); },
  _blank(name){
    return{
      username:name, xp:0, level:1, rank:"Initiate",
      selectedLang:"spanish", totalGames:0, totalCorrect:0,
      totalWrong:0, streakMax:0, history:[],
      wordMemory:{}, achievements:[],
      stats:{byMode:{reflex:{},ninja:{},syntax:{},dictation:{}},byLang:{}}
    };
  }
};

const Memory = {
  _p:null,
  load(){ const u=Auth.current(); if(!u) return null; this._p=Auth.getProfile(u); return this._p; },
  save(){ const u=Auth.current(); if(u&&this._p) Auth.saveProfile(u,this._p); },
  get profile(){ return this._p; },

  recordWord(lang,word,correct,ms){
    if(!this._p) return;
    if(!this._p.wordMemory[lang]) this._p.wordMemory[lang]={};
    const wm=this._p.wordMemory[lang];
    if(!wm[word]) wm[word]={correct:0,wrong:0,avgTime:0,familiarity:0,lastSeen:0};
    const w=wm[word];
    correct ? (w.correct++, this._p.totalCorrect++) : (w.wrong++, this._p.totalWrong++);
    const n=w.correct+w.wrong;
    w.avgTime=Math.round((w.avgTime*(n-1)+ms)/n);
    w.lastSeen=Date.now();
    w.familiarity=Math.min(100,Math.round((w.correct/n)*80+(ms<2000?10:ms<4000?5:0)));
    this.save();
  },

  getWeakWords(lang,limit=8){
    if(!this._p?.wordMemory?.[lang]) return [];
    return Object.entries(this._p.wordMemory[lang])
      .sort((a,b)=>a[1].familiarity-b[1].familiarity)
      .slice(0,limit).map(([w])=>w);
  },

  getSuggestedTier(lang){
    if(!this._p?.wordMemory?.[lang]) return 1;
    const words=Object.values(this._p.wordMemory[lang]);
    if(!words.length) return 1;
    const avg=words.reduce((a,b)=>a+b.familiarity,0)/words.length;
    return avg>75?4:avg>50?3:avg>25?2:1;
  },

  recordSession(mode,lang,score,acc,xp,dur){
    if(!this._p) return;
    this._p.xp+=xp; this._p.totalGames++;
    this._p.level=Math.floor(Math.sqrt(this._p.xp/100))+1;
    this._p.rank=["Initiate","Decoder","Synthesizer","Architect","Fluent Entity"][Math.min(4,Math.floor(this._p.level/5))];
    this._p.history.unshift({date:new Date().toISOString(),mode,lang,score,accuracy:acc,xp,duration:dur});
    if(this._p.history.length>100) this._p.history.pop();
    const ms=this._p.stats.byMode[mode]||{};
    ms.gamesPlayed=(ms.gamesPlayed||0)+1;
    ms.bestScore=Math.max(ms.bestScore||0,score);
    ms.avgAccuracy=Math.round(((ms.avgAccuracy||0)*(ms.gamesPlayed-1)+acc)/ms.gamesPlayed);
    this._p.stats.byMode[mode]=ms;
    const ls=this._p.stats.byLang[lang]||{};
    ls.gamesPlayed=(ls.gamesPlayed||0)+1;
    ls.xpEarned=(ls.xpEarned||0)+xp;
    this._p.stats.byLang[lang]=ls;
    this.save();
  },

  getWeeklyActivity(){
    const days=[];
    for(let i=6;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const k=d.toISOString().slice(0,10);
      const s=(this._p?.history||[]).filter(h=>h.date.slice(0,10)===k);
      days.push({label:d.toLocaleDateString("en",{weekday:"short"}),xp:s.reduce((a,b)=>a+b.xp,0),games:s.length});
    }
    return days;
  },
  getModeBreakdown(){
    return["reflex","ninja","syntax","dictation"].map(m=>({
      mode:m,label:m[0].toUpperCase()+m.slice(1),
      games:this._p?.stats.byMode[m]?.gamesPlayed||0,
      best:this._p?.stats.byMode[m]?.bestScore||0,
      acc:this._p?.stats.byMode[m]?.avgAccuracy||0,
    }));
  },
  getLangBreakdown(){
    return Object.entries(this._p?.stats.byLang||{}).map(([lang,s])=>({
      lang,flag:WORD_DB[lang]?.flag||"🌐",name:WORD_DB[lang]?.name||lang,
      xp:s.xpEarned||0,games:s.gamesPlayed||0,
    }));
  }
};
