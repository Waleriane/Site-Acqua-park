/* =========================================================================
   DESCIDA NO TOBOGÃ — animação controlada pela rolagem
   -------------------------------------------------------------------------
   Os quadros do vídeo ficam empacotados em poucos arquivos .bin
   (assets/descida). Computador usa o vídeo horizontal, celular o vertical.
   Conforme a pessoa rola, o código desenha o quadro correspondente.

   ✏️ DURAÇÃO DA ROLAGEM: --ride-length no css/style.css
   ✏️ QUANDO CADA TEXTO APARECE: data-from / data-to no index.html
   ========================================================================= */
(function () {
  'use strict';

  var SETS = {
    pc:  { files: ['assets/descida/descida-pc-1.bin', 'assets/descida/descida-pc-2.bin'], offsets: [[0,0,456660],[0,456660,452368],[0,909028,458678],[0,1367706,485252],[0,1852958,451096],[0,2304054,447122],[0,2751176,429516],[0,3180692,429956],[0,3610648,416042],[0,4026690,411484],[0,4438174,436412],[0,4874586,401220],[0,5275806,393904],[0,5669710,369718],[0,6039428,353190],[0,6392618,349944],[0,6742562,343048],[0,7085610,360686],[0,7446296,311786],[0,7758082,291242],[0,8049324,285534],[0,8334858,267076],[0,8601934,261702],[0,8863636,257270],[0,9120906,222732],[0,9343638,218548],[0,9562186,194046],[0,9756232,172650],[0,9928882,125956],[0,10054838,92672],[0,10147510,60918],[0,10208428,39126],[0,10247554,36420],[0,10283974,37304],[0,10321278,39172],[0,10360450,39496],[0,10399946,42226],[0,10442172,43738],[0,10485910,43346],[0,10529256,43662],[0,10572918,43060],[0,10615978,44172],[0,10660150,46682],[0,10706832,48354],[0,10755186,48342],[0,10803528,48624],[0,10852152,48752],[0,10900904,46434],[0,10947338,48304],[0,10995642,48178],[0,11043820,45230],[0,11089050,46334],[0,11135384,45224],[0,11180608,45336],[0,11225944,45808],[0,11271752,45984],[0,11317736,47488],[0,11365224,46826],[0,11412050,45312],[0,11457362,46800],[0,11504162,46312],[0,11550474,47028],[0,11597502,43882],[0,11641384,47618],[0,11689002,48446],[0,11737448,48258],[0,11785706,46556],[0,11832262,46074],[0,11878336,47570],[0,11925906,47314],[0,11973220,49818],[0,12023038,50760],[0,12073798,47808],[0,12121606,49834],[0,12171440,50678],[0,12222118,48234],[0,12270352,49254],[0,12319606,50144],[0,12369750,49286],[0,12419036,49148],[1,0,46100],[1,46100,46792],[1,92892,47618],[1,140510,48138],[1,188648,48748],[1,237396,49912],[1,287308,47088],[1,334396,46966],[1,381362,49782],[1,431144,48296],[1,479440,47436],[1,526876,48794],[1,575670,48208],[1,623878,48428],[1,672306,49484],[1,721790,53624],[1,775414,51876],[1,827290,55736],[1,883026,56002],[1,939028,56840],[1,995868,60516],[1,1056384,63246],[1,1119630,71384],[1,1191014,80216],[1,1271230,87928],[1,1359158,88862],[1,1448020,96440],[1,1544460,123626],[1,1668086,159464],[1,1827550,167958],[1,1995508,178074],[1,2173582,164762],[1,2338344,166412],[1,2504756,162332],[1,2667088,157472],[1,2824560,158392],[1,2982952,155748],[1,3138700,165188],[1,3303888,148632],[1,3452520,139778],[1,3592298,139632],[1,3731930,137210],[1,3869140,143180],[1,4012320,149042],[1,4161362,137778],[1,4299140,141210],[1,4440350,128508],[1,4568858,113262],[1,4682120,83912],[1,4766032,69640],[1,4835672,66296],[1,4901968,61908],[1,4963876,68106],[1,5031982,57064],[1,5089046,54188],[1,5143234,64470],[1,5207704,59510],[1,5267214,64564],[1,5331778,69928],[1,5401706,59082],[1,5460788,60208],[1,5520996,57224],[1,5578220,59148],[1,5637368,69636],[1,5707004,120490],[1,5827494,124592],[1,5952086,130268],[1,6082354,146460],[1,6228814,153788],[1,6382602,154934],[1,6537536,163972],[1,6701508,159066],[1,6860574,162212],[1,7022786,171968],[1,7194754,168734],[1,7363488,170706],[1,7534194,170344],[1,7704538,175438],[1,7879976,170274],[1,8050250,175016]] },
    cel: { files: ['assets/descida/descida-cel.bin'], offsets: [[0,0,165722],[0,165722,159872],[0,325594,167558],[0,493152,160542],[0,653694,150700],[0,804394,156356],[0,960750,148664],[0,1109414,151066],[0,1260480,147618],[0,1408098,139758],[0,1547856,140200],[0,1688056,130560],[0,1818616,136224],[0,1954840,128550],[0,2083390,122390],[0,2205780,126258],[0,2332038,117528],[0,2449566,116654],[0,2566220,111450],[0,2677670,103848],[0,2781518,103908],[0,2885426,99154],[0,2984580,101452],[0,3086032,88068],[0,3174100,81624],[0,3255724,75250],[0,3330974,62698],[0,3393672,49030],[0,3442702,28118],[0,3470820,24478],[0,3495298,25886],[0,3521184,26846],[0,3548030,27086],[0,3575116,27434],[0,3602550,27396],[0,3629946,29768],[0,3659714,28724],[0,3688438,30428],[0,3718866,33304],[0,3752170,32144],[0,3784314,32870],[0,3817184,32694],[0,3849878,32428],[0,3882306,31996],[0,3914302,31322],[0,3945624,32062],[0,3977686,31988],[0,4009674,31256],[0,4040930,31890],[0,4072820,29394],[0,4102214,30792],[0,4133006,29224],[0,4162230,30674],[0,4192904,29162],[0,4222066,29296],[0,4251362,28838],[0,4280200,28258],[0,4308458,28876],[0,4337334,28344],[0,4365678,28482],[0,4394160,28572],[0,4422732,27694],[0,4450426,28190],[0,4478616,27748],[0,4506364,26342],[0,4532706,28178],[0,4560884,27388],[0,4588272,27470],[0,4615742,28110],[0,4643852,27350],[0,4671202,27242],[0,4698444,25700],[0,4724144,26906],[0,4751050,26906],[0,4777956,25032],[0,4802988,25702],[0,4828690,26368],[0,4855058,26342],[0,4881400,25298],[0,4906698,25660],[0,4932358,25778],[0,4958136,24846],[0,4982982,25058],[0,5008040,25412],[0,5033452,23912],[0,5057364,25350],[0,5082714,25608],[0,5108322,26300],[0,5134622,24298],[0,5158920,25042],[0,5183962,26972],[0,5210934,25122],[0,5236056,25366],[0,5261422,28230],[0,5289652,27810],[0,5317462,27544],[0,5345006,26548],[0,5371554,28068],[0,5399622,31182],[0,5430804,30738],[0,5461542,36190],[0,5497732,39666],[0,5537398,42610],[0,5580008,49892],[0,5629900,50764],[0,5680664,62904],[0,5743568,68734],[0,5812302,83150],[0,5895452,95736],[0,5991188,88788],[0,6079976,90560],[0,6170536,85416],[0,6255952,90846],[0,6346798,91088],[0,6437886,87050],[0,6524936,88896],[0,6613832,91614],[0,6705446,82928],[0,6788374,84092],[0,6872466,90780],[0,6963246,87880],[0,7051126,89084],[0,7140210,88734],[0,7228944,84376],[0,7313320,88506],[0,7401826,94332],[0,7496158,93430],[0,7589588,93302],[0,7682890,81942],[0,7764832,64568],[0,7829400,51496],[0,7880896,38320],[0,7919216,45580],[0,7964796,48128],[0,8012924,50686],[0,8063610,60618],[0,8124228,55898],[0,8180126,57366],[0,8237492,71656],[0,8309148,63808],[0,8372956,70756],[0,8443712,64050],[0,8507762,70298],[0,8578060,68368],[0,8646428,82140],[0,8728568,91780],[0,8820348,80536],[0,8900884,83516],[0,8984400,91082],[0,9075482,86450],[0,9161932,97818],[0,9259750,93998],[0,9353748,100656],[0,9454404,94814],[0,9549218,94230],[0,9643448,99942],[0,9743390,96390],[0,9839780,100982],[0,9940762,98554],[0,10039316,98662]] }
  };
  var SUAVE = 0.14;   // ✏️ 0.08 = bem macio · 0.25 = mais direto
  var FIM = 0.82;     // a descida termina em 82% da rolagem; o resto segura a cena final com as frases

  var section = document.querySelector('[data-ride]');
  if (!section) return;
  var canvas = section.querySelector('.ride__canvas');
  var ctx = canvas.getContext('2d');
  var loader = section.querySelector('.ride__loader');
  var bar = section.querySelector('.ride__progress span');
  var steps = Array.prototype.slice.call(section.querySelectorAll('[data-from]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var useBitmap = 'createImageBitmap' in window;

  var mode = '', blobs = [], total = 0, drawn = -1, decoding = false, pending = -1;
  var started = false, shown = 0, running = false, cache = {};

  function isVertical() { return window.innerHeight > window.innerWidth; }

  function load(key) {
    var set = SETS[key];
    total = set.offsets.length; blobs = []; drawn = -1;
    if (cache[key]) { blobs = cache[key]; loader.hidden = true; section.classList.add('is-ready'); tick(); return; }
    loader.hidden = false; loader.style.setProperty('--l', 0);
    var got = [], sizes = [];
    function prog() { var g = 0, t = 0; for (var k = 0; k < set.files.length; k++) { g += got[k] || 0; t += sizes[k] || 0; } if (t) loader.style.setProperty('--l', (g / t).toFixed(3)); }
    Promise.all(set.files.map(function (url, k) {
      return fetch(url).then(function (res) {
        if (!res.ok) throw new Error(url);
        sizes[k] = +res.headers.get('Content-Length') || 0;
        if (!res.body || !window.ReadableStream) return res.arrayBuffer();
        var reader = res.body.getReader(), chunks = []; got[k] = 0;
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) return new Blob(chunks).arrayBuffer();
            chunks.push(r.value); got[k] += r.value.length; prog(); return pump();
          });
        }
        return pump();
      });
    })).then(function (bufs) {
      var list = set.offsets.map(function (o) { return new Blob([bufs[o[0]].slice(o[1], o[1] + o[2])], { type: 'image/webp' }); });
      cache[key] = list;
      if (mode !== key) return;
      blobs = list; loader.hidden = true; section.classList.add('is-ready'); drawn = -1; tick();
    }).catch(function () { loader.hidden = true; });
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.imageSmoothingQuality = 'high'; drawn = -1;
  }
  function cover(img) {
    var w = canvas.width, h = canvas.height, iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    var s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  function show(i) {
    if (!blobs.length || i === drawn) return;
    if (decoding) { pending = i; return; }
    decoding = true;
    var b = blobs[i];
    var p = useBitmap ? createImageBitmap(b) : new Promise(function (ok, no) { var im = new Image(); im.onload = function () { ok(im); URL.revokeObjectURL(im.src); }; im.onerror = no; im.src = URL.createObjectURL(b); });
    p.then(function (img) { cover(img); if (img.close) img.close(); drawn = i; })
     .catch(function () {})
     .then(function () { decoding = false; if (pending >= 0 && pending !== drawn) { var n = pending; pending = -1; show(n); } });
  }

  function progress() {
    var r = section.getBoundingClientRect(), t = section.offsetHeight - window.innerHeight;
    return t <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / t));
  }
  function updateUI(p) {
    if (bar) bar.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    steps.forEach(function (el) {
      var from = parseFloat(el.getAttribute('data-from'));
      var to = el.hasAttribute('data-to') ? parseFloat(el.getAttribute('data-to')) : 2;
      el.classList.toggle('is-on', p >= from && p <= to);
    });
    section.classList.toggle('is-end', p >= FIM);
  }
  function loop() {
    var target = reduce ? 1 : progress();
    shown += (target - shown) * SUAVE;
    if (Math.abs(target - shown) < 0.0005) shown = target;
    updateUI(target);
    if (total) show(Math.round(Math.min(1, shown / FIM) * (total - 1)));
    if (shown !== target || decoding) requestAnimationFrame(loop); else running = false;
  }
  function tick() { if (!running) { running = true; requestAnimationFrame(loop); } }

  function setMode() {
    var m = isVertical() ? 'cel' : 'pc';
    sizeCanvas();
    if (m !== mode) { mode = m; load(m); } else tick();
  }
  function start() {
    if (started) return; started = true;
    setMode();
    window.addEventListener('scroll', function () {
      var r = section.getBoundingClientRect();
      if (r.bottom > -100 && r.top < window.innerHeight + 100) tick();
    }, { passive: true });
  }
  var lastW = window.innerWidth, lastH = window.innerHeight;
  window.addEventListener('resize', function () {
    if (!started) return;
    var w = window.innerWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 160) return;   // barra do navegador do celular
    lastW = w; lastH = h; setMode();
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { start(); io.disconnect(); } }, { rootMargin: '300% 0px' });
    io.observe(section);
  } else window.addEventListener('load', start);

  updateUI(reduce ? 1 : 0);
  if (reduce) section.classList.add('is-reduced');
})();
