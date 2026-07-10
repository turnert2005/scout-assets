/**
 * Scout Adaptive Cards — Webchat v3 message plugin
 *
 * Visual system aligned to Scout xApps (assets/css/frontier-tokens.css +
 * xapp-system.css):
 *   Primary Green #006643 | Cyan #00ACEC | Surfaces white / F8FAFB
 *   Text #1A1A1A / #576E77 | Montserrat | radius-lg 12px | green-tinted shadows
 *   Primary buttons = solid Frontier green (scout-btn-primary)
 *   Secondary buttons = cyan outline (scout-btn-secondary)
 *
 * Match: adaptivecards (official) + adaptivecard (Scout legacy)
 */
(function () {
  'use strict';

  var SDK_URL =
    'https://cdn.jsdelivr.net/npm/adaptivecards@3.0.5/dist/adaptivecards.min.js';
  var FONT_URL =
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
  var sdkLoading = null;
  var stylesInjected = false;

  // Mirror assets/css/frontier-tokens.css (xApp system)
  var T = {
    green: '#006643',
    greenHover: '#005538',
    cyan: '#00ACEC',
    cyanSoft: 'rgba(0,172,236,0.08)',
    grayDark: '#4C4C4C',
    grayMid: '#9A9A9A',
    grayLight: '#E8E8E8',
    grayBlue: '#576E77',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFB',
    surfaceGreenTint: 'rgba(0,102,67,0.04)',
    text: '#1A1A1A',
    textInverse: '#FFFFFF',
    radiusLg: '12px',
    radiusMd: '8px',
    radiusXl: '16px',
    shadowMd: '0 2px 8px rgba(0,102,67,0.08)',
    shadowLg: '0 4px 16px rgba(0,102,67,0.10)',
    shadowSm: '0 1px 2px rgba(0,102,67,0.06)',
    focusRing: '0 0 0 3px rgba(0,172,236,0.4)',
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

    // Replace prior style block if hot-reloaded
    var old = document.querySelector('style[data-scout-adaptivecards]');
    if (old) old.parentNode.removeChild(old);

    var css = [
      '@keyframes scoutAcIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',

      '.scout-ac-shell { font-family: Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 380px; margin: 6px 0 12px; animation: scoutAcIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }',

      /* Frame matches xApp card surfaces: white, soft green shadow, 16px radius */
      '.scout-ac-shell .scout-ac-frame { border-radius: ' + T.radiusXl + '; overflow: hidden; background: ' + T.surface + '; border: 1px solid ' + T.grayLight + '; box-shadow: ' + T.shadowLg + '; position: relative; }',

      /* Header bar = xApp kb-header / green→cyan gradient */
      '.scout-ac-shell .scout-ac-chrome { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; background: linear-gradient(135deg, ' + T.green + ' 0%, #00836E 55%, ' + T.cyan + ' 100%); color: ' + T.textInverse + '; }',
      '.scout-ac-shell .scout-ac-chrome-left { display: flex; align-items: center; gap: 10px; min-width: 0; }',
      '.scout-ac-shell .scout-ac-mark { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.16); color: ' + T.textInverse + '; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; border: 1.5px solid rgba(255,255,255,0.35); flex-shrink: 0; }',
      '.scout-ac-shell .scout-ac-chrome-title { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.2; }',
      '.scout-ac-shell .scout-ac-chrome-sub { font-size: 11px; font-weight: 500; opacity: 0.88; line-height: 1.2; margin-top: 2px; }',
      '.scout-ac-shell .scout-ac-chip { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ' + T.green + '; background: ' + T.textInverse + '; border-radius: 9999px; padding: 4px 8px; flex-shrink: 0; }',

      '.scout-ac-shell .scout-ac-host { padding: 4px 6px 12px; background: ' + T.surfaceSecondary + '; }',
      '.scout-ac-shell .ac-adaptiveCard { background: transparent !important; font-family: Montserrat, sans-serif !important; padding: 4px 6px 2px !important; }',
      '.scout-ac-shell .ac-textBlock { font-family: Montserrat, sans-serif !important; color: ' + T.text + ' !important; line-height: 1.5 !important; }',
      '.scout-ac-shell .ac-container { border-radius: ' + T.radiusLg + ' !important; }',

      /* Action set: stack like xApp footers */
      '.scout-ac-shell .ac-actionSet { gap: 8px !important; }',

      /* Base button = .scout-btn */
      '.scout-ac-shell .ac-pushButton, .scout-ac-shell .ac-actionSet button, .scout-ac-shell button.ac-pushButton { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 100% !important; min-height: 44px !important; padding: 12px 24px !important; border-radius: ' + T.radiusLg + ' !important; font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; letter-spacing: 0 !important; cursor: pointer !important; transition: all 150ms cubic-bezier(0.4,0,0.2,1) !important; outline: none !important; box-sizing: border-box !important; pointer-events: auto !important; -webkit-appearance: none !important; appearance: none !important; }',
      '.scout-ac-shell .ac-pushButton:focus-visible, .scout-ac-shell .ac-actionSet button:focus-visible { box-shadow: ' + T.focusRing + ' !important; }',

      /* Primary = scout-btn-primary (Frontier green solid) */
      '.scout-ac-shell button.scout-ac-btn-primary, .scout-ac-shell .ac-pushButton.style-positive { background: ' + T.green + ' !important; background-color: ' + T.green + ' !important; color: ' + T.textInverse + ' !important; border: 2px solid ' + T.green + ' !important; box-shadow: none !important; }',
      '.scout-ac-shell button.scout-ac-btn-primary:hover, .scout-ac-shell .ac-pushButton.style-positive:hover { background: ' + T.greenHover + ' !important; background-color: ' + T.greenHover + ' !important; border-color: ' + T.greenHover + ' !important; box-shadow: ' + T.shadowMd + ' !important; }',
      '.scout-ac-shell button.scout-ac-btn-primary:active { transform: scale(0.98) !important; }',

      /* Secondary = scout-btn-secondary (cyan outline) */
      '.scout-ac-shell button.scout-ac-btn-secondary { background: transparent !important; background-color: transparent !important; color: ' + T.cyan + ' !important; border: 2px solid ' + T.cyan + ' !important; box-shadow: none !important; }',
      '.scout-ac-shell button.scout-ac-btn-secondary:hover { background: ' + T.cyanSoft + ' !important; background-color: ' + T.cyanSoft + ' !important; box-shadow: ' + T.shadowSm + ' !important; }',

      /* ShowCard expanded region */
      '.scout-ac-shell .ac-adaptiveCard .ac-container { }',

      '.scout-ac-shell .ac-fact-title { color: ' + T.grayBlue + ' !important; font-weight: 600 !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }',
      '.scout-ac-shell .ac-fact-value { color: ' + T.text + ' !important; font-weight: 700 !important; font-size: 14px !important; }',
      '.scout-ac-shell .ac-horizontal-separator { border-top-color: ' + T.grayLight + ' !important; }',
      '.scout-ac-shell .ac-input { border-radius: ' + T.radiusMd + ' !important; border: 1.5px solid ' + T.grayLight + ' !important; font-family: Montserrat, sans-serif !important; }',
      '.scout-ac-shell .ac-input:focus { border-color: ' + T.cyan + ' !important; outline: none !important; box-shadow: ' + T.focusRing + ' !important; }',

      '.scout-ac-error { padding: 14px 16px; font-size: 13px; color: ' + T.grayBlue + '; font-family: Montserrat, sans-serif; background: ' + T.surfaceSecondary + '; }',
      '.scout-ac-loading { padding: 18px 16px; font-size: 12px; font-weight: 600; color: ' + T.green + '; letter-spacing: 0.04em; font-family: Montserrat, sans-serif; background: ' + T.surfaceSecondary + '; }',

      /* Links inside cards */
      '.scout-ac-shell a { color: ' + T.cyan + ' !important; font-weight: 600; }',
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
      fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSizes: {
        small: 12,
        default: 14,
        medium: 16,
        large: 18,
        extraLarge: 24,
      },
      fontWeights: {
        lighter: 400,
        default: 500,
        bolder: 700,
      },
      spacing: {
        small: 6,
        default: 10,
        medium: 14,
        large: 16,
        extraLarge: 24,
        padding: 14,
      },
      separator: {
        lineThickness: 1,
        lineColor: T.grayLight,
      },
      containerStyles: {
        default: {
          backgroundColor: '#FFFFFF00',
          foregroundColors: {
            default: { default: T.text, subtle: T.grayBlue },
            accent: { default: T.cyan, subtle: '#4DC8F6' },
            good: { default: T.green, subtle: '#33826A' },
            warning: { default: '#E0B774', subtle: '#C9A05E' },
            attention: { default: '#BD696A', subtle: '#a85a5b' },
            dark: { default: T.text, subtle: T.grayBlue },
            light: { default: T.textInverse, subtle: 'rgba(255,255,255,0.85)' },
          },
        },
        emphasis: {
          backgroundColor: T.green,
          foregroundColors: {
            default: { default: T.textInverse, subtle: 'rgba(255,255,255,0.85)' },
            accent: { default: T.cyan, subtle: '#A8E4F8' },
            good: { default: '#B8F0D0', subtle: '#8FDBB0' },
            warning: { default: '#FFE08A', subtle: '#FFD45C' },
            attention: { default: '#FFB4B4', subtle: '#FF8F8F' },
            dark: { default: T.textInverse, subtle: 'rgba(255,255,255,0.8)' },
            light: { default: T.textInverse, subtle: 'rgba(255,255,255,0.85)' },
          },
        },
        accent: {
          backgroundColor: 'rgba(0,172,236,0.10)',
          foregroundColors: {
            default: { default: T.text, subtle: T.grayBlue },
            accent: { default: T.cyan, subtle: '#0090C7' },
            good: { default: T.green, subtle: '#33826A' },
            warning: { default: '#B8860B', subtle: '#D4A84B' },
            attention: { default: '#BD696A', subtle: '#a85a5b' },
            dark: { default: T.text, subtle: T.grayBlue },
            light: { default: T.textInverse, subtle: 'rgba(255,255,255,0.85)' },
          },
        },
        good: {
          backgroundColor: 'rgba(0,102,67,0.06)',
          foregroundColors: {
            default: { default: T.green, subtle: '#33826A' },
            accent: { default: T.cyan, subtle: '#0090C7' },
            good: { default: T.green, subtle: '#33826A' },
            warning: { default: '#B8860B', subtle: '#D4A84B' },
            attention: { default: '#BD696A', subtle: '#a85a5b' },
            dark: { default: T.text, subtle: T.grayBlue },
            light: { default: T.textInverse, subtle: 'rgba(255,255,255,0.85)' },
          },
        },
      },
      actions: {
        maxActions: 5,
        spacing: 'default',
        buttonSpacing: 8,
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

  function styleButtons(root) {
    if (!root) return;
    var buttons = root.querySelectorAll('button, .ac-pushButton, a.ac-pushButton');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var label = (btn.textContent || '').trim().toLowerCase();
      var isPrimary =
        btn.classList.contains('style-positive') ||
        /read full|manage this booking|confirm|continue|submit|done|yes|book/.test(label) ||
        i === 0;
      btn.classList.remove('scout-ac-btn-primary', 'scout-ac-btn-secondary');
      btn.classList.add(isPrimary ? 'scout-ac-btn-primary' : 'scout-ac-btn-secondary');

      // Override Adaptive Cards inline paints without blocking clicks
      if (isPrimary) {
        btn.style.setProperty('background', T.green, 'important');
        btn.style.setProperty('background-color', T.green, 'important');
        btn.style.setProperty('color', T.textInverse, 'important');
        btn.style.setProperty('border', '2px solid ' + T.green, 'important');
      } else {
        btn.style.setProperty('background', 'transparent', 'important');
        btn.style.setProperty('background-color', 'transparent', 'important');
        btn.style.setProperty('color', T.cyan, 'important');
        btn.style.setProperty('border', '2px solid ' + T.cyan, 'important');
      }
      btn.style.setProperty('pointer-events', 'auto', 'important');
      btn.style.setProperty('cursor', 'pointer', 'important');
      btn.style.setProperty('opacity', '1', 'important');
      btn.removeAttribute('disabled');
      if (btn.getAttribute('aria-disabled') === 'true') {
        btn.setAttribute('aria-disabled', 'false');
      }
    }
  }

  /**
   * Action handling:
   * - OpenUrl: open in new tab (must run BEFORE getData — OpenUrl also has getData)
   * - Submit / Execute: send chat message with action title + data
   * - ShowCard: handled by Adaptive Cards SDK (no-op here)
   */
  function handleAction(action, onSendMessage) {
    if (!action) return;

    var typeName = '';
    try {
      typeName = (action.getJsonTypeName && action.getJsonTypeName()) || action.constructor && action.constructor.name || '';
    } catch (e) {
      typeName = '';
    }

    // ShowCard is expanded by the SDK; do not treat as message
    if (/ShowCard/i.test(typeName)) return;

    // OpenUrl — check url first
    var url = null;
    try {
      if (action.url) url = action.url;
      else if (typeof action.getUrl === 'function') url = action.getUrl();
    } catch (e2) {
      /* ignore */
    }
    if (url && typeof url === 'string' && /^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Submit / Execute / ToggleVisibility with data
    var data = null;
    try {
      if (typeof action.getData === 'function') data = action.getData();
      else if (action.data !== undefined) data = action.data;
    } catch (e3) {
      data = null;
    }

    if (typeof onSendMessage === 'function') {
      var title = '';
      try {
        title = action.title || (action.getTitle && action.getTitle()) || '';
      } catch (e4) {
        title = '';
      }
      // Prefer human-readable title so the bot receives a normal utterance
      var text = title || (data && data.action) || 'Card action';
      onSendMessage(String(text), {
        adaptivecards: data || {},
        _cognigy: {
          _plugin: {
            type: 'adaptivecards',
            data: data || {},
          },
        },
      });
    }
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
              card.onExecuteAction = function (action) {
                handleAction(action, props.onSendMessage);
              };
              card.parse(payload);
              var rendered = card.render();
              hostRef.current.innerHTML = '';
              if (rendered) {
                hostRef.current.appendChild(rendered);
                styleButtons(hostRef.current);
                // Restyle after ShowCard expands (bubble, non-capturing)
                hostRef.current.addEventListener('click', function (ev) {
                  // Do not stop propagation — AC needs the click
                  setTimeout(function () {
                    if (hostRef.current) styleButtons(hostRef.current);
                  }, 0);
                });
              }
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

    var chromeLabel =
      variant === 'booking'
        ? 'Booking'
        : variant === 'faq'
          ? 'Official FAQ'
          : 'Scout card';

    var frameChildren = [
      createElement(
        'div',
        { className: 'scout-ac-chrome', key: 'chrome' },
        createElement(
          'div',
          { className: 'scout-ac-chrome-left' },
          createElement('div', { className: 'scout-ac-mark' }, 'F'),
          createElement(
            'div',
            null,
            createElement('div', { className: 'scout-ac-chrome-title' }, 'Frontier Scout'),
            createElement('div', { className: 'scout-ac-chrome-sub' }, chromeLabel)
          )
        ),
        createElement('div', { className: 'scout-ac-chip' }, 'Scout')
      ),
    ];
    if (status === 'loading') {
      frameChildren.push(
        createElement('div', { className: 'scout-ac-loading', key: 'load' }, 'Loading…')
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

  register('adaptivecards');
  register('adaptivecard');
})();
