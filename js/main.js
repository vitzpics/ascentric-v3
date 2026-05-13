/* ============================================================
   ASCENTRIC — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV SCROLL BEHAVIOR ──────────────────────────────── */

  const nav = document.querySelector('.nav');

  function handleNavScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  if (nav) {
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // run on load
  }

  /* ── MOBILE MENU ──────────────────────────────────────── */

  const toggle     = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── HERO BG PARALLAX LOAD ────────────────────────────── */

  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    // Trigger the zoom-out after first paint
    requestAnimationFrame(function () {
      setTimeout(function () {
        heroBg.classList.add('loaded');
      }, 100);
    });
  }

  /* ── SCROLL REVEAL ────────────────────────────────────── */

  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── SMOOTH ANCHOR SCROLL ─────────────────────────────── */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── CONTACT FORM SUBMISSION ──────────────────────────── */

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn     = contactForm.querySelector('[type="submit"]');
      const origTxt = btn.textContent;

      btn.textContent = 'Sending…';
      btn.disabled    = true;

      // Netlify handles the form via the netlify attribute.
      // This gives visual feedback while it submits.
      const data = new FormData(contactForm);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
        .then(function () {
          contactForm.innerHTML =
            '<p style="font-family:var(--font-display);font-size:1.5rem;color:var(--dark);line-height:1.6;">' +
            'Thank you. Adam will be in touch shortly.</p>';
        })
        .catch(function () {
          btn.textContent = origTxt;
          btn.disabled    = false;
          alert('Something went wrong. Please email hello@ascentric.io directly.');
        });
    });
  }

  /* ── ACTIVE NAV LINK ──────────────────────────────────── */

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(function (link) {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.style.opacity = '1';
      link.style.fontWeight = '600';
    }
  });

})();
