/**
 * Scout Adaptive Cards — Frontier 2026 brand showcase Webchat v3 plugin
 *
 * Official core palette (Brand Guide 2026):
 *   Frontier Green #00472C | Tropic #92DD2F | Alpine #DAFFD7
 *   Taiga #002600 | Cloud #FAFFFA | Near-Black #16171A
 *
 * Digital type: Plus Jakarta Sans (brand secondary for web/app;
 * Ginka / TT Commons Pro are licensed desktop fonts).
 *
 * Match: adaptivecards (official) + adaptivecard (Scout legacy)
 */
(function () {
  'use strict';

  var SDK_URL =
    'https://cdn.jsdelivr.net/npm/adaptivecards@3.0.5/dist/adaptivecards.min.js';
  var FONT_URL =
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
  var sdkLoading = null;
  var stylesInjected = false;

  var BRAND = {
    green: '#00472C',
    tropic: '#92DD2F',
    alpine: '#DAFFD7',
    taiga: '#002600',
    cloud: '#FAFFFA',
    nearBlack: '#16171A',
    gray: '#808186',
    white: '#FFFFFF',
  };

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    if (!document.querySelector('link[data-scout-ac-font]')) {
      var font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href = FONT_URL;
      font.setAttribute('data-scout-ac-font', '1');
      document.head.appendChild(font);
    }

    var css = [
      '@keyframes scoutAcIn { from { opacity: 0; transform: translateY(18px) scale(0.96); filter: blur(2px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }',
      '@keyframes scoutAcShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }',
      '@keyframes scoutAcPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(146,221,47,0.45); } 50% { box-shadow: 0 0 0 6px rgba(146,221,47,0); } }',
      '@keyframes scoutAcGlow { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }',
      '@keyframes scoutAcPlane { 0% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 100% { transform: translateX(-6px); } }',

      '.scout-ac-shell { font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 392px; margin: 8px 0 14px; animation: scoutAcIn 0.55s cubic-bezier(0.22,1,0.36,1) both; }',
      '.scout-ac-shell .scout-ac-frame { border-radius: 20px; overflow: hidden; background: linear-gradient(160deg, ' + BRAND.cloud + ' 0%, ' + BRAND.alpine + ' 55%, #c8f5c4 100%); border: 1px solid rgba(0,71,44,0.16); box-shadow: 0 18px 40px rgba(0,71,44,0.16), 0 4px 12px rgba(0,38,0,0.06), inset 0 1px 0 rgba(255,255,255,0.75); position: relative; }',
      '.scout-ac-shell .scout-ac-frame::before { content: ""; display: block; height: 5px; background: linear-gradient(90deg, ' + BRAND.green + ' 0%, ' + BRAND.tropic + ' 40%, ' + BRAND.green + ' 70%, ' + BRAND.tropic + ' 100%); background-size: 220% 100%; animation: scoutAcShimmer 3.6s linear infinite; }',
      '.scout-ac-shell .scout-ac-frame::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(120% 60% at 100% 0%, rgba(146,221,47,0.18) 0%, transparent 55%); animation: scoutAcGlow 5s ease-in-out infinite; }',

      '.scout-ac-shell .scout-ac-badge { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px 2px; position: relative; z-index: 1; }',
      '.scout-ac-shell .scout-ac-badge-left { display: flex; align-items: center; gap: 10px; }',
      '.scout-ac-shell .scout-ac-mark { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(145deg, ' + BRAND.green + ' 0%, ' + BRAND.taiga + ' 100%); color: ' + BRAND.tropic + '; font-weight: 800; font-size: 13px; letter-spacing: -0.02em; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,71,44,0.35), inset 0 1px 0 rgba(146,221,47,0.35); animation: scoutAcPulse 2.8s ease-in-out infinite; }',
      '.scout-ac-shell .scout-ac-badge-text { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: ' + BRAND.green + '; }',
      '.scout-ac-shell .scout-ac-badge-sub { font-size: 10px; font-weight: 600; color: ' + BRAND.gray + '; letter-spacing: 0.02em; }',
      '.scout-ac-shell .scout-ac-chip { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ' + BRAND.taiga + '; background: ' + BRAND.tropic + '; border-radius: 999px; padding: 4px 8px; box-shadow: 0 2px 6px rgba(146,221,47,0.45); }',

      '.scout-ac-shell .scout-ac-host { padding: 2px 4px 12px; position: relative; z-index: 1; }',
      '.scout-ac-shell .ac-adaptiveCard { background: transparent !important; font-family: "Plus Jakarta Sans", sans-serif !important; padding: 0 8px 4px !important; }',
      '.scout-ac-shell .ac-textBlock { font-family: "Plus Jakarta Sans", sans-serif !important; color: ' + BRAND.nearBlack + ' !important; line-height: 1.4 !important; }',
      '.scout-ac-shell .ac-container { border-radius: 14px !important; }',
      '.scout-ac-shell .ac-container.ac-selectable:hover { filter: brightness(1.02); }',

      /* Primary CTA — Tropic on dark green gravity */
      '.scout-ac-shell .ac-pushButton, .scout-ac-shell .ac-actionSet button { background: linear-gradient(135deg, ' + BRAND.tropic + ' 0%, #7bc922 100%) !important; color: ' + BRAND.taiga + ' !important; border: none !important; border-radius: 12px !important; padding: 12px 16px !important; font-family: "Plus Jakarta Sans", sans-serif !important; font-weight: 800 !important; font-size: 13px !important; letter-spacing: 0.01em !important; cursor: pointer !important; box-shadow: 0 6px 16px rgba(146,221,47,0.4), inset 0 1px 0 rgba(255,255,255,0.35) !important; transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease !important; min-height: 44px !important; }',
      '.scout-ac-shell .ac-pushButton:hover, .scout-ac-shell .ac-actionSet button:hover { transform: translateY(-2px) !important; box-shadow: 0 10px 22px rgba(146,221,47,0.5), inset 0 1px 0 rgba(255,255,255,0.4) !important; filter: brightness(1.03) !important; }',
      '.scout-ac-shell .ac-pushButton:active, .scout-ac-shell .ac-actionSet button:active { transform: translateY(0) !important; }',

      /* Secondary / default actions */
      '.scout-ac-shell .ac-actionSet button.style-default, .scout-ac-shell button.ac-pushButton.style-default { background: transparent !important; color: ' + BRAND.green + ' !important; border: 2px solid ' + BRAND.green + ' !important; box-shadow: none !important; }',
      '.scout-ac-shell .ac-actionSet button.style-default:hover, .scout-ac-shell button.ac-pushButton.style-default:hover { background: rgba(0,71,44,0.06) !important; box-shadow: none !important; }',

      /* Destructive-style rare */
      '.scout-ac-shell .ac-actionSet button.style-destructive { background: ' + BRAND.taiga + ' !important; color: ' + BRAND.cloud + ' !important; }',

      '.scout-ac-shell .ac-fact-title { color: ' + BRAND.gray + ' !important; font-weight: 700 !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; }',
      '.scout-ac-shell .ac-fact-value { color: ' + BRAND.taiga + ' !important; font-weight: 800 !important; font-size: 14px !important; }',
      '.scout-ac-shell .ac-horizontal-separator { border-top-color: rgba(0,71,44,0.14) !important; }',
      '.scout-ac-shell .ac-input { border-radius: 10px !important; border: 1.5px solid rgba(0,71,44,0.2) !important; font-family: "Plus Jakarta Sans", sans-serif !important; }',
      '.scout-ac-shell .ac-input:focus { border-color: ' + BRAND.green + ' !important; outline: 2px solid rgba(146,221,47,0.35) !important; }',

      /* Emphasis (green) headers inside Adaptive Cards */
      '.scout-ac-shell .ac-container[style*="background-color: #' + BRAND.green.replace('#', '') + '"], .scout-ac-shell .ac-container[style*="background-color: rgb(0, 71, 44)"] { position: relative; }',

      '.scout-ac-error { padding: 14px 16px; font-size: 13px; color: ' + BRAND.gray + '; font-family: "Plus Jakarta Sans", sans-serif; }',
      '.scout-ac-loading { padding: 22px 16px; font-size: 11px; font-weight: 800; color: ' + BRAND.green + '; letter-spacing: 0.12em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }',
      '.scout-ac-loading::before { content: "✈"; animation: scoutAcPlane 1.2s ease-in-out infinite; color: ' + BRAND.tropic + '; filter: drop-shadow(0 0 4px rgba(146,221,47,0.6)); }',

      /* Boarding-pass notch aesthetic for booking variant */
      '.scout-ac-shell[data-variant="booking"] .scout-ac-frame { background: linear-gradient(165deg, ' + BRAND.cloud + ' 0%, #ffffff 40%, ' + BRAND.alpine + ' 100%); }',
      '.scout-ac-shell[data-variant="booking"] .scout-ac-host { position: relative; }',
      '.scout-ac-shell[data-variant="booking"] .scout-ac-host::before { content: ""; position: absolute; left: -6px; top: 42%; width: 14px; height: 14px; border-radius: 50%; background: #e8f0ec; box-shadow: inset 0 0 0 1px rgba(0,71,44,0.12); z-index: 2; }',
      '.scout-ac-shell[data-variant="booking"] .scout-ac-host::after { content: ""; position: absolute; right: -6px; top: 42%; width: 14px; height: 14px; border-radius: 50%; background: #e8f0ec; box-shadow: inset 0 0 0 1px rgba(0,71,44,0.12); z-index: 2; }',
    ].join('\n');

    var el = document.createElement('style');
    el.setAttribute('data-scout-adaptivecards', '1');
    el.textContent = css;
    document.head.appendChild(el);
  }

  function ensureSdk() {
    if (window.AdaptiveCards) return Promise.resolve(window.AdaptiveCards);
    if (sdkLoading) return sdkLoading;
    sdkLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SDK_URL;
      s.async = true;
      s.onload = function () {
        if (window.AdaptiveCards) resolve(window.AdaptiveCards);
        else reject(new Error('AdaptiveCards global missing after load'));
      };
      s.onerror = function () {
        reject(new Error('Failed to load Adaptive Cards SDK'));
      };
      document.head.appendChild(s);
    });
    return sdkLoading;
  }

  function frontierHostConfig(AdaptiveCards) {
    return new AdaptiveCards.HostConfig({
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSizes: {
        small: 12,
        default: 14,
        medium: 16,
        large: 20,
        extraLarge: 30,
      },
      fontWeights: {
        lighter: 400,
        default: 500,
        bolder: 800,
      },
      spacing: {
        small: 6,
        default: 10,
        medium: 14,
        large: 18,
        extraLarge: 26,
        padding: 14,
      },
      separator: {
        lineThickness: 1,
        lineColor: 'rgba(0,71,44,0.14)',
      },
      containerStyles: {
        default: {
          backgroundColor: '#FFFFFF00',
          foregroundColors: {
            default: { default: BRAND.nearBlack, subtle: BRAND.gray },
            accent: { default: BRAND.green, subtle: '#1a6b45' },
            good: { default: BRAND.green, subtle: '#1a6b45' },
            warning: { default: '#8A6D00', subtle: '#B8860B' },
            attention: { default: '#8B1E1E', subtle: '#C45C5C' },
            dark: { default: BRAND.taiga, subtle: BRAND.gray },
            light: { default: BRAND.cloud, subtle: 'rgba(250,255,250,0.82)' },
          },
        },
        emphasis: {
          backgroundColor: BRAND.green,
          foregroundColors: {
            default: { default: BRAND.cloud, subtle: 'rgba(250,255,250,0.85)' },
            accent: { default: BRAND.tropic, subtle: '#b8f06a' },
            good: { default: BRAND.tropic, subtle: '#b8f06a' },
            warning: { default: '#FFE08A', subtle: '#FFD45C' },
            attention: { default: '#FFB4B4', subtle: '#FF8F8F' },
            dark: { default: BRAND.cloud, subtle: 'rgba(250,255,250,0.8)' },
            light: { default: BRAND.cloud, subtle: 'rgba(250,255,250,0.85)' },
          },
        },
        accent: {
          backgroundColor: BRAND.alpine,
          foregroundColors: {
            default: { default: BRAND.taiga, subtle: BRAND.green },
            accent: { default: BRAND.green, subtle: '#1a6b45' },
            good: { default: BRAND.green, subtle: '#1a6b45' },
            warning: { default: '#8A6D00', subtle: '#B8860B' },
            attention: { default: '#8B1E1E', subtle: '#C45C5C' },
            dark: { default: BRAND.taiga, subtle: BRAND.gray },
            light: { default: BRAND.cloud, subtle: 'rgba(250,255,250,0.85)' },
          },
        },
        good: {
          backgroundColor: BRAND.alpine,
          foregroundColors: {
            default: { default: BRAND.green, subtle: '#1a6b45' },
            accent: { default: BRAND.green, subtle: '#1a6b45' },
            good: { default: BRAND.green, subtle: '#1a6b45' },
            warning: { default: '#8A6D00', subtle: '#B8860B' },
            attention: { default: '#8B1E1E', subtle: '#C45C5C' },
            dark: { default: BRAND.taiga, subtle: BRAND.gray },
            light: { default: BRAND.cloud, subtle: 'rgba(250,255,250,0.85)' },
          },
        },
        attention: {
          backgroundColor: '#FFF1F1',
          foregroundColors: {
            default: { default: BRAND.nearBlack, subtle: BRAND.gray },
            accent: { default: BRAND.green, subtle: '#1a6b45' },
            good: { default: BRAND.green, subtle: '#1a6b45' },
            warning: { default: '#8A6D00', subtle: '#B8860B' },
            attention: { default: '#8B1E1E', subtle: '#C45C5C' },
            dark: { default: BRAND.taiga, subtle: BRAND.gray },
            light: { default: BRAND.cloud, subtle: 'rgba(250,255,250,0.85)' },
          },
        },
      },
      actions: {
        maxActions: 5,
        spacing: 'default',
        buttonSpacing: 10,
        actionsOrientation: 'vertical',
        actionAlignment: 'stretch',
      },
    });
  }

  function getPayload(message) {
    var data = (message && message.data) || {};
    var plugin = data._plugin || data.plugin || {};
    return plugin.payload || plugin.card || null;
  }

  function detectVariant(payload) {
    try {
      var blob = JSON.stringify(payload || {}).toLowerCase();
      if (/booking confirmed|confirmation|pnr|boarding/.test(blob)) return 'booking';
      if (/official faq|knowledge|faq/.test(blob)) return 'faq';
    } catch (e) {
      /* ignore */
    }
    return 'default';
  }

  function AdaptiveCardComponent(props) {
    var React =
      (window.__COGNIGY_WEBCHAT && window.__COGNIGY_WEBCHAT.React) ||
      window.React;
    if (!React) return null;

    var message = props.message || {};
    var payload = getPayload(message);
    var variant = detectVariant(payload);

    var useState = React.useState;
    var useEffect = React.useEffect;
    var useRef = React.useRef;
    var createElement = React.createElement;

    var hostRef = useRef(null);
    var state = useState('loading');
    var status = state[0];
    var setStatus = state[1];
    var errState = useState('');
    var err = errState[0];
    var setErr = errState[1];

    useEffect(
      function () {
        injectStyles();
        var cancelled = false;
        if (!payload) {
          setStatus('error');
          setErr('No Adaptive Card payload');
          return function () {
            cancelled = true;
          };
        }
        ensureSdk()
          .then(function (AdaptiveCards) {
            if (cancelled || !hostRef.current) return;
            try {
              var card = new AdaptiveCards.AdaptiveCard();
              card.hostConfig = frontierHostConfig(AdaptiveCards);
              if (typeof props.onSendMessage === 'function') {
                card.onExecuteAction = function (action) {
                  try {
                    if (action && action.getData) {
                      props.onSendMessage('', {
                        adaptivecards: action.getData(),
                      });
                    } else if (action && action.url) {
                      window.open(action.url, '_blank', 'noopener,noreferrer');
                    }
                  } catch (e) {
                    /* ignore */
                  }
                };
              }
              card.parse(payload);
              var rendered = card.render();
              hostRef.current.innerHTML = '';
              if (rendered) hostRef.current.appendChild(rendered);
              setStatus('ready');
            } catch (e) {
              setStatus('error');
              setErr((e && e.message) || 'Card render failed');
            }
          })
          .catch(function (e) {
            if (cancelled) return;
            setStatus('error');
            setErr((e && e.message) || 'SDK load failed');
          });
        return function () {
          cancelled = true;
        };
      },
      [payload]
    );

    var frameChildren = [
      createElement(
        'div',
        { className: 'scout-ac-badge', key: 'badge' },
        createElement(
          'div',
          { className: 'scout-ac-badge-left' },
          createElement('div', { className: 'scout-ac-mark' }, 'F'),
          createElement(
            'div',
            null,
            createElement(
              'div',
              { className: 'scout-ac-badge-text' },
              'Frontier Scout'
            ),
            createElement(
              'div',
              { className: 'scout-ac-badge-sub' },
              'The Sky is for Everyone'
            )
          )
        ),
        createElement('div', { className: 'scout-ac-chip' }, 'Live')
      ),
    ];
    if (status === 'loading') {
      frameChildren.push(
        createElement(
          'div',
          { className: 'scout-ac-loading', key: 'load' },
          'Building your card'
        )
      );
    }
    if (status === 'error') {
      frameChildren.push(
        createElement(
          'div',
          { className: 'scout-ac-error', key: 'err' },
          err || 'Unable to render card'
        )
      );
    }
    frameChildren.push(
      createElement('div', {
        key: 'host',
        className: 'scout-ac-host',
        ref: hostRef,
      })
    );

    return createElement(
      'div',
      Object.assign({}, props.attributes || {}, {
        className: 'scout-ac-shell',
        'data-variant': variant,
      }),
      createElement('div', { className: 'scout-ac-frame' }, frameChildren)
    );
  }

  function register(matchName) {
    var plugin = {
      match: matchName,
      component: AdaptiveCardComponent,
      options: { fullwidth: true },
    };
    if (!window.cognigyWebchatMessagePlugins) {
      window.cognigyWebchatMessagePlugins = [];
    }
    window.cognigyWebchatMessagePlugins.push(plugin);
  }

  // Expose for POC visual QA injection inside the live widget
  window.__SCOUT_AC_RENDER__ = function (payload, mountEl) {
    injectStyles();
    return ensureSdk().then(function (AdaptiveCards) {
      var card = new AdaptiveCards.AdaptiveCard();
      card.hostConfig = frontierHostConfig(AdaptiveCards);
      card.onExecuteAction = function (action) {
        if (action && action.url) {
          window.open(action.url, '_blank', 'noopener,noreferrer');
        }
      };
      card.parse(payload);
      var rendered = card.render();
      var variant = detectVariant(payload);
      var shell = document.createElement('div');
      shell.className = 'scout-ac-shell';
      shell.setAttribute('data-variant', variant);
      shell.innerHTML =
        '<div class="scout-ac-frame">' +
        '<div class="scout-ac-badge">' +
        '<div class="scout-ac-badge-left">' +
        '<div class="scout-ac-mark">F</div>' +
        '<div><div class="scout-ac-badge-text">Frontier Scout</div>' +
        '<div class="scout-ac-badge-sub">The Sky is for Everyone</div></div>' +
        '</div><div class="scout-ac-chip">Live</div></div>' +
        '<div class="scout-ac-host"></div></div>';
      shell.querySelector('.scout-ac-host').appendChild(rendered);
      if (mountEl) {
        mountEl.appendChild(shell);
      }
      return shell;
    });
  };

  register('adaptivecards');
  register('adaptivecard');
})();
