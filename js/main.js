/* Ascentric — progressive enhancement, navigation and the existing Netlify form. */
(function () {
  'use strict';
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.nav__mobile');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (nav) {
    const updateNav = () => nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  if (toggle && menu) {
    function setMenu(open, restoreFocus) {
      menu.hidden = !open;
      menu.inert = !open;
      menu.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (main) main.inert = open;
      if (footer) footer.inert = open;
      if (open) menu.querySelector('a').focus();
      else if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener('click', () => setMenu(menu.hidden, true));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, false)));
    document.addEventListener('keydown', event => {
      if (menu.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (event.key === 'Tab') {
        const targets = [toggle, ...menu.querySelectorAll('a')];
        const index = targets.indexOf(document.activeElement);
        if (event.shiftKey && index <= 0) { event.preventDefault(); targets[targets.length - 1].focus(); }
        else if (!event.shiftKey && index === targets.length - 1) { event.preventDefault(); toggle.focus(); }
      }
    });
    window.matchMedia('(min-width: 1051px)').addEventListener('change', event => {
      if (event.matches && !menu.hidden) setMenu(false, false);
    });
  }

  const hero = document.querySelector('.hero__bg');
  if (hero) hero.classList.add('loaded');
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      if (target.matches('details')) target.open = true;
      event.preventDefault();
      history.pushState(null, '', '#' + id);
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  const current = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  const group = ['culture-cartography', 'class-iv'].includes(current) ? 'approach' : current;
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(link => {
    if ((link.getAttribute('href') || '').replace(/\.html$/, '') === group && !link.classList.contains('nav__cta') && !link.classList.contains('nav__mobile-cta')) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // Manual, progressively enhanced carousel. All approved quotes remain readable without JS.
  document.querySelectorAll('.testimonial-carousel').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('.testimonial-slide')];
    const controls = carousel.querySelector('.carousel-controls');
    if (slides.length < 2 || !controls) return;
    const status = carousel.querySelector('[data-carousel-status]');
    let currentSlide = 0;
    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== currentSlide;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
      });
      status.textContent = `${currentSlide + 1} / ${slides.length}`;
    }
    controls.hidden = false;
    carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => showSlide(currentSlide - 1));
    carousel.querySelector('[data-carousel-next]').addEventListener('click', () => showSlide(currentSlide + 1));
    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    showSlide(0);
  });
  function openLinkedDetails() {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target && target.matches('details')) target.open = true;
  }
  openLinkedDetails();
  window.addEventListener('hashchange', openLinkedDetails);

  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const button = form.querySelector('[type="submit"]');
  const select = document.getElementById('interest');
  const interestMap = { 'class-iv': 'Class IV', 'partnerships': 'Partnerships', 'culture': 'Culture & Teams', 'strategy': 'Strategy & Organization', 'leadership': 'Executive Leadership', 'eq-i': 'EQ-i 2.0' };
  const requestedInterest = new URLSearchParams(window.location.search).get('interest');
  if (select && interestMap[requestedInterest]) select.value = interestMap[requestedInterest];
  const localPreview = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) || window.location.protocol === 'file:';
  function announce(message, state) {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }
  if (localPreview) announce('Local preview: this form will not send a message.', 'preview');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (localPreview) {
      announce('Preview only. Your message has not been sent. The existing contact connection is preserved for a future approved release.', 'preview');
      return;
    }
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    announce('', 'pending');
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      announce('Thank you. Your message has been sent. Adam will be in touch.', 'success');
    } catch (error) {
      announce('Your message could not be sent. Please try again or email hello@ascentric.io. Your entries are still here.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
})();
