/* Esencia Fresh Bar */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = window.ESENCIA;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap && !reduce ? window.gsap : null;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const nav = $(".nav");
  const hm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

  /* ---------- menu: comes down like the shop's shutter ---------- */
  const burger = $(".nav__burger");
  const menu = $("#menu");
  let tlMenu = null;
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.documentElement.style.overflow = open ? "hidden" : "";
    nav.classList.toggle("is-menu", open);
    if (open) {
      menu.hidden = false;
      if (G) {
        tlMenu?.kill();
        tlMenu = G.timeline()
          .fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: .65, ease: "power3.inOut" })
          .from($$("#menu nav a, .menu__pie"), { y: 26, opacity: 0, duration: .5, stagger: .06, ease: "power3.out" }, "-=.2");
      }
      $("#menu nav a").focus({ preventScroll: true });
    } else if (G && !menu.hidden) {
      tlMenu?.kill();
      tlMenu = G.timeline({ onComplete: () => { menu.hidden = true; G.set(menu, { clearProps: "clipPath" }); } })
        .to(menu, { clipPath: "inset(0 0 100% 0)", duration: .5, ease: "power3.in" });
    } else menu.hidden = true;
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !menu.hidden) { setMenu(false); burger.focus(); } });

  /* ---------- nav turns solid after the hero ---------- */
  const hero = $(".hero");
  const solid = () => nav.classList.toggle("is-solida", hero.getBoundingClientRect().bottom < 90);
  addEventListener("scroll", solid, { passive: true });
  solid();

  /* ---------- footer swirls ---------- */
  const voluta = document.getElementById("voluta");
  const largo = voluta.getTotalLength();
  $$(".voluta").forEach((v) => { v.style.strokeDasharray = largo; v.style.strokeDashoffset = G ? largo : 0; });
  if (G) G.set(".pie .voluta__hoja", { opacity: 0 });

  /* ---------- hero: the café seen through the letters of the logo; scrolling goes in through the flower ---------- */
  const lienzo = $(".hero__lienzo");
  const ctx = lienzo.getContext("2d");
  const fuente = $(".hero__fuente");
  const MARCA = new Path2D(document.getElementById("marca").getAttribute("d"));
  const FRESH = new Path2D(document.getElementById("fresh").getAttribute("d"));
  const [FX, FY] = D.foco;
  const est = { w: G ? 0 : D.w * 1.3, r: G ? 0 : 140, z: 0, vid: 0, fresh: G ? 0 : 1 };
  let CW = 0, CH = 0, dpr = 1;
  const medir = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    CW = lienzo.clientWidth; CH = lienzo.clientHeight;
    lienzo.width = Math.round(CW * dpr); lienzo.height = Math.round(CH * dpr);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const suave = (t) => t * t * (3 - 2 * t);
  const dibuja = () => {
    if (!CW) return;
    const movil = CW < 700;
    const lw = Math.min(CW * (movil ? .92 : .86), 1250);
    const s0 = lw / D.w;
    const ox = (CW - lw) / 2, oy = CH * (movil ? .34 : .44) - (D.h * s0) / 2;
    const ez = suave(est.z);
    const sFin = (Math.hypot(CW, CH) / 2 + 40) / 15;
    const S = s0 * Math.pow(sFin / s0, ez);
    const cx = lerp(ox + FX * s0, CW / 2, ez), cy = lerp(oy + FY * s0, CH / 2, ez);
    const tx = cx - FX * S, ty = cy - FY * S;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    ctx.save();
    ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * tx, dpr * ty);
    if (est.w < D.w * 1.2) {
      const q = new Path2D();
      q.rect(-10, -10, est.w + 10, D.h + 20);
      D.flores.forEach(([x, y]) => { q.moveTo(x + est.r, y); q.arc(x, y, est.r, 0, Math.PI * 2); });
      ctx.clip(q, "nonzero");
    }
    ctx.clip(MARCA, "evenodd");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#1d1e18";
    ctx.fillRect(0, 0, CW, CH);
    if (est.vid > 0 && fuente.readyState >= 2) {
      const vw = fuente.videoWidth, vh = fuente.videoHeight;
      const k = Math.max(CW / vw, CH / vh);
      ctx.globalAlpha = est.vid;
      /* inside the letters the footage needs more body to read against the cream */
      ctx.filter = `saturate(${1.3 - .3 * est.z}) contrast(${1.12 - .12 * est.z}) brightness(${.82 + .18 * est.z})`;
      ctx.drawImage(fuente, (CW - vw * k) / 2, (CH - vh * k) / 2, vw * k, vh * k);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (est.fresh > 0 && est.z < .4) {
      ctx.save();
      ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * tx, dpr * ty);
      ctx.globalAlpha = est.fresh * (1 - est.z / .4);
      ctx.fillStyle = "#1d1e18";
      ctx.fill(FRESH, "evenodd");
      ctx.restore();
    }
  };
  medir();
  addEventListener("resize", () => { medir(); dibuja(); });
  const bucle = () => { dibuja(); requestAnimationFrame(bucle); };
  requestAnimationFrame(bucle);
  fuente.play().catch(() => {});
  if (!G) est.vid = 1;
  const enHero = () => nav.classList.toggle("is-claro", !nav.classList.contains("is-solida") && est.z < .55);

  if (G) {
    G.timeline({ delay: .3 })
      .to(est, { w: 880, duration: 1.9, ease: "power1.inOut" })
      .to(est, { r: 140, duration: 1.1, ease: "power2.out" }, "-=.3")
      .set(est, { w: D.w * 1.3 })
      .to(est, { fresh: 1, duration: .8 }, "-=.7")
      .to(est, { vid: 1, duration: 1.4, ease: "power1.inOut" }, "-=.6")
      .from(".hero__pie > *", { y: 18, opacity: 0, duration: .8, stagger: .12, ease: "power2.out" }, "-=1");
    G.timeline({
      scrollTrigger: { trigger: hero, start: "top top", end: () => `+=${innerHeight * 1.5}`, pin: true, scrub: true, onUpdate: enHero },
    })
      .to(est, { z: 1, duration: 1, ease: "none" }, 0)
      .to(".hero__pie", { opacity: 0, y: 30, duration: .25 }, 0)
      .to(".hero__velo", { opacity: 1, duration: .25 }, .7)
      .fromTo(".hero__dentro span", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .15, stagger: .06 }, .74)
      .set(".hero__dentro", { opacity: 1 }, .74)
      .to({}, { duration: .2 });
  }
  addEventListener("scroll", enHero, { passive: true });
  enHero();

  /* ---------- la carta: headline for the real time, posts stack as you scroll ---------- */
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const hoy = new Date();
  const dia = hoy.getDay();
  const [abre, cierra] = D.horario[dia];
  const minAhora = hoy.getHours() * 60 + hoy.getMinutes();
  const abiertoAhora = abre != null && minAhora >= abre && minAhora < cierra;
  const HORA = { desayuno: "Hora de desayunar.", almuerzo: "Hora de almorzar.", tapas: "Hora del tapeo.", merienda: "Hora de merendar." };
  const cartaAhora = $("#carta-ahora");
  if (abiertoAhora) {
    const m = D.momentos.find((x) => minAhora >= x.desde && minAhora < x.hasta) || D.momentos[D.momentos.length - 1];
    cartaAhora.innerHTML = `<b>Son las ${hm(minAhora)}. ${HORA[m.id]}</b>Abierto hasta las ${hm(cierra)}. <a href="#m-${m.id}">Mira qué hay ahora</a>`;
  } else {
    const man = D.horario[(dia + 1) % 7];
    const cuando = abre != null && minAhora < abre ? `Hoy abrimos a las ${hm(abre)}` : man[0] != null ? `Mañana abrimos a las ${hm(man[0])}` : `Volvemos el lunes a las 7:00`;
    cartaAhora.innerHTML = `<b>Ahora estamos cerrados.</b>${cuando}. Así va el día en Esencia.`;
  }
  const posts = $$(".post");
  if (G) {
    const apila = matchMedia("(min-width: 961px)");
    if (apila.matches) {
      posts.slice(0, -1).forEach((post, k) => {
        G.timeline({ scrollTrigger: { trigger: posts[k + 1], start: "top bottom", end: () => `top ${parseFloat(getComputedStyle(posts[k + 1]).top)}px`, scrub: true } })
          .to(post, { scale: .94, "--sombra": .45, ease: "none" });
      });
    }
    posts.forEach((post) => {
      G.from(post.querySelectorAll(".plato__n, .post__frase"), { y: 20, opacity: 0, duration: .7, stagger: .06, ease: "power2.out", scrollTrigger: { trigger: post, start: "top 65%", once: true } });
      G.from(post.querySelector(".post__mini"), { y: 40, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: post, start: "top 60%", once: true } });
    });
  }

  /* ---------- galería: the reel starts full screen and settles into the mosaic ---------- */
  const galeria = $(".galeria");
  const gPin = $(".galeria__pin");
  const gGrid = $(".galeria__grid");
  const gX = $(".g--x");
  const fotos = $$("button.g");
  const gVideo = $(".g--x video");
  new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) gVideo.play().catch(() => {}); else gVideo.pause();
  }), { threshold: .1 }).observe(gVideo);

  if (G) {
    const geo = (el) => {
      const W = gPin.clientWidth, H = gPin.clientHeight;
      const x = gGrid.offsetLeft + el.offsetLeft + el.offsetWidth / 2;
      const y = gGrid.offsetTop + el.offsetTop + el.offsetHeight / 2;
      return { W, H, dx: W / 2 - x, dy: H / 2 - y, w: el.offsetWidth, h: el.offsetHeight };
    };
    const tlG = G.timeline({
      scrollTrigger: { trigger: galeria, start: "top top", end: () => `+=${innerHeight * 1.4}`, pin: true, scrub: true, invalidateOnRefresh: true },
    });
    tlG.fromTo(gX, {
      x: () => geo(gX).dx, y: () => geo(gX).dy,
      scale: () => { const g = geo(gX); return Math.max(g.W / g.w, g.H / g.h) * 1.02; },
    }, { x: 0, y: 0, scale: 1, duration: 1, ease: "power1.inOut" }, 0);
    const orden = fotos.map((f) => ({ f, d: Math.hypot(geo(f).dx, geo(f).dy) })).sort((m, n) => m.d - n.d);
    orden.forEach(({ f }, k) => {
      tlG.fromTo(f, { x: () => -geo(f).dx * .45, y: () => -geo(f).dy * .45, scale: .75, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: .55, ease: "power2.out" }, .3 + k * .045);
    });
    tlG.fromTo(".galeria__cab", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .7);
  }

  /* lightbox */
  const lb = $("#lb");
  const lbImg = $(".lb__fig img");
  const lbCap = $(".lb__fig figcaption");
  let lbI = 0, lbDesde = null;
  const lbPon = (n) => {
    lbI = (n + fotos.length) % fotos.length;
    const im = fotos[lbI].querySelector("img");
    lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = im.alt;
    if (G) G.fromTo(lbImg, { opacity: 0, scale: .97 }, { opacity: 1, scale: 1, duration: .45, ease: "power2.out" });
  };
  const lbAbre = (n) => {
    lbDesde = document.activeElement;
    lb.hidden = false; document.documentElement.style.overflow = "hidden";
    lbPon(n);
    if (G) G.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: .3 });
    $(".lb__cerrar").focus();
  };
  const lbCierra = () => { lb.hidden = true; document.documentElement.style.overflow = ""; lbDesde?.focus(); };
  fotos.forEach((f, n) => f.addEventListener("click", () => lbAbre(n)));
  $(".lb__cerrar").addEventListener("click", lbCierra);
  $(".lb__flecha--prev").addEventListener("click", () => lbPon(lbI - 1));
  $(".lb__flecha--next").addEventListener("click", () => lbPon(lbI + 1));
  lb.addEventListener("click", (ev) => { if (ev.target === lb) lbCierra(); });
  addEventListener("keydown", (ev) => {
    if (lb.hidden) return;
    if (ev.key === "Escape") lbCierra();
    else if (ev.key === "ArrowLeft") lbPon(lbI - 1);
    else if (ev.key === "ArrowRight") lbPon(lbI + 1);
    else if (ev.key === "Tab") {
      const bs = $$("button", lb), i = bs.indexOf(document.activeElement);
      ev.preventDefault(); bs[(i + (ev.shiftKey ? -1 : 1) + bs.length) % bs.length].focus();
    }
  });

  /* ---------- opiniones: written in chalk, rubbed out with the board eraser ---------- */
  const pizarra = $(".pizarra");
  const caja = $(".pizarra__texto");
  const rs = $$(".tiza-resena");
  const fantasma = $(".pizarra__fantasma");
  const num = $(".pizarra__num b");
  const borrador = $(".borrador");
  let ri = 0, ocupado = false, enVista = false, encima = false, ultimo = Date.now();

  const escribeTiza = (el) => {
    if (G) G.fromTo($$(".w", el), { opacity: 0 }, { opacity: 1, duration: .22, stagger: .045, ease: "none" });
  };
  const cambia = (dir) => {
    if (ocupado) return;
    const viejo = rs[ri];
    ri = (ri + dir + rs.length) % rs.length;
    const nuevo = rs[ri];
    num.textContent = ri + 1;
    ultimo = Date.now();
    const pasa = () => {
      fantasma.innerHTML = viejo.innerHTML;
      viejo.hidden = true; viejo.classList.remove("borrando"); viejo.style.removeProperty("--e");
      nuevo.hidden = false;
    };
    if (!G) { pasa(); return; }
    ocupado = true;
    const t = caja.getBoundingClientRect(), b = borrador.getBoundingClientRect();
    const x0 = t.left - b.left, x1 = t.left + Math.min(t.width, 900) - b.right, y = t.top + t.height * .32 - b.top;
    const e = { p: 0 };
    viejo.classList.add("borrando");
    G.timeline({ onComplete: () => { ocupado = false; } })
      .to(borrador, { x: x0, y, rotation: -10, duration: .4, ease: "power2.inOut" })
      .to(borrador, { x: x1, y: y + t.height * .12, rotation: 6, duration: .6, ease: "sine.inOut" })
      .to(e, { p: 100, duration: .6, ease: "sine.inOut", onUpdate: () => viejo.style.setProperty("--e", `${e.p}%`) }, "<")
      .to(borrador, { x: x0 + 30, y: y + t.height * .3, rotation: -4, duration: .45, ease: "sine.inOut" })
      .add(() => { pasa(); G.set($$(".w", nuevo), { opacity: 0 }); })
      .to(borrador, { x: 0, y: 0, rotation: 0, duration: .5, ease: "power2.inOut" })
      .add(() => escribeTiza(nuevo), "-=.45");
  };
  $$(".pizarra__btn").forEach((btn) => btn.addEventListener("click", () => cambia(+btn.dataset.dir)));
  pizarra.addEventListener("pointerenter", () => { encima = true; });
  pizarra.addEventListener("pointerleave", () => { encima = false; });
  pizarra.addEventListener("focusin", () => { encima = true; });
  pizarra.addEventListener("focusout", () => { encima = false; });
  new IntersectionObserver((es) => es.forEach((en) => { enVista = en.isIntersecting; }), { threshold: .45 }).observe(pizarra);
  if (G) {
    G.set($$(".w", rs[0]), { opacity: 0 });
    ScrollTrigger.create({ trigger: pizarra, start: "top 70%", once: true, onEnter: () => { escribeTiza(rs[0]); ultimo = Date.now(); } });
    setInterval(() => {
      if (enVista && !encima && !document.hidden && Date.now() - ultimo > 9000) cambia(1);
    }, 1000);
  }

  /* ---------- quiet entrances ---------- */
  if (G) {
    $$(".visita h2, .visita__acciones, .semana__ahora, .visita__extra").forEach((el) => {
      G.from(el, { y: 26, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    $$(".mapa__foto .marco").forEach((el) => {
      G.from(el, { clipPath: "inset(12% 12% 12% 12%)", opacity: 0, duration: 1.2, ease: "power3.out", clearProps: "clipPath", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    G.timeline({ scrollTrigger: { trigger: ".pie", start: "top 85%", once: true } })
      .to(".pie .voluta", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
      .to(".pie .voluta__hoja", { opacity: 1, duration: .6 }, "-=.5");
  }

  /* ---------- visítanos: the street draws itself, the week fills in ---------- */
  const hoyDia = $(`.dia[data-dia="${dia}"]`);
  hoyDia?.classList.add("is-hoy");
  const semanaAhora = $("#semana-ahora");
  if (abiertoAhora) {
    const ya = document.createElement("span");
    ya.className = "dia__ya";
    ya.style.setProperty("--n", (minAhora - 420) / 780);
    hoyDia.querySelector(".dia__pista").appendChild(ya);
    semanaAhora.innerHTML = `<b>Ahora mismo estamos abiertos</b>, hasta las ${hm(cierra)}.`;
  } else {
    const man = D.horario[(dia + 1) % 7], pasado = D.horario[(dia + 2) % 7];
    const antes = abre != null && minAhora < abre;
    semanaAhora.innerHTML = antes ? `Ahora cerrado. <b>Hoy abrimos a las ${hm(abre)}.</b>`
      : man[0] != null ? `Ahora cerrado. <b>Mañana abrimos a las ${hm(man[0])}.</b>`
        : `Ahora cerrado. <b>Volvemos el ${dias[(dia + 2) % 7]} a las ${hm(pasado[0])}.</b>`;
  }
  if (G) {
    const calles = $$(".mapa__calle");
    G.set(calles, { strokeDasharray: 1, strokeDashoffset: 1 });
    G.timeline({ scrollTrigger: { trigger: ".mapa", start: "top 75%", once: true } })
      .to(calles, { strokeDashoffset: 0, duration: 2.2, stagger: .08, ease: "power2.inOut" })
      .from(".mapa__rotulos, .mapa__parque", { opacity: 0, duration: .8 }, "-=1.2")
      .from(".mapa__pin", { scale: 0, transformOrigin: "50% 50%", duration: .7, ease: "back.out(2)" }, "-=.6")
      .from(".mapa__aqui", { opacity: 0, x: -10, duration: .5 }, "-=.3");
    G.from(".dia__barra", { scaleY: 0, duration: .9, stagger: .07, ease: "power3.out", scrollTrigger: { trigger: ".semana", start: "top 85%", once: true } });
  }
})();
