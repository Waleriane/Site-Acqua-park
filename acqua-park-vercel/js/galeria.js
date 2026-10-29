/* =========================================================================
   GALERIAS: carrosséis (arrastar no celular), antes/depois e espaços
   Normalmente você NÃO precisa mexer aqui.
   ========================================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- CARROSSÉIS ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (box) {
    var track = box.querySelector('[data-track]');
    var dotsBox = box.querySelector('[data-dots]');
    var items = Array.prototype.slice.call(track.children);
    var prev = box.querySelector('[data-prev]');
    var next = box.querySelector('[data-next]');

    function scrollable() { return track.scrollWidth - track.clientWidth > 4; }
    function step() { return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth; }
    function current() { return Math.round(track.scrollLeft / Math.max(1, step())); }

    // bolinhas
    var dots = [];
    if (dotsBox) {
      items.forEach(function (_, i) {
        var d = document.createElement('i');
        dotsBox.appendChild(d); dots.push(d);
      });
    }
    function update() {
      box.classList.toggle('is-scrollable', scrollable());
      var c = current();
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === c); });
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4;
    }
    track.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    function go(n) { track.scrollTo({ left: n * step(), behavior: reduce ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { go(current() - 1); });
    if (next) next.addEventListener('click', function () { go(current() + 1); });
    update();

    // passa sozinho (só quando visível e sem a pessoa mexer)
    if (box.hasAttribute('data-autoplay') && !reduce && 'IntersectionObserver' in window) {
      var timer = null, visible = false, touched = false;
      function tickAuto() {
        if (!visible || touched || !scrollable()) return;
        var atEnd = track.scrollLeft > track.scrollWidth - track.clientWidth - 4;
        go(atEnd ? 0 : current() + 1);
      }
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        clearInterval(timer);
        if (visible) timer = setInterval(tickAuto, 3800);
      }, { threshold: 0.4 }).observe(box);
      ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) {
        track.addEventListener(ev, function () { touched = true; }, { passive: true });
      });
    }
  });

  /* ---------- ESPAÇOS (painéis que abrem no computador) ---------- */
  document.querySelectorAll('[data-accordion]').forEach(function (row) {
    var panels = Array.prototype.slice.call(row.children);
    function open(p) { panels.forEach(function (x) { x.classList.toggle('is-open', x === p); }); }
    panels.forEach(function (p) {
      p.addEventListener('mouseenter', function () { open(p); });
      p.addEventListener('focus', function () { open(p); });
      p.addEventListener('click', function () { open(p); });
    });
  });

  /* ---------- ANTES E DEPOIS ---------- */
  document.querySelectorAll('[data-ba]').forEach(function (ba) {
    var range = ba.querySelector('.ba__range');
    function set(v) { ba.style.setProperty('--pos', v + '%'); }
    range.addEventListener('input', function () { set(range.value); ba.classList.add('is-touched'); });
    set(range.value);
  });
  // abas
  document.querySelectorAll('.ba-wrap').forEach(function (wrap) {
    var tabs = wrap.querySelectorAll('[data-ba-tab]');
    var panes = wrap.querySelectorAll('[data-ba-pane]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var n = t.getAttribute('data-ba-tab');
        tabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
        panes.forEach(function (p) { p.hidden = p.getAttribute('data-ba-pane') !== n; });
      });
    });
  });
})();
