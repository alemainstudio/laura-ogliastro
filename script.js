/**
 * =============================================
 * Laura Ogliastro – script.js
 * Comportamenti interattivi del sito vetrina
 * Vanilla JS puro, nessuna dipendenza esterna
 * =============================================
 */

'use strict';

/* ─── 1. NAVBAR: scroll effect & hamburger menu ─── */
(function initNavbar() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger-btn');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Aggiungi classe "scrolled" quando si scorre oltre 60px
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // esegui subito al caricamento

  // Toggle hamburger menu
  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    // Blocca lo scroll del body quando il menu è aperto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);

  // Chiudi menu al click su un link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Chiudi menu al click fuori
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu();
    }
  });
})();


/* ─── 2. SMOOTH SCROLL con offset per la navbar ─── */
(function initSmoothScroll() {
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
    10
  ) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─── 3. ANIMAZIONI ON SCROLL (AOS leggero custom) ─── */
(function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);

          setTimeout(() => {
            el.classList.add('aos-animate');
          }, delay);

          observer.unobserve(el); // anima una sola volta
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ─── 4. CONTATORE NUMERI (Stats Strip) ─── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1800; // ms
        const step   = 30;     // ms tra ogni aggiornamento
        const increment = target / (duration / step);
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current);
        }, step);

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


/* ─── 5. GALLERIA MARQUEE & LIGHTBOX ─── */
(function initGalleryMarquee() {
  const outer        = document.getElementById('gallery-marquee-outer');
  const track        = document.getElementById('gallery-track');
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxCapt = document.getElementById('lightbox-caption');
  const closeBtn     = document.getElementById('lightbox-close');
  const lbPrevBtn    = document.getElementById('lightbox-prev');
  const lbNextBtn    = document.getElementById('lightbox-next');

  if (!track) return;

  // Only the FIRST set of tiles (not the duplicates) are lightbox-able
  const tiles = Array.from(track.querySelectorAll('.gallery-tile:not([aria-hidden])'));
  let currentLbIndex = 0;

  /* ── Lightbox ── */
  function openLightbox(index) {
    currentLbIndex = index;
    const tile = tiles[index];
    const src  = tile.getAttribute('data-src') || '';
    const cap  = tile.getAttribute('data-caption') || '';
    lightboxImg.src  = src;
    lightboxImg.alt  = cap;
    lightboxCapt.textContent = cap;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (lbPrevBtn) lbPrevBtn.style.opacity = index === 0 ? '0.35' : '1';
    if (lbNextBtn) lbNextBtn.style.opacity = index === tiles.length - 1 ? '0.35' : '1';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 350);
  }

  function showLbNext() { if (currentLbIndex < tiles.length - 1) openLightbox(currentLbIndex + 1); }
  function showLbPrev() { if (currentLbIndex > 0) openLightbox(currentLbIndex - 1); }

  // Click on any tile (real or clone) opens lightbox at its index
  track.addEventListener('click', (e) => {
    const tile = e.target.closest('.gallery-tile');
    if (!tile) return;
    const idx = parseInt(tile.getAttribute('data-index'), 10);
    if (!isNaN(idx)) openLightbox(idx);
  });

  if (closeBtn)  closeBtn.addEventListener('click',  closeLightbox);
  if (lbPrevBtn) lbPrevBtn.addEventListener('click', showLbPrev);
  if (lbNextBtn) lbNextBtn.addEventListener('click', showLbNext);
  if (lightbox)  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowRight')  showLbNext();
    if (e.key === 'ArrowLeft')   showLbPrev();
  });

  /* ── Mobile: pause marquee on touch (tap to pause, then re-start after 2.5s) ── */
  if (outer) {
    let touchPauseTimer = null;

    outer.addEventListener('touchstart', () => {
      outer.classList.add('is-paused');
      clearTimeout(touchPauseTimer);
    }, { passive: true });

    outer.addEventListener('touchend', () => {
      clearTimeout(touchPauseTimer);
      touchPauseTimer = setTimeout(() => {
        outer.classList.remove('is-paused');
      }, 2500);
    }, { passive: true });
  }
})();




/* ─── 6. REVIEWS SLIDER ─── */
(function initReviewsSlider() {
  const track   = document.getElementById('reviews-track');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsEl  = document.getElementById('slider-dots');

  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  if (!cards.length) return;

  let currentSlide  = 0;
  let autoPlayTimer = null;

  function getMetrics() {
    const wrapper = track.parentElement;
    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const computedStyle = window.getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap) || 24;
    const cardWidth = cards[0].getBoundingClientRect().width;

    // Quante card sono visibili contemporaneamente
    const visibleCards = Math.max(1, Math.round((wrapperWidth + gap) / (cardWidth + gap)));
    const maxSlide = Math.max(0, cards.length - visibleCards);

    return { gap, cardWidth, visibleCards, maxSlide };
  }

  function buildDots(maxSlide) {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const numDots = maxSlide + 1;

    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-dot${i === currentSlide ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Vai alla recensione ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsEl.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsEl) return;
    const dots = dotsEl.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function goToSlide(index) {
    const { gap, cardWidth, maxSlide } = getMetrics();

    currentSlide = Math.max(0, Math.min(index, maxSlide));

    // Calcola l'offset esatto in pixel
    const offset = currentSlide * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    buildDots(maxSlide);
    updateDots();
  }

  function goNext() {
    const { maxSlide } = getMetrics();
    if (currentSlide >= maxSlide) {
      goToSlide(0);
    } else {
      goToSlide(currentSlide + 1);
    }
  }

  function goPrev() {
    const { maxSlide } = getMetrics();
    if (currentSlide <= 0) {
      goToSlide(maxSlide);
    } else {
      goToSlide(currentSlide - 1);
    }
  }

  // Auto-play
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(goNext, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => { goPrev(); startAutoPlay(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { goNext(); startAutoPlay(); });
  }

  // Swipe su dispositivi touch / mobile
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
      startAutoPlay();
    }
  });

  // Pausa auto-play quando il mouse è sopra le recensioni
  track.parentElement.addEventListener('mouseenter', stopAutoPlay);
  track.parentElement.addEventListener('mouseleave', startAutoPlay);

  // Ricalcola posizione al ridimensionamento della finestra
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      goToSlide(currentSlide);
    }, 150);
  });

  // Inizializza slider
  goToSlide(0);
  startAutoPlay();
})();


/* ─── 7. ACTIVE NAV LINK su scroll (Scrollspy) ─── */
(function initScrollspy() {
  const sections   = document.querySelectorAll('section[id], footer[id]');
  const navLinks   = document.querySelectorAll('.nav-links a');
  const navHeight  = 80;

  function onScroll() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - navHeight - 20;
      if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ─── 8. LAZY LOAD immagini con fallback ─── */
(function initLazyImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  images.forEach(img => {
    img.addEventListener('error', () => {
      // Fallback placeholder se l'immagine Unsplash non carica
      img.src = `https://placehold.co/600x600/ede7f6/6a4c93?text=Laura+Ogliastro`;
    });
  });
})();


/* ─── 9. PRELOADER (animazione entrata) ─── */
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
  });
})();


/* ─── 10. CONSOLE WELCOME MESSAGE ─── */
console.log(
  '%c✦ Laura Ogliastro%c\nBenessere & Bellezza per i tuoi Capelli\nFicarazzi (Palermo)',
  'color: #6a4c93; font-size: 1.4em; font-weight: bold;',
  'color: #9e8c85; font-size: 1em;'
);
