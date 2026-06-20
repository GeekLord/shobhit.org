/* =========================================================
   site.js — shared chrome + the global Shobhit toolkit
   Injects nav/footer, manages sound, sparkle cursor,
   achievements, and site-wide Easter eggs.
   Load this FIRST on every page.
   ========================================================= */

window.Shobhit = (function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ============ NAV + FOOTER ============ */
  const PAGES = [
    { href: 'index.html', label: 'Home', icon: '🏠' },
    { href: 'map.html', label: 'World Map', icon: '🗺️' },
    { href: 'name.html', label: 'The Name', icon: '✨' },
    { href: 'quotes.html', label: 'Quotes', icon: '💬' },
    { href: 'play.html', label: 'Playground', icon: '🎮' }
  ];

  function currentPage() {
    let p = location.pathname.split('/').pop() || 'index.html';
    if (p === '') p = 'index.html';
    return p;
  }

  function buildNav() {
    const here = currentPage();
    const links = PAGES.map(function (pg) {
      const active = pg.href === here ? ' aria-current="page"' : '';
      return '<a href="' + pg.href + '"' + active + '><span aria-hidden="true">' + pg.icon + '</span> ' + pg.label + '</a>';
    }).join('');

    const header = document.createElement('header');
    header.className = 'nav';
    header.innerHTML =
      '<a class="nav__logo" href="index.html" aria-label="shobhit.org home"><img src="assets/logo.svg" alt="shobhit.org" /></a>' +
      '<button class="nav__toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>' +
      '<nav class="nav__links" id="navLinks">' + links +
        '<button class="sound-toggle" id="soundToggle" title="Toggle sound" aria-pressed="false">🔇</button>' +
      '</nav>';
    document.body.insertBefore(header, document.body.firstChild);

    const toggle = header.querySelector('.nav__toggle');
    const linksEl = header.querySelector('#navLinks');
    toggle.addEventListener('click', function () {
      const open = linksEl.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    linksEl.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { linksEl.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  function buildFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML =
      '<div class="wrap">' +
        '<img class="mascot-mini wobble" src="assets/mascot.svg" alt="" aria-hidden="true" />' +
        '<h3 style="color:#fff;">Made with 💜 by a <a href="https://shobhit.net/" target="_blank" title="Shobhit Kumar Prabhakar">Shobhit</a> for every Shobhit, everywhere.</h3>' +
        '<p>A fan-made celebration of a great name.</p>' +
        '<p class="footer__nav">' +
          PAGES.map(function (p) { return '<a href="' + p.href + '">' + p.label + '</a>'; }).join('<span>·</span>') +
        '</p>' +
        '<p class="footer__hint">🏆 Achievements unlocked: <b data-egg-count>0</b> / ' + ACH_TOTAL + ' · ' +
          'type <code>party</code> anywhere · try the <code>↑↑↓↓←→←→ba</code> code</p>' +
      '</div>';
    document.body.appendChild(footer);
  }

  /* ============ TOAST ============ */
  let toastTimer = null;
  function toast(message, ms) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.id = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove('show'); }, ms || 3200);
  }

  /* ============ SOUND (WebAudio, opt-in) ============ */
  let audioCtx = null;
  let soundOn = false;
  try { soundOn = localStorage.getItem('shobhit_sound') === 'on'; } catch (e) {}

  function ensureCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  function blip(freq, dur, type, when, gainVal) {
    if (!soundOn) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime + (when || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(gainVal || 0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.18));
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + (dur || 0.18) + 0.02);
  }

  const SOUNDS = {
    pop: function () { blip(620, 0.12, 'triangle'); },
    ding: function () { blip(880, 0.18, 'sine'); blip(1320, 0.22, 'sine', 0.06, 0.12); },
    win: function () { [523, 659, 784, 1046].forEach(function (f, i) { blip(f, 0.16, 'triangle', i * 0.09); }); },
    boop: function () { blip(320, 0.1, 'square', 0, 0.1); },
    error: function () { blip(180, 0.2, 'sawtooth', 0, 0.12); }
  };
  function sound(name) { if (SOUNDS[name]) SOUNDS[name](); }

  function initSoundToggle() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    function paint() {
      btn.textContent = soundOn ? '🔊' : '🔇';
      btn.setAttribute('aria-pressed', String(soundOn));
      btn.title = soundOn ? 'Sound on' : 'Sound off';
    }
    paint();
    btn.addEventListener('click', function () {
      soundOn = !soundOn;
      try { localStorage.setItem('shobhit_sound', soundOn ? 'on' : 'off'); } catch (e) {}
      if (soundOn) { ensureCtx(); sound('ding'); toast('🔊 Sound on'); } else { toast('🔇 Sound off'); }
      paint();
    });
  }

  /* ============ CONFETTI ============ */
  const CONFETTI_COLORS = ['#ff6f91', '#9b5cff', '#27c4d9', '#ffd23f', '#8fe3c4', '#ffb27a'];
  function confetti(amount) {
    if (reduceMotion) { return; }
    const n = amount || 90;
    for (let i = 0; i < n; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const size = 8 + Math.random() * 10;
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.width = size + 'px';
      piece.style.height = size * (0.5 + Math.random()) + 'px';
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      document.body.appendChild(piece);
      const dx = (Math.random() - 0.5) * 260;
      const dy = window.innerHeight + 60;
      const rot = (Math.random() - 0.5) * 1080;
      const dur = 2200 + Math.random() * 1600;
      piece.animate(
        [{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
         { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)', opacity: 0.9 }],
        { duration: dur, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' });
      window.setTimeout(function () { piece.remove(); }, dur + 60);
    }
  }

  /* ============ SPARKLE CURSOR ============ */
  const SPARKLES = ['✦', '✧', '⭐', '✨', '💫'];
  function initSparkleCursor() {
    if (reduceMotion || !finePointer) return;
    let last = 0;
    window.addEventListener('pointermove', function (e) {
      const now = Date.now();
      if (now - last < 60) return;
      last = now;
      const s = document.createElement('span');
      s.className = 'cursor-spark';
      s.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      s.style.fontSize = (10 + Math.random() * 12) + 'px';
      document.body.appendChild(s);
      s.animate(
        [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 0.9 },
         { transform: 'translate(-50%,-140%) scale(0.2)', opacity: 0 }],
        { duration: 700, easing: 'ease-out', fill: 'forwards' });
      window.setTimeout(function () { s.remove(); }, 720);
    }, { passive: true });
  }

  /* ============ ACHIEVEMENTS ============ */
  const ACHIEVEMENTS = {
    'konami': { emoji: '🕹️', name: 'Konami Coder' },
    'party': { emoji: '🌈', name: 'Party Animal' },
    'mascot-pat': { emoji: '🤖', name: 'Mascot Whisperer' },
    'map-pin': { emoji: '📍', name: 'On The Map' },
    'globe-trotter': { emoji: '🌍', name: 'Globe Trotter' },
    'unicorn-mood': { emoji: '🦄', name: 'Unicorn Spotter' },
    'reaction-ace': { emoji: '⚡', name: 'Lightning Reflexes' },
    'memory-master': { emoji: '🧠', name: 'Memory Master' },
    'quiz-whiz': { emoji: '🎯', name: 'Quiz Whiz' },
    'quote-collector': { emoji: '📜', name: 'Quote Collector' }
  };
  const ACH_TOTAL = Object.keys(ACHIEVEMENTS).length;

  function getEggs() {
    try { return JSON.parse(localStorage.getItem('shobhit_eggs_v1') || '[]'); } catch (e) { return []; }
  }
  function saveEggs(arr) {
    try { localStorage.setItem('shobhit_eggs_v1', JSON.stringify(arr)); } catch (e) {}
  }
  function paintEggCount() {
    const found = getEggs().length;
    document.querySelectorAll('[data-egg-count]').forEach(function (el) { el.textContent = found; });
  }
  function achievement(id, customMsg) {
    const eggs = getEggs();
    if (eggs.indexOf(id) !== -1) return false;
    eggs.push(id);
    saveEggs(eggs);
    paintEggCount();
    const a = ACHIEVEMENTS[id] || { emoji: '🏆', name: id };
    toast(a.emoji + ' Achievement unlocked: ' + a.name + (customMsg ? ' — ' + customMsg : '') + ' (' + eggs.length + '/' + ACH_TOTAL + ')', 4200);
    confetti(80);
    sound('win');
    try { window.dispatchEvent(new CustomEvent('shobhit:achievement', { detail: { id: id } })); } catch (e) {}
    return true;
  }

  /* ============ GLOBAL EASTER EGGS ============ */
  function initKonami() {
    const seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let pos = 0;
    document.addEventListener('keydown', function (e) {
      const key = e.key.toLowerCase();
      if (key === seq[pos]) {
        pos++;
        if (pos === seq.length) { pos = 0; achievement('konami', 'super mode!'); confetti(180); document.body.classList.add('party'); window.setTimeout(function(){document.body.classList.remove('party');}, 6000); }
      } else { pos = (key === seq[0]) ? 1 : 0; }
    });
  }
  function initTypeParty() {
    let buffer = '';
    document.addEventListener('keydown', function (e) {
      if (e.key.length !== 1) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      buffer = (buffer + e.key.toLowerCase()).slice(-5);
      if (buffer === 'party') {
        const on = document.body.classList.toggle('party');
        achievement('party');
        if (on) { confetti(120); toast('🌈 Party mode ON! Type it again to stop.'); } else { toast('🌈 Party mode off.'); }
      }
    });
  }

  /* ============ REVEAL ON SCROLL ============ */
  let revealObserver = null;
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { revealObserver.observe(el); });
  }

  // register reveal elements added to the DOM after init (e.g. injected cards)
  function revealNew(scope) {
    const root = scope && scope.querySelectorAll ? scope : document;
    const items = root.querySelectorAll('.reveal');
    if (!revealObserver) { items.forEach(function (el) { el.classList.add('in'); }); return; }
    items.forEach(function (el) { if (!el.classList.contains('in')) revealObserver.observe(el); });
  }

  /* ============ init ============ */
  function init() {
    document.body.classList.add('loaded'); // ensure page is visible no matter what
    try {
      buildNav();
      buildFooter();
      initSoundToggle();
      paintEggCount();
      initSparkleCursor();
      initKonami();
      initTypeParty();
      initReveal();
    } catch (e) {
      if (window.console) console.error('site.js init error', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  return {
    toast: toast,
    confetti: confetti,
    sound: sound,
    achievement: achievement,
    getEggs: getEggs,
    achievementsTotal: ACH_TOTAL,
    achievementsMeta: ACHIEVEMENTS,
    revealNew: revealNew,
    reduceMotion: reduceMotion
  };
})();
