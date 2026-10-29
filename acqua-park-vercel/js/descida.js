/* =========================================================================
   DESCIDA NO TOBOGÃ — animação controlada pela rolagem
   -------------------------------------------------------------------------
   COMPUTADOR: quadros em imagem nítida (assets/descida/pc/001.webp ...).
     As imagens ficam guardadas "compactadas" e só o quadro da vez é aberto,
     por isso fica nítido E leve na memória.
   CELULAR: vídeo controlado pela rolagem (assets/video/descida-celular.mp4).

   ✏️ PARA TROCAR A DESCIDA (com ffmpeg):
     computador (quadros):
       ffmpeg -i novo-horizontal.mp4 -vf fps=20 -c:v libwebp -quality 72 assets/descida/pc/%03d.webp
       depois atualize QUADROS_PC abaixo com a quantidade de arquivos gerados
     celular (vídeo):
       ffmpeg -i novo-vertical.mp4 -an -c:v libx264 -crf 20 -g 1 -pix_fmt yuv420p -movflags +faststart assets/video/descida-celular.mp4

   ✏️ PARA MUDAR A DURAÇÃO DA ROLAGEM: altere --ride-length no css/style.css (seção 14)
   ✏️ PARA MUDAR QUANDO CADA TEXTO APARECE: altere data-from / data-to no index.html
   ========================================================================= */
