/* =========================================================
   home.js — home page flourishes: live stats + mascot pats
   ========================================================= */

(function () {
  'use strict';
  const S = window.Shobhit || { toast: function () {}, sound: function () {}, achievement: function () {} };

  function fillStats() {
    // try the server first, fall back to localStorage count
    fetch('api/pins', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { paint(d.pins || []); })
      .catch(function () {
        let pins = [];
        try { pins = JSON.parse(localStorage.getItem('shobhit_pins_v2') || '[]'); } catch (e) {}
        if (!pins.length) pins = new Array(12); // seed count
        paint(pins);
      });
  }

  function paint(pins) {
    const total = pins.length;
    const places = pins[0] && pins[0].place
      ? new Set(pins.map(function (p) { return (p.place || '').toLowerCase(); })).size
      : total;
    countTo('[data-stat="pins"]', total);
    countTo('[data-stat="places"]', places || total);
  }

  function countTo(sel, target) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (S.reduceMotion) { el.textContent = target; return; }
      let cur = 0;
      const step = Math.max(1, Math.round(target / 30));
      const t = setInterval(function () {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = cur;
      }, 30);
    });
  }

  function mascotPats() {
    const mascot = document.querySelector('.hero__mascot');
    if (!mascot) return;
    let clicks = 0;
    mascot.title = 'Pat the mascot?';
    mascot.addEventListener('click', function () {
      clicks++;
      S.sound && S.sound('boop');
      if (!S.reduceMotion) mascot.animate(
        [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-26px) rotate(8deg)' }, { transform: 'translateY(0) rotate(0)' }],
        { duration: 500, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
      if (clicks === 7) S.achievement('mascot-pat', 'it giggled!');
      else if (clicks < 7) S.toast('boop! (' + clicks + '/7)');
    });
  }

  // mascot pupils track the cursor
  function eyeFollow() {
    const svg = document.querySelector('.hero__mascot');
    if (!svg || S.reduceMotion) return;
    const eyes = [
      { el: svg.querySelector('#mPupilL'), cx: 99, cy: 124 },
      { el: svg.querySelector('#mPupilR'), cx: 148, cy: 124 }
    ];
    if (!eyes[0].el || !eyes[1].el) return;
    const VBW = 240, VBH = 282, VB_MIN_Y = -22, MAX = 4.6;
    let mx = window.innerWidth / 2, my = window.innerHeight / 3, raf = null;

    function update() {
      raf = null;
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      eyes.forEach(function (eye) {
        const ex = rect.left + (eye.cx / VBW) * rect.width;
        const ey = rect.top + ((eye.cy - VB_MIN_Y) / VBH) * rect.height;
        const dx = mx - ex, dy = my - ey;
        const dist = Math.hypot(dx, dy) || 1;
        const intensity = Math.min(1, dist / 170);
        const ox = (dx / dist) * MAX * intensity;
        const oy = (dy / dist) * MAX * intensity;
        eye.el.setAttribute('transform', 'translate(' + ox.toFixed(2) + ' ' + oy.toFixed(2) + ')');
      });
    }
    function onMove(e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', function () {
      eyes.forEach(function (eye) { eye.el.setAttribute('transform', 'translate(0 0)'); });
    });
  }

  // hills + clouds follow cursor with parallax ripple
  function sceneParallax() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const hillA = document.getElementById('hillA');
    const hillB = document.getElementById('hillB');
    const hillC = document.getElementById('hillC');
    const cloudA = document.querySelector('.hero-cloud--a');
    const cloudB = document.querySelector('.hero-cloud--b');
    const cloudC = document.querySelector('.hero-cloud--c');
    
    if (!hillA || !hillB || !hillC) return;

    // Disable CSS animations on clouds (hills no longer have CSS animations)
    [cloudA, cloudB, cloudC].forEach(function (el) {
      if (el) el.style.setProperty('animation', 'none', 'important');
    });

    let targetX = 0.5, targetY = 0.5;
    let currentX = 0.5, currentY = 0.5;
    let isAnimating = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);

      const hx = (currentX - 0.5) * 2;
      const hy = (currentY - 0.5) * 2;

      // Hills - back moves most, front least (depth parallax)
      hillA.setAttribute('transform', 'translate(' + (hx * 50) + ', ' + (hy * 15) + ')');
      hillB.setAttribute('transform', 'translate(' + (hx * 30) + ', ' + (hy * 10) + ')');
      hillC.setAttribute('transform', 'translate(' + (hx * 15) + ', ' + (hy * 5) + ')');

      // Clouds move opposite direction
      if (cloudA) cloudA.setAttribute('transform', 'translate(' + (-hx * 40) + ', ' + (hy * 12) + ')');
      if (cloudB) cloudB.setAttribute('transform', 'translate(' + (-hx * 25) + ', ' + (hy * 8) + ')');
      if (cloudC) cloudC.setAttribute('transform', 'translate(' + (-hx * 15) + ', ' + (hy * 5) + ')');

      if (Math.abs(currentX - targetX) > 0.001 || Math.abs(currentY - targetY) > 0.001) {
        requestAnimationFrame(animate);
      } else {
        isAnimating = false;
      }
    }

    function startAnimation() {
      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animate);
      }
    }

    function onMouseMove(e) {
      const hero = document.querySelector('.hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
      
      targetX = Math.max(0, Math.min(1, targetX));
      targetY = Math.max(0, Math.min(1, targetY));
      
      startAnimation();
    }

    function onMouseLeave() {
      targetX = 0.5;
      targetY = 0.5;
      startAnimation();
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('blur', onMouseLeave);
    
    startAnimation();
  }

  function init() { fillStats(); mascotPats(); eyeFollow(); sceneParallax(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
