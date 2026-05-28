/* ═══════════════════════════════════════════════════
   LE POPOLARI — script.js
   Tutti gli effetti cinematografici in vanilla JS
═══════════════════════════════════════════════════ */

'use strict';

/* ─── UTILS ──────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function lerp(a, b, t) { return a + (b - a) * t; }
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
function map(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/* ════════════════════════════════════════════════════
   0. COOKIE BANNER
════════════════════════════════════════════════════ */
(function initCookie() {
  const banner = $('#cookie-banner');
  if (!banner) return;

  if (localStorage.getItem('lp_cookie_accepted')) {
    banner.classList.add('hidden');
    setTimeout(() => banner.remove(), 500);
    return;
  }

  $('#cookie-accept').addEventListener('click', () => {
    localStorage.setItem('lp_cookie_accepted', '1');
    banner.classList.add('hidden');
    setTimeout(() => banner.remove(), 500);
  });

  $('#cookie-decline').addEventListener('click', () => {
    banner.classList.add('hidden');
    setTimeout(() => banner.remove(), 500);
  });
})();

/* ════════════════════════════════════════════════════
   1. PRELOADER
   Barra che avanza, poi fade-out sull'evento load
════════════════════════════════════════════════════ */
(function initPreloader() {
  const preloader = $('#preloader');
  const bar = $('#preloader-bar');
  if (!preloader || !bar) return;

  let progress = 0;
  let raf;

  function advanceBar() {
    if (progress < 90) {
      progress += Math.random() * 3 + 0.5;
      progress = Math.min(progress, 90);
      bar.style.width = progress + '%';
      raf = requestAnimationFrame(advanceBar);
    }
  }
  advanceBar();

  function finishPreloader() {
    cancelAnimationFrame(raf);
    progress = 100;
    bar.style.width = '100%';
    bar.style.transition = 'width 0.3s ease';

    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.style.overflow = '';
      }, 850);
    }, 350);
  }

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    finishPreloader();
  } else {
    window.addEventListener('load', finishPreloader, { once: true });
    setTimeout(finishPreloader, 2500);
  }
})();

/* ════════════════════════════════════════════════════
   2. TYPEWRITER — hero title lettera per lettera
════════════════════════════════════════════════════ */
(function initTypewriter() {
  const target = $('#typewriter-target');
  const cursor = $('.hero__cursor');
  if (!target) return;

  const text = 'Le Popolari';
  let i = 0;
  let started = false;

  function startTyping() {
    if (started) return;
    started = true;

    const interval = setInterval(() => {
      target.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (cursor) {
          setTimeout(() => {
            cursor.style.animation = 'blink 0.9s step-end infinite';
          }, 500);
        }
      }
    }, 80);
  }

  if (document.readyState === 'complete') {
    setTimeout(startTyping, 900);
  } else {
    window.addEventListener('load', () => setTimeout(startTyping, 900), { once: true });
  }
})();

/* ════════════════════════════════════════════════════
   3. NAVBAR — appare dopo il primo scroll
════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const topbar = document.querySelector('.top-bar');
  const burger = document.getElementById('navbar-burger');
  const links  = document.getElementById('navbar-links');
  if (!navbar) return;

  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const y = window.scrollY;
    const hero = document.getElementById('hero');
    const heroH = hero ? hero.offsetHeight : 600;

    if (y > 80) {
      navbar.classList.add('visible');
    } else {
      navbar.classList.remove('visible', 'scrolled');
    }
    if (y > 200) {
      navbar.classList.add('scrolled');
    }

    // Nascondi top bar dopo la hero, navbar sale
    if (topbar) {
      const hideTopbar = y > (heroH - 100);
      if (hideTopbar) {
        topbar.classList.add('hidden');
        navbar.style.top = '0px';
      } else {
        topbar.classList.remove('hidden');
        navbar.style.top = '36px';
      }
    }

    lastScrollY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateNavbar); ticking = true; }
  }, { passive: true });

  if (burger && links) {
    burger.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    $$('.navbar__link', links).forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();


/* ════════════════════════════════════════════════════
   5. ANIMAZIONI ENTRATA — IntersectionObserver
════════════════════════════════════════════════════ */
(function initAnimations() {
  /* ── Fade-in generici ── */
  const els = $$('[data-animate], [data-stagger]');
  els.forEach(el => el.classList.add('animate-ready'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));

})();

