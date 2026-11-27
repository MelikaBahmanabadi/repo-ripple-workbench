/* ============================================================
   EMBER & OAK — main.js
   Reveal system · hero parallax · 3D tilt · menu · gallery ·
   testimonials · mobile menu · counters · reduced-motion aware
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Preloader ---------- */
  const preloader = $('#preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('done'), reduceMotion ? 0 : 500);
  });
  // safety net
  setTimeout(() => preloader && preloader.classList.add('done'), 3500);

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
    $$('.exp-step').forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
    $$('.exp-step').forEach(el => io.observe(el));
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('solid', window.scrollY > 60);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  // Mobile menu
  const toggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  toggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    $$('.mobile-menu nav a', mobileMenu).forEach((a, i) => a.style.setProperty('--i', i));
  });
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));

  // Smooth scroll for nav anchors (with fixed header offset)
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 40);
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Hero parallax + mouse depth ---------- */
  const hero = $('#hero');
  const heroMedia = $('[data-parallax="media"]');
  const heroInner = $('[data-parallax="inner"]');
  const heroVideo = $('#heroVideo');
  const floaters = $$('.float-bean, .float-ring');

  if (hero && !reduceMotion) {
    const onScrollHero = () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      heroMedia.style.transform = `translateY(${y * 0.28}px) scale(1.02)`;
      heroInner.style.transform = `translateY(${y * 0.16}px)`;
      heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
    };
    onScrollHero();
    window.addEventListener('scroll', onScrollHero, { passive: true });

    let mx = 0, my = 0, raf = null;
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX / r.width - 0.5);
      my = (e.clientY / r.height - 0.5);
      if (!raf) raf = requestAnimationFrame(() => {
        raf = null;
        heroInner.style.transform = `rotateX(${my * -2.4}deg) rotateY(${mx * 2.4}deg) translateZ(0)`;
        floaters.forEach((f, i) => {
          const k = (i + 1) * 9;
          f.style.translate = `${mx * k}px ${my * k}px`;
        });
      });
    });
    hero.addEventListener('mouseleave', () => {
      heroInner.style.transform = '';
      floaters.forEach(f => (f.style.translate = ''));
    });
  }

  // pause hero video when far off-screen (perf) — keep playing while visible
  if (heroVideo && 'IntersectionObserver' in window && !reduceMotion) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) heroVideo.play().catch(() => {});
        else heroVideo.pause();
      });
    }, { threshold: 0.05 }).observe(hero);
  }

  /* ---------- Cursor glow ---------- */
  const glow = $('#cursorGlow');
  if (glow && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    glow.classList.add('on');
    window.addEventListener('mousemove', e => {
      glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`;
    }, { passive: true });
  }

  /* ---------- Marquee duplication ---------- */
  const marquee = $('#marqueeTrack');
  if (marquee) marquee.innerHTML += marquee.innerHTML;

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const run = el => {
      const end = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = end + suffix; return; }
      const t0 = performance.now(), dur = 1400;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { run(e.target); io2.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach(el => io2.observe(el));
  }

  /* ---------- 3D tilt (cards + map) ---------- */
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    const tiltables = () => $$('.menu-card:not(.tilt-bound), .visit-map:not(.tilt-bound), .story-img-a:not(.tilt-bound)');
    const bindTilt = el => {
      el.classList.add('tilt-bound');
      const isCard = el.classList.contains('menu-card');
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const max = isCard ? 7 : 4;
        el.style.transform = `rotateY(${x * max}deg) rotateX(${y * -max}deg) translateZ(6px)`;
        if (isCard) {
          const img = $('.menu-card-img img', el);
          if (img) img.style.transform = `scale(1.08) translate(${-x * 10}px, ${-y * 10}px)`;
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        const img = $('.menu-card-img img', el);
        if (img) img.style.transform = '';
      });
    };
    const mo = new MutationObserver(() => tiltables().forEach(bindTilt));
    mo.observe(document.body, { childList: true, subtree: true });
    tiltables().forEach(bindTilt);
  }

  /* ---------- Menu ---------- */
  const PRODUCTS = [
    { id: 1,  name: 'Classic Espresso',       cat: 'espresso',   price: 3.5,  rating: 4.9, tag: 'Strong',        img: '/__l5e/assets-v1/550fd311-d717-4956-a2e4-8e0de333e240/espresso.jpg',             desc: 'Bold single-origin shot, thick crema, notes of cocoa and toasted hazelnut.' },
    { id: 2,  name: 'Double Espresso',        cat: 'espresso',   price: 4.0,  rating: 4.8, tag: 'Bold',          img: '/__l5e/assets-v1/97f08f0f-0716-44a0-9ffa-90e785420826/double-espresso.jpg',      desc: 'Two shots pulled short and intense. For those who like it dark.' },
    { id: 3,  name: 'Americano',              cat: 'espresso',   price: 3.8,  rating: 4.7, tag: 'Smooth',        img: '/__l5e/assets-v1/28239b5d-a046-4355-8fc4-256694204442/americano.jpg',            desc: 'Espresso lengthened with hot water. Clean, balanced, infinitely drinkable.' },
    { id: 4,  name: 'Macchiato',              cat: 'espresso',   price: 4.2,  rating: 4.8, tag: 'Classic',       img: '/__l5e/assets-v1/0032af91-cd8e-4dfb-b665-aebef113a17c/macchiato.jpg',            desc: 'Espresso marked with a dollop of foamed milk. Small, intense, perfect.' },
    { id: 5,  name: 'Cappuccino',             cat: 'cappuccino', price: 4.5,  rating: 4.9, tag: 'House Classic', img: '/__l5e/assets-v1/9af23558-0219-4408-865d-b0d15f50ae97/cappuccino.jpg',           desc: 'Equal thirds espresso, steamed milk and airy foam, dusted with cocoa.' },
    { id: 6,  name: 'Iced Cappuccino',        cat: 'cappuccino', price: 4.8,  rating: 4.7, tag: 'Cold',          img: '/__l5e/assets-v1/79711ded-edcc-416c-af7f-495703a9097f/iced-cappuccino.jpg',      desc: 'Chilled espresso over ice with cold foam and a dusting of cocoa.' },
    { id: 7,  name: 'Caramel Cappuccino',     cat: 'cappuccino', price: 5.0,  rating: 4.8, tag: 'Sweet',         img: '/__l5e/assets-v1/4e17a114-1608-46c3-a874-fdc34df6fb8d/caramel-cappuccino.jpg',   desc: 'House caramel folded into foam, finished with flaky sea salt.' },
    { id: 8,  name: 'Vanilla Latte',          cat: 'latte',      price: 4.8,  rating: 4.9, tag: 'Popular',       img: '/__l5e/assets-v1/c1d54c17-0ff4-4c73-bf0c-ea83932dcafd/vanilla-latte.jpg',        desc: 'Madagascar bourbon vanilla, double shot, silky steamed milk.' },
    { id: 9,  name: 'Iced Latte',             cat: 'latte',      price: 4.5,  rating: 4.7, tag: 'Cold',          img: '/__l5e/assets-v1/ab2889ed-c24e-4ea8-ad97-ea9efb384142/iced-latte.jpg',           desc: 'Espresso, cold milk, ice. Simple, balanced, refreshing.' },
    { id: 10, name: 'Hazelnut Latte',         cat: 'latte',      price: 5.0,  rating: 4.8, tag: 'Nutty',         img: '/__l5e/assets-v1/4cb2bc42-479b-404b-916d-068db2bc8a7b/hazelnut-latte.jpg',       desc: 'Roasted hazelnut praline, espresso and a swirl of cream over latte art.' },
    { id: 11, name: 'Chai Latte',             cat: 'latte',      price: 4.9,  rating: 4.6, tag: 'Spiced',        img: '/__l5e/assets-v1/928a67be-ea38-4a34-9439-4fa5006d9b71/chai-latte.jpg',           desc: 'House-blend black tea, cardamom, cinnamon, clove, steamed milk.' },
    { id: 12, name: 'Flat White',             cat: 'flatwhite',  price: 4.6,  rating: 4.8, tag: 'Smooth',        img: '/__l5e/assets-v1/df917100-166b-41c7-8570-0e0f4d664302/flat-white.jpg',           desc: 'Double ristretto under thin microfoam. Australasian classic, perfectly poured.' },
    { id: 13, name: 'Cortado',                cat: 'flatwhite',  price: 4.4,  rating: 4.7, tag: 'Balanced',      img: '/__l5e/assets-v1/b25f2797-3f9a-4bf8-9a7c-31e86a3ab3f8/cortado.jpg',              desc: 'Espresso cut with warm milk in equal measure. Small but mighty.' },
    { id: 14, name: 'Matcha Latte',           cat: 'matcha',     price: 5.2,  rating: 4.8, tag: 'Ceremonial',    img: '/__l5e/assets-v1/2fe8bea7-9441-4642-a8dc-5ec42773d83e/matcha-latte.jpg',         desc: 'Stone-ground ceremonial matcha whisked with steamed milk.' },
    { id: 15, name: 'Iced Matcha',            cat: 'matcha',     price: 5.4,  rating: 4.7, tag: 'Cold',          img: '/__l5e/assets-v1/bc5f7f2a-bade-48ba-a574-62f10d629a79/iced-matcha.jpg',          desc: 'Matcha shaken with ice and milk. Vibrant green, gently sweet.' },
    { id: 16, name: 'Matcha Cloud',           cat: 'matcha',     price: 5.8,  rating: 4.9, tag: 'Signature',     img: '/__l5e/assets-v1/55547524-b4e5-4219-a58e-71cc7c56a298/matcha-cloud.jpg',         desc: 'Matcha, espresso, brown sugar and cold foam. A dual-layered wonder.' },
    { id: 17, name: 'Honey Lavender Latte',   cat: 'signature',  price: 6.2,  rating: 5.0, tag: "Barista's Choice", img: '/__l5e/assets-v1/78a42558-7a6a-405a-9dd3-94f96f26d5d5/honey-lavender-latte.jpg', desc: 'Wildflower honey, French lavender, double shot, oat milk.' },
    { id: 18, name: 'Brown Sugar Shaken',     cat: 'signature',  price: 6.0,  rating: 4.9, tag: 'Hand-Shaken',   img: '/__l5e/assets-v1/f37e28bc-51b8-4486-9d73-aa1c3c134a3a/brown-sugar-shaken.jpg',   desc: 'Brown sugar syrup shaken with espresso and cinnamon. Frothy, cool.' },
    { id: 19, name: 'Spiced Mocha',           cat: 'signature',  price: 6.4,  rating: 4.8, tag: 'Rich',          img: '/__l5e/assets-v1/3277a2e9-45fb-4e3e-b06a-80f46f59a84d/spiced-mocha.jpg',         desc: '70% dark chocolate, espresso, a whisper of chili, steamed milk.' },
    { id: 20, name: 'House Blend Pour Over',  cat: 'signature',  price: 5.5,  rating: 4.9, tag: 'Slow Brew',     img: '/__l5e/assets-v1/80955e87-2c19-4e43-bb91-2800b45fde7f/pour-over.jpg',            desc: 'Single origin, hand-poured bloom by bloom. Three minutes of patience.' },
    { id: 21, name: 'Butter Croissant',       cat: 'desserts',   price: 3.8,  rating: 4.9, tag: 'Baked Daily',   img: '/__l5e/assets-v1/e1848c12-38cd-41bb-b2d1-cefb64739697/croissant.jpg',            desc: '72-hour laminated dough, baked until shatteringly flaky.' },
    { id: 22, name: 'Pain au Chocolat',       cat: 'desserts',   price: 4.2,  rating: 4.8, tag: 'Two Bars',      img: '/__l5e/assets-v1/3c3e91e6-1065-4b78-b079-74fac06c1ff5/pain-chocolat.jpg',        desc: 'Same croissant dough, two batons of 70% dark chocolate inside.' },
    { id: 23, name: 'Almond Danish',          cat: 'desserts',   price: 4.5,  rating: 4.7, tag: 'Frangipane',    img: '/__l5e/assets-v1/3ac94c93-d1a3-42c5-8330-f7df5282e023/almond-danish.jpg',        desc: 'Frangipane cream, toasted almonds, light glaze. French-style.' },
    { id: 24, name: 'Tiramisu',               cat: 'desserts',   price: 6.0,  rating: 4.9, tag: 'House-Made',    img: '/__l5e/assets-v1/87ed9fec-ceee-4cb9-8447-1b73df53fbd9/tiramisu.jpg',             desc: 'Espresso-soaked ladyfingers, mascarpone, dark cocoa dust.' },
  ];

  const CATS = [
    { id: 'all', label: 'All' },
    { id: 'espresso', label: 'Espresso' },
    { id: 'cappuccino', label: 'Cappuccino' },
    { id: 'latte', label: 'Latte' },
    { id: 'flatwhite', label: 'Flat White' },
    { id: 'matcha', label: 'Matcha' },
    { id: 'signature', label: 'Signature' },
    { id: 'desserts', label: 'Desserts' },
  ];


  const C={esp:'#3b1f12',milk:'#f3e9dc',foam:'#fffaf2',water:'#8a5a3b',ice:'#d9eef5',choc:'#4a2615',car:'#c98a3a',van:'#efd9a7',haz:'#a8743f',chai:'#b98557',mat:'#7fa548',matl:'#b8d48c',hon:'#e3b23c',lav:'#b9a3d6',bs:'#8b5a2b',cream:'#fff6e6',butter:'#e8b65a',dough:'#dcb07a',alm:'#d9b98a',masc:'#f5ead2',cocoa:'#6b3d22'};
  const INGREDIENTS={
    1:[['Espresso',C.esp,70],['Crema',C.car,30]],
    2:[['Espresso ×2',C.esp,80],['Crema',C.car,20]],
    3:[['Hot water',C.water,60],['Espresso ×2',C.esp,40]],
    4:[['Espresso',C.esp,70],['Milk foam',C.foam,30]],
    5:[['Espresso',C.esp,33],['Steamed milk',C.milk,33],['Foam & cocoa',C.foam,34]],
    6:[['Ice',C.ice,30],['Espresso',C.esp,30],['Cold foam',C.foam,40]],
    7:[['Caramel',C.car,20],['Espresso',C.esp,30],['Steamed milk',C.milk,25],['Foam & sea salt',C.foam,25]],
    8:[['Vanilla syrup',C.van,15],['Espresso ×2',C.esp,30],['Steamed milk',C.milk,55]],
    9:[['Ice',C.ice,30],['Cold milk',C.milk,45],['Espresso',C.esp,25]],
    10:[['Hazelnut praline',C.haz,20],['Espresso',C.esp,30],['Steamed milk',C.milk,35],['Cream',C.cream,15]],
    11:[['Spiced black tea',C.chai,50],['Steamed milk',C.milk,40],['Cinnamon',C.car,10]],
    12:[['Ristretto ×2',C.esp,55],['Microfoam',C.milk,45]],
    13:[['Espresso',C.esp,50],['Warm milk',C.milk,50]],
    14:[['Ceremonial matcha',C.mat,35],['Steamed milk',C.matl,65]],
    15:[['Ice',C.ice,25],['Milk',C.milk,40],['Matcha',C.mat,35]],
    16:[['Milk & ice',C.milk,30],['Matcha',C.mat,25],['Brown sugar',C.bs,15],['Espresso',C.esp,15],['Cold foam',C.foam,15]],
    17:[['Wildflower honey',C.hon,15],['Lavender',C.lav,10],['Espresso ×2',C.esp,30],['Oat milk',C.milk,45]],
    18:[['Brown sugar syrup',C.bs,20],['Ice',C.ice,25],['Espresso',C.esp,35],['Froth & cinnamon',C.foam,20]],
    19:[['Dark chocolate',C.choc,25],['Espresso',C.esp,25],['Chili',C.car,5],['Steamed milk',C.milk,45]],
    20:[['Hand-poured coffee',C.water,100]],
    21:[['Laminated dough',C.dough,60],['French butter',C.butter,40]],
    22:[['Croissant dough',C.dough,55],['Butter',C.butter,20],['70% chocolate',C.choc,25]],
    23:[['Danish dough',C.dough,45],['Frangipane',C.van,30],['Toasted almonds',C.alm,25]],
    24:[['Espresso ladyfingers',C.haz,40],['Mascarpone',C.masc,45],['Cocoa dust',C.cocoa,15]]
  };
  const isFood=p=>p.cat==='desserts';
  const vesselHTML=p=>{const L=INGREDIENTS[p.id]||[];return `
    <div class="ing-panel" aria-hidden="true">
      <div class="ing-vessel ${isFood(p)?'is-plate':''} ${/iced|cold|shaken|cloud/i.test(p.name+p.tag)?'is-glass':''}">
        <div class="ing-fill">${L.map((l,j)=>`<span class="ing-layer" style="--h:${l[2]}%;--c:${l[1]};--j:${j}"></span>`).join('')}</div>
        <span class="ing-stream"></span>
      </div>
      <ul class="ing-list">${L.map((l,j)=>`<li style="--j:${j}"><i style="background:${l[1]}"></i>${l[0]}</li>`).join('')}</ul>
    </div>`;};
  const filtersEl = $('#menuFilters');
  const gridEl = $('#menuGrid');

  const renderMenu = cat => {
    const items = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);
    gridEl.innerHTML = items.map((p, i) => `
      <article class="menu-card" style="--i:${i}">
        <div class="menu-card-img">
          <span class="menu-card-tag">${p.tag}</span>
          ${vesselHTML(p)}
          <img src="${p.img}" alt="${p.name}" loading="lazy" width="800" height="600"
               onerror="this.style.display='none';this.parentNode.classList.add('img-missing')">
        </div>
        <div class="menu-card-body">
          <div class="menu-card-row">
            <h3 class="menu-card-name">${p.name}</h3>
            <span class="menu-card-price">$${p.price.toFixed(2)}</span>
          </div>
          <p class="menu-card-desc">${p.desc}</p>
          <div class="menu-card-foot">
            <span class="menu-card-rating"><b>★</b> ${p.rating} · <span class="menu-card-cat">${CATS.find(c => c.id === p.cat).label}</span></span>
            <button type="button" class="ing-btn" aria-label="Show ingredients of ${p.name}">What's inside</button>
          </div>
        </div>
      </article>`).join('');
  };

  if (filtersEl && gridEl) {
    filtersEl.innerHTML = CATS.map((c, i) =>
      `<button role="tab" aria-selected="${i === 0}" class="${i === 0 ? 'active' : ''}" data-cat="${c.id}">${c.label}</button>`).join('');
    filtersEl.addEventListener('click', e => {
      const btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      $$('button', filtersEl).forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      renderMenu(btn.dataset.cat);
    });
    renderMenu('all');
    gridEl.addEventListener('click', e => {
      const b = e.target.closest('.ing-btn'); if (!b) return;
      const card = b.closest('.menu-card'); const on = !card.classList.contains('show-ing');
      card.classList.remove('show-ing'); void card.offsetWidth; card.classList.toggle('show-ing', on);
      b.textContent = on ? 'Hide' : "What's inside";
    });
  }

  /* ---------- Testimonials slider ---------- */
  const track = $('#testiTrack');
  if (track) {
    const cards = $$('.testi-card', track);
    const dotsEl = $('#testiDots');
    let idx = 0, timer = null;

    dotsEl.innerHTML = cards.map((_, i) =>
      `<button aria-label="Go to testimonial ${i + 1}" class="${i === 0 ? 'active' : ''}"></button>`).join('');
    const dots = $$('button', dotsEl);

    const go = n => {
      cards.forEach((c, i) => {
        c.classList.remove('active', 'leaving');
        if (i === n) c.classList.add('active');
        else if (i === idx && i !== n) c.classList.add('leaving');
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === n));
      idx = n;
    };
    const next = () => go((idx + 1) % cards.length);
    const prev = () => go((idx - 1 + cards.length) % cards.length);

    $('#testiNext').addEventListener('click', () => { next(); restart(); });
    $('#testiPrev').addEventListener('click', () => { prev(); restart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));

    const restart = () => {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(next, 6500);
    };
    go(0); restart();

    // swipe
    let sx = null;
    track.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
    track.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
      sx = null; restart();
    }, { passive: true });
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = $('#lightbox');
  if (lightbox) {
    const lbImg = $('#lightboxImg');
    const lbCap = $('#lightboxCap');
    const openLb = fig => {
      const img = $('img', fig);
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = $('figcaption', fig) ? $('figcaption', fig).textContent : img.alt;
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add('open'));
      document.body.style.overflow = 'hidden';
      $('#lightboxClose').focus();
    };
    const closeLb = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => (lightbox.hidden = true), 350);
    };
    $$('[data-lightbox]').forEach(f => f.addEventListener('click', () => openLb(f)));
    $('#lightboxClose').addEventListener('click', closeLb);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- Newsletter ---------- */
  const newsForm = $('#newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', async e => {
      e.preventDefault();
      const input = $('input', newsForm), btn = $('button', newsForm);
      btn.disabled = true;
      try {
        const r = await fetch('/api/public/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: input.value }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        $('#newsNote').hidden = false; newsForm.reset(); toast('Thanks — you are on the list.');
      } catch (x) { toast(x.message || 'Could not subscribe. Please try again.'); }
      finally { btn.disabled = false; }
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ---------- Hero video fallback ---------- */
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      hero.classList.add('no-video');
    });
    // if autoplay blocked, show poster stays — nothing else needed
  }
})();

/* ---------- Reservation flow ---------- */
(() => {
  const m = document.getElementById('rsv'); if (!m) return;
  const form = document.getElementById('rsvForm');
  const steps = [...m.querySelectorAll('.rsv-step')], pills = [...m.querySelectorAll('.rsv-steps span')];
  const date = document.getElementById('rsvDate');
  const iso = d => d.toISOString().slice(0, 10);
  const today = new Date(); const max = new Date(Date.now() + 60 * 864e5);
  date.min = iso(today); date.max = iso(max); date.value = iso(today);
  const go = n => { steps.forEach(s => s.classList.toggle('on', s.dataset.step == n)); pills.forEach((p, i) => p.classList.toggle('on', i === n - 1)); };
  const open = e => { e && e.preventDefault(); go(1); form.reset(); date.value = iso(today); m.querySelectorAll('[data-g],[data-v]').forEach(b => b.classList.toggle('on', ['2','Main hall','None'].includes(b.dataset.g || b.dataset.v))); m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; };
  const close = () => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; };
  document.querySelectorAll('[data-reserve]').forEach(b => b.addEventListener('click', open));
  m.querySelectorAll('[data-rsv-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
  m.addEventListener('click', e => {
    const g = e.target.closest('[data-g]');
    if (g) { m.querySelectorAll('[data-g]').forEach(b => b.classList.remove('on')); g.classList.add('on'); form.party_size.value = g.dataset.g; }
    const c = e.target.closest('[data-v]');
    if (c) { const wrap = c.parentElement; wrap.querySelectorAll('button').forEach(b => b.classList.remove('on')); c.classList.add('on'); form[wrap.dataset.name].value = c.dataset.v; }
    const nx = e.target.closest('[data-go]');
    if (nx) {
      if (nx.dataset.go === '2') {
        if (!date.value || date.value < date.min || date.value > date.max) { date.classList.add('invalid'); return; }
        date.classList.remove('invalid');
        const d = new Date(date.value + 'T00:00:00');
        document.getElementById('rsvSummary').textContent = `${form.party_size.value === '10' ? '9–12' : form.party_size.value} guests · ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · ${form.reservation_time.value} · ${form.area.value}`;
      }
      go(+nx.dataset.go);
    }
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = document.getElementById('rsvErr'), btn = document.getElementById('rsvSubmit');
    let bad = false;
    [form.full_name, form.phone].forEach(i => { const ok = i.value.trim().length >= (i === form.phone ? 7 : 2); i.classList.toggle('invalid', !ok); bad ||= !ok; });
    if (bad) { err.textContent = 'Please add your name and phone number.'; return; }
    err.textContent = ''; btn.disabled = true; btn.textContent = 'Booking…';
    const data = Object.fromEntries(new FormData(form));
    data.party_size = Number(data.party_size);
    try {
      const r = await fetch('/api/public/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Something went wrong.');
      document.getElementById('rsvDoneText').textContent = `Thank you, ${data.full_name.split(' ')[0]}! ${document.getElementById('rsvSummary').textContent}. We'll call you at ${data.phone} to confirm.`;
      go(3);
    } catch (x) { err.textContent = x.message || 'Could not send. Please try again.'; }
    finally { btn.disabled = false; btn.textContent = 'Confirm reservation'; }
  });
})();

/* ---------- Open-now badge, year, back to top ---------- */
(() => {
  const el = document.getElementById('openNow');
  if (el) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    const [o, c] = (d === 0 || d === 6) ? [8, 22] : [7, 21];
    const open = h >= o && h < c;
    el.classList.toggle('is-open', open);
    el.querySelector('span').textContent = open ? `Open now · until ${c - 12} PM` : `Closed · opens ${o} AM`;
  }
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  const top = document.getElementById('toTop');
  if (top) {
    window.addEventListener('scroll', () => top.classList.toggle('show', scrollY > 900), { passive: true });
    top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();
