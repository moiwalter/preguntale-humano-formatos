// Intro "Pregúntale a un humano" v2 — portada tal cual desde
// proyectos/cvander/2026-10-cvander-preguntale-humano-intro/index.html (9-oct-2026),
// sin el fondo (aurora + grilla): sólo la caja, sobre el video.
// Mismo timeline GSAP, mismos tiempos; ids con prefijo ix- para no chocar con la página.
(function () {
  const CSS = `
  @font-face{font-family:"Permanent Marker IX";src:url("media/PermanentMarker-Regular.ttf") format("truetype")}
  #ix-scrim{position:absolute;inset:0}
  #ix-stage{position:absolute;inset:0}
  #ix-card-wrap{position:absolute;left:40px;width:1000px;top:800px;height:330px}
  #ix-halo{position:absolute;inset:-6px;border-radius:64px;overflow:hidden;filter:blur(34px);opacity:.7}
  #ix-rim{position:absolute;inset:0;border-radius:58px;overflow:hidden}
  .ix-spin{position:absolute;left:50%;top:50%;width:1400px;height:1400px;margin:-700px 0 0 -700px;background:conic-gradient(from 0deg,#a43ff1,#f6cae6,#eee6e1,#a43ff1,#3c0058,#a43ff1)}
  #ix-card{position:absolute;inset:4px;border-radius:54px;background:linear-gradient(180deg,#1e0a2b 0%,#160620 100%)}
  #ix-head{position:absolute;left:52px;top:44px;display:flex;align-items:center;gap:16px}
  #ix-spark{width:40px;height:40px;display:block}
  #ix-thinking{font-family:"Lineal",sans-serif;font-weight:700;font-size:34px;letter-spacing:-.01em;background:linear-gradient(90deg,#6f5a7c 0%,#6f5a7c 35%,#f6cae6 50%,#6f5a7c 65%,#6f5a7c 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent}
  #ix-prompt{position:absolute;left:52px;top:132px;white-space:nowrap;font-family:"Lineal",sans-serif;font-weight:900;font-size:84px;line-height:1;letter-spacing:-.045em;color:#eee6e1}
  .ix-tok{display:inline-block}
  #ix-gpt{position:relative;display:inline-block}
  #ix-gpt-text{display:inline-block;background:linear-gradient(90deg,#a43ff1 0%,#f6cae6 45%,#eee6e1 55%,#a43ff1 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent}
  #ix-send{position:absolute;right:40px;bottom:36px;width:76px;height:76px;border-radius:50%;background:#eee6e1;display:grid;place-items:center}
  #ix-send svg{width:34px;height:34px;display:block}
  #ix-send-glow{position:absolute;inset:-14px;border-radius:50%;background:#f6cae6;filter:blur(18px);opacity:0}
  #ix-strike{position:absolute;left:1%;top:0;width:103%;height:100%;overflow:visible}
  #ix-human{position:absolute;left:0;top:0;width:600px;height:220px;overflow:visible}
  #ix-human text{font-family:"Permanent Marker IX","Permanent Marker",cursive;font-size:80px;fill:#ffffff}`;
  const HTML = `
  <div id="ix-scrim"></div>
  <div id="ix-stage">
    <div id="ix-card-wrap">
      <div id="ix-halo"><div class="ix-spin" id="ix-spin-halo"></div></div>
      <div id="ix-rim"><div class="ix-spin" id="ix-spin-rim"></div></div>
      <div id="ix-card">
        <div id="ix-head">
          <svg id="ix-spark" viewBox="0 0 40 40"><path d="M20 2 C21.5 13 27 18.5 38 20 C27 21.5 21.5 27 20 38 C18.5 27 13 21.5 2 20 C13 18.5 18.5 13 20 2 Z" fill="#f6cae6"/></svg>
          <span id="ix-thinking">Pensando…</span>
        </div>
        <div id="ix-prompt"><span class="ix-tok">Pregún</span><span class="ix-tok">tale</span><span class="ix-tok">&nbsp;a&nbsp;</span><span class="ix-tok" id="ix-gpt"><span id="ix-gpt-text">ChatGPT</span></span></div>
        <div id="ix-send"><div id="ix-send-glow"></div><svg viewBox="0 0 34 34"><path d="M17 28 V7 M8 15 L17 6 L26 15" fill="none" stroke="#2a0d3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      </div>
    </div>
    <svg id="ix-human" viewBox="0 0 600 220">
      <defs><mask id="ix-write-mask" maskUnits="userSpaceOnUse" x="-60" y="-60" width="720" height="340">
        <path id="ix-write-path" d="" fill="none" stroke="#fff" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
      </mask></defs>
      <text id="ix-human-text" x="10" y="150" mask="url(#ix-write-mask)">un humano</text>
    </svg>
  </div>`;
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const fontsReady = Promise.all([
    document.fonts.load('900 84px "Lineal"'),
    document.fonts.load('80px "Permanent Marker IX"'),
  ]).catch(() => {});

  // Sonido de la intro (mismos inicios y volúmenes que la composición original).
  const SFX = [
    { src: 'media/sfx/hum.m4a', t: 0, vol: 0.7 },
    { src: 'media/sfx/tokens.m4a', t: 0.62, vol: 0.6 },
    { src: 'media/sfx/strike.m4a', t: 1.32, vol: 0.85 },
    { src: 'media/sfx/write.m4a', t: 1.92, vol: 0.6 },
  ].map(s => Object.assign(new Audio(s.src), { preload: 'auto', volume: s.vol, _t: s.t }));

  window.IntroIX = {
    D: 3.4,
    sfx: SFX,
    // dock: {top, left, width, height} → al terminar, la caja baja a esa posición en vez de irse.
    async build(parent, stageEl, opts = {}) {
      const root = document.createElement('div');
      root.style.cssText = 'position:absolute;inset:0;pointer-events:none';
      root.innerHTML = HTML; parent.appendChild(root);
      const TOP = opts.top != null ? opts.top : 800;
      root.querySelector('#ix-card-wrap').style.top = TOP + 'px';
      root.querySelector('#ix-scrim').style.background = `radial-gradient(75% 22% at 50% ${(TOP + 165) / 19.2}%,#12041bd9,#12041b00)`;
      await fontsReady;
      const q = s => root.querySelector(s);
      const svgNS = 'http://www.w3.org/2000/svg';
      const gpt = q('#ix-gpt');
      const strike = document.createElementNS(svgNS, 'svg');
      strike.setAttribute('id', 'ix-strike'); strike.setAttribute('viewBox', '0 0 1000 150'); strike.setAttribute('preserveAspectRatio', 'none');
      const sp = document.createElementNS(svgNS, 'path');
      sp.setAttribute('d', 'M 0 80 C 180 72, 330 84, 520 68 S 860 58, 1000 50 C 900 68, 640 86, 420 94 S 120 100, 30 104');
      sp.setAttribute('fill', 'none'); sp.setAttribute('stroke', '#f6cae6'); sp.setAttribute('stroke-width', '15');
      sp.setAttribute('stroke-linecap', 'round'); sp.setAttribute('vector-effect', 'non-scaling-stroke');
      strike.appendChild(sp); gpt.appendChild(strike);

      // Medir en reposo (L042), corrigiendo la escala del escenario de la página.
      const k = stageEl.getBoundingClientRect().width / 1080;
      const stage0 = q('#ix-stage').getBoundingClientRect();
      const g0 = q('#ix-gpt-text').getBoundingClientRect();
      const gx = (g0.left - stage0.left) / k, gy = (g0.top - stage0.top) / k, gh = g0.height / k;

      const tl = gsap.timeline({ paused: true });
      const D = 3.4;
      tl.fromTo(q('#ix-scrim'), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);
      tl.fromTo(q('#ix-stage'), { scale: 1, transformOrigin: `50% ${(TOP + 165) / 19.2}%` }, { scale: 1.04, duration: D, ease: 'none' }, 0);
      tl.fromTo(q('#ix-card-wrap'), { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }, 0);
      tl.fromTo([q('#ix-spin-rim'), q('#ix-spin-halo')], { rotation: 0 }, { rotation: 300, duration: 1.4, ease: 'none' }, 0);
      tl.fromTo(q('#ix-spark'), { rotation: -90, scale: 0.6, transformOrigin: '50% 50%' }, { rotation: 90, scale: 1, duration: 1.3, ease: 'power2.out' }, 0);
      tl.fromTo(q('#ix-thinking'), { opacity: 0, backgroundPosition: '100% 0' }, { opacity: 1, duration: 0.2 }, 0.2);
      tl.to(q('#ix-thinking'), { backgroundPosition: '0% 0', duration: 0.9, ease: 'none' }, 0.2);
      tl.to(q('#ix-thinking'), { opacity: 0, duration: 0.2 }, 1.15);
      root.querySelectorAll('.ix-tok').forEach((t, i) => {
        tl.fromTo(t, { opacity: 0, filter: 'blur(14px)', y: 10 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.22, ease: 'power2.out' }, 0.62 + i * 0.1);
      });
      tl.fromTo(q('#ix-gpt-text'), { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 0.7, ease: 'power1.inOut' }, 0.92);
      tl.fromTo(q('#ix-send'), { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.08, duration: 0.18, ease: 'power2.out' }, 1.1);
      tl.fromTo(q('#ix-send-glow'), { opacity: 0 }, { opacity: 0.8, duration: 0.18 }, 1.1);
      const len = sp.getTotalLength();
      tl.set(sp, { strokeDasharray: len, strokeDashoffset: len }, 0);
      tl.to(sp, { strokeDashoffset: 0, duration: 0.28, ease: 'power2.in' }, 1.32);
      tl.to(gpt, { opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, 1.68);
      tl.to(q('#ix-send'), { scale: 1, opacity: 0.25, duration: 0.3, ease: 'power2.out' }, 1.4);
      tl.to(q('#ix-send-glow'), { opacity: 0, duration: 0.2 }, 1.4);
      tl.to(q('#ix-halo'), { opacity: 0, duration: 0.45, ease: 'power2.out' }, 1.4);
      tl.to(q('#ix-spin-rim'), { opacity: 0.32, duration: 0.45, ease: 'power2.out' }, 1.4);
      tl.to(q('#ix-spark'), { opacity: 0.3, duration: 0.3 }, 1.4);

      // "un humano" a mano, en el MISMO lugar y línea base que ChatGPT.
      const human = q('#ix-human'), txt = q('#ix-human-text');
      const bb = txt.getBBox();
      gsap.set(human, { left: gx - bb.x + 6, top: gy + 0.8 * gh - 150 });
      tl.set(human, { rotation: -2, transformOrigin: '0% 100%' }, 0);
      const wp = q('#ix-write-path');
      const sweeps = 18, y0 = bb.y - 10, y1 = bb.y + bb.height + 10;
      let d = `M ${bb.x - 20} ${y0}`;
      for (let i = 1; i <= sweeps; i++) d += ` L ${bb.x - 20 + ((bb.width + 40) * i) / sweeps} ${i % 2 ? y1 : y0}`;
      wp.setAttribute('d', d);
      const wl = wp.getTotalLength();
      tl.set(wp, { strokeDasharray: wl, strokeDashoffset: wl }, 0);
      tl.to(wp, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, 1.92);

      // Salida (lo único nuevo): se va, o baja a acoplarse como caja de la pregunta.
      tl.to(q('#ix-scrim'), { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, D);
      if (opts.dock) {
        const dy = opts.dock.top - TOP;
        tl.to(q('#ix-stage'), { y: dy, scale: 1, duration: 0.8, ease: 'power3.inOut' }, D);
      } else {
        tl.to(q('#ix-stage'), { opacity: 0, y: -40, duration: 0.4, ease: 'power2.in' }, D);
      }
      tl.progress(1, true).progress(0, true);
      return { root, tl, end: D + 0.8 };
    },
  };
})();
