// ═══════════════════════════════════════════════════════════════
//  NLR — Isometric Game Engine
//  Top-down isometric view, 5 enemy types, 4 biomes, infinite levels
// ═══════════════════════════════════════════════════════════════

// ── Isometric helpers ────────────────────────────────────────
const ISO = {
  // Convert grid (col,row) → screen (sx,sy)
  toScreen(col, row, tileW, tileH, originX, originY) {
    return {
      x: originX + (col - row) * (tileW / 2),
      y: originY + (col + row) * (tileH / 2),
    };
  },
  // Z-depth for painter's sort
  depth(col, row) { return col + row; },
};

// ── Biome configs ─────────────────────────────────────────────
const BIOMES = {
  forest: {
    name:"LEXICON JUNGLE", color:"#00cc44",
    floorBase:"#0d2a0d", floorTop:"#1a4a1a", floorEdgeL:"#0a1f0a", floorEdgeR:"#122a12",
    wallColor:"#1e5a1e", accentColor:"#00ff44",
    fogRGB:"0,20,0", skyTop:"#020c02", skyBot:"#051505",
    enemyTypes:["slime"], minEnemies:2, maxEnemies:4,
    decorFn: "drawForestDecor",
  },
  factory: {
    name:"SYNTAX CONVEYOR", color:"#ff8800",
    floorBase:"#2a1a00", floorTop:"#3a2500", floorEdgeL:"#1a1000", floorEdgeR:"#251800",
    wallColor:"#5a3a00", accentColor:"#ffaa00",
    fogRGB:"30,15,0", skyTop:"#080400", skyBot:"#120900",
    enemyTypes:["slime","twin","knight"], minEnemies:3, maxEnemies:5,
    decorFn: "drawFactoryDecor",
  },
  caverns: {
    name:"ECHO CANYON", color:"#4488ff",
    floorBase:"#001830", floorTop:"#00224a", floorEdgeL:"#000d1a", floorEdgeR:"#001228",
    wallColor:"#003060", accentColor:"#44aaff",
    fogRGB:"0,8,30", skyTop:"#000408", skyBot:"#00060f",
    enemyTypes:["slime","wraith","knight"], minEnemies:3, maxEnemies:6,
    decorFn: "drawCavernDecor",
  },
  glitch: {
    name:"GLITCH REALM", color:"#aa44ff",
    floorBase:"#180020", floorTop:"#220030", floorEdgeL:"#0f0015", floorEdgeR:"#180020",
    wallColor:"#440060", accentColor:"#ff44ff",
    fogRGB:"20,0,30", skyTop:"#050008", skyBot:"#09000f",
    enemyTypes:["slime","twin","knight","wraith","chimera"], minEnemies:4, maxEnemies:8,
    decorFn: "drawGlitchDecor",
  },
};
const BIOME_ORDER = ["forest","factory","caverns","glitch"];

// ── Character stages ──────────────────────────────────────────
const CHAR_STAGES = [
  {name:"INITIATE",   minLvl:1,  bodyColor:"#aabbcc", glowColor:"#8899aa", auraSize:18},
  {name:"DECODER",    minLvl:5,  bodyColor:"#44aaff", glowColor:"#2266cc", auraSize:24},
  {name:"SYNTHESIZER",minLvl:10, bodyColor:"#00f5c4", glowColor:"#00aa88", auraSize:30},
  {name:"FLUENT",     minLvl:20, bodyColor:"#ff8800", glowColor:"#cc5500", auraSize:38},
];

