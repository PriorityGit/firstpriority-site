// Client-results chart: Google Business Profile stats for a local towing company
// (name withheld), Jun–Oct 2026. Values read from the profile's monthly charts; they
// sum to the profile totals (408 interactions, 207 direction requests).
// November is omitted because the month is still in progress.
(function () {
  var root = document.getElementById('results');
  if (!root) return;

  var MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  var SERIES = [
    { label: 'Profile interactions', color: '#00d4ff', vals: [24, 21, 98, 129, 136], area: true, delay: 0 },
    { label: 'Direction requests',   color: '#00ff9d', vals: [0, 0, 73, 61, 73],     delay: 350 }
  ];
  var MAX = 160, TICKS = [40, 80, 120, 160];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var svg = root.querySelector('.cs-chart svg');
  var W, H, L = 34, R = 14, T = 30, B = 28;
  var shown = SERIES.map(function () { return [0, 0, 0, 0, 0]; });

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  }
  function x(i) { return L + i * (W - L - R) / (MONTHS.length - 1); }
  function y(v) { return T + (H - T - B) * (1 - v / MAX); }

  // ---- tooltip (shares the .mc-tip style) ----
  var tip = document.createElement('div');
  tip.className = 'mc-tip'; tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  function showTip(e, html) {
    tip.innerHTML = html; tip.style.opacity = 1;
    var r = e.target.getBoundingClientRect();
    var cx = e.clientX !== undefined ? e.clientX : r.left + r.width / 2, cy = e.clientY !== undefined ? e.clientY : r.top;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, cx - w / 2)) + 'px';
    tip.style.top = (cy - h - 14 < 8 ? cy + 18 : cy - h - 14) + 'px';
  }
  function hideTip() { tip.style.opacity = 0; }

  // ---- static frame + series shapes, sized 1:1 to the container so text stays crisp ----
  var parts = [];
  function build() {
    W = Math.round(Math.max(300, Math.min(720, svg.parentNode.clientWidth - 2)));
    H = W < 500 ? 230 : 270;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var defs = el('defs', {});
    var g = el('linearGradient', { id: 'csArea', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#00d4ff', 'stop-opacity': 0.35 }, g);
    el('stop', { offset: 1, 'stop-color': '#00d4ff', 'stop-opacity': 0 }, g);

    var split = (x(1) + x(2)) / 2;
    el('rect', { x: L, y: T, width: split - L, height: H - T - B, class: 'cs-zone-before' });
    el('rect', { x: split, y: T, width: W - R - split, height: H - T - B, class: 'cs-zone-after' });
    el('text', { x: (L + split) / 2, y: T - 10, class: 'cs-zone-label', 'text-anchor': 'middle' }).textContent = 'BEFORE';
    el('text', { x: (split + W - R) / 2, y: T - 10, class: 'cs-zone-label after', 'text-anchor': 'middle' }).textContent = 'AFTER';

    TICKS.forEach(function (t) {
      el('line', { x1: L, x2: W - R, y1: y(t), y2: y(t), class: 'cs-grid' });
      el('text', { x: L - 6, y: y(t) + 4, class: 'cs-axis', 'text-anchor': 'end' }).textContent = t;
    });
    el('line', { x1: L, x2: W - R, y1: y(0), y2: y(0), class: 'cs-base' });
    MONTHS.forEach(function (m, i) {
      el('text', { x: x(i), y: H - 8, class: 'cs-axis', 'text-anchor': i === 0 ? 'start' : i === MONTHS.length - 1 ? 'end' : 'middle' }).textContent = m;
    });
    el('line', { x1: split, x2: split, y1: T - 4, y2: H - B, class: 'cs-split' });

    parts = SERIES.map(function (s) {
      var p = {};
      if (s.area) p.area = el('path', { class: 'cs-area', fill: 'url(#csArea)' });
      p.line = el('path', { class: 'cs-line' }); p.line.style.stroke = s.color;
      p.dots = s.vals.map(function (v, i) {
        var d = el('circle', { r: 4.5, class: 'cs-dot' }); d.style.stroke = s.color;
        var hit = el('circle', { r: 14, class: 'cs-hit', tabindex: 0 });
        var html = '<b>' + MONTHS[i] + ' 2026</b>' + s.label + ': ' + v;
        hit.addEventListener('mousemove', function (e) { showTip(e, html); });
        hit.addEventListener('focus', function (e) { showTip(e, html); });
        hit.addEventListener('mouseleave', hideTip);
        hit.addEventListener('blur', hideTip);
        return { dot: d, hit: hit };
      });
      return p;
    });
    render();
  }

  function render() {
    SERIES.forEach(function (s, si) {
      var v = shown[si], p = parts[si];
      var pts = v.map(function (val, i) { return x(i).toFixed(1) + ',' + y(val).toFixed(1); });
      p.line.setAttribute('d', 'M' + pts.join(' L'));
      if (p.area) p.area.setAttribute('d', 'M' + x(0) + ',' + y(0) + ' L' + pts.join(' L') + ' L' + x(v.length - 1) + ',' + y(0) + ' Z');
      p.dots.forEach(function (d, i) {
        d.dot.setAttribute('cx', x(i)); d.dot.setAttribute('cy', y(v[i]));
        d.hit.setAttribute('cx', x(i)); d.hit.setAttribute('cy', y(v[i]));
      });
    });
  }

  // ---- the climb: each point rises from the baseline, sweeping left to right ----
  function climb() {
    var t0 = null, STAGGER = 220, DUR = 900;
    var total = DUR + STAGGER * (MONTHS.length - 1) + 350;
    function ease(p) { return 1 - Math.pow(1 - p, 3); }
    function step(t) {
      if (!t0) t0 = t;
      var el2 = t - t0;
      SERIES.forEach(function (s, si) {
        s.vals.forEach(function (target, i) {
          var p = Math.max(0, Math.min(1, (el2 - s.delay - i * STAGGER) / DUR));
          shown[si][i] = target * ease(p);
        });
      });
      render();
      if (el2 < total) requestAnimationFrame(step);
    }
    if (reduce) { shown = SERIES.map(function (s) { return s.vals.slice(); }); render(); }
    else requestAnimationFrame(step);
  }

  function countUp(node) {
    var target = parseFloat(node.dataset.count), t0 = null, dur = 1600;
    if (reduce) { node.textContent = target; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  build();
  var started = false, rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (Math.abs(svg.parentNode.clientWidth - 2 - W) > 24) build(); }, 150);
  });
  function start() {
    if (started) return; started = true;
    root.classList.add('cs-go');
    climb();
    root.querySelectorAll('[data-count]').forEach(countUp);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { start(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(root.querySelector('.cs-chart'));
  } else start();
})();
