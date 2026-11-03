/* The Gathering - small, dependency-free enhancements. The site works without JS. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    /* Header: solid background after scrolling past the top */
    var header = document.querySelector('[data-header]');
    var mobileCta = document.querySelector('[data-mobile-cta]');
    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 40);
      if (mobileCta) mobileCta.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Video: load the player only when the visitor presses play */
    document.querySelectorAll('[data-video-embed]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var f = document.createElement('iframe');
        f.src = a.getAttribute('data-video-embed');
        f.title = a.getAttribute('data-video-title') || 'Video';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        f.allowFullscreen = true;
        a.replaceWith(f);
        f.focus();
      });
    });

    /* Mobile menu */
    var menuBtn = document.querySelector('[data-menu-btn]');
    var nav = document.getElementById('site-nav');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    }
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
      });
    }

    /* "More" dropdown */
    document.querySelectorAll('.nav__more').forEach(function (li) {
      var btn = li.querySelector('.nav__more-btn');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !li.classList.contains('is-open');
        li.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', function () { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Escape') { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
    });

    /* Countdown - target date comes from the event settings in the admin */
    document.querySelectorAll('[data-countdown]').forEach(function (el) {
      var target = new Date(el.getAttribute('data-countdown')).getTime();
      if (isNaN(target)) return;
      var d = el.querySelector('[data-d]'), h = el.querySelector('[data-h]'), m = el.querySelector('[data-m]'), s = el.querySelector('[data-s]');
      function pad(n) { return n < 10 ? '0' + n : String(n); }
      function tick() {
        var diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
        d.textContent = Math.floor(diff / 86400);
        h.textContent = pad(Math.floor((diff % 86400) / 3600));
        m.textContent = pad(Math.floor((diff % 3600) / 60));
        s.textContent = pad(diff % 60);
        if (diff === 0) { clearInterval(timer); }
      }
      tick();
      var timer = setInterval(tick, 1000);
    });

    /* Tabs (schedule) with arrow-key support */
    document.querySelectorAll('[data-tabs]').forEach(function (wrap) {
      var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        tab.focus();
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
          if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (e.key === 'Home') n = tabs[0];
          if (e.key === 'End') n = tabs[tabs.length - 1];
          if (n) { e.preventDefault(); select(n); }
        });
      });
    });

    /* Gallery lightbox */
    document.querySelectorAll('[data-lightbox]').forEach(function (grid) {
      var links = Array.prototype.slice.call(grid.querySelectorAll('a'));
      if (!links.length || typeof HTMLDialogElement !== 'function') return;
      var dlg = document.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', 'Photo viewer');
      dlg.innerHTML = '<figure class="lightbox__fig"><img alt=""><figcaption></figcaption></figure>' +
        '<button type="button" class="lightbox__close" aria-label="Close">&times;</button>' +
        '<button type="button" class="lightbox__prev" aria-label="Previous photo">&#8249;</button>' +
        '<button type="button" class="lightbox__next" aria-label="Next photo">&#8250;</button>';
      document.body.appendChild(dlg);
      var img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), idx = 0, lastFocus = null;
      function show(i) {
        idx = (i + links.length) % links.length;
        var a = links[idx], thumb = a.querySelector('img');
        img.src = a.href;
        img.alt = thumb ? thumb.alt : '';
        cap.textContent = a.getAttribute('data-caption') || '';
      }
      links.forEach(function (a, i) {
        a.addEventListener('click', function (e) { e.preventDefault(); lastFocus = a; show(i); dlg.showModal(); });
      });
      dlg.querySelector('.lightbox__close').addEventListener('click', function () { dlg.close(); });
      dlg.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
      dlg.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') show(idx + 1);
        if (e.key === 'ArrowLeft') show(idx - 1);
      });
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lightbox__fig')) dlg.close(); });
      dlg.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });
      var sx = null;
      dlg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      dlg.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
        sx = null;
      });
    });

    /* Copy bank details */
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () { var t = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = t; }, 1800); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done);
      });
    });

    /* Forms: focus the result or the first error after a submission */
    var focusTarget = document.querySelector('.form-success, .has-error input, .has-error textarea, .has-error select, .form-alert');
    if (focusTarget) {
      if (focusTarget.classList.contains('form-alert')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: false });
    }
    /* Prevent double submits */
    document.querySelectorAll('form.form').forEach(function (f) {
      f.addEventListener('submit', function () {
        var b = f.querySelector('button[type="submit"]');
        if (b) { b.disabled = true; b.dataset.label = b.textContent; b.textContent = 'Sending…'; }
      });
    });

    /* Re-enable buttons if the page is restored from the back/forward cache */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      document.querySelectorAll('form.form button[type="submit"][disabled]').forEach(function (b) {
        b.disabled = false;
        if (b.dataset.label) b.textContent = b.dataset.label;
      });
    });

    /* Reveal on scroll */
    var items = document.querySelectorAll('.reveal');
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('is-visible'); });
    }
  });
})();
