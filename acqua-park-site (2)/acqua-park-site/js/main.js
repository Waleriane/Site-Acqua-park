/* =========================================================================
   ACQUA PARK RESORT JARU — COMPORTAMENTOS
   Normalmente você NÃO precisa mexer aqui.
   Número do WhatsApp e vídeo ficam em js/config.js
   ========================================================================= */
(function () {
  'use strict';

  var CFG = window.ACQUA_CONFIG || {};
  var header = document.querySelector('[data-header]');
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');

  /* ---------- 1. Links de WhatsApp ---------------------------------------
     Todo elemento com o atributo data-whatsapp recebe o link do vendedor.
     Para usar uma mensagem diferente num botão específico:
     <a data-whatsapp data-whatsapp-msg="Outra mensagem">...</a>          */
  function whatsappLink(msg) {
    var numero = String(CFG.whatsappNumero || '').replace(/\D/g, '');
    var texto = encodeURIComponent(msg || CFG.whatsappMensagem || '');
    return 'https://wa.me/' + numero + (texto ? '?text=' + texto : '');
  }
  document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
    el.setAttribute('href', whatsappLink(el.getAttribute('data-whatsapp-msg')));
  });

  /* ---------- 2. Cabeçalho muda ao rolar --------------------------------- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 3. Menu hamburger (celular/tablet) ------------------------- */
  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) {
      var first = nav.querySelector('a');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 250);
    }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  backdrop.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1180) setMenu(false);
  });

  /* ---------- 4. Rolagem suave para âncoras da mesma página -------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link) return;
    var url = new URL(link.getAttribute('href'), window.location.href);
    var samePage = url.pathname === window.location.pathname ||
      link.getAttribute('href').charAt(0) === '#';
    if (!samePage || !url.hash) return;
    var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    markActive(url.hash.slice(1));
  });

  /* ---------- 5. Item ativo do menu conforme a seção visível ------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav__link'));
  function markActive(id) {
    navLinks.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var on = href.split('#')[1] === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window && document.getElementById('inicio')) {
    var watched = ['inicio', 'socio-remido', 'o-projeto', 'quem-ja-e-socio', 'contato']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) markActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    watched.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 6. Componente de vídeo --------------------------------------
     Usa data-video-src do próprio bloco ou, se não houver, CFG.videoProjetoUrl.
     Aceita .mp4/.webm, YouTube e Vimeo.                                     */
  function embedUrl(src) {
    var yt = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0';
    var vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1';
    return null;
  }
  document.querySelectorAll('[data-video]').forEach(function (box) {
    var src = box.getAttribute('data-video-src') || CFG.videoProjetoUrl;
    var poster = box.querySelector('.video__poster');
    if (poster && CFG.videoCapa && !box.hasAttribute('data-video-src')) poster.src = CFG.videoCapa;
    var cover = box.querySelector('.video__cover');
    if (!cover || !src) return;
    cover.addEventListener('click', function () {
      var player;
      var iframeSrc = embedUrl(src);
      if (iframeSrc) {
        player = document.createElement('iframe');
        player.src = iframeSrc;
        player.title = 'Vídeo do projeto Acqua Park Resort Jaru';
        player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        player.allowFullscreen = true;
      } else {
        player = document.createElement('video');
        player.src = src;
        player.controls = true;
        player.autoplay = true;
        player.playsInline = true;
        if (poster) player.poster = poster.src;
      }
      box.appendChild(player);
      cover.remove();
      if (player.play) { var p = player.play(); if (p && p.catch) p.catch(function () {}); }
    });
  });

  /* ---------- 7. Ano do rodapé ------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 8. Botão flutuante do WhatsApp some enquanto a Hero aparece -- */
  var fab = document.querySelector('.whats-fab');
  var heroSec = document.getElementById('inicio');
  if (fab && heroSec && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      fab.classList.toggle('is-hidden', en[0].intersectionRatio >= 0.35);
      heroSec.classList.toggle('is-off', !en[0].isIntersecting);
    }, { threshold: [0, 0.35] }).observe(heroSec);
  }
})();
