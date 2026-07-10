/**
 * Scout Adaptive Cards — Frontier-branded Webchat v3 Message Plugin (POC showcase)
 *
 * Brand tokens (Frontier 2026):
 *   Primary Green #006643 | Accent Cyan #00ACEC | Surface #F0F7F4 | Ink #1A1A1A
 *   Typography: Montserrat
 *
 * Match: adaptivecards (official) + adaptivecard (Scout legacy)
 */
(function () {
  'use strict';

  var SDK_URL =
    'https://cdn.jsdelivr.net/npm/adaptivecards@3.0.5/dist/adaptivecards.min.js';
  var FONT_URL =
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
  var sdkLoading = null;
  var stylesInjected = false;

  var BRAND = {
    green: '#006643',
    greenDeep: '#004D33',
    greenSoft: '#E8F5EE',
    cyan: '#00ACEC',
    cyanSoft: '#E6F7FC',
    ink: '#1A1A1A',
    muted: '#5C6B73',
    surface: '#FFFFFF',
    wash: '#F4FAF7',
    line: 'rgba(0,102,67,0.14)',
    gold: '#C4A35A',
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
      '@keyframes scoutAcIn { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }',
      '@keyframes scoutAcShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }',
      '.scout-ac-shell { font-family: "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif; max-width: 380px; margin: 6px 0 12px; animation: scoutAcIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }',
      '.scout-ac-shell .scout-ac-frame { border-radius: 18px; overflow: hidden; background: linear-gradient(145deg, #ffffff 0%, #f4faf7 55%, #e8f5ee 100%); border: 1px solid ' + BRAND.line + '; box-shadow: 0 12px 32px rgba(0,102,67,0.12), 0 2px 8px rgba(0,0,0,0.04); position: relative; }',
      '.scout-ac-shell .scout-ac-frame::before { content: ""; display: block; height: 4px; background: linear-gradient(90deg, ' + BRAND.green + ' 0%, ' + BRAND.cyan + ' 50%, ' + BRAND.green + ' 100%); background-size: 200% 100%; animation: scoutAcShimmer 4s linear infinite; }',
      '.scout-ac-shell .scout-ac-badge { display: flex; align-items: center; gap: 8px; padding: 10px 14px 0; }',
      '.scout-ac-shell .scout-ac-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: ' + BRAND.cyan + '; box-shadow: 0 0 0 3px rgba(0,172,236,0.22); }',
      '.scout-ac-shell .scout-ac-badge-text { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ' + BRAND.green + '; }',
      '.scout-ac-shell .scout-ac-host { padding: 4px 6px 10px; }',
      '.scout-ac-shell .ac-adaptiveCard { background: transparent !important; font-family: "Montserrat", sans-serif !important; }',
      '.scout-ac-shell .ac-textBlock { font-family: "Montserrat", sans-serif !important; color: ' + BRAND.ink + ' !important; }',
      '.scout-ac-shell .ac-container { border-radius: 12px !important; }',
      '.scout-ac-shell .ac-pushButton, .scout-ac-shell .ac-actionSet button { background: linear-gradient(135deg, ' + BRAND.green + ' 0%, ' + BRAND.greenDeep + ' 100%) !important; color: #fff !important; border: none !important; border-radius: 10px !important; padding: 11px 16px !important; font-family: "Montserrat", sans-serif !important; font-weight: 700 !important; font-size: 13px !important; letter-spacing: 0.02em !important; cursor: pointer !important; box-shadow: 0 4px 12px rgba(0,102,67,0.25) !important; transition: transform 0.15s ease, box-shadow 0.15s ease !important; }',
      '.scout-ac-shell .ac-pushButton:hover, .scout-ac-shell .ac-actionSet button:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 16px rgba(0,102,67,0.32) !important; }',
      '.scout-ac-shell .ac-fact-title { color: ' + BRAND.muted + ' !important; font-weight: 600 !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; }',
      '.scout-ac-shell .ac-fact-value { color: ' + BRAND.ink + ' !important; font-weight: 700 !important; font-size: 14px !important; }',
      '.scout-ac-shell .ac-horizontal-separator { border-top-color: ' + BRAND.line + ' !important; }',
      '.scout-ac-error { padding: 14px 16px; font-size: 13px; color: ' + BRAND.muted + '; font-family: Montserrat, sans-serif; }',
      '.scout-ac-loading { padding: 20px 16px; font-size: 12px; font-weight: 600; color: ' + BRAND.green + '; letter-spacing: 0.08em; text-transform: uppercase; }',
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
      fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSizes: {
        small: 12,
        default: 14,
        medium: 16,
        large: 20,
        extraLarge: 28,
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
        large: 18,
        extraLarge: 24,
        padding: 14,
      },
      separator: {
        lineThickness: 1,
        lineColor: BRAND.line,
      },
      containerStyles: {
        default: {
          backgroundColor: '#FFFFFF00',
          foregroundColors: {
            default: { default: BRAND.ink, subtle: BRAND.muted },
            accent: { default: BRAND.cyan, subtle: '#66C9F3' },
            good: { default: BRAND.green, subtle: '#3D8B6A' },
            warning: { default: '#B8860B', subtle: '#D4A84B' },
            attention: { default: '#9B2C2C', subtle: '#C45C5C' },
            dark: { default: BRAND.ink, subtle: BRAND.muted },
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.82)' },
          },
        },
        emphasis: {
          backgroundColor: BRAND.green,
          foregroundColors: {
            default: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.85)' },
            accent: { default: BRAND.cyan, subtle: '#A8E4F8' },
            good: { default: '#B8F0D0', subtle: '#8FDBB0' },
            warning: { default: '#FFE08A', subtle: '#FFD45C' },
            attention: { default: '#FFB4B4', subtle: '#FF8F8F' },
            dark: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.8)' },
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.85)' },
          },
        },
        accent: {
          backgroundColor: BRAND.cyanSoft,
          foregroundColors: {
            default: { default: BRAND.ink, subtle: BRAND.muted },
            accent: { default: BRAND.cyan, subtle: '#0090C7' },
            good: { default: BRAND.green, subtle: '#3D8B6A' },
            warning: { default: '#B8860B', subtle: '#D4A84B' },
            attention: { default: '#9B2C2C', subtle: '#C45C5C' },
            dark: { default: BRAND.ink, subtle: BRAND.muted },
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.85)' },
          },
        },
        good: {
          backgroundColor: BRAND.greenSoft,
          foregroundColors: {
            default: { default: BRAND.greenDeep, subtle: BRAND.green },
            accent: { default: BRAND.cyan, subtle: '#0090C7' },
            good: { default: BRAND.green, subtle: '#3D8B6A' },
            warning: { default: '#B8860B', subtle: '#D4A84B' },
            attention: { default: '#9B2C2C', subtle: '#C45C5C' },
            dark: { default: BRAND.ink, subtle: BRAND.muted },
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.85)' },
          },
        },
      },
      actions: {
        maxActions: 4,
        spacing: 'default',
        buttonSpacing: 10,
        actionsOrientation: 'horizontal',
        actionAlignment: 'stretch',
      },
    });
  }

  function getPayload(message) {
    var data = (message && message.data) || {};
    var plugin = data._plugin || data.plugin || {};
    return plugin.payload || plugin.card || null;
  }

  function AdaptiveCardComponent(props) {
    var React =
      (window.__COGNIGY_WEBCHAT && window.__COGNIGY_WEBCHAT.React) ||
      window.React;
    if (!React) return null;

    var message = props.message || {};
    var payload = getPayload(message);

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
        createElement('span', { className: 'scout-ac-badge-dot' }),
        createElement(
          'span',
          { className: 'scout-ac-badge-text' },
          'Frontier Scout'
        )
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
      Object.assign({}, props.attributes || {}, { className: 'scout-ac-shell' }),
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
