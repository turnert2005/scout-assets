/**
 * Scout Adaptive Cards — Webchat v3 Message Plugin
 *
 * Renders Microsoft Adaptive Card payloads emitted by Cognigy Code/Say nodes:
 *   actions.output(text, { _plugin: { type: 'adaptivecards' | 'adaptivecard', payload: cardJson } })
 *
 * Anti-pattern fixed: Scout previously emitted Adaptive Card JSON without a renderer
 * on endpoint pluginUrls. This plugin is the renderer for the Scout POC.
 *
 * Host: GitHub Pages (same as weather/flight) for Scout only — not www2 production.
 *
 * Match: both 'adaptivecards' (official Cognigy name) and 'adaptivecard' (Scout legacy).
 */
(function () {
  'use strict';

  var SDK_URL =
    'https://cdn.jsdelivr.net/npm/adaptivecards@3.0.5/dist/adaptivecards.min.js';
  var sdkLoading = null;
  var stylesInjected = false;

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var css = [
      '.scout-ac-wrap { font-family: "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif; max-width: 360px; margin: 4px 0 8px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,102,67,0.12); box-shadow: 0 2px 10px rgba(0,0,0,0.06); background: #fff; }',
      '.scout-ac-wrap .ac-container { padding: 8px !important; }',
      '.scout-ac-wrap .ac-pushButton { background: #006643 !important; color: #fff !important; border: none !important; border-radius: 8px !important; padding: 8px 14px !important; font-weight: 600 !important; cursor: pointer !important; }',
      '.scout-ac-wrap .ac-pushButton:hover { background: #005536 !important; }',
      '.scout-ac-error { padding: 12px 14px; font-size: 13px; color: #6b7280; }',
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
              card.hostConfig = new AdaptiveCards.HostConfig({
                fontFamily:
                  'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
                spacing: {
                  small: 4,
                  default: 8,
                  medium: 12,
                  large: 16,
                  extraLarge: 20,
                  padding: 10,
                },
              });
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
                    /* ignore action errors */
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

    var children = [];
    if (status === 'loading') {
      children.push(
        createElement(
          'div',
          { className: 'scout-ac-error', key: 'load' },
          'Loading card…'
        )
      );
    }
    if (status === 'error') {
      children.push(
        createElement(
          'div',
          { className: 'scout-ac-error', key: 'err' },
          err || 'Unable to render card'
        )
      );
    }
    children.push(
      createElement('div', {
        key: 'host',
        ref: hostRef,
        style: status === 'ready' ? undefined : { minHeight: 0 },
      })
    );

    return createElement(
      'div',
      Object.assign({}, props.attributes || {}, { className: 'scout-ac-wrap' }),
      children
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

  // Official Cognigy name + Scout legacy singular
  register('adaptivecards');
  register('adaptivecard');
})();
