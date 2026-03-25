// ═══════════════════════════════════════
//  NLR — Charts (HiDPI Canvas)
// ═══════════════════════════════════════
const Charts={
  _setup(canvas){
    const dpr=window.devicePixelRatio||1;
    const W=canvas.offsetWidth||300, H=canvas.offsetHeight||140;
    canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
    canvas.style.width=W+"px"; canvas.style.height=H+"px";
    const ctx=canvas.getContext("2d"); ctx.scale(dpr,dpr);
    return{ctx,W,H};
  },
  bar(canvas,labels,values,opts={}){
    const{ctx,W,H}=this._setup(canvas);
    const pad=opts.pad||35, color=opts.color||"#00f5c4";
    ctx.clearRect(0,0,W,H);
    const max=Math.max(...values,1), bw=(W-pad*2)/Math.max(labels.length,1), chartH=H-pad*1.5;
    for(let i=0;i<=4;i++){
      const y=pad*0.5+chartH-(chartH*i/4);
      ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad*0.5,y); ctx.stroke();
      if(i>0){ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font="10px 'Share Tech Mono'";ctx.textAlign="right";ctx.fillText(Math.round(max*i/4),pad-4,y+3);}
    }
    labels.forEach((label,i)=>{
      const x=pad+i*bw, bh=Math.max(2,(values[i]/max)*chartH), by=pad*0.5+chartH-bh;
      const g=ctx.createLinearGradient(0,by,0,by+bh); g.addColorStop(0,color); g.addColorStop(1,color+"33");
      ctx.fillStyle=g; ctx.fillRect(x+3,by,bw-6,bh);
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="10px 'Share Tech Mono'"; ctx.textAlign="center";
      ctx.fillText(label,x+bw/2,H-5);
      if(values[i]>0){ctx.fillStyle=color;ctx.font="bold 10px 'Share Tech Mono'";ctx.fillText(values[i],x+bw/2,by-3);}
    });
    ctx.textAlign="left";
  },
  line(canvas,labels,datasets,opts={}){
    const{ctx,W,H}=this._setup(canvas); const pad=opts.pad||35;
    ctx.clearRect(0,0,W,H);
    const allVals=datasets.flatMap(d=>d.values), max=Math.max(...allVals,1);
    const chartH=H-pad*1.5, chartW=W-pad*1.2, step=chartW/Math.max(labels.length-1,1);
    for(let i=0;i<=4;i++){const y=pad*0.5+chartH-(chartH*i/4);ctx.strokeStyle="rgba(255,255,255,0.07)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad*0.2,y);ctx.stroke();}
    datasets.forEach(ds=>{
      const color=ds.color||"#00f5c4";
      const pts=ds.values.map((v,i)=>({x:pad+i*step,y:pad*0.5+chartH-(v/max)*chartH}));
      ctx.beginPath(); ctx.moveTo(pts[0].x,H-pad*0.5); pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.lineTo(pts[pts.length-1].x,H-pad*0.5); ctx.closePath();
      const g=ctx.createLinearGradient(0,pad*0.5,0,H-pad*0.5); g.addColorStop(0,color+"44"); g.addColorStop(1,color+"00"); ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=2; pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
      pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});
    });
    labels.forEach((l,i)=>{ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="10px 'Share Tech Mono'";ctx.textAlign="center";ctx.fillText(l,pad+i*step,H-3);});
    ctx.textAlign="left";
  },
  donut(canvas,segments,opts={}){
    const{ctx,W,H}=this._setup(canvas);
    const cx=W/2,cy=H/2,outer=Math.min(W,H)/2-8,inner=outer*0.58;
    ctx.clearRect(0,0,W,H);
    const total=segments.reduce((a,b)=>a+(b.value||0),0)||1;
    let angle=-Math.PI/2;
    segments.forEach(seg=>{
      const slice=(seg.value/total)*Math.PI*2; if(slice<0.01){angle+=slice;return;}
      ctx.shadowBlur=10;ctx.shadowColor=seg.color;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,outer,angle,angle+slice);ctx.closePath();ctx.fillStyle=seg.color;ctx.fill();
      ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(cx,cy,inner,0,Math.PI*2);ctx.fillStyle=opts.center||"#0a0f1e";ctx.fill();
      const mid=angle+slice/2,lx=cx+Math.cos(mid)*outer*0.76,ly=cy+Math.sin(mid)*outer*0.76;
      if(seg.value>0.1){ctx.fillStyle="#fff";ctx.font="bold 10px 'Share Tech Mono'";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(seg.label||"",lx,ly);}
      angle+=slice;
    });
    if(opts.centerText){ctx.fillStyle="#00f5c4";ctx.font="bold 11px 'Orbitron',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(opts.centerText,cx,cy);}
    ctx.textAlign="left";ctx.textBaseline="alphabetic";
  },
  radar(canvas,labels,values,opts={}){
    const{ctx,W,H}=this._setup(canvas);
    const cx=W/2,cy=H/2,r=Math.min(W,H)/2-28,n=labels.length,color=opts.color||"#00f5c4",max=opts.max||100;
    ctx.clearRect(0,0,W,H); if(!n) return;
    for(let ring=1;ring<=4;ring++){
      const rr=r*ring/4; ctx.beginPath();
      for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2;i===0?ctx.moveTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a)):ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a));}
      ctx.closePath();ctx.strokeStyle="rgba(255,255,255,0.09)";ctx.lineWidth=1;ctx.stroke();
    }
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.strokeStyle="rgba(255,255,255,0.12)";ctx.lineWidth=1;ctx.stroke();}
    ctx.beginPath();
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2,rv=r*(Math.max(0,values[i])/max);i===0?ctx.moveTo(cx+rv*Math.cos(a),cy+rv*Math.sin(a)):ctx.lineTo(cx+rv*Math.cos(a),cy+rv*Math.sin(a));}
    ctx.closePath();ctx.fillStyle=color+"2a";ctx.fill();
    ctx.shadowBlur=8;ctx.shadowColor=color;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2,rv=r*(Math.max(0,values[i])/max);ctx.beginPath();ctx.arc(cx+rv*Math.cos(a),cy+rv*Math.sin(a),3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2;ctx.fillStyle="rgba(255,255,255,0.65)";ctx.font="10px 'Share Tech Mono'";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(labels[i],cx+(r+14)*Math.cos(a),cy+(r+14)*Math.sin(a));}
    ctx.textAlign="left";ctx.textBaseline="alphabetic";
  }
};
