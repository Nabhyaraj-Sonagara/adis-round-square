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

  /* ---------- Globe: coarse continents, the network's schools as gold nodes, ADIS in red ---------- */
  // Rough coastlines as [lon, lat] rings. Coarse on purpose: they only need to read as continents at ASCII size.
  const LAND = [
    // Eurasia, from Iberia east along the Mediterranean, round Arabia and India, up the Pacific coast and back along the Arctic.
    [[-9,43],[-9,37],[-5,36],[0,38],[3,42],[7,43.5],[10,44],[13,41],[16,38],[18,40],[13,45],[19,42],[22,37],[24,38],[26,40],[27,37],[30,36],[36,36],[35,33],[34,29],[39,21],[43,13],[45,13],[52,16],[56,18],[59,22],[56,26],[52,24],[50,27],[48,30],[50,30],[56,27],[62,25],[67,24.5],[68.5,23.5],[69,22.3],[70.5,20.8],[72.3,21.5],[72.7,21],[73,19],[73.5,16],[75,12],[77,8],[78.5,9],[80,13],[80,15.5],[82,17],[85,19.5],[87,21.5],[90,22],[92,21],[94,17],[97,16],[98,10],[100,7],[103,1.5],[104,1.5],[103,4],[101,7],[100,13],[102,12.5],[105,9],[107,11],[109,12],[108,16],[106,19],[108,21.5],[111,21],[114,22.5],[117,23.5],[120,27],[122,30],[121,32],[120,34],[119,35],[122,37],[118,38],[118,39],[121,41],[122,40],[125,40],[127,38],[129,35],[129,38],[128,40],[130,42],[133,43],[137,45],[140,48],[141,52],[137,54],[135,55],[140,59],[148,59],[155,59],[156,51],[160,54],[163,57],[163,60],[170,60],[178,63],[180,65],[180,69],[170,70],[160,70],[150,71],[140,73],[130,71],[120,73],[113,74],[105,77],[100,79],[90,76],[80,73],[70,73],[67,69],[60,70],[50,68],[44,68],[40,66],[34,69],[28,71],[20,70],[14,67],[10,63],[5,62],[5,58],[8,58],[11,59],[12,56],[10,55],[8,54],[5,53],[3,51],[-2,48],[-5,48],[-1,46],[-2,43.5]],
    [[-17,21],[-13,28],[-9,32],[-6,36],[10,37],[11,33],[20,31],[25,32],[32,31],[34,28],[39,19],[43,12],[51,12],[48,5],[40,-3],[39,-8],[40,-15],[35,-20],[33,-26],[28,-33],[20,-35],[18,-32],[12,-18],[13,-10],[9,-1],[9,4],[4,6],[-4,5],[-8,4],[-13,8],[-17,14]],
    [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
    [[-168,66],[-156,71.5],[-140,70],[-128,70],[-115,68],[-95,72],[-85,70],[-80,63],[-94,59],[-90,57],[-82,55],[-79,52],[-77,60],[-70,62],[-64,60],[-56,53],[-60,47],[-66,44],[-70,42],[-74,40],[-76,35],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-98,22],[-95,18],[-90,21],[-87,21],[-88,16],[-84,15],[-83,10],[-80,8],[-78,9],[-80,7],[-85,10],[-92,14],[-105,20],[-110,24],[-112,29],[-117,32],[-120,34],[-124,40],[-124,46],[-123,49],[-130,54],[-135,58],[-140,60],[-147,61],[-152,59],[-158,57],[-164,55],[-158,58],[-165,62],[-165,65]],
    [[-73,78],[-60,82],[-30,83],[-20,80],[-20,72],[-25,69],[-40,65],[-44,60],[-50,62],[-54,67],[-58,75],[-70,77]],
    [[-80,9],[-75,11],[-72,12],[-63,10.5],[-60,8],[-52,5],[-50,1],[-44,-2],[-35,-5],[-35,-9],[-39,-14],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-62,-39],[-65,-42],[-66,-47],[-69,-51],[-68,-55],[-72,-53],[-75,-48],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-1],[-78,2],[-77,7]],
    [[114,-22],[114,-26],[115,-34],[118,-35],[124,-33],[129,-32],[132,-32],[135,-35],[138,-35],[140,-38],[146,-39],[150,-37],[153,-32],[153,-25],[149,-21],[146,-18],[145,-15],[142,-11],[141,-17],[137,-16],[136,-12],[131,-11],[127,-14],[122,-17],[118,-20]],
    [[172,-34],[178,-38],[175,-41],[171,-46],[167,-46],[171,-41]],
    [[130,31],[132,34],[135,34],[140,35],[141,38],[142,42],[145,44],[142,46],[140,42],[139,38],[136,37],[132,35]],
    [[-5,50],[1,51],[2,53],[-1,55],[-2,58],[-5,58],[-6,56],[-3,54],[-5,52]],
    [[-10,52],[-6,52],[-6,55],[-8,55]],
    [[-24,64],[-14,64],[-14,66],[-22,66]],
    [[80,6],[82,7],[81,9.5],[80,9]],
    [[95,5.5],[98,4],[104,-2],[106,-6],[102,-4],[96,2]],
    [[109,1],[111,-3],[116,-4],[119,1],[117,7],[113,3]],
    [[105,-6],[114,-7],[114,-8.5],[106,-7.5]],
    [[131,-1],[138,-2],[147,-6],[150,-10],[142,-9],[138,-8],[132,-3]],
    [[120,18],[122,18],[124,13],[126,7],[122,7],[120,14]],
  ];
  let landMap = null;
  function isLand(latDeg, lonDeg) {
    if (!landMap) {
      // One-degree lookup grid, built once on first use.
      landMap = new Uint8Array(360 * 180);
      const inside = (x, y, ring) => {
        let hit = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [xi, yi] = ring[i], [xj, yj] = ring[j];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
        }
        return hit;
      };
      for (let la = 0; la < 180; la++) for (let lo = 0; lo < 360; lo++) {
        const y = la - 89.5, x = lo - 179.5;
        landMap[la * 360 + lo] = y < -68 || LAND.some((r) => inside(x, y, r)) ? 1 : 0;
      }
    }
    const la = Math.min(179, Math.max(0, Math.floor(latDeg + 90)));
    const lo = ((Math.floor(lonDeg + 180) % 360) + 360) % 360;
    return landMap[la * 360 + lo] === 1;
  }

  function globe() {
    const R = 0.86, deg = 180 / Math.PI;
    const vec = (lat, lon) => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
    // Other member schools: illustrative positions, but always on land.
    const nodes = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // ADIS, Shantigram, Ahmedabad.
    const adisLat = 23.16 / deg, adisLon = 72.54 / deg;
    const adis = vec(adisLat, adisLon);
    const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
    while (nodes.length < 60) {
      const lat = Math.asin(rnd() * 1.5 - 0.6), lon = rnd() * Math.PI * 2 - Math.PI;
      const v = vec(lat, lon);
      if (isLand(lat * deg, lon * deg) && dot(v, adis) < 0.99) nodes.push(v);
    }
    const L = (() => { const v = [-0.55, -0.5, 0.67]; const m = Math.hypot(...v); return v.map((n) => n / m); })();
    const sea = " ..:", ground = ".:-=+";
    const tag = "ADIS";
    let rot = -adisLon, tilt = -0.3, prevT = 0, pdx = 0, pdy = 0;

    const frame = (s) => {
      const dt = prevT ? Math.min(0.1, s.t - prevT) : 0; prevT = s.t;
      if (!s.dragging) rot += dt * 0.18;
      rot += (s.dragX - pdx) * 0.008; pdx = s.dragX;
      tilt = Math.max(-0.9, Math.min(0.9, tilt + (s.dragY - pdy) * 0.004)); pdy = s.dragY;
      s.facing = (((-rot * 180 / Math.PI) % 360) + 540) % 360 - 180;
      s.cosT = Math.cos(tilt); s.sinT = Math.sin(tilt); s.cosR = Math.cos(rot); s.sinR = Math.sin(rot);
      s.pulse = 0.5 + 0.5 * Math.sin(s.t * 4);
      // Where ADIS sits on screen, for the callout: spin, then tilt, the reverse of the shader's mapping.
      const z1 = -adis[0] * s.sinR + adis[2] * s.cosR;
      const nx = adis[0] * s.cosR + adis[2] * s.sinR, ny = adis[1] * s.cosT + z1 * s.sinT, nz = -adis[1] * s.sinT + z1 * s.cosT;
      s.adisVisible = nz > 0.2;
      s.ax = nx * R; s.ay = -ny * R;
    };

    const shader = (x, y, s, c, r) => {
      // Callout: a short leader and the name, to the right of the red dot.
      if (s.adisVisible && Math.abs(y - s.ay) < s.ch / 2) {
        const k = Math.floor((x - s.ax - s.cw * 1.5) / s.cw);
        if (k >= 0 && k < 2) return ["-", rgba(C.red, 1)];
        if (k >= 3 && k < 3 + tag.length) return [tag[k - 3], rgba(C.white, 1)];
      }
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
      const g = [gx, gy, gz], toAdis = dot(adis, g);
      if (toAdis > 0.9993) return ["@", rgba(C.red, 1)];
      if (toAdis > 0.9965 && toAdis < 0.9978) return ["o", rgba(C.red, 0.35 + 0.65 * s.pulse)];
      for (const n of nodes) if (dot(n, g) > 0.9992) return ["o", rgba(C.gold, 0.6 + 0.4 * b)];
      const lat = Math.asin(Math.max(-1, Math.min(1, gy))), lon = Math.atan2(gx, gz);
      if (isLand(lat * deg, lon * deg)) {
        const i = Math.min(ground.length - 1, Math.floor(b * ground.length));
        return [ground[i], mix([200, 170, 208], [250, 246, 251], (b - 0.22) / 0.78, 0.45 + 0.5 * b)];
      }
      const onLat = Math.abs(Math.sin(lat * 6)) < 0.09, onLon = Math.abs(Math.sin(lon * 6)) < 0.09 * (1 + Math.abs(gy) * 3);
      if (onLat || onLon) return [onLat && onLon ? "+" : onLat ? "-" : "|", rgba(C.blueTint, 0.08 + 0.4 * b * b)];
      const i = Math.max(1, Math.floor(b * (sea.length - 0.01)));
      return [sea[i], mix([127, 50, 134], [190, 150, 196], (b - 0.22) / 0.78, 0.35 + 0.45 * b)];
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
