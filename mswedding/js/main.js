(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---- add family contacts here to show the RSVP section ----
     Example: { name: "Name", phone: "919876543210" }  (country code + number, digits only) */
  var RSVP_CONTACTS = [];

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- temple bell (synthesised, no audio file) ---------- */
  var AC = null, soundOn = true;
  function ring(strength, pitch) {
    if (!soundOn) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") AC.resume();
      var now = AC.currentTime, base = pitch || 587;
      var master = AC.createGain();
      master.gain.value = 0.16 * (strength || 1);
      master.connect(AC.destination);
      [[1, 1, 2.6], [2, .55, 1.8], [2.76, .4, 1.3], [5.4, .18, .7]].forEach(function (p) {
        var o = AC.createOscillator(), g = AC.createGain();
        o.type = "sine";
        o.frequency.value = base * p[0];
        g.gain.setValueAtTime(p[1], now);
        g.gain.exponentialRampToValueAtTime(0.0008, now + p[2]);
        o.connect(g); g.connect(master);
        o.start(now); o.stop(now + p[2] + 0.05);
      });
    } catch (e) { /* audio is optional */ }
  }
  /* ---------- background music: starts when the curtain is opened, loops, one button controls all sound ---------- */
  var bgm = $("bgm"), soundBtn = $("soundBtn"), MUSIC_OFF_KEY = "ms-music-off";
  var MUSIC_VOL = 0.75, fadeRaf = 0, musicStarted = false;
  try { if (localStorage.getItem(MUSIC_OFF_KEY) === "1") soundOn = false; } catch (e) {}

  function fadeTo(v, ms, done) {
    cancelAnimationFrame(fadeRaf);
    var from = bgm.volume, t0 = performance.now();
    (function step(t) {
      var k = ms ? Math.min(1, (t - t0) / ms) : 1;
      try { bgm.volume = Math.max(0, Math.min(1, from + (v - from) * k)); } catch (e) {}
      if (k < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  function syncMusicBtn() {
    var playing = !bgm.paused;
    soundBtn.classList.toggle("playing", playing);
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.setAttribute("aria-label", soundOn ? "Music: on. Tap to turn off." : "Music: off. Tap to turn on.");
  }
  function musicStart() {
    if (!soundOn) return;
    musicStarted = true;
    try { bgm.volume = 0; } catch (e) {}
    var p = bgm.play();
    if (p && p.catch) p.catch(function () { /* the browser blocked it; the button will start it on the next tap */ });
    fadeTo(MUSIC_VOL, 2000);
  }
  function musicStop() {
    fadeTo(0, 450, function () { bgm.pause(); syncMusicBtn(); });
  }
  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    try { localStorage.setItem(MUSIC_OFF_KEY, soundOn ? "0" : "1"); } catch (e) {}
    if (soundOn) { musicStart(); ring(.5); } else musicStop();
    syncMusicBtn();
  });
  bgm.addEventListener("play", syncMusicBtn);
  bgm.addEventListener("pause", syncMusicBtn);
  /* be polite: pause when the tab is hidden, resume when it comes back */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (!bgm.paused) bgm.pause(); }
    else if (soundOn && musicStarted && bgm.paused) { var p = bgm.play(); if (p && p.catch) p.catch(function () {}); }
  });
  syncMusicBtn();

  /* ---------- petals / confetti ---------- */
  function burst(count, ms, colors, petals) {
    if (reduce) return;
    var cv = document.createElement("canvas");
    cv.className = "confetti";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d");
    var W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
    var bits = [];
    for (var i = 0; i < count; i++) {
      bits.push({
        x: Math.random() * W, y: -20 - Math.random() * H * 0.6,
        w: petals ? 7 + Math.random() * 6 : 6 + Math.random() * 6,
        h: petals ? 12 + Math.random() * 8 : 9 + Math.random() * 8,
        vy: 1.5 + Math.random() * 2.4, vx: -0.8 + Math.random() * 1.6,
        r: Math.random() * 6.28, vr: -0.1 + Math.random() * 0.2,
        c: colors[(Math.random() * colors.length) | 0]
      });
    }
    var start = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, W, H);
      bits.forEach(function (b) {
        b.x += b.vx + Math.sin(b.y / 40) * 0.4; b.y += b.vy; b.r += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.c;
        if (petals) { ctx.beginPath(); ctx.ellipse(0, 0, b.w / 2, b.h / 2, 0, 0, 6.29); ctx.fill(); }
        else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      });
      if (t - start < ms) requestAnimationFrame(frame);
      else cv.remove();
    })(start);
  }
  var confettiColors = ["#6A0A14", "#C89B3C", "#A96D3C", "#8F1B22", "#F0D98F"];
  var petalColors = ["#F4A300", "#E8890C", "#FFC93C", "#D9480F", "#F6B93B"];


  /* ---------- swinging temple bells: pendulum physics ---------- */
  var bellHint = $("bellHint"), bellTouched = false;
  function bellUsed() {
    if (bellTouched) return;
    bellTouched = true;
  }

  function makeBell(el, o) {
    var th = 0, om = 0, prevOm = 0, drag = false, lastRing = 0;
    var visible = false, raf = 0, prev = 0;
    var DAMP = 0.55;

    function strike(strength) {
      var now = performance.now();
      if (now - lastRing < 280) return;
      lastRing = now;
      ring(strength, o.pitch);
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (x) {} }
    }
    function frame(t) {
      var dt = Math.min(0.033, (t - (prev || t)) / 1000);
      prev = t;
      if (!drag) {
        prevOm = om;
        om += (-o.grav * Math.sin(th) - DAMP * om) * dt;
        th += om * dt;
        /* the clapper strikes each time the swing turns around */
        if (prevOm * om < 0 && Math.abs(th) > 0.16) strike(Math.min(1, Math.abs(th) / 0.5) * 0.6);
      }
      var s = t / 1000 + o.phase;
      var idle = reduce ? 0 : 0.05 * Math.sin(s * o.idleSpeed) + 0.02 * Math.sin(s * 0.7 + 1);
      el.style.transform = "rotate(" + (th + idle).toFixed(4) + "rad)";
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    function start() { if (!raf && !reduce) { prev = 0; raf = requestAnimationFrame(frame); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible) start();
      }).observe(el);
    } else { visible = true; start(); }

    var pivot = { x: 0, y: 0 }, sx = 0, sy = 0, moved = 0, t0 = 0, lastTh = 0, lastT = 0, vel = 0;
    function angleFor(e) {
      var dx = e.clientX - pivot.x, dy = Math.max(70, e.clientY - pivot.y);
      return Math.max(-0.75, Math.min(0.75, Math.atan2(dx, dy)));
    }
    el.addEventListener("pointerdown", function (e) {
      bellUsed();
      drag = true; moved = 0; t0 = performance.now(); sx = e.clientX; sy = e.clientY;
      var st = el.style.transform; el.style.transform = "none";
      var r = el.getBoundingClientRect(); el.style.transform = st;
      pivot = { x: r.left + r.width * o.pivot, y: r.top };
      lastTh = th; lastT = t0; vel = 0; om = 0;
      el.setPointerCapture(e.pointerId);
      el.classList.add("grabbing");
      start();
    });
    el.addEventListener("pointermove", function (e) {
      if (!drag) return;
      moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy));
      if (moved < 6) return;
      var a = angleFor(e), now = performance.now();
      var dtm = Math.max(1, now - lastT) / 1000;
      vel = 0.6 * vel + 0.4 * ((a - lastTh) / dtm);
      lastTh = a; lastT = now; th = a;
    });
    el.addEventListener("pointerup", function (e) {
      if (!drag) return;
      drag = false;
      el.classList.remove("grabbing");
      lastRing = 0;
      if (moved < 6 && performance.now() - t0 < 400) {
        /* a tap: push the bell away from the touched side and ring */
        var r = el.getBoundingClientRect();
        om = (e.clientX > r.left + r.width * 0.5 ? -1 : 1) * 2.8;
        strike(1);
      } else {
        om = Math.max(-6, Math.min(6, vel));
        strike(Math.min(1, 0.4 + Math.abs(th) * 1.2));
      }
      if (reduce) { th = 0; el.style.transform = "none"; }
    });
    el.addEventListener("pointercancel", function () { drag = false; el.classList.remove("grabbing"); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bellUsed(); om = 2.8; lastRing = 0; strike(1); start(); }
    });
  }
  /* four bells: different chain length, weight and pitch, so they swing out of step */
  makeBell($("bellA"), { grav: 20, pitch: 587, phase: 0, idleSpeed: 1.9, pivot: 0.6707 });
  makeBell($("bellB"), { grav: 29, pitch: 740, phase: 2.3, idleSpeed: 2.5, pivot: 0.6707 });
  makeBell($("bellC"), { grav: 24, pitch: 660, phase: 1.1, idleSpeed: 2.2, pivot: 0.3293 });
  makeBell($("bellD"), { grav: 33, pitch: 830, phase: 3.4, idleSpeed: 2.8, pivot: 0.3293 });

  /* ---------- names written out on the home screen ---------- */
  var hero = $("home");
  function writeNames() {
    hero.classList.remove("written");
    void hero.offsetWidth;
    hero.classList.add("written");
  }

  /* ---------- curtain raiser: drag up or tap ---------- */
  var curtain = $("curtain");
  var dock = $("dock");
  root.classList.add("locked");
  var p = 0, opened = false, dragging = false, startY = 0, moved = 0, raf = 0;
  function setP(v) { p = v; curtain.style.setProperty("--p", v.toFixed(3)); }
  function tween(to, ms, done) {
    cancelAnimationFrame(raf);
    var from = p, t0 = performance.now();
    (function step(t) {
      var k = ms ? Math.min(1, (t - t0) / ms) : 1;
      var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setP(from + (to - from) * e);
      if (k < 1) raf = requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  function openCurtain() {
    if (opened) return;
    opened = true;
    musicStart();
    ring(1);
    setTimeout(writeNames, reduce ? 0 : 450);
    setTimeout(function () { bellHint.classList.add("show"); }, reduce ? 300 : 1400);
    tween(1, reduce ? 0 : 1500, function () {
      curtain.classList.add("gone");
      root.classList.remove("locked");
      window.scrollTo(0, 0);
      dock.classList.add("show");
      setTimeout(function () { curtain.classList.add("removed"); }, 600);
    });
  }
  curtain.addEventListener("pointerdown", function (e) {
    if (opened) return;
    dragging = true; startY = e.clientY; moved = 0;
    cancelAnimationFrame(raf);
    curtain.setPointerCapture(e.pointerId);
    curtain.classList.add("grabbing");
  });
  curtain.addEventListener("pointermove", function (e) {
    if (!dragging || opened) return;
    var dy = startY - e.clientY;
    moved = Math.max(moved, Math.abs(dy));
    setP(Math.max(0, Math.min(1, dy / (window.innerHeight * 0.55))));
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    curtain.classList.remove("grabbing");
    if (moved < 8 || p > 0.3) openCurtain(); else tween(0, 350);
  }
  curtain.addEventListener("pointerup", release);
  curtain.addEventListener("pointercancel", release);
  curtain.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") { e.preventDefault(); openCurtain(); }
  });

  /* ---------- tap the names: bell and petals ---------- */
  $("homeTap").addEventListener("click", function () {
    ring(.9);
    writeNames();
    burst(46, 3200, petalColors, true);
  });

  /* ---------- scratch circles ---------- */
  var circles = Array.prototype.slice.call(document.querySelectorAll(".scratch"));
  var finished = 0;
  var section = $("reveal");

  function paintFoil(ctx, size) {
    var g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, "#C9A24B");
    g.addColorStop(0.45, "#F0D98F");
    g.addColorStop(1, "#A67C2E");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    for (var i = 0; i < 320; i++) {
      ctx.fillStyle = "rgba(255,255,255," + (Math.random() * 0.28).toFixed(2) + ")";
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }
    ctx.fillStyle = "rgba(106,10,20,.55)";
    ctx.font = "italic 600 " + Math.round(size * 0.14) + "px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("scratch", size / 2, size / 2);
  }
  function finishCircle(c) {
    if (c.done) return;
    c.done = true;
    c.canvas.classList.add("cleared");
    finished++;
    ring(.35);
    if (finished === circles.length) celebrate();
  }
  function clearedRatio(c) {
    var w = c.canvas.width, h = c.canvas.height, data;
    try { data = c.ctx.getImageData(0, 0, w, h).data; } catch (e) { return 0; }
    var cleared = 0, total = 0;
    for (var i = 3; i < data.length; i += 16) { total++; if (data[i] < 128) cleared++; }
    return total ? cleared / total : 0;
  }
  var cards = circles.map(function (el) {
    var canvas = el.querySelector("canvas");
    var size = el.clientWidth || 96;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(size * dpr);
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    paintFoil(ctx, size);
    var card = { el: el, canvas: canvas, ctx: ctx, done: false };
    var drawing = false, lx = 0, ly = 0, moves = 0;
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (size / r.width), y: (e.clientY - r.top) * (size / r.height) };
    }
    function stroke(x, y) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineWidth = size * 0.2;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
      lx = x; ly = y;
    }
    canvas.addEventListener("pointerdown", function (e) {
      if (card.done) return;
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      var q = pos(e); lx = q.x; ly = q.y;
      stroke(q.x + 0.1, q.y + 0.1);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing || card.done) return;
      var q = pos(e);
      stroke(q.x, q.y);
      if (++moves % 6 === 0 && clearedRatio(card) >= 0.45) finishCircle(card);
    });
    function up() {
      if (!drawing) return;
      drawing = false;
      if (!card.done && clearedRatio(card) >= 0.45) finishCircle(card);
    }
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return card;
  });
  $("revealBtn").addEventListener("click", function () { cards.forEach(finishCircle); });


  /* ---------- photo scratch cards ---------- */
  /* Photos revealed under the foil. Replace the files in /images (keep the names), or change the paths here. */
  var PHOTOS = { p1: "images/moment-1.jpg", p2: "images/moment-2.jpg", p3: "images/moment-3.jpg" };

  var memoEls = Array.prototype.slice.call(document.querySelectorAll(".memo"));
  var memoDone = 0;
  var memoSection = $("memories");

  function paintBrushed(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#DDBB6C");
    g.addColorStop(0.35, "#C4A055");
    g.addColorStop(0.6, "#EBD394");
    g.addColorStop(1, "#B48E3E");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) {
      var y = Math.random() * h, len = w * (0.25 + Math.random() * 0.75), x = Math.random() * (w - len);
      ctx.strokeStyle = Math.random() < 0.7
        ? "rgba(255,255,255," + (0.1 + Math.random() * 0.25).toFixed(2) + ")"
        : "rgba(110,75,20," + (0.06 + Math.random() * 0.1).toFixed(2) + ")";
      ctx.lineWidth = 0.5 + Math.random() * 1.4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (Math.random() - 0.5) * 2); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(90,60,15,.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(9.5, 9.5, w - 19, h - 19);
    ctx.fillStyle = "rgba(80,50,10,.7)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "italic 500 " + Math.max(15, Math.round(w * 0.075)) + "px 'Playfair Display', Georgia, serif";
    ctx.fillText("scratch to reveal", w / 2, h / 2);
  }

  function finishMemo(m) {
    if (m.done) return;
    m.done = true;
    m.canvas.classList.add("cleared");
    memoDone++;
    ring(.3);
    if (memoDone === memoEls.length) {
      memoSection.classList.add("memo-done");
      burst(60, 3600, petalColors, true);
    }
  }

  var memos = memoEls.map(function (el) {
    var key = el.getAttribute("data-key");
    if (PHOTOS[key]) {
      var ph = el.querySelector(".photo");
      ph.style.backgroundImage = 'url("' + PHOTOS[key] + '")';
      var stub = ph.querySelector(".ph"); if (stub) stub.remove();
    }
    var inner = el.querySelector(".memo-in");
    var canvas = el.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var m = { el: el, canvas: canvas, ctx: ctx, done: false, touched: false, w: 0, h: 0, last: 0 };

    function setup() {
      var r = inner.getBoundingClientRect();
      var w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      m.w = w; m.h = h;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      paintBrushed(ctx, w, h);
    }
    setup();
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () { if (!m.touched && !m.done) setup(); }).observe(inner);
    }

    function ratio() {
      var data;
      try { data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; } catch (e) { return 0; }
      var cleared = 0, total = 0;
      for (var i = 3; i < data.length; i += 32) { total++; if (data[i] < 128) cleared++; }
      return total ? cleared / total : 0;
    }
    var drawing = false, lx = 0, ly = 0;
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (m.w / r.width), y: (e.clientY - r.top) * (m.h / r.height) };
    }
    function stroke(x, y) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineWidth = Math.min(m.w, m.h) * 0.13;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
      lx = x; ly = y;
    }
    canvas.addEventListener("pointerdown", function (e) {
      if (m.done) return;
      drawing = true; m.touched = true;
      canvas.setPointerCapture(e.pointerId);
      var q = pos(e); lx = q.x; ly = q.y;
      stroke(q.x + 0.1, q.y + 0.1);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing || m.done) return;
      var q = pos(e);
      stroke(q.x, q.y);
      var now = performance.now();
      if (now - m.last > 160) { m.last = now; if (ratio() >= 0.55) finishMemo(m); }
    });
    function up() {
      if (!drawing) return;
      drawing = false;
      if (!m.done && ratio() >= 0.55) finishMemo(m);
    }
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", function () { drawing = false; });
    return m;
  });
  $("memoAll").addEventListener("click", function () { memos.forEach(finishMemo); });


  /* ---------- brush the petals aside ---------- */
  var brushWrap = $("brushWrap"), petalCan = $("petalCanvas"), fxCan = $("petalFx");
  var petalCtx = petalCan.getContext("2d"), fxCtx = fxCan.getContext("2d");
  var pw = 0, ph = 0, pTouched = false, pDone = false, pLastCheck = 0, pLastSpawn = 0;
  var PETAL_PALETTES = [
    ["#F8F4E8", "#E9E0CB", "#D5C8AC"], ["#F8F4E8", "#ECE3CF", "#DCCFB2"], ["#F6F1E2", "#E6DCC4", "#D2C4A5"],
    ["#F7F2DF", "#EBE2BA", "#E4D48E"],
    ["#E8BDB6", "#D29A94", "#B97873"], ["#EBC3BC", "#D9A29B", "#C08480"],
    ["#EDCBB0", "#E0AA8D", "#CB8A70"]
  ];
  function pickPalette() { return PETAL_PALETTES[(Math.random() * PETAL_PALETTES.length) | 0]; }

  function drawPetal(ctx, L, Wd, pal, shadow) {
    ctx.beginPath();
    ctx.moveTo(0, L * 0.5);
    ctx.bezierCurveTo(Wd * 0.95, L * 0.25, Wd * 0.85, -L * 0.42, Wd * 0.25, -L * 0.5);
    ctx.bezierCurveTo(Wd * 0.1, -L * 0.56, -Wd * 0.1, -L * 0.44, -Wd * 0.25, -L * 0.5);
    ctx.bezierCurveTo(-Wd * 0.85, -L * 0.42, -Wd * 0.95, L * 0.25, 0, L * 0.5);
    ctx.closePath();
    var g = ctx.createLinearGradient(0, L * 0.5, 0, -L * 0.5);
    g.addColorStop(0, pal[2]); g.addColorStop(0.45, pal[1]); g.addColorStop(1, pal[0]);
    if (shadow) { ctx.shadowColor = "rgba(60,40,30,.38)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2; }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(110,90,70,.22)"; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.strokeStyle = "rgba(120,100,80,.14)";
    ctx.beginPath();
    ctx.moveTo(0, L * 0.5); ctx.quadraticCurveTo(0, 0, 0, -L * 0.36);
    ctx.moveTo(0, L * 0.5); ctx.quadraticCurveTo(Wd * 0.3, 0, Wd * 0.4, -L * 0.3);
    ctx.moveTo(0, L * 0.5); ctx.quadraticCurveTo(-Wd * 0.3, 0, -Wd * 0.4, -L * 0.3);
    ctx.stroke();
  }

  function paintPetals() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    petalCan.width = fxCan.width = Math.round(pw * dpr);
    petalCan.height = fxCan.height = Math.round(ph * dpr);
    petalCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    petalCtx.globalCompositeOperation = "source-over";
    petalCtx.fillStyle = "#D8CBB1";
    petalCtx.fillRect(0, 0, pw, ph);
    var n = Math.round(pw * ph * 3.6 / 1680);
    for (var i = 0; i < n; i++) {
      var L = 44 + Math.random() * 30;
      petalCtx.save();
      petalCtx.translate(Math.random() * (pw + 40) - 20, Math.random() * (ph + 40) - 20);
      petalCtx.rotate(Math.random() * 6.283);
      drawPetal(petalCtx, L, L * (0.36 + Math.random() * 0.08), pickPalette(), true);
      petalCtx.restore();
    }
  }
  function sizePetals() {
    var r = brushWrap.getBoundingClientRect();
    var w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h || (w === pw && h === ph)) return;
    pw = w; ph = h;
    paintPetals();
  }
  sizePetals();
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { if (!pTouched && !pDone) sizePetals(); }).observe(brushWrap);
  }

  /* petals that fly off the brush */
  var flyers = [], fxRaf = 0, fxPrev = 0;
  function spawnFlyers(x, y, dx) {
    if (reduce) return;
    for (var k = 0; k < 2; k++) {
      flyers.push({
        x: x, y: y, vx: dx * 0.05 + (Math.random() - 0.5) * 1.8, vy: -0.4 - Math.random() * 1.3,
        r: Math.random() * 6.283, vr: (Math.random() - 0.5) * 0.3, L: 14 + Math.random() * 12,
        age: 0, max: 700 + Math.random() * 600, pal: pickPalette()
      });
    }
    if (!fxRaf) { fxPrev = 0; fxRaf = requestAnimationFrame(fxFrame); }
  }
  function fxFrame(t) {
    var dt = Math.min(40, t - (fxPrev || t)); fxPrev = t;
    fxCtx.clearRect(0, 0, pw, ph);
    flyers = flyers.filter(function (f) { return f.age < f.max; });
    flyers.forEach(function (f) {
      f.age += dt;
      f.vy += 0.03; f.x += f.vx; f.y += f.vy; f.r += f.vr;
      fxCtx.save();
      fxCtx.globalAlpha = Math.max(0, 1 - f.age / f.max);
      fxCtx.translate(f.x, f.y); fxCtx.rotate(f.r);
      drawPetal(fxCtx, f.L, f.L * 0.4, f.pal, false);
      fxCtx.restore();
    });
    if (flyers.length) fxRaf = requestAnimationFrame(fxFrame);
    else { fxRaf = 0; fxCtx.clearRect(0, 0, pw, ph); }
  }

  var tiny = document.createElement("canvas"), tinyCtx = tiny.getContext("2d");
  function petalsLeft() {
    tiny.width = 40; tiny.height = Math.max(20, Math.round(40 * ph / Math.max(1, pw)));
    tinyCtx.clearRect(0, 0, tiny.width, tiny.height);
    tinyCtx.drawImage(petalCan, 0, 0, tiny.width, tiny.height);
    var d;
    try { d = tinyCtx.getImageData(0, 0, tiny.width, tiny.height).data; } catch (e) { return 1; }
    var sum = 0, n = 0;
    for (var i = 3; i < d.length; i += 4) { sum += d[i]; n++; }
    return sum / (n * 255);
  }
  function revealNote() {
    if (pDone) return;
    pDone = true;
    brushWrap.classList.add("done");
    ring(.55);
    burst(70, 4200, ["#F6EFE0", "#E6B8B0", "#D89A93", "#F3E3B0", "#EDCBB0"], true);
  }
  function stamp(x, y) {
    var r = Math.max(34, Math.min(pw, ph) * 0.11);
    var g = petalCtx.createRadialGradient(x, y, r * 0.15, x, y, r);
    g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.6, "rgba(0,0,0,.85)"); g.addColorStop(1, "rgba(0,0,0,0)");
    petalCtx.globalCompositeOperation = "destination-out";
    petalCtx.fillStyle = g;
    petalCtx.beginPath(); petalCtx.arc(x, y, r, 0, 6.29); petalCtx.fill();
  }
  var pBrushing = false, plx = 0, ply = 0;
  function ppos(e) {
    var r = petalCan.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (pw / r.width), y: (e.clientY - r.top) * (ph / r.height) };
  }
  petalCan.addEventListener("pointerdown", function (e) {
    if (pDone) return;
    pBrushing = true; pTouched = true;
    brushWrap.classList.add("started");
    petalCan.setPointerCapture(e.pointerId);
    var q = ppos(e); plx = q.x; ply = q.y;
    stamp(q.x, q.y);
  });
  petalCan.addEventListener("pointermove", function (e) {
    if (!pBrushing || pDone) return;
    var q = ppos(e);
    var dx = q.x - plx, dy = q.y - ply, dist = Math.sqrt(dx * dx + dy * dy);
    var step = Math.max(8, Math.min(pw, ph) * 0.04), n = Math.max(1, Math.ceil(dist / step));
    for (var i = 1; i <= n; i++) stamp(plx + dx * i / n, ply + dy * i / n);
    var now = performance.now();
    if (now - pLastSpawn > 50) { pLastSpawn = now; spawnFlyers(q.x, q.y, dx); }
    plx = q.x; ply = q.y;
    if (now - pLastCheck > 250) { pLastCheck = now; if (petalsLeft() < 0.5) revealNote(); }
  });
  function pUp() {
    if (!pBrushing) return;
    pBrushing = false;
    if (!pDone && petalsLeft() < 0.5) revealNote();
  }
  petalCan.addEventListener("pointerup", pUp);
  petalCan.addEventListener("pointercancel", function () { pBrushing = false; });
  $("noteBtn").addEventListener("click", function () { brushWrap.classList.add("started"); revealNote(); });


  /* ---------- wishes wall ---------- */
  /* curated: wishes everyone sees, written as { text: "...", name: "..." }.
     endpoint: optional https address of a form service (Formspree, Google Apps Script). When set, every wish
     a guest sends is also posted there so Mahati & Sankar receive it. Without it, a wish is saved on that
     guest's own device only. */
  var WISHES_CFG = { endpoint: "", curated: [] };

  var wishForm = $("wishForm"), wishText = $("wishText"), wishName = $("wishName");
  var wishMsg = $("wishMsg"), wall = $("wall"), viewAll = $("viewAll");
  var WISH_KEY = "ms-wishes-v1", ROT = [-1.2, 0.9, -0.6, 1.4, -0.9, 0.7];
  var mine = [];
  try { mine = JSON.parse(localStorage.getItem(WISH_KEY) || "[]"); } catch (e) { mine = []; }
  if (!Array.isArray(mine)) mine = [];

  var PETAL_SVG = '<svg class="pet" aria-hidden="true"><use href="#petal"/></svg>';
  $("wishNote").textContent = /^https:\/\//.test(WISHES_CFG.endpoint)
    ? "Your wish goes straight to Mahati & Sankar."
    : "Wishes you leave are saved on this device.";

  function renderWishes(bloomFirst) {
    var list = mine.concat(WISHES_CFG.curated);
    wall.textContent = "";
    if (!list.length) {
      var e = document.createElement("div");
      e.className = "wish empty";
      e.textContent = "Your wish will bloom here.";
      wall.appendChild(e);
    }
    list.forEach(function (w, i) {
      var a = document.createElement("article");
      a.className = "wish" + (i % 2 ? " alt" : "") + (bloomFirst && i === 0 ? " bloom" : "");
      a.style.setProperty("--rot", ROT[i % ROT.length] + "deg");
      a.insertAdjacentHTML("beforeend", PETAL_SVG);
      var q = document.createElement("blockquote"); q.textContent = w.text;
      var c = document.createElement("cite"); c.textContent = w.name;
      a.appendChild(q); a.appendChild(c);
      wall.appendChild(a);
    });
    var many = list.length > 4;
    viewAll.hidden = !many;
    if (many) {
      var open = !wall.classList.contains("collapsed");
      viewAll.innerHTML = (open ? "Show fewer" : "View all wishes (" + list.length + ")") +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18L18 6M9 6h9v9"/></svg>';
    }
  }
  renderWishes(false);

  viewAll.addEventListener("click", function () {
    var open = wall.classList.toggle("collapsed") === false;
    viewAll.setAttribute("aria-expanded", String(open));
    renderWishes(false);
  });
  wishText.addEventListener("input", function () { $("wishLeft").textContent = 280 - wishText.value.length; });

  wishForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = wishText.value.trim(), name = wishName.value.trim();
    if (!text) { wishMsg.textContent = "Write a few words first."; wishText.focus(); return; }
    if (!name) { wishMsg.textContent = "Add your name so they know who it is from."; wishName.focus(); return; }
    mine.unshift({ text: text.slice(0, 280), name: name.slice(0, 40) });
    try { localStorage.setItem(WISH_KEY, JSON.stringify(mine.slice(0, 50))); } catch (x) {}
    var sent = /^https:\/\//.test(WISHES_CFG.endpoint);
    if (sent) {
      try {
        fetch(WISHES_CFG.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ name: name, message: text })
        }).catch(function () {});
      } catch (x) {}
    }
    wishText.value = ""; $("wishLeft").textContent = "280";
    wishMsg.textContent = sent ? "Sent to Mahati & Sankar. Thank you!" : "Thank you! Your wish is on the wall.";
    renderWishes(true);
    ring(.35);
    burst(26, 2400, petalColors, true);
  });

  /* ---------- live countdown ---------- */
  var target = new Date("2026-10-24T19:00:00+05:30").getTime();
  var cdTimer = 0;
  function tick() {
    var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    $("cdD").textContent = Math.floor(s / 86400);
    $("cdH").textContent = Math.floor(s % 86400 / 3600);
    $("cdM").textContent = Math.floor(s % 3600 / 60);
    $("cdS").textContent = s % 60;
  }
  function celebrate() {
    section.classList.add("is-revealed");
    if (target > Date.now()) { tick(); cdTimer = setInterval(tick, 1000); }
    else $("count").style.display = "none";
    ring(.8);
    burst(90, 4500, confettiColors, false);
  }

  /* ---------- schedule entrance: hairlines draw, dates count up ---------- */
  var finale = $("details");
  var nums = Array.prototype.slice.call(finale.querySelectorAll("[data-count]"));
  if ("IntersectionObserver" in window && !reduce) {
    nums.forEach(function (n) { n.textContent = "0"; });
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      finale.classList.add("in");
      nums.forEach(function (n, i) {
        var to = +n.getAttribute("data-count"), t0 = performance.now() + 400 + i * 650, dur = 900;
        (function step(t) {
          var k = Math.max(0, Math.min(1, (t - t0) / dur));
          n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.35 }).observe(finale);
  } else {
    finale.classList.add("in");
  }

  /* ---------- calendar, share ---------- */
  var place = "Sree Varaaham Hall, Jawaharlal Nehru Road, Koyambedu, Chennai - 107";
  var events = {
    reception: { title: "Reception – Mahati & Sankar", dates: "20261024T190000/20261024T220000" },
    muhurtham: { title: "Muhurtham – Mahati & Sankar", dates: "20261025T090000/20261025T103000" }
  };
  Array.prototype.forEach.call(document.querySelectorAll("[data-cal]"), function (a) {
    var ev = events[a.getAttribute("data-cal")];
    a.href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(ev.title) + "&dates=" + ev.dates +
      "&ctz=Asia%2FKolkata&location=" + encodeURIComponent(place);
  });
  var calBtn = $("calBtn"), calPop = $("calPop");
  calBtn.addEventListener("click", function () {
    var open = calPop.classList.toggle("open");
    calBtn.setAttribute("aria-expanded", String(open));
  });
  var pageUrl = "";
  try { pageUrl = window.top.location.href; } catch (e) { pageUrl = document.referrer || window.location.href; }
  $("shareBtn").href = "https://wa.me/?text=" + encodeURIComponent(
    "You are invited to the wedding of Mahati & Sankar, 24–25 October 2026, Chennai. " + pageUrl);

  /* ---------- accordions ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".acc"), function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      var hint = btn.querySelector("small");
      if (hint) hint.textContent = open ? "Tap to open" : "Tap to close";
    });
  });

  /* ---------- dock: highlight the section in view ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-spy]"));
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("data-spy") === en.target.id); });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    links.forEach(function (l) { var s = $(l.getAttribute("data-spy")); if (s) spy.observe(s); });
  }

  /* ---------- RSVP ---------- */
  if (RSVP_CONTACTS.length) {
    var list = $("rsvpList");
    RSVP_CONTACTS.forEach(function (c) {
      var a = document.createElement("a");
      a.className = "btn";
      a.href = "https://wa.me/" + String(c.phone).replace(/\D/g, "");
      a.target = "_blank"; a.rel = "noopener";
      a.textContent = "WhatsApp " + c.name;
      list.appendChild(a);
    });
    $("rsvp").hidden = false;
  }
})();