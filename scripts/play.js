/* =========================================================
   play.js — the Playground: three mini-games.
   Catch the Mascot · Emoji Memory Match · Shobhit Quiz
   ========================================================= */

(function () {
  'use strict';

  const S = window.Shobhit || { toast: function () {}, sound: function () {}, confetti: function () {}, achievement: function () {} };

  function $(id) { return document.getElementById(id); }
  function getBest(key) { try { return Number(localStorage.getItem(key) || 0); } catch (e) { return 0; } }
  function setBest(key, val) { try { localStorage.setItem(key, String(val)); } catch (e) {} }

  /* =====================================================
     GAME 1 — Catch the Mascot (whack-a-mole style)
     ===================================================== */
  function initWhack() {
    const grid = $('whackGrid');
    if (!grid) return;
    const startBtn = $('whackStart');
    const scoreEl = $('whackScore');
    const timeEl = $('whackTime');
    const bestEl = $('whackBest');
    const HOLES = 9;
    const DURATION = 20;
    let score = 0, timeLeft = DURATION, running = false;
    let spawnTimer = null, countdown = null;

    for (let i = 0; i < HOLES; i++) {
      const hole = document.createElement('button');
      hole.className = 'whack-hole';
      hole.type = 'button';
      hole.setAttribute('aria-label', 'mascot hole');
      hole.innerHTML = '<img src="assets/mascot.svg" alt="" class="whack-mole" />';
      hole.addEventListener('click', function () {
        if (!running || !hole.classList.contains('up')) return;
        score++;
        scoreEl.textContent = score;
        hole.classList.remove('up');
        S.sound('pop');
        if (!S.reduceMotion) hole.querySelector('.whack-mole').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(0)' }], { duration: 220 });
      });
      grid.appendChild(hole);
    }
    const holes = Array.prototype.slice.call(grid.children);
    bestEl.textContent = getBest('shobhit_whack_best');

    function popRandom() {
      const free = holes.filter(function (h) { return !h.classList.contains('up'); });
      if (!free.length) return;
      const h = free[Math.floor(Math.random() * free.length)];
      h.classList.add('up');
      const life = 700 + Math.random() * 600;
      window.setTimeout(function () { h.classList.remove('up'); }, life);
    }

    function stop() {
      running = false;
      window.clearInterval(spawnTimer);
      window.clearInterval(countdown);
      holes.forEach(function (h) { h.classList.remove('up'); });
      startBtn.textContent = 'Play again ▶';
      startBtn.disabled = false;
      const best = getBest('shobhit_whack_best');
      if (score > best) { setBest('shobhit_whack_best', score); bestEl.textContent = score; S.toast('🏆 New best: ' + score + '!'); }
      S.confetti(70); S.sound('win');
      if (score >= 18) S.achievement('reaction-ace', 'caught ' + score + ' mascots!');
      else S.toast('You caught ' + score + ' mascots! 🎉');
    }

    function start() {
      score = 0; timeLeft = DURATION; running = true;
      scoreEl.textContent = '0'; timeEl.textContent = DURATION;
      startBtn.disabled = true; startBtn.textContent = 'Catching…';
      spawnTimer = window.setInterval(popRandom, 650);
      popRandom();
      countdown = window.setInterval(function () {
        timeLeft--; timeEl.textContent = timeLeft;
        if (timeLeft <= 0) stop();
      }, 1000);
    }

    startBtn.addEventListener('click', start);
  }

  /* =====================================================
     GAME 2 — Emoji Memory Match
     ===================================================== */
  function initMemory() {
    const grid = $('memoryGrid');
    if (!grid) return;
    const startBtn = $('memoryStart');
    const movesEl = $('memoryMoves');
    const bestEl = $('memoryBest');
    const POOL = ['✨', '🦄', '🚀', '🌈', '🔥', '🌸', '🎈', '💎'];
    let first = null, lock = false, moves = 0, matched = 0;

    bestEl.textContent = getBest('shobhit_memory_best') || '—';

    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

    function build() {
      first = null; lock = false; moves = 0; matched = 0;
      movesEl.textContent = '0';
      const deck = shuffle(POOL.concat(POOL));
      grid.innerHTML = '';
      deck.forEach(function (emoji) {
        const card = document.createElement('button');
        card.className = 'mem-card';
        card.type = 'button';
        card.dataset.emoji = emoji;
        card.innerHTML = '<span class="mem-card__face mem-card__back">❓</span><span class="mem-card__face mem-card__front">' + emoji + '</span>';
        card.addEventListener('click', function () { flip(card); });
        grid.appendChild(card);
      });
      startBtn.textContent = 'Restart 🔀';
    }

    function flip(card) {
      if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      S.sound('pop');
      if (!first) { first = card; return; }
      moves++; movesEl.textContent = moves;
      if (first.dataset.emoji === card.dataset.emoji) {
        first.classList.add('matched'); card.classList.add('matched');
        first = null; matched++;
        S.sound('ding');
        if (matched === POOL.length) win();
      } else {
        lock = true;
        const a = first, b = card; first = null;
        window.setTimeout(function () { a.classList.remove('flipped'); b.classList.remove('flipped'); lock = false; }, 800);
      }
    }

    function win() {
      S.confetti(120); S.sound('win');
      const best = getBest('shobhit_memory_best');
      if (!best || moves < best) { setBest('shobhit_memory_best', moves); bestEl.textContent = moves; S.toast('🧠 New record: ' + moves + ' moves!'); }
      else S.toast('🎉 Matched all in ' + moves + ' moves!');
      S.achievement('memory-master', 'cleared in ' + moves + ' moves');
    }

    startBtn.addEventListener('click', build);
  }

  /* =====================================================
     GAME 3 — Shobhit Quiz
     ===================================================== */
  function initQuiz() {
    const box = $('quizBox');
    if (!box) return;
    const QUESTIONS = [
      { q: 'What does the name "Shobhit" mean?', a: ['Adorned / shining', 'Sleepy', 'Loud', 'Hungry'], correct: 0 },
      { q: 'Which language gives us the name Shobhit?', a: ['Latin', 'Sanskrit', 'Greek', 'Old Norse'], correct: 1 },
      { q: 'How many letters are in "Shobhit"?', a: ['5', '6', '7', '8'], correct: 2 },
      { q: 'This site\'s world map uses real coordinates from…', a: ['A guess', 'OpenStreetMap', 'A potato', 'Vibes only'], correct: 1 },
      { q: 'The best way to celebrate being a Shobhit is…', a: ['Drop a map pin', 'Find the Easter eggs', 'Beat the games', 'All of the above'], correct: 3 }
    ];
    let idx = 0, score = 0;

    function render() {
      if (idx >= QUESTIONS.length) return finish();
      const item = QUESTIONS[idx];
      box.innerHTML =
        '<div class="quiz-progress">Question ' + (idx + 1) + ' / ' + QUESTIONS.length + '</div>' +
        '<h3 class="quiz-q">' + item.q + '</h3>' +
        '<div class="quiz-options">' +
          item.a.map(function (opt, i) { return '<button class="quiz-opt" data-i="' + i + '">' + opt + '</button>'; }).join('') +
        '</div>';
      box.querySelectorAll('.quiz-opt').forEach(function (btn) {
        btn.addEventListener('click', function () { answer(Number(btn.dataset.i), btn); });
      });
    }

    function answer(choice, btn) {
      const item = QUESTIONS[idx];
      const opts = box.querySelectorAll('.quiz-opt');
      opts.forEach(function (b) { b.disabled = true; });
      if (choice === item.correct) { btn.classList.add('correct'); score++; S.sound('ding'); }
      else { btn.classList.add('wrong'); opts[item.correct].classList.add('correct'); S.sound('error'); }
      window.setTimeout(function () { idx++; render(); }, 900);
    }

    function finish() {
      const perfect = score === QUESTIONS.length;
      box.innerHTML =
        '<div class="quiz-result">' +
          '<div class="quiz-result__emoji">' + (perfect ? '🏆' : score >= 4 ? '🎉' : score >= 2 ? '😎' : '🌱') + '</div>' +
          '<h3>You scored ' + score + ' / ' + QUESTIONS.length + '</h3>' +
          '<p>' + (perfect ? 'Flawless. A true Shobhit scholar.' : score >= 4 ? 'So close to perfect!' : 'Every Shobhit is a winner. Try again?') + '</p>' +
          '<button class="btn" id="quizRetry">Play again 🔁</button>' +
        '</div>';
      $('quizRetry').addEventListener('click', function () { idx = 0; score = 0; render(); });
      S.confetti(perfect ? 160 : 70); S.sound('win');
      if (score >= 4) S.achievement('quiz-whiz', score + '/' + QUESTIONS.length);
    }

    const startBtn = $('quizStart');
    if (startBtn) startBtn.addEventListener('click', function () { idx = 0; score = 0; render(); });
    else render();
  }

  /* =====================================================
     Achievements board
     ===================================================== */
  function renderAchievements() {
    const board = $('achBoard');
    if (!board || !window.Shobhit) return;
    const meta = window.Shobhit.achievementsMeta || {};
    const total = window.Shobhit.achievementsTotal || Object.keys(meta).length;
    const totalEl = $('achTotal');
    if (totalEl) totalEl.textContent = total;

    function paint() {
      const found = window.Shobhit.getEggs();
      board.innerHTML = Object.keys(meta).map(function (id) {
        const a = meta[id];
        const got = found.indexOf(id) !== -1;
        return '<div class="ach' + (got ? ' is-got' : '') + '" title="' + (got ? a.name : 'Still hidden…') + '">' +
          '<span class="ach__emoji">' + (got ? a.emoji : '❔') + '</span>' +
          '<span class="ach__name">' + (got ? a.name : '???') + '</span></div>';
      }).join('');
    }
    paint();
    // refresh when the tab regains focus (eggs may have been earned elsewhere)
    window.addEventListener('focus', paint);
    window.addEventListener('shobhit:achievement', paint);
  }

  function init() { initWhack(); initMemory(); initQuiz(); renderAchievements(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
