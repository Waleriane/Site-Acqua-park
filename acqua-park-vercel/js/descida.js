/* =========================================================================
   DESCIDA NO TOBOGÃ — vídeo controlado pela rolagem
   -------------------------------------------------------------------------
   Como funciona: conforme a pessoa rola, o código avança ou volta o vídeo.
   O vídeo foi preparado com TODOS os quadros "completos" (keyframes), por
   isso ele responde rápido à rolagem e usa pouca memória.

   ✏️ PARA TROCAR O VÍDEO DA DESCIDA (com ffmpeg):
     computador:
       ffmpeg -i novo-horizontal.mp4 -an -vf scale=1600:-2 -c:v libx264 -crf 25 -g 1 -pix_fmt yuv420p -movflags +faststart assets/video/descida-computador.mp4
     celular:
       ffmpeg -i novo-vertical.mp4 -an -c:v libx264 -crf 25 -g 1 -pix_fmt yuv420p -movflags +faststart assets/video/descida-celular.mp4
   (o "-g 1" é o que deixa a rolagem lisa — não remova)

   ✏️ PARA MUDAR A DURAÇÃO DA ROLAGEM: altere --ride-length no css/style.css (seção 14)
   ✏️ PARA MUDAR QUANDO CADA TEXTO APARECE: altere data-from / data-to no index.html
   ========================================================================= */
(function () {
  'use strict';

  var RIDE = {
    VIDEO_COMPUTADOR: 'assets/video/descida-computador.mp4',
    VIDEO_CELULAR: 'assets/video/descida-celular.mp4',
    SUAVE: 0.14,      // ✏️ 0.08 = bem macio · 0.25 = mais direto
    FIM: 0.9          // a descida termina em 90% da rolagem; o resto segura a cena final
  };

  var section = document.querySelector('[data-ride]');
  if (!section) return;

  var video = section.querySelector('.ride__video');
  var loader = section.querySelector('.ride__loader');
  var bar = section.querySelector('.ride__progress span');
  var steps = Array.prototype.slice.call(section.querySelectorAll('[data-from]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isVertical() { return window.innerHeight > window.innerWidth; }
  var currentSrc = '';
  var duration = 0;
  var started = false;
  var shown = 0;
  var running = false;

  /* carrega o vídeo inteiro antes de usar (assim o "avançar/voltar" é instantâneo) */
  function loadVideo() {
    var src = isVertical() ? RIDE.VIDEO_CELULAR : RIDE.VIDEO_COMPUTADOR;
    if (src === currentSrc) return;
    currentSrc = src;
    duration = 0;
    loader.hidden = false;
    loader.style.setProperty('--l', 0);

    function useUrl(url) {
      video.src = url;
      video.load();
    }

    if (window.fetch && location.protocol !== 'file:') {
      fetch(src).then(function (res) {
        if (!res.ok || !res.body || !window.ReadableStream) return res.blob();
        var total = +res.headers.get('Content-Length') || 0, got = 0, chunks = [];
        var reader = res.body.getReader();
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) return new Blob(chunks, { type: 'video/mp4' });
            chunks.push(r.value); got += r.value.length;
            if (total) loader.style.setProperty('--l', (got / total).toFixed(3));
            return pump();
          });
        }
        return pump();
      }).then(function (blob) {
        if (src !== currentSrc) return;
        useUrl(URL.createObjectURL(blob));
      }).catch(function () { useUrl(src); });
    } else {
      // abrindo o arquivo direto do computador (file://): carrega normalmente
      video.preload = 'auto';
      useUrl(src);
    }
  }

  video.addEventListener('loadedmetadata', function () {
    duration = video.duration || 0;
    section.classList.add('is-ready');
    loader.hidden = true;
    // iOS só libera a busca depois de um play
    var p = video.play();
    if (p && p.then) p.then(function () { video.pause(); tick(); }).catch(function () { tick(); });
    else { video.pause(); tick(); }
  });

  function progress() {
    var rect = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 1;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  function updateUI(p) {
    section.style.setProperty('--p', p.toFixed(4));
    if (bar) bar.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    steps.forEach(function (el) {
      var from = parseFloat(el.getAttribute('data-from'));
      var to = el.hasAttribute('data-to') ? parseFloat(el.getAttribute('data-to')) : 2;
      el.classList.toggle('is-on', p >= from && p <= to);
    });
    section.classList.toggle('is-end', p >= 0.88);
  }

  function seek(pos) {
    if (!duration) return;
    var t = Math.min(1, pos / RIDE.FIM) * (duration - 0.05);
    if (Math.abs(video.currentTime - t) > 0.02 && !video.seeking) video.currentTime = t;
  }

  function loop() {
    var target = reduce ? 1 : progress();
    shown += (target - shown) * RIDE.SUAVE;
    if (Math.abs(target - shown) < 0.0005) shown = target;
    updateUI(target);
    seek(shown);
    if (shown !== target || video.seeking) requestAnimationFrame(loop);
    else running = false;
  }

  function tick() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  function onScroll() {
    // só trabalha quando a seção está perto da tela
    var r = section.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
    tick();
  }

  function start() {
    if (started) return;
    started = true;
    loadVideo();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* troca de vídeo só se a tela girar (deitada ↔ em pé) */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (!started || window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    loadVideo();
  });

  /* começa a baixar só quando a pessoa já passou da Hero (não atrasa a abertura do site) */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { start(); io.disconnect(); }
    }, { rootMargin: '300% 0px' });
    io.observe(section);
  } else {
    window.addEventListener('load', start);
  }

  updateUI(reduce ? 1 : 0);
  if (reduce) section.classList.add('is-reduced');
})();
