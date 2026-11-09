// Animated missed-call section. Data: 411 Locals study (Jan 2016) — 85 businesses,
// 58 industries, 30 days: 37.8% answered live, 37.8% voicemail, 24.3% no answer.
(function () {
  var root = document.getElementById('why-it-matters');
  if (!root) return;

  var DATA = [
    { k: 'answered',  label: 'Answered by a person', pct: 37.8, cells: 38,
      tip: 'Only about 1 in 3 calls reached a live person.' },
    { k: 'voicemail', label: 'Sent to voicemail',    pct: 37.8, cells: 38,
      tip: 'Many callers hang up instead of leaving a message, and call the next business.' },
    { k: 'missed',    label: 'No answer at all',     pct: 24.3, cells: 24,
      tip: 'Nobody picked up and there was no voicemail. The lead is simply gone.' }
  ];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- tooltip ----
  var tip = document.createElement('div');
  tip.className = 'mc-tip'; tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  function placeTip(e) {
    var x = e.clientX, y = e.clientY;
    if (x === undefined) { var r = e.target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
    tip.style.opacity = 1;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2)) + 'px';
    tip.style.top = (y - h - 14 < 8 ? y + 18 : y - h - 14) + 'px';
  }
  function showTip(e, html) { tip.innerHTML = html; placeTip(e); }
  function dataTip(d) { return '<b>' + d.pct + '% \u2014 ' + d.label + '</b>' + d.tip; }
  var SARAH_TIP = '<b>Answered by Sarah</b>Picked up right away, day or night, and the lead is captured.';
  function hideTip() { tip.style.opacity = 0; }
  function byKey(k) { for (var i = 0; i < DATA.length; i++) if (DATA[i].k === k) return DATA[i]; }

  // ---- stacked bar ----
  var segs = root.querySelectorAll('.mc-seg');
  segs.forEach(function (s) {
    var d = byKey(s.dataset.k);
    s.setAttribute('aria-label', d.pct + '% ' + d.label);
    s.addEventListener('mousemove', function (e) { showTip(e, dataTip(d)); });
    s.addEventListener('focus', function (e) { showTip(e, dataTip(d)); });
    s.addEventListener('mouseleave', hideTip);
    s.addEventListener('blur', hideTip);
  });

  // ---- count-up hero ----
  var hero = root.querySelector('[data-count]');
  function countUp() {
    var target = parseFloat(hero.dataset.count), start = null, dur = 1400;
    if (reduce) { hero.firstChild.nodeValue = target; return; }
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
      hero.firstChild.nodeValue = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- 100-call waffle ----
  var waffle = root.querySelector('.mc-waffle');
  var readout = root.querySelector('.mc-readout');
  var cells = [];
  DATA.forEach(function (d) {
    for (var i = 0; i < d.cells; i++) {
      var c = document.createElement('span');
      c.className = 'mc-cell'; c.dataset.k = d.k; c.dataset.base = d.k;
      c.addEventListener('mousemove', function (e) {
        var cur = e.target.dataset.k;
        showTip(e, cur === 'sarah' ? SARAH_TIP : dataTip(byKey(cur)));
      });
      c.addEventListener('mouseleave', hideTip);
      waffle.appendChild(c); cells.push(c);
    }
  });
  var TYPICAL = 'Out of every 100 calls, about <strong>62 never reach a person</strong>. Each one is a customer who may call your competitor next.';
  var SARAH = 'With Sarah, <strong>all 100 get answered</strong>: she books appointments, takes messages and sends you the lead, 24/7.';

  function fillTypical(animate) {
    cells.forEach(function (c, i) {
      c.dataset.k = c.dataset.base;
      if (animate && !reduce) setTimeout(function () { c.classList.add('on'); }, i * 18);
      else c.classList.add('on');
    });
    readout.innerHTML = TYPICAL;
  }
  function fillSarah() {
    var missedIdx = 0;
    cells.forEach(function (c) {
      if (c.dataset.base === 'answered') return;
      var delay = reduce ? 0 : (missedIdx++) * 22;
      setTimeout(function () { c.dataset.k = 'sarah'; }, delay);
    });
    readout.innerHTML = SARAH;
  }

  var btns = root.querySelectorAll('.mc-toggle button');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if (b.dataset.mode === 'sarah') fillSarah(); else fillTypical(false);
    });
  });

  // ---- start everything when the section scrolls into view ----
  var started = false;
  function start() {
    if (started) return; started = true;
    segs.forEach(function (s, i) {
      var d = byKey(s.dataset.k);
      setTimeout(function () { s.style.width = d.pct + '%'; }, reduce ? 0 : i * 250);
    });
    countUp();
    fillTypical(true);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { start(); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(root);
  } else start();
})();
