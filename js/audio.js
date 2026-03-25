// ═══════════════════════════════════════
//  NLR — Audio Engine
// ═══════════════════════════════════════
const Audio = {
  _on:true, _voices:[], _ready:false,
  init(){
    if(!window.speechSynthesis) return;
    const load=()=>{ this._voices=window.speechSynthesis.getVoices(); this._ready=this._voices.length>0; };
    load(); window.speechSynthesis.onvoiceschanged=load;
  },
  toggle(){ this._on=!this._on; return this._on; },
  isEnabled(){ return this._on; },
  speak(text,lang,rate=0.85){
    if(!this._on||!this._ready||!text) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=LANG_CODES[lang]||"en-US"; u.rate=rate; u.pitch=1; u.volume=0.9;
    const m=this._voices.find(v=>v.lang.startsWith(u.lang.slice(0,2)));
    if(m) u.voice=m;
    window.speechSynthesis.speak(u);
  },
  speakAndWait(text,lang){
    return new Promise(res=>{
      if(!this._on||!this._ready){res();return;}
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang=LANG_CODES[lang]||"en-US"; u.rate=0.75;
      u.onend=res; u.onerror=res;
      const m=this._voices.find(v=>v.lang.startsWith(u.lang.slice(0,2)));
      if(m) u.voice=m;
      window.speechSynthesis.speak(u);
    });
  },
  beep(type="correct"){
    if(!this._on) return;
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      const t=ctx.currentTime;
      if(type==="correct"){
        o.frequency.setValueAtTime(523,t); o.frequency.setValueAtTime(659,t+.1); o.frequency.setValueAtTime(784,t+.2);
        g.gain.setValueAtTime(.3,t); g.gain.exponentialRampToValueAtTime(.001,t+.4);
        o.start(t); o.stop(t+.4);
      } else if(type==="wrong"){
        o.type="sawtooth"; o.frequency.setValueAtTime(200,t); o.frequency.setValueAtTime(140,t+.15);
        g.gain.setValueAtTime(.3,t); g.gain.exponentialRampToValueAtTime(.001,t+.3);
        o.start(t); o.stop(t+.3);
      } else if(type==="levelup"){
        [392,523,659,784,1046].forEach((f,i)=>{
          const o2=ctx.createOscillator(),g2=ctx.createGain();
          o2.connect(g2);g2.connect(ctx.destination);
          o2.frequency.value=f;
          g2.gain.setValueAtTime(.2,t+i*.1);g2.gain.exponentialRampToValueAtTime(.001,t+i*.1+.2);
          o2.start(t+i*.1);o2.stop(t+i*.1+.2);
        });
      } else if(type==="boss"){
        o.type="square"; o.frequency.setValueAtTime(100,t); o.frequency.exponentialRampToValueAtTime(400,t+.5);
        g.gain.setValueAtTime(.4,t); g.gain.exponentialRampToValueAtTime(.001,t+.6);
        o.start(t); o.stop(t+.6);
      } else if(type==="tick"){
        o.frequency.value=800;
        g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.05);
        o.start(t); o.stop(t+.05);
      }
    }catch(e){}
  }
};