/* ════════════════════════════════════════════════════
   5b. TYPEWRITER SPARSO — eyebrow sezioni
════════════════════════════════════════════════════ */
(function initSectionTypewriters() {
  const targets = $$('.rooms__eyebrow, .stats__eyebrow, .bitonto__eyebrow, .reviews__eyebrow, .info__eyebrow, .contact__eyebrow');
  if (!targets.length) return;

  function typeEl(el) {
    const text = el.textContent.trim();
    el.textContent = '';
    el.style.visibility = 'visible';
    let i = 0;
    const iv = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 45);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typeEl(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  targets.forEach(el => {
    el.style.visibility = 'hidden';
    obs.observe(el);
  });
})();

/* ════════════════════════════════════════════════════
   6. COUNTER ANIMATION — IntersectionObserver + rAF
════════════════════════════════════════════════════ */
(function initCounters() {
  const nums = $$('.stats__num[data-target]');
  if (nums.length === 0) return;

  const DURATION = 1500;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const start  = performance.now();

    el.classList.add('counting');

    function frame(now) {
      const elapsed = now - start;
      const t = clamp(elapsed / DURATION, 0, 1);
      const eased = easeOutQuart(t);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target + suffix;
        el.classList.remove('counting');
      }
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════
   6a. GALLERY CAROUSEL — scorre 3 foto per volta
════════════════════════════════════════════════════ */
(function initGalleryCarousels() {
  $$('[data-carousel]').forEach(wrap => {
    const track = wrap.querySelector('.rooms__carousel-track');
    const imgs = Array.from(track.querySelectorAll('.rooms__gallery-img'));
    const prevBtn = wrap.querySelector('.rooms__carousel-prev');
    const nextBtn = wrap.querySelector('.rooms__carousel-next');
    const step = 3;
    const total = imgs.length;
    let idx = 0;

    function show() {
      /* Calcola larghezza di un "gruppo" di 3 foto + gap */
      const imgW = imgs[0].offsetWidth;
      const gap = 12; /* 0.75rem ≈ 12px */
      const groupW = (imgW + gap) * step;
      track.style.transform = `translateX(-${(idx / step) * groupW}px)`;
      prevBtn.style.opacity = idx === 0 ? '0.3' : '1';
      nextBtn.style.opacity = idx + step >= total ? '0.3' : '1';
    }

    prevBtn.addEventListener('click', () => { if (idx > 0) { idx -= step; show(); } });
    nextBtn.addEventListener('click', () => { if (idx + step < total) { idx += step; show(); } });

    show();
    window.addEventListener('resize', show, { passive: true });
  });
})();

/* ════════════════════════════════════════════════════
   6b. ACCORDION SERVIZI — chiude gli altri al click
════════════════════════════════════════════════════ */
(function initAccordion() {
  const details = Array.from($$('.stats__cat'));
  if (!details.length) return;

  /* Calcola quante colonne ha la griglia */
  function getCols() {
    const grid = details[0].parentElement;
    const style = getComputedStyle(grid);
    return style.gridTemplateColumns.split(' ').length;
  }

  /* Restituisce l'indice di riga di un elemento */
  function getRow(el) {
    const cols = getCols();
    return Math.floor(details.indexOf(el) / cols);
  }

  let busy = false; /* evita loop da toggle ricorsivi */

  details.forEach(d => {
    d.addEventListener('toggle', () => {
      if (busy) return;
      busy = true;

      const row = getRow(d);

      details.forEach(other => {
        if (getRow(other) === row) {
          other.open = d.open; /* stessa riga: allineati */
        } else {
          other.open = false;  /* altra riga: chiusi */
        }
      });

      busy = false;
    });
  });
})();

/* ════════════════════════════════════════════════════
   7. STAGGER COMFORTS — IntersectionObserver
════════════════════════════════════════════════════ */
(function initComforts() {
  const comforts = $$('.stats__highlight');
  if (comforts.length === 0) return;

  /* Attiva animazione solo se JS funziona */
  const statsInner = document.querySelector('.stats__inner');
  if (statsInner) statsInner.classList.add('js-ready');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  comforts.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════
   8. BITONTO CARDS — fan-in animation
════════════════════════════════════════════════════ */
(function initBitontoCards() {
  const cards = $$('.bitonto__card');
  if (cards.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
})();

/* ════════════════════════════════════════════════════
   9. REVIEWS — spotlight + navigazione
════════════════════════════════════════════════════ */
(function initReviews() {
  const slides     = $$('.reviews__slide');
  const dots       = $$('#reviews-dots .reviews__dot');
  const btnPrev    = $('#review-prev');
  const btnNext    = $('#review-next');
  const spotlight  = $('#reviews-spotlight');
  if (slides.length === 0) return;

  let current = 0;

  function goTo(index) {
    slides[current].classList.remove('reviews__slide--active');
    dots[current]?.classList.remove('reviews__dot--active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('reviews__slide--active');
    dots[current]?.classList.add('reviews__dot--active');

    if (spotlight) {
      const x = 30 + current * 20;
      spotlight.style.background = `radial-gradient(
        ellipse 600px 400px at ${x}% 50%,
        rgba(193,127,90,0.08) 0%,
        transparent 70%
      )`;
    }
  }

  btnPrev?.addEventListener('click', () => goTo(current - 1));
  btnNext?.addEventListener('click', () => goTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index, 10)));
  });

  document.addEventListener('keydown', e => {
    if (document.activeElement?.closest('#reviews') ||
        window.scrollY + window.innerHeight / 2 > $('#reviews')?.offsetTop) {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    }
  });

  let autoTimer = setInterval(() => goTo(current + 1), 6000);
  const stage = $('#reviews-stage');
  stage?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  stage?.addEventListener('mouseleave', () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  });

  goTo(0);
})();

/* ════════════════════════════════════════════════════
   10. HOW — SVG stroke animation + step fade
════════════════════════════════════════════════════ */
(function initHowTimeline() {
  const line  = $('#how-line');
  const steps = $$('.how__step');
  if (!line && steps.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (line) line.classList.add('drawn');
        steps.forEach(s => s.classList.add('visible'));
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const section = $('#how');
  if (section) observer.observe(section);
})();

/* ════════════════════════════════════════════════════
   11. CONTACT FORM — validazione + feedback
════════════════════════════════════════════════════ */
(function initContactForm() {
  const form = $('#contact-form');
  const note = $('#form-note');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name  = $('#field-name').value.trim();
    const email = $('#field-email').value.trim();
    const msg   = $('#field-msg').value.trim();

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) { showNote('Inserisci il tuo nome.', 'error'); return; }
    if (!emailRx.test(email)) { showNote('Inserisci un\'email valida.', 'error'); return; }
    if (!msg) { showNote('Scrivi un messaggio.', 'error'); return; }

    const submitBtn = form.querySelector('.contact__submit');
    submitBtn.textContent = 'Invio in corso…';
    submitBtn.disabled = true;

    setTimeout(() => {
      showNote('Messaggio inviato! Ti risponderemo presto.', 'success');
      form.reset();
      submitBtn.textContent = 'Invia messaggio';
      submitBtn.disabled = false;
    }, 1200);
  });

  function showNote(text, type) {
    if (!note) return;
    note.textContent = text;
    note.style.color = type === 'error' ? '#e57373' : '#C17F5A';
    setTimeout(() => { note.textContent = ''; }, 5000);
  }
})();

