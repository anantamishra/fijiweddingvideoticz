/* Videoticz Fiji — front-end behaviour for the static home page:
   mobile nav, sticky header state, testimonial slider, scroll reveal,
   back-to-top, and a no-backend contact form handler. */
(function () {
  'use strict';

  /* ---- Mobile navigation ---- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && window.innerWidth <= 880) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Sticky header shadow + back-to-top visibility ---- */
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 10);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Testimonial slider ---- */
  var track = document.getElementById('reviewsTrack');
  var dotsBox = document.getElementById('reviewsDots');

  if (track && dotsBox) {
    var slides = Array.prototype.slice.call(track.children);
    var index = 0;
    var timer = null;

    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      dot.addEventListener('click', function () { go(i); restart(); });
      dotsBox.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsBox.children);

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      dots.forEach(function (d, n) {
        d.setAttribute('aria-selected', n === index ? 'true' : 'false');
      });
      setHeight();
    }

    /* Keep the slider as tall as the visible quote only. */
    function setHeight() {
      track.style.height = slides[index].offsetHeight + 'px';
    }

    window.addEventListener('resize', setHeight);
    window.addEventListener('load', setHeight);

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 7000);
    }

    go(0);
    restart();

    var reviews = document.getElementById('reviews');
    reviews.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    reviews.addEventListener('mouseleave', restart);

    /* Touch swipe */
    var startX = null;
    reviews.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    reviews.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null;
      restart();
    });
  }

  /* ---- Reveal sections on scroll ---- */
  var targets = document.querySelectorAll('.section-title, .venue-card, .video-embed, .info-box, .badge-row img, .intro p');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  }

  /* ---- Contact form (static build: no backend) ---- */
  var form = document.querySelector('.contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      var required = form.querySelectorAll('[required]');
      var missing = Array.prototype.filter.call(required, function (f) { return !f.value.trim(); });

      if (missing.length) {
        note.textContent = 'Please fill in all required fields.';
        missing[0].focus();
        return;
      }
      note.textContent = 'Thanks — this static build has no mail backend. Email videoticzfiji@gmail.com or call +679 9452304.';
      form.reset();
    });
  }
})();