// ── Main Game ─────────────────────────────────────────────────
const Game = {
  mode:null, lang:null,
  score:0, streak:0, maxStreak:0, lives:3,
  correct:0, wrong:0,
  gameRunning:false, startTime:null,
  wordQueue:[], currentWord:null, wordStartTime:null,
  timer:null, gameTimer:null, animFrame:null,
  _answerCb:null,

  // Isometric world state
  procLevel:1,
  biomeIdx:0,
  biomeProgress:0,   // 0–100
  levelSeed:42,
  grid:[],           // 2D tile array
  COLS:12, ROWS:12,
  tileW:64, tileH:32,
  camX:0, camY:0,
  frame:0,

  // Entities
  enemies:[],
  particles:[],
  playerGridX:2, playerGridY:2,
  playerAnim:0,
  playerState:"idle",
  playerStateTimer:0,

  get biome(){ return BIOMES[BIOME_ORDER[this.biomeIdx%4]]; },
  get biomeKey(){ return BIOME_ORDER[this.biomeIdx%4]; },

  // ── Start ───────────────────────────────────────────────────
  start(mode,lang){
    this.mode=mode; this.lang=lang;
    this.score=0; this.streak=0; this.maxStreak=0;
    this.lives=mode==="dictation"?5:3;
    this.correct=0; this.wrong=0;
    this.gameRunning=true; this.startTime=Date.now();
    this.enemies=[]; this.particles=[];
    this.procLevel=Memory.profile?.level||1;
    this.biomeIdx=0; this.biomeProgress=0;
    this.frame=0; this.playerAnim=0;
    this.playerState="run"; this.playerStateTimer=0;

    this._buildWordQueue();
    this._generateLevel();
    UI.showGame(mode);
    this._modeInit[mode]?.call(this);
  },

  stop(){
    this.gameRunning=false;
    clearInterval(this.timer); clearInterval(this.gameTimer);
    cancelAnimationFrame(this.animFrame);
    const dur=Math.round((Date.now()-this.startTime)/1000);
    const tot=this.correct+this.wrong;
    const acc=tot>0?Math.round(this.correct/tot*100):0;
    const xp=this.score+this.streak*5;
    Memory.recordSession(this.mode,this.lang,this.score,acc,xp,dur);
    Audio.beep("levelup");
    UI.showResults(this.score,acc,xp,this.correct,this.wrong,this.maxStreak);
  },

  // ── Procedural level generation ─────────────────────────────
  _generateLevel(){
    const seed=this.procLevel*31+this.biomeIdx*17;
    const rng=(s)=>{ let x=Math.sin(s)*10000; return x-Math.floor(x); };
    this.grid=[];
    for(let r=0;r<this.ROWS;r++){
      this.grid[r]=[];
      for(let c=0;c<this.COLS;c++){
        const n=rng(seed+r*100+c);
        // 0=floor, 1=wall/obstacle, 2=special(conveyor/crystal/void)
        let type=0;
        if(r===0||c===0||r===this.ROWS-1||c===this.COLS-1) type=1; // border walls
        else if(n<0.12+this.procLevel*0.008) type=1; // random walls, more with level
        else if(n>0.88) type=2; // special tiles
        this.grid[r][c]={type, decor:rng(seed+r*200+c*3)};
      }
    }
    // Ensure player spawn is clear
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      const tr=2+dr, tc=2+dc;
      if(tr>=0&&tr<this.ROWS&&tc>=0&&tc<this.COLS) this.grid[tr][tc].type=0;
    }
    this.playerGridX=2; this.playerGridY=2;
    // Camera centers on player
    this._updateCam();
    // Spawn initial enemies
    this.enemies=[];
    const bm=this.biome;
    const count=bm.minEnemies+Math.floor(rng(seed+999)*(bm.maxEnemies-bm.minEnemies+1));
    for(let i=0;i<count;i++) this._spawnEnemy(seed+i*1000);
  },

  _updateCam(){
    const canvas=document.getElementById("ninja-canvas");
    if(!canvas) return;
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    const ps=ISO.toScreen(this.playerGridX,this.playerGridY,this.tileW,this.tileH,0,0);
    this.camX=W/2-ps.x;
    this.camY=H*0.38-ps.y;
  },

  _spawnEnemy(seed){
    const rng=(s)=>{ let x=Math.sin(s)*10000; return x-Math.floor(x); };
    const bm=this.biome;
    const types=bm.enemyTypes;
    const type=types[Math.floor(rng(seed)*types.length)];
    // Find a valid floor tile away from player
    let gx,gy,attempts=0;
    do{
      gx=3+Math.floor(rng(seed+attempts)*( this.COLS-4));
      gy=3+Math.floor(rng(seed+attempts*7)*(this.ROWS-4));
      attempts++;
    }while(attempts<30&&(this.grid[gy]?.[gx]?.type!==0||
      (Math.abs(gx-this.playerGridX)<3&&Math.abs(gy-this.playerGridY)<3)));

    const w=this.nextWord();
    this.enemies.push({
      type, word:w,
      gx, gy,
      // Smooth screen position
      sx:0, sy:0,
      hp:1, dead:false, deathAnim:0,
      wobble:rng(seed)*Math.PI*2,
      moveTimer:60+Math.floor(rng(seed+1)*80),
      color:{slime:"#ff4444",twin:"#ff8800",knight:"#ffcc00",wraith:"#4488ff",chimera:"#aa44ff"}[type],
      alt:w.tr+"X",
    });
  },

  // ── Advance biome ────────────────────────────────────────────
  _advanceBiome(){
    this.biomeProgress=Math.min(100,this.biomeProgress+8);
    if(this.biomeProgress>=100){
      this.biomeProgress=0;
      this.biomeIdx++;
      this.procLevel++;
      this.levelSeed=this.procLevel*31;
      Audio.beep("boss");
      UI.showBiomeTransition(this.biome.name, this.procLevel);
      setTimeout(()=>this._generateLevel(), 2400);
    }
  },

  // ── Word queue ───────────────────────────────────────────────
  _buildWordQueue(){
    const weak=Memory.getWeakWords(this.lang,5);
    const tier=Memory.getSuggestedTier(this.lang);
    const pool=getWordsByTier(this.lang,Math.max(1,tier));
    const all=getAllWords(this.lang);
    let q=[...pool,...pool];
    weak.forEach(w=>{ const f=all.find(x=>x.en===w||x.tr===w); if(f) q.unshift(f,f,f); });
    this.wordQueue=this._shuffle(q);
  },
  nextWord(){
    if(!this.wordQueue.length) this.wordQueue=this._shuffle(getAllWords(this.lang));
    this.currentWord=this.wordQueue.shift();
    this.wordStartTime=Date.now();
    return this.currentWord;
  },

  checkAnswer(input){
    if(!this.currentWord) return false;
    const ms=Date.now()-this.wordStartTime;
    const a=this._norm(input.trim()), c=this._norm(this.currentWord.tr);
    const ok=a===c;
    Memory.recordWord(this.lang,this.currentWord.en,ok,ms);
    if(ok){
      this.correct++; this.streak++;
      this.maxStreak=Math.max(this.maxStreak,this.streak);
      this.score+=10+(this.streak>3?this.streak*2:0);
      this.playerState="attack"; this.playerStateTimer=20;
      Audio.beep("correct"); Audio.speak(this.currentWord.tr,this.lang);
      this._spawnParticles(true);
      this._advanceBiome();
    }else{
      this.wrong++; this.streak=0; this.lives--;
      this.playerState="error"; this.playerStateTimer=25;
      Audio.beep("wrong"); this._spawnParticles(false);
    }
    return ok;
  },

  _norm(s){ return s.replace(/[^\w\u0080-\uFFFF]/g,"").toLowerCase(); },
  _shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]]; } return r; },

  // ── Particles ────────────────────────────────────────────────
  _spawnParticles(ok){
    const color=ok?"#00f5c4":"#ff3344";
    const canvas=document.getElementById("ninja-canvas");
    if(!canvas) return;
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    for(let i=0;i<14;i++){
      this.particles.push({
        x:W*0.5+Math.random()*60-30,
        y:H*0.6+Math.random()*40-20,
        vx:(Math.random()-.5)*7,
        vy:-Math.random()*7-2,
        life:45, maxLife:45, color,
        char:ok?"✓":"✗", size:12+Math.random()*8,
      });
    }
  },

  // ── Render ───────────────────────────────────────────────────
  render(canvas){
    const dpr=window.devicePixelRatio||1;
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){
      canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
    }
    const ctx=canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);

    const bm=this.biome;
    // Sky gradient
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,bm.skyTop); sky.addColorStop(1,bm.skyBot);
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

    // Scanlines
    for(let y=0;y<H;y+=3){
      ctx.fillStyle="rgba(0,0,0,0.04)";
      ctx.fillRect(0,y,W,1);
    }

    this._updateCam();
    ctx.save();
    ctx.translate(this.camX, this.camY);

    // Draw tiles sorted by depth (painter's algorithm)
    const toDraw=[];
    for(let r=0;r<this.ROWS;r++){
      for(let c=0;c<this.COLS;c++){
        toDraw.push({r,c,depth:ISO.depth(c,r),type:"tile"});
      }
    }
    // Add enemies to draw list
    this.enemies.filter(e=>!e.dead||e.deathAnim<25).forEach(e=>{
      toDraw.push({depth:ISO.depth(e.gx,e.gy)+0.5,type:"enemy",e});
    });
    // Add player
    toDraw.push({depth:ISO.depth(this.playerGridX,this.playerGridY)+0.6,type:"player"});
    toDraw.sort((a,b)=>a.depth-b.depth);

    toDraw.forEach(item=>{
      if(item.type==="tile"){
        this._drawTile(ctx,item.c,item.r);
      } else if(item.type==="enemy"){
        this._drawEnemy(ctx,item.e);
      } else {
        this._drawPlayer(ctx);
      }
    });

    ctx.restore();

    // Particles (screen space)
    this.particles=this.particles.filter(p=>p.life>0);
    this.particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.25; p.life--;
      const a=p.life/p.maxLife;
      ctx.globalAlpha=a;
      ctx.fillStyle=p.color;
      ctx.font=`bold ${p.size}px 'Courier New'`;
      ctx.textAlign="center"; ctx.fillText(p.char,p.x,p.y);
      ctx.globalAlpha=1;
    });

    // HUD overlays
    this._drawHUDOverlay(ctx,W,H);
  },

  // ── Tile drawing ─────────────────────────────────────────────
  _drawTile(ctx, c, r){
    const bm=this.biome;
    const s=ISO.toScreen(c,r,this.tileW,this.tileH,0,0);
    const tw=this.tileW, th=this.tileH;
    const tile=this.grid[r]?.[c];
    if(!tile) return;

    const gx=s.x, gy=s.y;

    if(tile.type===1){
      // Wall/obstacle block
      this._drawIsoBlock(ctx, gx, gy, tw, th, bm.wallColor,
        this._darken(bm.wallColor,0.6), this._darken(bm.wallColor,0.4));
      // Word label on wall face
      if(tile.decor>0.5){
        const words=getAllWords(this.lang);
        const w=words[Math.floor(tile.decor*words.length)%words.length];
        ctx.fillStyle=bm.accentColor+"88";
        ctx.font="7px 'Share Tech Mono'";
        ctx.textAlign="center";
        ctx.fillText(w?.en||"",gx,gy+th*0.3);
      }
    } else if(tile.type===2){
      // Special tile
      this._drawSpecialTile(ctx, gx, gy, tw, th, bm);
    } else {
      // Floor tile
      this._drawIsoFloor(ctx, gx, gy, tw, th, bm);
      // Biome-specific decoration
      if(tile.decor>0.75) this._drawBiomeDecor(ctx, gx, gy, tw, th, tile.decor, bm);
    }
  },

  _drawIsoFloor(ctx, x, y, tw, th, bm){
    // Top face
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+tw/2, y+th/2);
    ctx.lineTo(x, y+th);
    ctx.lineTo(x-tw/2, y+th/2);
    ctx.closePath();
    const grad=ctx.createLinearGradient(x-tw/2,y,x+tw/2,y+th);
    grad.addColorStop(0,bm.floorTop);
    grad.addColorStop(1,bm.floorBase);
    ctx.fillStyle=grad; ctx.fill();
    ctx.strokeStyle=bm.accentColor+"22"; ctx.lineWidth=0.5; ctx.stroke();
  },

  _drawIsoBlock(ctx, x, y, tw, th, topC, leftC, rightC){
    const bh=th; // block height
    // Top face
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+tw/2,y+th/2);
    ctx.lineTo(x,y+th);
    ctx.lineTo(x-tw/2,y+th/2);
    ctx.closePath();
    ctx.fillStyle=topC; ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,0.08)"; ctx.lineWidth=0.5; ctx.stroke();

    // Left face
    ctx.beginPath();
    ctx.moveTo(x-tw/2,y+th/2);
    ctx.lineTo(x,y+th);
    ctx.lineTo(x,y+th+bh);
    ctx.lineTo(x-tw/2,y+th/2+bh);
    ctx.closePath();
    ctx.fillStyle=leftC; ctx.fill();

    // Right face
    ctx.beginPath();
    ctx.moveTo(x+tw/2,y+th/2);
    ctx.lineTo(x,y+th);
    ctx.lineTo(x,y+th+bh);
    ctx.lineTo(x+tw/2,y+th/2+bh);
    ctx.closePath();
    ctx.fillStyle=rightC; ctx.fill();
  },

  _drawSpecialTile(ctx, x, y, tw, th, bm){
    const t=this.frame;
    if(this.biomeKey==="factory"){
      // Conveyor belt — moving arrows
      this._drawIsoFloor(ctx,x,y,tw,th,{...bm,floorTop:"#4a2a00",floorBase:"#3a1a00"});
      ctx.fillStyle=bm.accentColor+"66"; ctx.font="9px sans-serif"; ctx.textAlign="center";
      const off=((t*0.5)%16);
      ctx.fillText("→",x+(off%8)-4,y+th*0.7);
    } else if(this.biomeKey==="caverns"){
      // Crystal node — glowing
      this._drawIsoFloor(ctx,x,y,tw,th,{...bm,floorTop:"#002040",floorBase:"#001530"});
      ctx.save();
      ctx.shadowBlur=15+Math.sin(t*0.05)*5; ctx.shadowColor="#44aaff";
      ctx.fillStyle="#4488ff88";
      ctx.beginPath();
      ctx.moveTo(x,y+th*0.2);
      ctx.lineTo(x+tw*0.2,y+th*0.6);
      ctx.lineTo(x,y+th*0.9);
      ctx.lineTo(x-tw*0.2,y+th*0.6);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if(this.biomeKey==="glitch"){
      // Glitch void
      this._drawIsoFloor(ctx,x,y,tw,th,{...bm,floorTop:"#300040",floorBase:"#200030"});
      if(Math.random()>0.97){
        ctx.fillStyle=bm.accentColor+"44"; ctx.font="8px 'Share Tech Mono'"; ctx.textAlign="center";
        ctx.fillText(["TRUTH","LIBERTY","∅","???"][Math.floor(Math.random()*4)],x,y+th*0.6);
      }
    } else {
      // Forest — root/platform
      this._drawIsoFloor(ctx,x,y,tw,th,{...bm,floorTop:"#2a5a1a",floorBase:"#1a3a0a"});
      ctx.fillStyle="#00ff4444"; ctx.font="8px 'Courier New'"; ctx.textAlign="center";
      ctx.fillText("verb",x,y+th*0.65);
    }
  },

  _drawBiomeDecor(ctx, x, y, tw, th, seed, bm){
    const t=this.frame;
    if(this.biomeKey==="forest"){
      // Small tree
      ctx.save();
      ctx.translate(x,y+th*0.1);
      ctx.fillStyle="#0d2a0d";
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8,-18); ctx.lineTo(8,-18); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#1a4a0a";
      ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(-6,-20); ctx.lineTo(6,-20); ctx.closePath(); ctx.fill();
      // Noun label on tree
      ctx.fillStyle=bm.accentColor+"66"; ctx.font="6px 'Courier New'"; ctx.textAlign="center";
      ctx.fillText("noun",0,-22);
      ctx.restore();
    } else if(this.biomeKey==="factory"){
      // Small machine
      ctx.fillStyle=bm.wallColor+"88";
      ctx.fillRect(x-5,y+th*0.2,10,8);
      ctx.fillStyle=bm.accentColor+"66";
      ctx.fillRect(x-3,y+th*0.15,6,3);
    } else if(this.biomeKey==="caverns"){
      // Crystal
      ctx.save(); ctx.shadowBlur=8; ctx.shadowColor="#4488ff";
      ctx.fillStyle="#4488ff55";
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-5,y+th*0.5); ctx.lineTo(x+5,y+th*0.5); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if(this.biomeKey==="glitch"){
      // Glitch fragment
      if(Math.random()>0.95){
        ctx.fillStyle=bm.accentColor+"44"; ctx.font="7px monospace"; ctx.textAlign="center";
        ctx.fillText("∅",x,y+th*0.3);
      }
    }
  },

  // ── Enemy drawing ────────────────────────────────────────────
  _drawEnemy(ctx, e){
    const s=ISO.toScreen(e.gx,e.gy,this.tileW,this.tileH,0,0);
    e.sx=s.x; e.sy=s.y;
    const x=s.x, y=s.y-this.tileH*0.5;
    const t=this.frame;

    ctx.save();
    if(e.dead){ ctx.globalAlpha=1-e.deathAnim/25; ctx.scale(1+e.deathAnim*0.05,1+e.deathAnim*0.05); }
    ctx.translate(x,y);

    switch(e.type){
      case"slime":   this._drawSlime(ctx,e,t);   break;
      case"twin":    this._drawTwin(ctx,e,t);    break;
      case"knight":  this._drawKnight(ctx,e,t);  break;
      case"wraith":  this._drawWraith(ctx,e,t);  break;
      case"chimera": this._drawChimera(ctx,e,t); break;
    }
    ctx.restore();

    if(e.dead) e.deathAnim++;
  },

  _drawSlime(ctx,e,t){
    const w=e.wobble+t*0.05, sz=22;
    ctx.shadowBlur=12; ctx.shadowColor=e.color;
    // Body blob
    ctx.fillStyle=e.color+"55"; ctx.strokeStyle=e.color; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.ellipse(0,0, sz+Math.sin(w)*3, sz*0.75+Math.cos(w*1.3)*2, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    // Drips
    [-8,0,8].forEach((dx,i)=>{
      ctx.fillStyle=e.color+"44";
      ctx.beginPath(); ctx.ellipse(dx,sz*0.7+Math.sin(w+i)*3, 3, 5+Math.abs(Math.sin(w+i))*3, 0,0,Math.PI*2); ctx.fill();
    });
    // Eyes
    [-7,7].forEach(ex=>{
      ctx.beginPath(); ctx.arc(ex,-5,3.5,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.fill();
      ctx.beginPath(); ctx.arc(ex+1,-5,1.8,0,Math.PI*2); ctx.fillStyle="#000"; ctx.fill();
    });
    // Angry brow
    ctx.strokeStyle="#000"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(-11,-9); ctx.lineTo(-4,-7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11,-9); ctx.lineTo(4,-7); ctx.stroke();
    ctx.shadowBlur=0;
    // English word
    ctx.fillStyle="#fff"; ctx.font="bold 12px 'Share Tech Mono'"; ctx.textAlign="center";
    ctx.fillText(e.word.en, 0, 2);
    ctx.fillStyle=e.color; ctx.font="8px 'Share Tech Mono'";
    ctx.fillText("["+e.word.cat+"]",0,13);
  },

  _drawTwin(ctx,e,t){
    const flicker=Math.sin(t*0.25+e.wobble)>0;
    ctx.shadowBlur=10; ctx.shadowColor=e.color;
    // Two lizard/dragon heads fused at center
    [-18,18].forEach((dx,i)=>{
      const col=i===0?"#ff6600":"#ff4422";
      ctx.fillStyle=col+"44"; ctx.strokeStyle=col; ctx.lineWidth=2;
      // Reptile head shape
      ctx.beginPath();
      ctx.ellipse(dx,-8,14,17, i===0?-0.2:0.2, 0,Math.PI*2);
      ctx.fill(); ctx.stroke();
      // Snout
      ctx.beginPath();
      ctx.ellipse(dx+(i===0?-5:5),-2,8,5,0,0,Math.PI*2);
      ctx.fillStyle=col+"88"; ctx.fill(); ctx.stroke();
      // Eye
      ctx.beginPath(); ctx.arc(dx+(i===0?3:-3),-14,3,0,Math.PI*2);
      ctx.fillStyle="#ffaa00"; ctx.fill();
      ctx.beginPath(); ctx.arc(dx+(i===0?3:-3),-14,1.5,0,Math.PI*2);
      ctx.fillStyle="#000"; ctx.fill();
      // Frill spikes
      for(let s2=0;s2<3;s2++){
        ctx.fillStyle=col;
        const sx=dx+(s2-1)*5, sy=-22+s2*2;
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx-2,sy-8); ctx.lineTo(sx+2,sy-8); ctx.closePath(); ctx.fill();
      }
    });
    // Body connecting both
    ctx.fillStyle="#ff550033"; ctx.strokeStyle="#ff5500"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(0,5,20,10,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0;
    // Flickering words
    ctx.font="bold 10px 'Share Tech Mono'"; ctx.textAlign="center";
    if(flicker){
      ctx.fillStyle="#fff"; ctx.fillText(e.word.en,-18,-8);
      ctx.fillStyle="#8888ff"; ctx.font="9px 'Share Tech Mono'"; ctx.fillText("???",18,-8);
    } else {
      ctx.fillStyle="#8888ff"; ctx.font="9px 'Share Tech Mono'"; ctx.fillText("???", -18,-8);
      ctx.fillStyle="#fff"; ctx.font="bold 10px 'Share Tech Mono'"; ctx.fillText(e.word.en,18,-8);
    }
  },

  _drawKnight(ctx,e,t){
    const bob=Math.sin(t*0.08+e.wobble)*2;
    ctx.shadowBlur=8; ctx.shadowColor=e.color;
    const col=e.color;
    // Legs (object)
    [-10,4].forEach(lx=>{
      ctx.fillStyle=col+"33"; ctx.strokeStyle=col; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(lx,2+bob,10,14,2); ctx.fill(); ctx.stroke();
    });
    // Torso (verb plate)
    ctx.fillStyle=col+"44"; ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(-13,-18+bob,26,22,3); ctx.fill(); ctx.stroke();
    // Arms
    [-23,-10+bob].forEach((_,i)=>{
      const ax=i===0?-23:13, ay=-16+bob;
      ctx.fillStyle=col+"33"; ctx.strokeStyle=col; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(ax,ay,10,18,2); ctx.fill(); ctx.stroke();
    });
    ctx.fillStyle=col+"33"; ctx.strokeStyle=col; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(13,-16+bob,10,18,2); ctx.fill(); ctx.stroke();
    // Head (subject)
    ctx.fillStyle=col+"44"; ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(0,-30+bob,12,13,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    // Visor
    ctx.fillStyle=col+"88";
    ctx.beginPath(); ctx.ellipse(0,-30+bob,8,5,0,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    // Labels
    ctx.fillStyle=col; ctx.font="bold 7px 'Share Tech Mono'"; ctx.textAlign="center";
    ctx.fillText("I",0,-30+bob);           // head=subject
    ctx.fillStyle="#fff"; ctx.font="bold 9px 'Share Tech Mono'";
    ctx.fillText(e.word.en,0,-7+bob);      // torso=verb
    ctx.fillStyle=col+"cc"; ctx.font="7px 'Share Tech Mono'";
    ctx.fillText("pizza",0,9+bob);         // legs=object
  },

  _drawWraith(ctx,e,t){
    const alpha=0.35+Math.sin(t*0.06+e.wobble)*0.15;
    ctx.shadowBlur=18; ctx.shadowColor="#4488ff";
    // Waveform body
    ctx.fillStyle=`rgba(68,136,255,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(-20,0);
    for(let x=-20;x<=20;x+=2){
      ctx.lineTo(x, Math.sin((x+t*2)*0.3)*8-8);
    }
    ctx.lineTo(20,0);
    ctx.closePath(); ctx.fill();
    // Spectral hood
    ctx.strokeStyle=`rgba(100,180,255,${alpha+0.1})`; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(0,-20,14,17,0,0,Math.PI*2);
    ctx.fillStyle=`rgba(68,136,255,${alpha})`; ctx.fill(); ctx.stroke();
    // Eye sockets
    [-5,5].forEach(ex=>{
      ctx.beginPath(); ctx.arc(ex,-22,3,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,230,255,${alpha+0.3})`; ctx.fill();
    });
    // Tail wisps
    for(let i=0;i<3;i++){
      const wx=(i-1)*10, wy=5+Math.sin(t*0.1+i)*6;
      ctx.beginPath(); ctx.moveTo(wx,2);
      ctx.quadraticCurveTo(wx+3,wy+8,wx,wy+16);
      ctx.strokeStyle=`rgba(68,136,255,${alpha*0.5})`; ctx.lineWidth=5; ctx.stroke();
    }
    // Audio waveform across body
    ctx.strokeStyle=`rgba(180,220,255,${alpha+0.2})`; ctx.lineWidth=1;
    ctx.beginPath();
    for(let x=-12;x<=12;x++){
      const yy=Math.sin((x+t*4)*0.5)*5;
      x===-12?ctx.moveTo(x,-20+yy):ctx.lineTo(x,-20+yy);
    }
    ctx.stroke();
    ctx.shadowBlur=0;
    // Listen prompt
    ctx.fillStyle="#88aaff"; ctx.font="bold 9px 'Share Tech Mono'"; ctx.textAlign="center";
    ctx.fillText("🔊 LISTEN",-1,-5);
  },

  _drawChimera(ctx,e,t){
    ctx.shadowBlur=20;
    // Three dragon heads: red(text), yellow(grammar), blue(audio)
    const heads=[
      {dx:-24,col:"#ff4444",label:e.word.en,role:"TEXT"},
      {dx:0,  col:"#ffaa00",label:"???",    role:"GRAM"},
      {dx:24, col:"#4488ff",label:"🔊",     role:"AUDIO"},
    ];
    heads.forEach(h=>{
      ctx.shadowColor=h.col;
      // Dragon head
      ctx.fillStyle=h.col+"55"; ctx.strokeStyle=h.col; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.ellipse(h.dx,-28+Math.sin(t*0.08+h.dx)*3,15,18,0,0,Math.PI*2);
      ctx.fill(); ctx.stroke();
      // Snout
      ctx.fillStyle=h.col+"88"; ctx.strokeStyle=h.col; ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.ellipse(h.dx,-16+Math.sin(t*0.08+h.dx)*2,9,6,0,0,Math.PI*2);
      ctx.fill(); ctx.stroke();
      // Eye
      ctx.beginPath(); ctx.arc(h.dx+4,-32+Math.sin(t*0.08+h.dx)*3,3.5,0,Math.PI*2);
      ctx.fillStyle="#ffff00"; ctx.fill();
      ctx.beginPath(); ctx.arc(h.dx+4,-32+Math.sin(t*0.08+h.dx)*3,1.8,0,Math.PI*2);
      ctx.fillStyle="#000"; ctx.fill();
      // Horn
      ctx.fillStyle=h.col;
      ctx.beginPath(); ctx.moveTo(h.dx-4,-40); ctx.lineTo(h.dx-7,-52); ctx.lineTo(h.dx-1,-40); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(h.dx+4,-40); ctx.lineTo(h.dx+7,-52); ctx.lineTo(h.dx+1,-40); ctx.closePath(); ctx.fill();
      // Label
      ctx.fillStyle="#fff"; ctx.font="bold 8px 'Share Tech Mono'"; ctx.textAlign="center";
      ctx.fillText(h.label, h.dx, -28+Math.sin(t*0.08+h.dx)*3);
      ctx.fillStyle=h.col+"aa"; ctx.font="6px 'Share Tech Mono'";
      ctx.fillText(h.role, h.dx, -42);
    });
    // Body
    ctx.shadowColor="#aa44ff";
    ctx.fillStyle="#aa44ff33"; ctx.strokeStyle="#aa44ff"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(0,-2,32,18,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    // Swirling text aura
    const auraChars="LIBERTY TRUTH FREEDOM 自由 真相".split("");
    for(let i=0;i<8;i++){
      const angle=t*0.03+i*Math.PI*0.25;
      const r=30+Math.sin(t*0.06+i)*5;
      ctx.fillStyle="#aa44ff55"; ctx.font="7px 'Share Tech Mono'"; ctx.textAlign="center";
      ctx.fillText(auraChars[i%auraChars.length], Math.cos(angle)*r, Math.sin(angle)*r-10);
    }
    ctx.shadowBlur=0;
  },

  // ── Player drawing ───────────────────────────────────────────
  _drawPlayer(ctx){
    const s=ISO.toScreen(this.playerGridX,this.playerGridY,this.tileW,this.tileH,0,0);
    const x=s.x, y=s.y-this.tileH*0.5;
    const t=this.frame;
    const lvl=Memory.profile?.level||1;
    let stage=CHAR_STAGES[0];
    for(const st of CHAR_STAGES) if(lvl>=st.minLvl) stage=st;
    const stageIdx=CHAR_STAGES.indexOf(stage);

    if(this.playerStateTimer>0) this.playerStateTimer--;
    if(this.playerStateTimer===0) this.playerState="run";
    this.playerAnim++;

    ctx.save();
    ctx.translate(x,y);

    // Aura glow
    const auraR=stage.auraSize+(this.playerState==="combo"?8:0);
    const grd=ctx.createRadialGradient(0,-20,2,0,-20,auraR);
    grd.addColorStop(0,stage.glowColor+"88"); grd.addColorStop(1,"transparent");
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(0,-20,auraR,0,Math.PI*2); ctx.fill();

    if(stageIdx===0) this._drawPlayerInitiate(ctx,stage.bodyColor,t,this.playerState);
    else if(stageIdx===1) this._drawPlayerDecoder(ctx,stage.bodyColor,t,this.playerState);
    else if(stageIdx===2) this._drawPlayerSynthesizer(ctx,stage.bodyColor,t,this.playerState);
    else this._drawPlayerFluent(ctx,stage.bodyColor,t,this.playerState);

    ctx.restore();
  },

  _drawPlayerInitiate(ctx,col,t,state){
    const bob=Math.sin(t*0.12)*(state==="run"?2.5:1);
    ctx.strokeStyle=col; ctx.lineWidth=2;
    // Head
    ctx.beginPath(); ctx.arc(0,-44+bob,8,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle=col+"33"; ctx.fill();
    // Body
    ctx.beginPath(); ctx.moveTo(0,-36+bob); ctx.lineTo(0,-18+bob); ctx.stroke();
    // Arms swing
    const arm=Math.sin(t*0.18)*(state==="run"?16:4);
    ctx.beginPath(); ctx.moveTo(0,-33+bob); ctx.lineTo(-13,-22+bob+arm*0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-33+bob); ctx.lineTo(13,-22+bob-arm*0.4); ctx.stroke();
    // Legs
    const leg=Math.sin(t*0.18)*(state==="run"?14:3);
    ctx.beginPath(); ctx.moveTo(0,-18+bob); ctx.lineTo(-8,-4+leg); ctx.lineTo(-9,8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-18+bob); ctx.lineTo(8,-4-leg); ctx.lineTo(9,8); ctx.stroke();
    // Orbiting symbols (unstable, flickering)
    "a語text字".split("").forEach((c,i)=>{
      if(Math.sin(t*0.1+i*2)>-0.3){
        const a=t*0.04+i*Math.PI/2;
        ctx.fillStyle=col+"66"; ctx.font="9px 'Share Tech Mono'"; ctx.textAlign="center";
        ctx.fillText(c,Math.cos(a)*18,Math.sin(a)*10-28+bob);
      }
    });
  },

  _drawPlayerDecoder(ctx,col,t,state){
    const bob=Math.sin(t*0.12)*(state==="run"?2.5:1);
    ctx.shadowBlur=6; ctx.shadowColor=col;
    // Helmet
    ctx.fillStyle=col+"33"; ctx.strokeStyle=col; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(0,-48+bob,11,13,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle=col+"66"; ctx.beginPath(); ctx.ellipse(0,-48+bob,7,5,0,0,Math.PI*2); ctx.fill();
    // Armor torso
    ctx.fillStyle=col+"22"; ctx.strokeStyle=col; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(-12,-38+bob,24,22,3); ctx.fill(); ctx.stroke();
    ctx.fillStyle=col; ctx.font="bold 7px 'Courier New'"; ctx.textAlign="center";
    ctx.fillText("APPLE",0,-27+bob);
    // Arms with gauntlets
    const arm=Math.sin(t*0.18)*(state==="run"?13:3);
    ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(-12,-35+bob); ctx.lineTo(-19,-21+bob+arm*0.35); ctx.lineTo(-17,-13+bob+arm*0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12,-35+bob); ctx.lineTo(19,-21+bob-arm*0.35); ctx.lineTo(17,-13+bob-arm*0.45); ctx.stroke();
    // Legs
    const leg=Math.sin(t*0.18)*(state==="run"?13:2.5);
    ctx.beginPath(); ctx.moveTo(-5,-16+bob); ctx.lineTo(-8,-2+leg); ctx.lineTo(-9,9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5,-16+bob); ctx.lineTo(8,-2-leg); ctx.lineTo(9,9); ctx.stroke();
    // Energy nodes
    [[-12,-37],[12,-37],[-12,-28],[12,-28]].forEach(([nx,ny])=>{
      ctx.beginPath(); ctx.arc(nx,ny+bob,2,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
    });
    ctx.shadowBlur=0;
  },

  _drawPlayerSynthesizer(ctx,col,t,state){
    const bob=Math.sin(t*0.12)*(state==="run"?2:1);
    ctx.shadowBlur=14; ctx.shadowColor=col;
    // Full powered helmet
    ctx.fillStyle=col+"44"; ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(0,-50+bob,13,15,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,-50+bob,9,6,0,0,Math.PI*2); ctx.fill();
    // Heavy armor chest
    ctx.fillStyle=col+"33"; ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(-14,-38+bob,28,24,4); ctx.fill(); ctx.stroke();
    // Language text streams
    const streamText="私は学校へ行きます";
    for(let i=0;i<7;i++){
      const angle=t*0.045+i*(Math.PI*2/7);
      const r=20+Math.sin(t*0.08+i)*4;
      ctx.fillStyle=col+"55"; ctx.font="8px 'Share Tech Mono'"; ctx.textAlign="center";
      ctx.fillText(streamText[i%streamText.length],Math.cos(angle)*r,Math.sin(angle)*r*0.7-26+bob);
    }
    // Arms power cables
    const arm=Math.sin(t*0.18)*(state==="run"?12:2);
    ctx.strokeStyle=col; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(-14,-36+bob); ctx.lineTo(-21,-20+bob+arm*0.38); ctx.lineTo(-19,-11+bob+arm*0.48); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14,-36+bob); ctx.lineTo(21,-20+bob-arm*0.38); ctx.lineTo(19,-11+bob-arm*0.48); ctx.stroke();
    // Legs
    const leg=Math.sin(t*0.18)*(state==="run"?12:2);
    ctx.beginPath(); ctx.moveTo(-6,-14+bob); ctx.lineTo(-9,1+leg); ctx.lineTo(-10,11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6,-14+bob); ctx.lineTo(9,1-leg); ctx.lineTo(10,11); ctx.stroke();
    ctx.shadowBlur=0;
  },

  _drawPlayerFluent(ctx,col,t,state){
    // Abstract text entity — body made of language
    ctx.shadowBlur=22; ctx.shadowColor=col;
    const allChars="私学ABCDEFGHIJKLMNOPQαβγ語字文";
    for(let i=0;i<35;i++){
      const angle=(i/35)*Math.PI*2+t*0.025;
      const r=14+Math.sin(t*0.08+i*0.5)*7;
      const a=0.3+Math.abs(Math.sin(t*0.06+i))*0.5;
      ctx.fillStyle=col+Math.round(a*255).toString(16).padStart(2,"0");
      ctx.font=`${8+Math.random()*5}px 'Share Tech Mono'`;
      ctx.textAlign="center";
      ctx.fillText(allChars[i%allChars.length],Math.cos(angle)*r,Math.sin(angle)*r*0.65-22);
    }
    // Core glow
    const g=ctx.createRadialGradient(0,-22,0,0,-22,18);
    g.addColorStop(0,col+"aa"); g.addColorStop(1,"transparent");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,-22,18,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  },

  // ── HUD overlay ───────────────────────────────────────────────
  _drawHUDOverlay(ctx,W,H){
    const bm=this.biome;
    // Biome name top-right
    ctx.fillStyle=bm.accentColor+"66"; ctx.font="bold 10px 'Orbitron',sans-serif";
    ctx.textAlign="right"; ctx.fillText(bm.name,W-12,20); ctx.textAlign="left";
    // Proc level
    ctx.fillStyle=bm.accentColor+"aa"; ctx.font="9px 'Share Tech Mono'";
    ctx.fillText("PROC LVL "+this.procLevel, 10, 20);
    // Biome progress bar
    const bpW=Math.max(0,W*0.5-80);
    const bpX=W*0.25, bpY=H-18;
    ctx.fillStyle="rgba(0,0,0,0.5)";
    ctx.fillRect(bpX,bpY,bpW,6);
    const grad=ctx.createLinearGradient(bpX,0,bpX+bpW,0);
    grad.addColorStop(0,bm.accentColor); grad.addColorStop(1,bm.color+"88");
    ctx.fillStyle=grad;
    ctx.fillRect(bpX,bpY,bpW*(this.biomeProgress/100),6);
    ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.font="8px 'Share Tech Mono'";
    ctx.textAlign="center";
    ctx.fillText("BIOME PROGRESS",W*0.5,bpY-3);
    ctx.textAlign="left";
  },

  _darken(hex,f){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
  },

  // ── Mode initializers ─────────────────────────────────────────
  _modeInit:{

    reflex(){
      let timeLeft=60;
      UI.updateGameHUD(this);
      UI.showReflexWord(this.nextWord(),this.lang);
      this.gameTimer=setInterval(()=>{
        timeLeft--;
        UI.updateTimer(timeLeft);
        if(timeLeft<=5) Audio.beep("tick");
        if(timeLeft<=0) this.stop();
      },1000);
      UI.onAnswer(input=>{
        if(!this.gameRunning) return;
        UI.flashFeedback(this.checkAnswer(input));
        UI.updateGameHUD(this);
        if(this.lives<=0){this.stop();return;}
        UI.showReflexWord(this.nextWord(),this.lang);
      });
    },

    ninja(){
      const canvas=document.getElementById("ninja-canvas");
      if(!canvas) return;
      const resize=()=>{
        const dpr=window.devicePixelRatio||1;
        canvas.width=Math.round(canvas.offsetWidth*dpr);
        canvas.height=Math.round(canvas.offsetHeight*dpr);
      };
      resize();
      window.addEventListener("resize",resize);

      // AI enemy movement
      let enemyMoveTimer=0;
      const loop=()=>{
        if(!this.gameRunning) return;
        this.frame++;
        enemyMoveTimer++;

        // Move enemies toward player periodically
        if(enemyMoveTimer>45+Math.max(0,30-this.procLevel)){
          enemyMoveTimer=0;
          this.enemies.filter(e=>!e.dead).forEach(e=>{
            const dx=this.playerGridX-e.gx, dy=this.playerGridY-e.gy;
            const dist=Math.abs(dx)+Math.abs(dy);
            if(dist>1 && dist<8){
              // Move one step toward player
              const step=Math.abs(dx)>Math.abs(dy)
                ?{dx:Math.sign(dx),dy:0}:{dx:0,dy:Math.sign(dy)};
              const nx=e.gx+step.dx, ny=e.gy+step.dy;
              if(this.grid[ny]?.[nx]?.type===0 && !this.enemies.find(o=>o!==e&&!o.dead&&o.gx===nx&&o.gy===ny)){
                e.gx=nx; e.gy=ny;
              }
            }
            // Attack player if adjacent
            if(dist<=1){
              this.lives--;
              this.streak=0;
              this.playerState="error";
              this.playerStateTimer=30;
              Audio.beep("wrong");
              UI.flashLives(this.lives);
              e.dead=true; // enemy consumed in attack
              if(this.lives<=0) this.stop();
            }
          });
          // Clean dead
          this.enemies=this.enemies.filter(e=>!e.dead||e.deathAnim<25);
          // Respawn if too few enemies
          const living=this.enemies.filter(e=>!e.dead).length;
          const bm=this.biome;
          if(living<bm.minEnemies){
            for(let i=0;i<bm.minEnemies-living;i++)
              this._spawnEnemy(Date.now()+i*77+this.score);
          }
        }

        this.render(canvas);
        UI.updateGameHUD(this);
        this.animFrame=requestAnimationFrame(loop);
      };

      this.animFrame=requestAnimationFrame(loop);

      UI.onAnswer(input=>{
        if(!this.gameRunning) return;
        const ans=this._norm(input.trim());
        const idx=this.enemies.findIndex(e=>!e.dead&&this._norm(e.word.tr)===ans);
        if(idx!==-1){
          const en=this.enemies[idx];
          Memory.recordWord(this.lang,en.word.en,true,2000);
          en.dead=true;
          this.correct++; this.streak++;
          this.maxStreak=Math.max(this.maxStreak,this.streak);
          this.score+=10+(this.streak>3?this.streak*2:0);
          this.playerState="attack"; this.playerStateTimer=20;
          this._spawnParticles(true);
          this._advanceBiome();
          Audio.beep("correct");
          Audio.speak(en.word.tr,this.lang);
        } else {
          this.wrong++; this.streak=0; this.lives--;
          this.playerState="error"; this.playerStateTimer=25;
          this._spawnParticles(false);
          Audio.beep("wrong"); UI.shakeInput();
          UI.flashLives(this.lives);
          if(this.lives<=0) this.stop();
        }
        UI.updateGameHUD(this);
      });
    },

    syntax(){
      const sentences=WORD_DB[this.lang]?.sentences||[];
      if(!sentences.length){alert("No sentences available for this language.");return;}
      let idx=0;
      const show=()=>{
        if(!this.gameRunning) return;
        const s=sentences[idx%sentences.length];
        UI.showSyntaxPuzzle(s.en,this._shuffle(s.tr.split(" ")),s.tr,this.lang,ok=>{
          if(!this.gameRunning) return;
          ok?(this.correct++,this.streak++,this.maxStreak=Math.max(this.maxStreak,this.streak),this.score+=20,Audio.beep("correct"),Audio.speak(s.tr,this.lang))
            :(this.wrong++,this.streak=0,this.lives--,Audio.beep("wrong"));
          UI.updateGameHUD(this);
          if(this.lives<=0){this.stop();return;}
          idx++; setTimeout(show,800);
        });
      };
      UI.updateGameHUD(this); show();
    },

    async dictation(){
      UI.updateGameHUD(this);
      const run=async()=>{
        if(!this.gameRunning||this.lives<=0){this.stop();return;}
        const w=this.nextWord();
        UI.showDictationPrompt(w,this.lang);
        await Audio.speakAndWait(w.tr,this.lang);
        UI.enableDictationInput();
        UI.onAnswer(async input=>{
          if(!this.gameRunning) return;
          UI.disableDictationInput();
          UI.showDictationResult(this.checkAnswer(input),w.tr);
          UI.flashFeedback(this.checkAnswer.bind(this));
          UI.updateGameHUD(this);
          if(this.lives<=0){this.stop();return;}
          await new Promise(r=>setTimeout(r,1200));
          run();
        });
      };
      run();
    }
  }
};
