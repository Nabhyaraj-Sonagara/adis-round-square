/* ASCII shaders on canvas. Each shader is a function of a character cell's position (x, y in -1..1,
   aspect-corrected so circles stay round) and time; it returns [character, colour] or null.
   Canvases pause when off screen and render a single still frame for people who prefer reduced motion. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = {
    ink: "31,27,46", purple: "127,50,134", blue: "27,71,138", red: "230,0,72", gold: "213,150,0",
    white: "255,255,255", blueTint: "232,238,247", goldTint: "251,241,217",
  };
  const rgba = (c, a) => `rgba(${c},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
  const mix = (p, q, k, a) => { k = Math.max(0, Math.min(1, k)); return `rgba(${p.map((v, i) => Math.round(v + (q[i] - v) * k)).join(",")},${a.toFixed(3)})`; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  function mount(canvas, shader, opts = {}) {
    const ctx = canvas.getContext("2d");
    const cellH = opts.cell || 14, cellW = Math.round(cellH * 0.66);
    const state = { t: 0, px: 0, py: 0, dragX: 0, dragY: 0, dragging: false, ...opts.state };
    let cols = 0, rows = 0, w = 0, h = 0, unit = 1, raf = 0, visible = true, last = 0;

    function resize() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / cellW); rows = Math.floor(h / cellH);
      unit = Math.min(w, h) / 2;
      state.cw = cellW / unit; state.ch = cellH / unit;
      draw();
    }
    function draw() {
      if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fillRect(0, 0, w, h); } else ctx.clearRect(0, 0, w, h);
      ctx.font = `600 ${Math.round(cellH * 0.92)}px Barlow, "Helvetica Neue", Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const ox = (w - cols * cellW) / 2, oy = (h - rows * cellH) / 2;
      opts.frame?.(state);
      for (let r = 0; r < rows; r++) {
        const cy = oy + (r + 0.5) * cellH, y = (cy - h / 2) / unit;
        for (let c = 0; c < cols; c++) {
          const cx = ox + (c + 0.5) * cellW, x = (cx - w / 2) / unit;
          const out = shader(x, y, state, c, r);
          if (!out) continue;
          ctx.fillStyle = out[1];
          ctx.fillText(out[0], cx, cy);
        }
      }
    }
    function loop(now) {
      raf = 0;
      if (!visible) return;
      if (now - last > 33) { state.t = now / 1000; last = now; draw(); }
      raf = requestAnimationFrame(loop);
    }
    const start = () => { if (!raf && !reduce) raf = requestAnimationFrame(loop); };

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(canvas);

    // Pointer: position for every shader, drag deltas for the globe.
    let lx = 0, ly = 0;
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      state.px = ((e.clientX - r.left) - r.width / 2) / unit;
      state.py = ((e.clientY - r.top) - r.height / 2) / unit;
      if (state.dragging) { state.dragX += e.clientX - lx; state.dragY += e.clientY - ly; lx = e.clientX; ly = e.clientY; if (reduce) draw(); }
    });
    canvas.addEventListener("pointerleave", () => { state.px = 0; state.py = 0; });
    if (opts.draggable) {
      canvas.addEventListener("pointerdown", (e) => { state.dragging = true; lx = e.clientX; ly = e.clientY; canvas.classList.add("dragging"); canvas.setPointerCapture(e.pointerId); });
      const up = () => { state.dragging = false; canvas.classList.remove("dragging"); };
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
    }
    resize();
    start();
    return state;
  }

  /* ---------- Globe: a graticule sphere with the network's schools as nodes, ADIS in red ---------- */
  function globe() {
    const R = 0.86;
    const nodes = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const lat = Math.asin(rnd() * 1.6 - 0.8), lon = rnd() * Math.PI * 2;
      nodes.push([Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)]);
    }
    const adisLat = 23.1 * Math.PI / 180, adisLon = 72.5 * Math.PI / 180;
    const adis = [Math.cos(adisLat) * Math.sin(adisLon), Math.sin(adisLat), Math.cos(adisLat) * Math.cos(adisLon)];
    const L = (() => { const v = [-0.55, -0.5, 0.67]; const m = Math.hypot(...v); return v.map((n) => n / m); })();
    const ramp = " ..::-=";
    let rot = -adisLon, tilt = 0.35, prevT = 0, pdx = 0, pdy = 0;

    const frame = (s) => {
      const dt = prevT ? Math.min(0.1, s.t - prevT) : 0; prevT = s.t;
      if (!s.dragging) rot += dt * 0.18;
      rot += (s.dragX - pdx) * 0.008; pdx = s.dragX;
      tilt = Math.max(-0.9, Math.min(0.9, tilt + (s.dragY - pdy) * 0.004)); pdy = s.dragY;
      s.facing = (((-rot * 180 / Math.PI) % 360) + 540) % 360 - 180;
      s.cosT = Math.cos(tilt); s.sinT = Math.sin(tilt); s.cosR = Math.cos(rot); s.sinR = Math.sin(rot);
      s.pulse = 0.5 + 0.5 * Math.sin(s.t * 4);
    };

    const shader = (x, y, s, c, r) => {
      const d2 = x * x + y * y;
      const ex = x / 1.22, ey = (y - x * 0.18) / 0.3, ring = Math.abs(Math.sqrt(ex * ex + ey * ey) - 1) * 0.3;
      if (d2 > R * R) {
        // Orbit ring with a satellite, then stars.
        if (ring < 0.022) {
          const ang = Math.atan2(ey, ex), sat = (s.t * 0.6) % (Math.PI * 2) - Math.PI;
          if (Math.abs(ang - sat) < 0.09) return ["#", rgba(C.gold, 1)];
          return ["-", rgba(C.gold, 0.55)];
        }
        const hsh = hash(c, r);
        if (hsh < 0.012) return [hsh < 0.004 ? "+" : ".", rgba(C.white, 0.25 + 0.5 * Math.abs(Math.sin(s.t * 1.5 + hsh * 900)))];
        return null;
      }
      // The orbit ring passes in front of the lower half of the globe.
      if (y > 0 && ring < 0.022) return ["-", rgba(C.gold, 0.8)];
      const nx = x / R, ny = -y / R, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const b = 0.22 + 0.78 * Math.max(0, nx * L[0] - ny * L[1] + nz * L[2]);
      // Into the globe's own frame: undo tilt (about x), then spin (about y).
      const y1 = ny * s.cosT - nz * s.sinT, z1 = ny * s.sinT + nz * s.cosT;
      const gx = nx * s.cosR - z1 * s.sinR, gz = nx * s.sinR + z1 * s.cosR, gy = y1;
      if (adis[0] * gx + adis[1] * gy + adis[2] * gz > 0.9985 - s.pulse * 0.0012) return ["@", rgba(C.red, 1)];
      for (const n of nodes) if (n[0] * gx + n[1] * gy + n[2] * gz > 0.9988) return ["o", rgba(C.gold, 0.55 + 0.45 * b)];
      const lat = Math.asin(Math.max(-1, Math.min(1, gy))), lon = Math.atan2(gx, gz);
      const onLat = Math.abs(Math.sin(lat * 6)) < 0.09, onLon = Math.abs(Math.sin(lon * 6)) < 0.09 * (1 + Math.abs(gy) * 3);
      if (onLat || onLon) return [onLat && onLon ? "+" : onLat ? "-" : "|", rgba(C.blueTint, 0.1 + 0.9 * b * b)];
      const i = Math.max(1, Math.floor(b * (ramp.length - 0.01)));
      return [ramp[i], mix([127, 50, 134], [243, 234, 244], (b - 0.22) / 0.78, 0.45 + 0.55 * b)];
    };
    return { shader, frame };
  }

  /* ---------- Sunrise: the crest's sun with light pulsing out along its rays ---------- */
  function sunrise() {
    const rays = [-0.62, -0.25, 0.25, 0.62];
    return (x, y, s) => {
      const dx = x, dy = y - 1.02, d = Math.hypot(dx, dy);
      if (d < 0.46) return [(Math.floor(x / s.cw) + Math.floor(y / s.ch)) % 2 ? "+" : "=", rgba(C.white, 0.28)];
      if (d < 0.62) return [d < 0.55 ? "#" : "=", rgba(C.white, 0.95)];
      const ang = Math.atan2(dx, -dy);
      for (const a of rays) {
        if (Math.abs(ang - a) * d < 0.07) {
          const p = 0.5 + 0.5 * Math.sin(d * 14 - s.t * 5);
          return [p > 0.75 ? "#" : p > 0.4 ? "+" : ":", rgba(C.white, 0.35 + 0.65 * p)];
        }
      }
      const glow = Math.max(0, 1.6 - d) * 0.5;
      const n = hash(Math.floor(x * 40), Math.floor(y * 40));
      return n < 0.08 * glow ? [".", rgba(C.goldTint, 0.25 + 0.3 * Math.sin(s.t * 2 + n * 50))] : null;
    };
  }

  /* ---------- Circle in a square: the Round Square mark, with the six IDEALS orbiting inside ---------- */
  function circleSquare() {
    const ideals = [["I", C.blue], ["D", C.purple], ["E", C.gold], ["A", C.red], ["L", C.ink], ["S", C.ink]];
    let fx = 0, fy = 0;
    return {
      frame(s) { fx += (s.px * 0.12 - fx) * 0.08; fy += (s.py * 0.12 - fy) * 0.08; },
      shader(x, y, s) {
        if (Math.max(Math.abs(x), Math.abs(y)) > 0.93) return ["#", rgba(C.gold, 1)];
        const dx = x - fx, dy = y - fy, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
        const edge = 0.62 + 0.025 * Math.sin(a * 6 + s.t * 2.2);
        if (d > edge) {
          const n = 0.5 + 0.5 * Math.sin(x * 9 + s.t) * Math.sin(y * 9 - s.t * 0.8);
          return [n > 0.66 ? "#" : n > 0.33 ? "=" : "-", rgba(C.red, 0.55 + 0.45 * n)];
        }
        if (d > edge - 0.06) return ["o", rgba(C.red, 1)];
        for (let k = 0; k < 6; k++) {
          const t = s.t * 0.5 + k * Math.PI / 3;
          if (Math.abs(dx - Math.cos(t) * 0.34) < s.cw / 2 && Math.abs(dy - Math.sin(t) * 0.34) < s.ch / 2) return [ideals[k][0], rgba(ideals[k][1], 1)];
        }
        return null;
      },
    };
  }

  window.RSAscii = { mount, globe, sunrise, circleSquare };
})();
