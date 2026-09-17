/* Videoticz Fiji — interface behaviour
   Menu overlay · sticky masthead · scroll progress · reveals
   Mosaic lightbox · click-to-load Vimeo · quote slider · form */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Masthead + scroll progress ---------------- */
  var masthead = document.getElementById('masthead');
  var progress = document.getElementById('scrollProgress');
  var hero = document.querySelector('.hero');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      var trigger = hero ? Math.min(hero.offsetHeight - 120, window.innerHeight * 0.7) : 80;

      if (masthead) masthead.classList.toggle('is-solid', y > trigger);

      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------- Menu overlay ---------------- */
  var menuBtn = document.getElementById('menuBtn');
  var menuPanel = document.getElementById('menuPanel');
  var lastFocus = null;

  function openMenu() {
    lastFocus = document.activeElement;
    menuPanel.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { menuPanel.classList.add('is-open'); });
    menuBtn.setAttribute('aria-expanded', 'true');
    var first = menuPanel.querySelector('a');
    if (first) first.focus();
  }

  function closeMenu() {
    menuPanel.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () { menuPanel.hidden = true; }, reduced ? 0 : 420);
    if (lastFocus) lastFocus.focus();
  }

  if (menuBtn && menuPanel) {
    menuBtn.addEventListener('click', function () {
      if (menuBtn.getAttribute('aria-expanded') === 'true') closeMenu(); else openMenu();
    });
    menuPanel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealables = document.querySelectorAll(
    '.section-head, .story-figure, .story-copy > *, .tile, .film, .contact-list li, .enquire-form, .trust ul, .footer-col, .footer-brand'
  );

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(revealables, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      io.observe(el);
    });
  }

  /* ---------------- Films: load the player only on demand ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.film'), function (film) {
    var btn = film.querySelector('.film-play');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var id = film.getAttribute('data-vimeo');
      var frame = document.createElement('iframe');
      frame.className = 'film-frame';
      frame.src = 'https://player.vimeo.com/video/' + id + '?autoplay=1&title=0&byline=0&portrait=0';
      frame.title = film.querySelector('h3') ? film.querySelector('h3').textContent + ' — wedding film' : 'Wedding film';
      frame.allow = 'autoplay; fullscreen; picture-in-picture';
      frame.setAttribute('allowfullscreen', '');
      btn.replaceWith(frame);
    });
  });

  /* ---------------- Lightbox ---------------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var zooms = Array.prototype.slice.call(document.querySelectorAll('.tile-zoom'));
  var lbIndex = 0;
  var lbOpener = null;

  function showShot(i) {
    lbIndex = (i + zooms.length) % zooms.length;
    var z = zooms[lbIndex];
    lbImg.src = z.getAttribute('data-full');
    lbImg.alt = z.getAttribute('data-caption') || '';
    lbCap.textContent = z.getAttribute('data-caption') || '';
  }

  function openLb(i, opener) {
    lbOpener = opener || null;
    lb.hidden = false;
    document.body.classList.add('is-locked');
    showShot(i);
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    document.getElementById('lbClose').focus();
  }

  function closeLb() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () { lb.hidden = true; lbImg.src = ''; }, reduced ? 0 : 320);
    if (lbOpener) lbOpener.focus();
  }

  if (lb && zooms.length) {
    zooms.forEach(function (z, i) {
      z.addEventListener('click', function () { openLb(i, z); });
    });
    document.getElementById('lbClose').addEventListener('click', closeLb);
    document.getElementById('lbPrev').addEventListener('click', function () { showShot(lbIndex - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { showShot(lbIndex + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  }

  /* ---------------- Quote slider ---------------- */
  var track = document.getElementById('quoteTrack');
  var dotsBox = document.getElementById('quoteDots');
  var qIndex = 0;
  var qTimer = null;
  var quotes = [];
  var qDots = [];

  function sizeTrack() {
    if (quotes.length) track.style.height = quotes[qIndex].offsetHeight + 'px';
  }

  function goQuote(i) {
    qIndex = (i + quotes.length) % quotes.length;
    track.style.transform = 'translateX(' + (-100 * qIndex) + '%)';
    qDots.forEach(function (d, n) { d.setAttribute('aria-selected', n === qIndex ? 'true' : 'false'); });
    sizeTrack();
  }

  function restartQuotes() {
    if (qTimer) clearInterval(qTimer);
    if (!reduced) qTimer = setInterval(function () { goQuote(qIndex + 1); }, 8000);
  }

  if (track && dotsBox) {
    quotes = Array.prototype.slice.call(track.children);

    quotes.forEach(function (q, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goQuote(i); restartQuotes(); });
      dotsBox.appendChild(dot);
    });
    qDots = Array.prototype.slice.call(dotsBox.children);

    document.getElementById('quotePrev').addEventListener('click', function () { goQuote(qIndex - 1); restartQuotes(); });
    document.getElementById('quoteNext').addEventListener('click', function () { goQuote(qIndex + 1); restartQuotes(); });

    goQuote(0);
    restartQuotes();
    window.addEventListener('resize', sizeTrack);
    window.addEventListener('load', sizeTrack);

    var stage = document.getElementById('quoteStage');
    stage.addEventListener('mouseenter', function () { if (qTimer) clearInterval(qTimer); });
    stage.addEventListener('mouseleave', restartQuotes);

    var touchX = null;
    stage.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) goQuote(qIndex + (dx < 0 ? 1 : -1));
      touchX = null;
      restartQuotes();
    });
  }

  /* ---------------- Keyboard ---------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (lb && !lb.hidden) closeLb();
      else if (menuPanel && !menuPanel.hidden) closeMenu();
    }
    if (lb && !lb.hidden) {
      if (e.key === 'ArrowRight') showShot(lbIndex + 1);
      if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
    }
  });

  /* ---------------- Enquiry form (static build: no backend) ---------------- */
  var form = document.querySelector('.enquire-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));
      var missing = required.filter(function (f) { return !f.value.trim(); });
      var email = form.querySelector('input[type="email"]');

      if (missing.length) {
        note.textContent = 'Please complete the highlighted fields.';
        missing[0].focus();
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        note.textContent = 'That e-mail address does not look right.';
        email.focus();
        return;
      }
      note.textContent = 'Thanks — this static build has no mail backend yet. Email videoticzfiji@gmail.com or call +679 9452304.';
      form.reset();
    });
  }
})();
