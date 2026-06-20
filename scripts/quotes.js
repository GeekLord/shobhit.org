/* =========================================================
   quotes.js — shared content: fun facts, quotes, the name
   decoder, and the "What kind of Shobhit are you?" generator.
   Auto-wires to whatever elements exist on the current page.
   ========================================================= */

window.ShobhitContent = (function () {
  'use strict';

  const S = window.Shobhit || { toast: function () {}, sound: function () {}, confetti: function () {}, achievement: function () {} };

  /* ---------------- DATA ---------------- */
  const FACTS = [
    { emoji: '✨', title: 'It literally means "adorned"', body: 'Shobhit (शोभित) is Sanskrit for "adorned," "shining," or "beautified." The name basically says you light up the room.' },
    { emoji: '🌞', title: 'Rooted in radiance', body: 'It grows from the Sanskrit root "śobhā" — splendor and grace. Centuries of good vibes packed into one word.' },
    { emoji: '🧭', title: 'A global traveller', body: 'Born in India, Shobhits now live across six continents. Wherever you go, another one is probably nearby.' },
    { emoji: '🔢', title: 'Seven letters of charm', body: 'S-H-O-B-H-I-T. Seven letters — long considered a lucky, balanced number across many cultures.' },
    { emoji: '🎵', title: 'Pleasantly rhythmic', body: 'Three syllables — Sho-bhi-t — with a soft landing. Great for cheering, chanting, and stadium waves.' },
    { emoji: '💎', title: 'Rare by design', body: 'Uncommon enough that meeting another Shobhit feels like spotting a unicorn. Which is exactly why this site exists.' },
    { emoji: '🪔', title: 'Festival of light energy', body: 'The "shining" meaning pairs perfectly with Diwali season. Some Shobhits insist the lamps are just for them.' },
    { emoji: '🧠', title: 'Easy to remember', body: 'People rarely forget a Shobhit. The name sticks, the vibe lingers, the legend grows.' }
  ];

  const LETTERS = [
    { ch: 'S', word: 'Spark', desc: 'You start things. Energy follows you.' },
    { ch: 'H', word: 'Heart', desc: 'Warmth first, always.' },
    { ch: 'O', word: 'Open', desc: 'Curious about everything and everyone.' },
    { ch: 'B', word: 'Brave', desc: 'You try the scary, fun thing.' },
    { ch: 'H', word: 'Humor', desc: 'You keep the room laughing.' },
    { ch: 'I', word: 'Imagine', desc: 'Ideas for breakfast, lunch, and dinner.' },
    { ch: 'T', word: 'Thrive', desc: 'You bloom wherever you are planted.' }
  ];

  const QUOTES = [
    { text: 'Being adorned is not about what you wear, but the light you leave behind.', author: 'A wise Shobhit, probably' },
    { text: 'The world is wide, but the Shobhit network is wider.', author: 'shobhit.org field notes' },
    { text: 'Shine in a way that makes other people want to shine too.', author: 'Unknown' },
    { text: 'A name is a tiny poem your parents wrote about their hopes for you.', author: 'Anonymous' },
    { text: 'Somewhere, another Shobhit is having a great day. You are connected by vibes alone.', author: 'shobhit.org' },
    { text: 'Curiosity is the spark; delight is the fire it lights.', author: 'Unknown' },
    { text: 'You are not lost. You are exploring. There is a difference.', author: 'A friendly mascot' },
    { text: 'Do small things with great sparkle.', author: 'Reworked proverb' },
    { text: 'Every pin on a map is someone saying: I was here, and I was glad.', author: 'shobhit.org' },
    { text: 'The best Easter eggs are the ones you almost did not click.', author: 'A curious Shobhit' },
    { text: 'Brightness multiplies when shared. So does a good name.', author: 'Unknown' },
    { text: 'Be the reason someone believes the internet can still be fun.', author: 'shobhit.org' },
    { text: 'Confidence is just remembering your name means "shining".', author: 'A pep-talk in a bottle' },
    { text: 'Collect moments, drop pins, leave kindness.', author: 'shobhit.org' },
    { text: 'Today is a great day to be exactly who you are.', author: 'Your reflection' }
  ];

  // personality generator ingredients
  const VIBES = ['Sunbeam', 'Stardust', 'Cozy Campfire', 'Electric', 'Ocean Breeze', 'Midnight Neon', 'Cherry Blossom', 'Galaxy Brain', 'Golden Hour', 'Mischief'];
  const ANIMALS = ['Red Panda 🐾', 'Snow Leopard 🐆', 'Otter 🦦', 'Phoenix 🔥', 'Axolotl 🌸', 'Fox 🦊', 'Dolphin 🐬', 'Owl 🦉', 'Corgi 🐕', 'Unicorn 🦄'];
  const POWERS = ['turning awkward silences into laughter', 'finding the best snack in any city', 'making strangers feel like old friends', 'fixing the unfixable Wi-Fi', 'remembering everyone\'s birthday', 'giving advice that actually helps', 'being calm in chaos', 'spotting shortcuts no one else sees', 'hyping up their friends relentlessly', 'sensing when pizza arrives'];
  const COLORS = ['Pastel Pink', 'Electric Purple', 'Aqua Cyan', 'Sunshine Yellow', 'Mint Green', 'Peachy Coral'];
  const EMOJIS = ['✨', '🌈', '🚀', '🌟', '🔥', '🌸', '🎈', '🦄', '🎯', '💎'];

  /* ---------------- FACTS ---------------- */
  function renderFacts(id, limit) {
    const grid = document.getElementById(id || 'factsGrid');
    if (!grid) return;
    const list = limit ? FACTS.slice(0, limit) : FACTS;
    grid.innerHTML = list.map(function (f, i) {
      return '<article class="fact-card reveal d' + ((i % 4) + 1) + '">' +
        '<span class="emoji" aria-hidden="true">' + f.emoji + '</span>' +
        '<h3>' + f.title + '</h3><p>' + f.body + '</p></article>';
    }).join('');
    if (window.Shobhit && window.Shobhit.revealNew) window.Shobhit.revealNew(grid);
  }

  /* ---------------- NAME LETTERS ---------------- */
  function renderLetters(id) {
    const grid = document.getElementById(id || 'letterGrid');
    if (!grid) return;
    grid.innerHTML = LETTERS.map(function (l, i) {
      return '<button class="letter-card reveal d' + ((i % 4) + 1) + '" type="button">' +
        '<span class="letter-card__ch">' + l.ch + '</span>' +
        '<span class="letter-card__word">' + l.word + '</span>' +
        '<span class="letter-card__desc">' + l.desc + '</span></button>';
    }).join('');
    grid.querySelectorAll('.letter-card').forEach(function (c) {
      c.addEventListener('click', function () {
        S.sound('pop');
        if (S.reduceMotion) return;
        c.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(360deg)' }], { duration: 600, easing: 'ease' });
      });
    });
    if (window.Shobhit && window.Shobhit.revealNew) window.Shobhit.revealNew(grid);
  }

  /* ---------------- QUOTES ---------------- */
  let lastIdx = -1;
  function pick() {
    let i = Math.floor(Math.random() * QUOTES.length);
    while (QUOTES.length > 1 && i === lastIdx) i = Math.floor(Math.random() * QUOTES.length);
    lastIdx = i;
    return QUOTES[i];
  }

  let seenQuotes = 0;
  function initQuoteStage(opts) {
    opts = opts || {};
    const textEl = document.getElementById(opts.text || 'quoteText');
    const authorEl = document.getElementById(opts.author || 'quoteAuthor');
    const btn = document.getElementById(opts.button || 'newQuoteBtn');
    const copyBtn = document.getElementById(opts.copy || 'copyQuoteBtn');
    if (!textEl || !authorEl) return;
    let current = null;

    function show(initial) {
      current = pick();
      if (initial) {
        textEl.textContent = '“' + current.text + '”';
        authorEl.textContent = '— ' + current.author;
        return;
      }
      textEl.classList.add('is-out'); authorEl.classList.add('is-out');
      window.setTimeout(function () {
        textEl.textContent = '“' + current.text + '”';
        authorEl.textContent = '— ' + current.author;
        textEl.classList.remove('is-out'); authorEl.classList.remove('is-out');
      }, 460);
      seenQuotes++;
      if (seenQuotes >= 5) S.achievement('quote-collector');
    }

    show(true);
    if (btn) btn.addEventListener('click', function () { show(false); S.sound('pop'); });
    if (copyBtn) copyBtn.addEventListener('click', function () {
      const txt = current ? current.text + ' — ' + current.author : '';
      if (navigator.clipboard && txt) {
        navigator.clipboard.writeText(txt).then(function () { S.toast('📋 Copied to clipboard!'); S.sound('ding'); })
          .catch(function () { S.toast('Could not copy, sorry!'); });
      }
    });

    if (opts.autorotate !== false) {
      let timer = window.setInterval(function () { if (!document.hidden) show(false); }, 8000);
      document.addEventListener('visibilitychange', function () {
        window.clearInterval(timer);
        if (!document.hidden) timer = window.setInterval(function () { if (!document.hidden) show(false); }, 8000);
      });
    }
  }

  function renderQuoteWall(id) {
    const wall = document.getElementById(id || 'quoteWall');
    if (!wall) return;
    wall.innerHTML = QUOTES.map(function (q, i) {
      return '<figure class="qwall-card reveal d' + ((i % 4) + 1) + '">' +
        '<blockquote>“' + q.text + '”</blockquote><figcaption>— ' + q.author + '</figcaption></figure>';
    }).join('');
    if (window.Shobhit && window.Shobhit.revealNew) window.Shobhit.revealNew(wall);
  }

  /* ---------------- PERSONALITY GENERATOR ---------------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }
  function pickFrom(arr, n) { return arr[n % arr.length]; }

  function generatePersona(seedStr) {
    const h = hash((seedStr || 'shobhit').toLowerCase());
    return {
      vibe: pickFrom(VIBES, h),
      animal: pickFrom(ANIMALS, Math.floor(h / 7)),
      power: pickFrom(POWERS, Math.floor(h / 13)),
      color: pickFrom(COLORS, Math.floor(h / 17)),
      emoji: pickFrom(EMOJIS, Math.floor(h / 23)),
      score: 80 + (h % 21) // 80-100, because every Shobhit is great
    };
  }

  function initPersona(opts) {
    opts = opts || {};
    const form = document.getElementById(opts.form || 'personaForm');
    const out = document.getElementById(opts.out || 'personaOut');
    const input = document.getElementById(opts.input || 'personaInput');
    if (!form || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const seed = (input && input.value.trim()) || ('shobhit-' + new Date().toDateString());
      const p = generatePersona(seed);
      out.innerHTML =
        '<div class="persona-card">' +
          '<div class="persona-card__emoji">' + p.emoji + '</div>' +
          '<h3>Your Shobhit Vibe: <span class="grad">' + p.vibe + '</span></h3>' +
          '<ul class="persona-list">' +
            '<li>🎨 Signature colour: <b>' + p.color + '</b></li>' +
            '<li>🌟 Spirit animal: <b>' + p.animal + '</b></li>' +
            '<li>🦸 Superpower: <b>' + p.power + '</b></li>' +
          '</ul>' +
          '<div class="persona-meter"><span style="width:' + p.score + '%"></span></div>' +
          '<p class="persona-score">Shobhit-ness: <b>' + p.score + '%</b> (rounding error — it is really 100%)</p>' +
        '</div>';
      S.confetti(60); S.sound('win');
      const card = out.querySelector('.persona-card');
      if (card && !S.reduceMotion) card.animate([{ transform: 'scale(0.85)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
    });
  }

  /* ---------------- auto init ---------------- */
  function init() {
    if (document.getElementById('factsGrid')) renderFacts('factsGrid', document.getElementById('factsGrid').dataset.limit ? Number(document.getElementById('factsGrid').dataset.limit) : 0);
    if (document.getElementById('letterGrid')) renderLetters('letterGrid');
    if (document.getElementById('quoteText')) initQuoteStage({});
    if (document.getElementById('quoteWall')) renderQuoteWall('quoteWall');
    if (document.getElementById('personaForm')) initPersona({});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  return { FACTS: FACTS, QUOTES: QUOTES, generatePersona: generatePersona, renderFacts: renderFacts };
})();
