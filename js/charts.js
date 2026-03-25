// ═══════════════════════════════════════════════════════
//  NINJA LANGUAGE RUNNER — Charts (pure Canvas)
// ═══════════════════════════════════════════════════════

const Charts = {

  // ── Bar Chart ────────────────────────────────────────
  bar(canvas, labels, values, opts = {}) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = opts.pad || 40;
    const color = opts.color || "#00f5c4";
    const bg = opts.bg || "transparent";

    ctx.clearRect(0, 0, W, H);
    if (bg !== "transparent") { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }

    const max = Math.max(...values, 1);
    const bw = (W - pad * 2) / labels.length;
    const chartH = H - pad * 2;

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad + chartH - (chartH * i / 4);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px 'Courier New'";
      ctx.fillText(Math.round(max * i / 4), 2, y + 4);
    }

    labels.forEach((label, i) => {
      const x = pad + i * bw;
      const bh = (values[i] / max) * chartH;
      const by = pad + chartH - bh;

      // Bar gradient
      const grad = ctx.createLinearGradient(0, by, 0, by + bh);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "44");
      ctx.fillStyle = grad;
      ctx.fillRect(x + 4, by, bw - 8, bh);

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "10px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText(label, x + bw / 2, H - 8);

      // Value on top
      if (values[i] > 0) {
        ctx.fillStyle = color;
        ctx.font = "bold 11px 'Courier New'";
        ctx.fillText(values[i], x + bw / 2, by - 4);
      }
    });
    ctx.textAlign = "left";
  },

  // ── Line Chart ───────────────────────────────────────
  line(canvas, labels, datasets, opts = {}) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = opts.pad || 40;

    ctx.clearRect(0, 0, W, H);

    const allVals = datasets.flatMap(d => d.values);
    const max = Math.max(...allVals, 1);
    const chartH = H - pad * 2;
    const chartW = W - pad * 2;
    const step = chartW / Math.max(labels.length - 1, 1);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad + chartH - (chartH * i / 4);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }

    datasets.forEach(ds => {
      const color = ds.color || "#00f5c4";
      const points = ds.values.map((v, i) => ({
        x: pad + i * step,
        y: pad + chartH - (v / max) * chartH
      }));

      // Fill area
      ctx.beginPath();
      ctx.moveTo(points[0].x, H - pad);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, H - pad);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad, 0, H - pad);
      grad.addColorStop(0, color + "44");
      grad.addColorStop(1, color + "00");
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Dots
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    });

    // X labels
    labels.forEach((label, i) => {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "10px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText(label, pad + i * step, H - 6);
    });
    ctx.textAlign = "left";
  },

  // ── Donut Chart ──────────────────────────────────────
  donut(canvas, segments, opts = {}) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const outer = Math.min(W, H) / 2 - 10;
    const inner = outer * 0.6;

    ctx.clearRect(0, 0, W, H);

    const total = segments.reduce((a, b) => a + b.value, 0) || 1;
    let angle = -Math.PI / 2;

    segments.forEach((seg, i) => {
      const slice = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outer, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Gap
      ctx.beginPath();
      ctx.arc(cx, cy, inner - 2, 0, Math.PI * 2);
      ctx.fillStyle = opts.center || "#0a0f1e";
      ctx.fill();

      // Label on arc midpoint
      const mid = angle + slice / 2;
      const lx = cx + Math.cos(mid) * (outer * 0.78);
      const ly = cy + Math.sin(mid) * (outer * 0.78);
      if (seg.value > 0) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(seg.label || "", lx, ly);
      }
      angle += slice;
    });

    // Center text
    if (opts.centerText) {
      ctx.fillStyle = "#00f5c4";
      ctx.font = "bold 14px 'Courier New'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opts.centerText, cx, cy);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  },

  // ── Radar Chart ──────────────────────────────────────
  radar(canvas, labels, values, opts = {}) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) / 2 - 30;
    const n = labels.length;
    const color = opts.color || "#00f5c4";
    const max = opts.max || 100;

    ctx.clearRect(0, 0, W, H);

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const rr = r * ring / 4;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + rr * Math.cos(a);
        const y = cy + rr * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.stroke();
    }

    // Data
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rv = r * (values[i] / max);
      const x = cx + rv * Math.cos(a);
      const y = cy + rv * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color + "33";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const lx = cx + (r + 16) * Math.cos(a);
      const ly = cy + (r + 16) * Math.sin(a);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "10px 'Courier New'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[i], lx, ly);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
};
