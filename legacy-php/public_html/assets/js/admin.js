/* The Gathering - admin enhancements */
(function () {
  'use strict';
  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    /* Show / hide password (Lucide eye icons) */
    var svgOpen = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
    var eye = svgOpen + '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
    var eyeOff = svgOpen + '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>';
    document.querySelectorAll('input[type="password"]').forEach(function (input) {
      var wrap = document.createElement('div');
      wrap.className = 'pw';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pw__toggle';
      btn.setAttribute('aria-controls', input.id || '');
      function set(show) {
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? eyeOff : eye;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.setAttribute('aria-pressed', String(show));
        btn.title = show ? 'Hide password' : 'Show password';
      }
      set(false);
      btn.addEventListener('click', function () {
        var pos = input.selectionStart;
        set(input.type === 'password');
        input.focus();
        try { input.setSelectionRange(pos, pos); } catch (e) {}
      });
      wrap.appendChild(btn);
      /* Never submit or leave the page with the password showing as plain text */
      if (input.form) input.form.addEventListener('submit', function () { set(false); });
    });

    /* Mobile sidebar */
    var toggle = document.querySelector('[data-side-toggle]');
    var side = document.getElementById('side');
    if (toggle && side) {
      toggle.addEventListener('click', function () {
        var open = !side.classList.contains('is-open');
        side.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    /* Confirm destructive actions */
    document.querySelectorAll('form[data-confirm]').forEach(function (f) {
      f.addEventListener('submit', function (e) { if (!window.confirm(f.getAttribute('data-confirm'))) e.preventDefault(); });
    });

    /* Rich text editor */
    document.querySelectorAll('[data-rte]').forEach(function (wrap) {
      var area = wrap.querySelector('.rte__area');
      var src = wrap.querySelector('.rte__src');
      var sourceMode = false;
      function sync() { if (!sourceMode) src.value = area.innerHTML; }
      area.addEventListener('input', sync);
      area.addEventListener('blur', sync);
      area.addEventListener('paste', function (e) {
        // Paste as clean text with line breaks, to avoid carrying Word/Google Docs styling.
        var text = (e.clipboardData || window.clipboardData).getData('text/plain');
        if (!text) return;
        e.preventDefault();
        var html = text.split(/\n{2,}/).map(function (p) {
          return '<p>' + p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + '</p>';
        }).join('');
        document.execCommand('insertHTML', false, html);
        sync();
      });
      wrap.querySelectorAll('[data-cmd]').forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
        btn.addEventListener('click', function () {
          var cmd = btn.getAttribute('data-cmd');
          if (cmd === 'source') {
            sourceMode = !sourceMode;
            if (sourceMode) { src.value = area.innerHTML; src.hidden = false; area.hidden = true; }
            else { area.innerHTML = src.value; src.hidden = true; area.hidden = false; }
            btn.classList.toggle('is-on', sourceMode);
            return;
          }
          area.focus();
          if (cmd === 'h2' || cmd === 'h3' || cmd === 'blockquote') {
            var current = document.queryCommandValue('formatBlock').toLowerCase();
            document.execCommand('formatBlock', false, current === cmd ? 'p' : cmd);
          } else if (cmd === 'link') {
            var url = window.prompt('Link address (https://…, /page, mailto: or tel:)', 'https://');
            if (url && url !== 'https://') document.execCommand('createLink', false, url);
          } else {
            document.execCommand(cmd, false, null);
          }
          sync();
        });
      });
      var form = wrap.closest('form');
      if (form) form.addEventListener('submit', function () { if (sourceMode) { area.innerHTML = src.value; } src.value = sourceMode ? src.value : area.innerHTML; });
    });

    /* Warn about unsaved changes */
    document.querySelectorAll('form[data-unsaved]').forEach(function (f) {
      var dirty = false;
      f.addEventListener('input', function () { dirty = true; });
      f.addEventListener('change', function () { dirty = true; });
      f.addEventListener('submit', function () { dirty = false; });
      window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
    });

    /* Settings tabs */
    var tabs = document.querySelectorAll('.settings__tabs [data-tab]');
    if (tabs.length) {
      var form = document.querySelector('.settings');
      form.classList.add('js-tabs');
      var tabInput = document.querySelector('[data-tab-input]');
      var show = function (id) {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === id)); });
        document.querySelectorAll('[data-panel]').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-panel') === id);
          // Show a panel that contains an error even if not selected
          if (p.querySelector('.has-error')) p.classList.add('is-active');
        });
        if (tabInput) tabInput.value = id;
      };
      tabs.forEach(function (t) {
        t.addEventListener('click', function (e) { e.preventDefault(); show(t.getAttribute('data-tab')); history.replaceState(null, '', '#' + t.getAttribute('data-tab')); });
      });
      var initial = location.hash.replace('#', '');
      show(document.querySelector('[data-panel="' + initial + '"]') ? initial : tabs[0].getAttribute('data-tab'));
    }

    /* Drag & drop upload areas */
    document.querySelectorAll('[data-drop]').forEach(function (zone) {
      var input = zone.querySelector('input[type="file"]');
      ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('is-over'); }); });
      zone.addEventListener('drop', function (e) { if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; updateLabel(); } });
      input.addEventListener('change', updateLabel);
      function updateLabel() {
        var s = zone.querySelector('strong');
        s.textContent = input.files.length + ' file' + (input.files.length === 1 ? '' : 's') + ' selected. Press Upload';
      }
    });

    /* Media library picker: "Use this" sends the chosen file back to the edit form */
    document.querySelectorAll('[data-pick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.opener) {
          window.opener.postMessage({ type: 'media-pick', field: btn.getAttribute('data-pick'), id: btn.getAttribute('data-id') }, window.location.origin);
          window.close();
        }
      });
    });
    window.addEventListener('message', function (e) {
      if (e.origin !== window.location.origin || !e.data || e.data.type !== 'media-pick') return;
      var input = document.querySelector('input[name="' + e.data.field + '_pick"]');
      if (input) { input.value = e.data.id; input.dispatchEvent(new Event('change', { bubbles: true })); input.focus(); }
    });
  });
})();
