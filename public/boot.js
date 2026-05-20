/* Synchronous pre-paint theme bootstrap.
   Loaded from <head> with a blocking <script src="/boot.js"></script> so it
   runs before the body paints. Lives in /public to keep the CSP strict —
   served from the same origin, allowed by `script-src 'self'` without
   needing 'unsafe-inline'. Two responsibilities:

     1) Apply the cached theme's page colors to CSS variables BEFORE the
        first paint (no white flash on refresh for returning visitors).
     2) Decide whether the boot splash needs to appear at all — only when
        there is no cached siteConfig to hydrate. */
(function () {
  var docEl = document.documentElement;

  function applyColors(bg, fg, accent) {
    if (bg) docEl.style.setProperty('--odl-page-bg', bg);
    if (fg) docEl.style.setProperty('--odl-page-fg', fg);
    if (accent) docEl.style.setProperty('--odl-page-accent', accent);
  }

  try {
    var raw = localStorage.getItem('theme-storage');
    var parsed = raw ? JSON.parse(raw) : null;
    var state = parsed && parsed.state;
    var sc = state && state.siteConfig;

    if (!raw || !state || !sc) {
      docEl.classList.add('odl-needs-splash');
      return;
    }

    var mode = state.mode || 'system';
    if (mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    var paintRaw = localStorage.getItem('odl-paint-cache');
    if (paintRaw) {
      var paint = JSON.parse(paintRaw);
      var pc = paint && paint[mode];
      if (pc) {
        applyColors(pc.background, pc.onBackground, pc.primary);
        return;
      }
    }

    var active = sc.activeCustomTheme;
    if (active && active[mode]) {
      var c = active[mode];
      applyColors(c.background, c.onBackground, c.primary);
    }
  } catch (e) {
    docEl.classList.add('odl-needs-splash');
  }
})();