(function () {
  'use strict';

  var RIDE = {
    ARQUIVOS_PC: ['assets/descida/descida-pc-1.bin', 'assets/descida/descida-pc-2.bin'],
    QUADROS_PC: 160,
    VIDEO_CELULAR: 'assets/video/descida-celular.mp4',
    SUAVE: 0.14,      // ✏️ 0.08 = bem macio · 0.25 = mais direto
    FIM: 0.7          // a descida termina em 70% da rolagem; depois vêm a mensagem e o slide do título
  };

  var section = document.querySelector('[data-ride]');
  if (!section) return;

  var video = section.querySelector('.ride__video');
  var canvas = section.querySelector('.ride__canvas');
  var ctx = canvas.getContext('2d');
  var loader = section.querySelector('.ride__loader');
  var bar = section.querySelector('.ride__progress span');
  var steps = Array.prototype.slice.call(section.querySelectorAll('[data-from]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isVertical() { return window.innerHeight > window.innerWidth; }
  var mode = '';            // 'pc' ou 'cel'
  var started = false;
  var shown = 0;
  var running = false;

  /* ---------------- COMPUTADOR: quadros ---------------- */
  var blobs = [];           // imagens guardadas compactadas
  var loadedCount = 0;
  var drawnIndex = -1;
  var decoding = false;
  var pendingIndex = -1;
  var useBitmap = 'createImageBitmap' in window;


  /* Os 160 quadros ficam juntos em UM arquivo (assets/descida/descida-pc.bin).
     A lista abaixo diz onde começa cada quadro e o tamanho dele. */
  var OFFSETS = [[0,0,456660],[0,456660,452368],[0,909028,458678],[0,1367706,485252],[0,1852958,451096],[0,2304054,447122],[0,2751176,429516],[0,3180692,429956],[0,3610648,416042],[0,4026690,411484],[0,4438174,436412],[0,4874586,401220],[0,5275806,393904],[0,5669710,369718],[0,6039428,353190],[0,6392618,349944],[0,6742562,343048],[0,7085610,360686],[0,7446296,311786],[0,7758082,291242],[0,8049324,285534],[0,8334858,267076],[0,8601934,261702],[0,8863636,257270],[0,9120906,222732],[0,9343638,218548],[0,9562186,194046],[0,9756232,172650],[0,9928882,125956],[0,10054838,92672],[0,10147510,60918],[0,10208428,39126],[0,10247554,36420],[0,10283974,37304],[0,10321278,39172],[0,10360450,39496],[0,10399946,42226],[0,10442172,43738],[0,10485910,43346],[0,10529256,43662],[0,10572918,43060],[0,10615978,44172],[0,10660150,46682],[0,10706832,48354],[0,10755186,48342],[0,10803528,48624],[0,10852152,48752],[0,10900904,46434],[0,10947338,48304],[0,10995642,48178],[0,11043820,45230],[0,11089050,46334],[0,11135384,45224],[0,11180608,45336],[0,11225944,45808],[0,11271752,45984],[0,11317736,47488],[0,11365224,46826],[0,11412050,45312],[0,11457362,46800],[0,11504162,46312],[0,11550474,47028],[0,11597502,43882],[0,11641384,47618],[0,11689002,48446],[0,11737448,48258],[0,11785706,46556],[0,11832262,46074],[0,11878336,47570],[0,11925906,47314],[0,11973220,49818],[0,12023038,50760],[0,12073798,47808],[0,12121606,49834],[0,12171440,50678],[0,12222118,48234],[0,12270352,49254],[0,12319606,50144],[0,12369750,49286],[0,12419036,49148],[1,0,46100],[1,46100,46792],[1,92892,47618],[1,140510,48138],[1,188648,48748],[1,237396,49912],[1,287308,47088],[1,334396,46966],[1,381362,49782],[1,431144,48296],[1,479440,47436],[1,526876,48794],[1,575670,48208],[1,623878,48428],[1,672306,49484],[1,721790,53624],[1,775414,51876],[1,827290,55736],[1,883026,56002],[1,939028,56840],[1,995868,60516],[1,1056384,63246],[1,1119630,71384],[1,1191014,80216],[1,1271230,87928],[1,1359158,88862],[1,1448020,96440],[1,1544460,123626],[1,1668086,159464],[1,1827550,167958],[1,1995508,178074],[1,2173582,164762],[1,2338344,166412],[1,2504756,162332],[1,2667088,157472],[1,2824560,158392],[1,2982952,155748],[1,3138700,165188],[1,3303888,148632],[1,3452520,139778],[1,3592298,139632],[1,3731930,137210],[1,3869140,143180],[1,4012320,149042],[1,4161362,137778],[1,4299140,141210],[1,4440350,128508],[1,4568858,113262],[1,4682120,83912],[1,4766032,69640],[1,4835672,66296],[1,4901968,61908],[1,4963876,68106],[1,5031982,57064],[1,5089046,54188],[1,5143234,64470],[1,5207704,59510],[1,5267214,64564],[1,5331778,69928],[1,5401706,59082],[1,5460788,60208],[1,5520996,57224],[1,5578220,59148],[1,5637368,69636],[1,5707004,120490],[1,5827494,124592],[1,5952086,130268],[1,6082354,146460],[1,6228814,153788],[1,6382602,154934],[1,6537536,163972],[1,6701508,159066],[1,6860574,162212],[1,7022786,171968],[1,7194754,168734],[1,7363488,170706],[1,7534194,170344],[1,7704538,175438],[1,7879976,170274],[1,8050250,175016]];  // [arquivo, início, tamanho]

  function loadFrames() {
    blobs = new Array(RIDE.QUADROS_PC);
    loadedCount = 0;
    var parts = RIDE.ARQUIVOS_PC, got = [], totals = [];
    function progress() {
      var g = 0, t = 0; for (var k = 0; k < parts.length; k++) { g += got[k] || 0; t += totals[k] || 0; }
      if (t) loader.style.setProperty('--l', (g / t).toFixed(3));
    }
    Promise.all(parts.map(function (url, k) {
      return fetch(url).then(function (res) {
        if (!res.ok) throw new Error(url + ' não encontrado');
        totals[k] = +res.headers.get('Content-Length') || 0;
        if (!res.body || !window.ReadableStream) return res.arrayBuffer();
        var reader = res.body.getReader(), chunks = [];
        got[k] = 0;
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) return new Blob(chunks).arrayBuffer();
            chunks.push(r.value); got[k] += r.value.length; progress();
            return pump();
          });
        }
        return pump();
      });
    })).then(function (bufs) {
      for (var i = 0; i < OFFSETS.length; i++) {
        var o = OFFSETS[i];
        blobs[i] = new Blob([bufs[o[0]].slice(o[1], o[1] + o[2])], { type: 'image/webp' });
      }
      loadedCount = OFFSETS.length;
      loader.hidden = true;
      section.classList.add('is-ready');
      drawnIndex = -1; tick();
    }).catch(function () {
      // se algo falhar no computador, usa o vídeo do celular como plano B
      mode = 'cel'; section.classList.remove('is-pc'); loadVideo();
    });
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.imageSmoothingQuality = 'high';
    drawnIndex = -1;
  }

  function cover(img, w, h) {
    var iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    var s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  function nearestLoaded(i) {
    if (blobs[i]) return i;
    for (var d = 1; d < RIDE.QUADROS_PC; d++) {
      if (blobs[i - d]) return i - d;
      if (blobs[i + d]) return i + d;
    }
    return -1;
  }

  function showFrame(i) {
    var n = nearestLoaded(i);
    if (n < 0 || n === drawnIndex) return;
    if (decoding) { pendingIndex = n; return; }
    var item = blobs[n];
    if (!(item instanceof Blob)) { cover(item, canvas.width, canvas.height); drawnIndex = n; return; }
    decoding = true;
    var decode = useBitmap ? createImageBitmap(item) : new Promise(function (ok, no) {
      var im = new Image(); im.onload = function () { ok(im); URL.revokeObjectURL(im.src); }; im.onerror = no; im.src = URL.createObjectURL(item);
    });
    decode.then(function (bmp) {
      cover(bmp, canvas.width, canvas.height);
      if (bmp.close) bmp.close();          // libera a memória na hora
      drawnIndex = n;
    }).catch(function () {}).then(function () {
      decoding = false;
      if (pendingIndex >= 0 && pendingIndex !== drawnIndex) { var p = pendingIndex; pendingIndex = -1; showFrame(p); }
    });
  }

  /* ---------------- CELULAR: vídeo ---------------- */
  var duration = 0;
  function loadVideo() {
    duration = 0;
    var src = RIDE.VIDEO_CELULAR;
    function useUrl(url) { video.src = url; video.load(); }
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
      }).then(function (blob) { if (mode === 'cel') useUrl(URL.createObjectURL(blob)); })
        .catch(function () { useUrl(src); });
    } else { video.preload = 'auto'; useUrl(src); }
  }
  video.addEventListener('loadedmetadata', function () {
    duration = video.duration || 0;
    section.classList.add('is-ready');
    loader.hidden = true;
    var p = video.play();
    if (p && p.then) p.then(function () { video.pause(); tick(); }).catch(function () { tick(); });
    else { video.pause(); tick(); }
  });
  function seek(pos) {
    if (!duration) return;
    var t = Math.min(1, pos / RIDE.FIM) * (duration - 0.05);
    if (Math.abs(video.currentTime - t) > 0.02 && !video.seeking) video.currentTime = t;
  }

  /* ---------------- comum ---------------- */
  function setMode() {
    var m = isVertical() ? 'cel' : 'pc';
    if (m === mode) return;
    mode = m;
    section.classList.toggle('is-pc', m === 'pc');
    loader.hidden = false; loader.style.setProperty('--l', 0);
    if (m === 'pc') { sizeCanvas(); if (!blobs.length) loadFrames(); else { loader.hidden = true; } }
    else loadVideo();
  }

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
    section.classList.toggle('is-end', p >= 0.72);
    // onda do slide: sobe entre 86% e 96% da rolagem, acompanhando o dedo/mouse
    var w = Math.min(1, Math.max(0, (p - 0.86) / 0.1));
    section.style.setProperty('--w', w.toFixed(4));
    section.classList.toggle('is-slide', w >= 0.85);
  }

  function loop() {
    var target = reduce ? 1 : progress();
    shown += (target - shown) * RIDE.SUAVE;
    if (Math.abs(target - shown) < 0.0005) shown = target;
    updateUI(target);
    if (mode === 'pc') showFrame(Math.round(Math.min(1, shown / RIDE.FIM) * (RIDE.QUADROS_PC - 1)));
    else seek(shown);
    if (shown !== target || (mode === 'cel' && video.seeking) || decoding) requestAnimationFrame(loop);
    else running = false;
  }

  function tick() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  function onScroll() {
    var r = section.getBoundingClientRect();
    if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
    tick();
  }

  function start() {
    if (started) return;
    started = true;
    setMode();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var lastW = window.innerWidth, lastH = window.innerHeight;
  window.addEventListener('resize', function () {
    if (!started) return;
    var w = window.innerWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 160) return;   // barra do celular aparecendo/sumindo
    lastW = w; lastH = h;
    setMode();
    if (mode === 'pc') { sizeCanvas(); tick(); }
  });

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