/* ════════════════════════════════════════════════════
   12. BACK TO TOP button
════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ════════════════════════════════════════════════════
   13. SMOOTH ANCHOR SCROLL — offset per navbar fissa
════════════════════════════════════════════════════ */
(function initAnchorScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navbarH = $('#navbar')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ════════════════════════════════════════════════════
   14. LAZY LOAD FALLBACK — per browser senza supporto
════════════════════════════════════════════════════ */
(function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return;

  const lazyImages = $$('img[loading="lazy"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => observer.observe(img));
})();

/* ════════════════════════════════════════════════════
   15. TOUCH SWIPE — recensioni su mobile
════════════════════════════════════════════════════ */
(function initSwipe() {
  const stage = $('#reviews-stage');
  if (!stage) return;

  let startX = 0;
  let isDragging = false;

  stage.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    if (!isDragging) return;
    const deltaX = e.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) $('#review-next')?.click();
      else $('#review-prev')?.click();
    }
    isDragging = false;
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════
   LIGHTBOX — gallery foto stanze
════════════════════════════════════════════════════ */
(function initLightbox() {
  const lightbox  = $('#lightbox');
  const lbImg     = $('#lightbox-img');
  const lbClose   = $('#lightbox-close');
  const lbPrev    = $('#lightbox-prev');
  const lbNext    = $('#lightbox-next');
  if (!lightbox) return;

  let allImgs = [];
  let currentIdx = 0;

  function open(imgs, idx) {
    allImgs = imgs;
    currentIdx = idx;
    lbImg.src = allImgs[currentIdx].src;
    lbImg.alt = allImgs[currentIdx].alt;
    lightbox.classList.add('open');
    lbPrev.style.display = allImgs.length > 1 ? 'flex' : 'none';
    lbNext.style.display = allImgs.length > 1 ? 'flex' : 'none';
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    currentIdx = (currentIdx + dir + allImgs.length) % allImgs.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = allImgs[currentIdx].src;
      lbImg.alt = allImgs[currentIdx].alt;
      lbImg.style.opacity = '1';
    }, 150);
  }

  lbImg.style.transition = 'opacity 0.15s';

  document.addEventListener('click', e => {
    const img = e.target.closest('.rooms__gallery-img');
    if (!img) return;
    const gallery = img.closest('.rooms__gallery');
    const imgs = $$('img', gallery);
    const idx = imgs.indexOf(img);
    open(imgs, idx);
  });

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();
