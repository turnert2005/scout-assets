/**
 * Scout Adaptive Cards — official Frontier brand, xApp-aligned density
 *
 * Tokens: frontier-tokens.css (#006643, #00ACEC, Montserrat)
 * Header: solid green + white type (claim-header pattern)
 * Marks: official Badge / domain icons from brand kit (not custom AI art)
 * Spacing: 16px rhythm, comfortable type scale, no dual chrome
 */
(function () {
  'use strict';

  var SDK_URL =
    'https://cdn.jsdelivr.net/npm/adaptivecards@3.0.5/dist/adaptivecards.min.js';
  var FONT_URL =
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';

  var sdkLoading = null;
  var stylesInjected = false;

  var T = {
    green: '#006643',
    greenHover: '#005538',
    cyan: '#00ACEC',
    cyanSoft: 'rgba(0,172,236,0.08)',
    grayLight: '#E8E8E8',
    grayBlue: '#576E77',
    grayMid: '#9A9A9A',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFB',
    text: '#1A1A1A',
    radiusLg: '12px',
    radiusXl: '16px',
    shadow: '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
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

    var old = document.querySelector('style[data-scout-adaptivecards]');
    if (old) old.parentNode.removeChild(old);

    var css = [
      '@keyframes scoutAcIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }',

      '.scout-ac-shell { font-family: Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 360px; margin: 6px 0 10px; animation: scoutAcIn 0.28s cubic-bezier(0.4,0,0.2,1) both; }',
      '.scout-ac-shell .scout-ac-frame { border-radius: ' + T.radiusXl + '; overflow: hidden; background: ' + T.surface + '; border: 1px solid rgba(0,102,67,0.10); box-shadow: ' + T.shadow + '; }',
      '.scout-ac-shell .scout-ac-host { padding: 0; background: ' + T.surface + '; }',
      '.scout-ac-shell .ac-adaptiveCard { background: transparent !important; font-family: Montserrat, sans-serif !important; padding: 0 !important; }',
      '.scout-ac-shell .ac-textBlock { font-family: Montserrat, sans-serif !important; line-height: 1.45 !important; margin: 0 !important; }',
      '.scout-ac-shell .ac-container { border-radius: 0 !important; }',

      /* Green header blocks → always white type (xApp claim-header) */
      '.scout-ac-shell .ac-container[style*="background-color: #006643"] .ac-textBlock,',
      '.scout-ac-shell .ac-container[style*="background-color: rgb(0, 102, 67)"] .ac-textBlock,',
      '.scout-ac-shell .ac-container[style*="background-color:#006643"] .ac-textBlock { color: #FFFFFF !important; }',

      /* Domain icon in body: keep green icon crisp on white */
      '.scout-ac-shell img { object-fit: contain !important; display: block !important; }',

      /* Facts: calm, even rhythm — pad body columns so labels never clip */
      '.scout-ac-shell .ac-factSet { margin: 0 16px !important; width: auto !important; }',
      '.scout-ac-shell .ac-fact-title { color: ' + T.grayMid + ' !important; font-weight: 600 !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.04em !important; padding: 4px 16px 4px 0 !important; vertical-align: top !important; white-space: nowrap !important; }',
      '.scout-ac-shell .ac-fact-value { color: ' + T.text + ' !important; font-weight: 600 !important; font-size: 13px !important; padding: 4px 0 !important; }',
      '.scout-ac-shell .ac-horizontal-separator { border-top-color: ' + T.grayLight + ' !important; margin: 12px 16px !important; }',
      /* Body column padding for icon + text block */
      '.scout-ac-shell .ac-adaptiveCard > .ac-container + .ac-columnSet,',
      '.scout-ac-shell .ac-columnSet { padding-left: 16px !important; padding-right: 16px !important; box-sizing: border-box !important; }',

      /* Actions: scout-btn sizing (44px tap) with 16px side padding */
      '.scout-ac-shell .ac-actionSet { display: flex !important; flex-direction: column !important; gap: 8px !important; padding: 8px 16px 16px !important; margin: 0 !important; }',
      '.scout-ac-shell .ac-pushButton, .scout-ac-shell .ac-actionSet button, .scout-ac-shell button.ac-pushButton { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 100% !important; min-height: 44px !important; padding: 12px 20px !important; border-radius: ' + T.radiusLg + ' !important; font-family: Montserrat, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; cursor: pointer !important; transition: all 150ms cubic-bezier(0.4,0,0.2,1) !important; outline: none !important; box-sizing: border-box !important; pointer-events: auto !important; -webkit-appearance: none !important; appearance: none !important; letter-spacing: 0 !important; }',
      '.scout-ac-shell .ac-pushButton:focus-visible { box-shadow: ' + T.focusRing + ' !important; }',

      '.scout-ac-shell button.scout-ac-btn-primary, .scout-ac-shell .ac-pushButton.style-positive { background: ' + T.green + ' !important; background-color: ' + T.green + ' !important; color: #FFFFFF !important; border: 2px solid ' + T.green + ' !important; box-shadow: none !important; }',
      '.scout-ac-shell button.scout-ac-btn-primary:hover { background: ' + T.greenHover + ' !important; background-color: ' + T.greenHover + ' !important; border-color: ' + T.greenHover + ' !important; }',
      '.scout-ac-shell button.scout-ac-btn-primary:active { transform: scale(0.98) !important; }',

      '.scout-ac-shell button.scout-ac-btn-secondary { background: transparent !important; background-color: transparent !important; color: ' + T.cyan + ' !important; border: 2px solid ' + T.cyan + ' !important; box-shadow: none !important; }',
      '.scout-ac-shell button.scout-ac-btn-secondary:hover { background: ' + T.cyanSoft + ' !important; background-color: ' + T.cyanSoft + ' !important; }',

      '.scout-ac-shell a { color: ' + T.cyan + ' !important; font-weight: 600; }',
      '.scout-ac-error { padding: 16px; font-size: 13px; color: ' + T.grayBlue + '; font-family: Montserrat, sans-serif; }',
      '.scout-ac-loading { padding: 16px; font-size: 12px; font-weight: 600; color: ' + T.green + '; font-family: Montserrat, sans-serif; }',
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
        extraLarge: 22,
      },
      fontWeights: {
        lighter: 400,
        default: 500,
        bolder: 700,
      },
      spacing: {
        small: 8,
        default: 12,
        medium: 16,
        large: 20,
        extraLarge: 24,
        padding: 16,
      },
      imageSizes: {
        small: 32,
        medium: 48,
        large: 72,
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
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.90)' },
          },
        },
        emphasis: {
          backgroundColor: T.green,
          foregroundColors: {
            default: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.90)' },
            accent: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.90)' },
            good: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.90)' },
            warning: { default: '#FFE08A', subtle: '#FFD45C' },
            attention: { default: '#FFB4B4', subtle: '#FF8F8F' },
            dark: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.90)' },
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.90)' },
          },
        },
        accent: {
          backgroundColor: 'rgba(0,172,236,0.08)',
          foregroundColors: {
            default: { default: T.text, subtle: T.grayBlue },
            accent: { default: T.cyan, subtle: '#0090C7' },
            good: { default: T.green, subtle: '#33826A' },
            warning: { default: '#B8860B', subtle: '#D4A84B' },
            attention: { default: '#BD696A', subtle: '#a85a5b' },
            dark: { default: T.text, subtle: T.grayBlue },
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.85)' },
          },
        },
        good: {
          backgroundColor: 'rgba(0,102,67,0.05)',
          foregroundColors: {
            default: { default: T.green, subtle: '#33826A' },
            accent: { default: T.cyan, subtle: '#0090C7' },
            good: { default: T.green, subtle: '#33826A' },
            warning: { default: '#B8860B', subtle: '#D4A84B' },
            attention: { default: '#BD696A', subtle: '#a85a5b' },
            dark: { default: T.text, subtle: T.grayBlue },
            light: { default: '#FFFFFF', subtle: 'rgba(255,255,255,0.85)' },
          },
        },
      },
      actions: {
        maxActions: 3,
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

  function styleButtons(root) {
    if (!root) return;
    var buttons = root.querySelectorAll('button, .ac-pushButton, a.ac-pushButton');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var label = (btn.textContent || '').trim().toLowerCase();
      var isPrimary =
        btn.classList.contains('style-positive') ||
        /read full|manage|confirm|continue|submit|done|yes|book/.test(label) ||
        i === 0;
      btn.classList.remove('scout-ac-btn-primary', 'scout-ac-btn-secondary');
      btn.classList.add(isPrimary ? 'scout-ac-btn-primary' : 'scout-ac-btn-secondary');
      if (isPrimary) {
        btn.style.setProperty('background', T.green, 'important');
        btn.style.setProperty('background-color', T.green, 'important');
        btn.style.setProperty('color', '#FFFFFF', 'important');
        btn.style.setProperty('border', '2px solid ' + T.green, 'important');
      } else {
        btn.style.setProperty('background', 'transparent', 'important');
        btn.style.setProperty('background-color', 'transparent', 'important');
        btn.style.setProperty('color', T.cyan, 'important');
        btn.style.setProperty('border', '2px solid ' + T.cyan, 'important');
      }
      btn.style.setProperty('pointer-events', 'auto', 'important');
      btn.style.setProperty('cursor', 'pointer', 'important');
      btn.removeAttribute('disabled');
    }
  }

  function forceHeaderContrast(root) {
    if (!root) return;
    var containers = root.querySelectorAll('.ac-container');
    for (var i = 0; i < containers.length; i++) {
      var el = containers[i];
      var bg = (el.style && el.style.backgroundColor) || '';
      var cs = getComputedStyle(el).backgroundColor || '';
      var isGreen =
        /rgb\(\s*0\s*,\s*102\s*,\s*67\s*\)/i.test(bg) ||
        /rgb\(\s*0\s*,\s*102\s*,\s*67\s*\)/i.test(cs) ||
        /#006643/i.test(bg);
      if (!isGreen) continue;
      var texts = el.querySelectorAll('.ac-textBlock, p, span');
      for (var j = 0; j < texts.length; j++) {
        texts[j].style.setProperty('color', '#FFFFFF', 'important');
      }
    }
  }

  function handleAction(action, onSendMessage) {
    if (!action) return;
    var typeName = '';
    try {
      typeName =
        (action.getJsonTypeName && action.getJsonTypeName()) ||
        (action.constructor && action.constructor.name) ||
        '';
    } catch (e) {
      typeName = '';
    }
    if (/ShowCard/i.test(typeName)) return;

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
      var text = title || (data && data.action) || 'Card action';
      onSendMessage(String(text), {
        adaptivecards: data || {},
        _cognigy: {
          _plugin: { type: 'adaptivecards', data: data || {} },
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
                forceHeaderContrast(hostRef.current);
                hostRef.current.addEventListener('click', function () {
                  setTimeout(function () {
                    if (!hostRef.current) return;
                    styleButtons(hostRef.current);
                    forceHeaderContrast(hostRef.current);
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

    var kids = [];
    if (status === 'loading') {
      kids.push(
        createElement('div', { className: 'scout-ac-loading', key: 'load' }, 'Loading…')
      );
    }
    if (status === 'error') {
      kids.push(
        createElement(
          'div',
          { className: 'scout-ac-error', key: 'err' },
          err || 'Unable to render card'
        )
      );
    }
    kids.push(
      createElement('div', {
        key: 'host',
        className: 'scout-ac-host',
        ref: hostRef,
      })
    );

    return createElement(
      'div',
      Object.assign({}, props.attributes || {}, { className: 'scout-ac-shell' }),
      createElement('div', { className: 'scout-ac-frame' }, kids)
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
