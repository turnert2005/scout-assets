/**
 * Scout Weather Card — Webchat v3 Message Plugin
 *
 * Renders an inline weather card in the chat stream.
 * Frontier Airlines branded — Montserrat, gradients, design tokens.
 *
 * Trigger payload (from Code Node):
 *   actions.output('', { _plugin: { type: 'scout-weather', ...weatherData } })
 *
 * Data contract:
 *   { temp, description, location, feels_like, wind_speed, humidity, visibility, advisory, updated }
 *
 * Webchat v3 plugin format: match + component (React) + options
 */
(function () {
  'use strict';

  // ── Weather icon mapping ──────────────────────────────────
  var ICONS = {
    'clear sky': '\u2600\uFE0F', 'few clouds': '\uD83C\uDF24\uFE0F', 'scattered clouds': '\u26C5',
    'broken clouds': '\u2601\uFE0F', 'overcast clouds': '\u2601\uFE0F',
    'shower rain': '\uD83C\uDF27\uFE0F', 'rain': '\uD83C\uDF27\uFE0F', 'light rain': '\uD83C\uDF26\uFE0F',
    'thunderstorm': '\u26C8\uFE0F', 'snow': '\u2744\uFE0F', 'light snow': '\uD83C\uDF28\uFE0F',
    'mist': '\uD83C\uDF2B\uFE0F', 'fog': '\uD83C\uDF2B\uFE0F', 'haze': '\uD83C\uDF2B\uFE0F',
    'drizzle': '\uD83C\uDF26\uFE0F', 'tornado': '\uD83C\uDF2A\uFE0F'
  };

  function getIcon(desc) {
    var d = (desc || '').toLowerCase();
    for (var key in ICONS) {
      if (d.indexOf(key) >= 0) return ICONS[key];
    }
    return '\uD83C\uDF24\uFE0F';
  }

  // ── Inject styles once ────────────────────────────────────
  var injected = false;
  function injectStyles() {
    if (injected) return;
    injected = true;

    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    var css = [
      '@keyframes scoutWeatherSlideIn {',
      '  from { opacity: 0; transform: translateY(12px); }',
      '  to { opacity: 1; transform: translateY(0); }',
      '}',
      '.scout-wx { font-family: "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06); animation: scoutWeatherSlideIn 0.4s ease-out both; max-width: 340px; border: 1px solid rgba(0,102,67,0.08); }',
      '.scout-wx-header { background: linear-gradient(135deg, #1a5276 0%, #2980b9 40%, #5dade2 80%, #85c1e9 100%); padding: 20px 20px 16px; text-align: center; position: relative; overflow: hidden; }',
      '.scout-wx-header::before { content: ""; position: absolute; top: -20px; right: -15px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }',
      '.scout-wx-hero { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px; position: relative; z-index: 1; }',
      '.scout-wx-icon { font-size: 48px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }',
      '.scout-wx-temp { font-size: 44px; font-weight: 700; color: #fff; letter-spacing: -1px; font-variant-numeric: tabular-nums; text-shadow: 0 1px 3px rgba(0,0,0,0.15); }',
      '.scout-wx-unit { font-size: 18px; font-weight: 400; opacity: 0.8; vertical-align: super; }',
      '.scout-wx-desc { color: rgba(255,255,255,0.95); font-size: 14px; font-weight: 600; text-transform: capitalize; margin-bottom: 2px; position: relative; z-index: 1; }',
      '.scout-wx-loc { color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 400; position: relative; z-index: 1; }',
      '.scout-wx-body { background: #fff; padding: 16px; }',
      '.scout-wx-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }',
      '.scout-wx-stat { background: #f8fafb; border: 1px solid #edf2f4; border-radius: 10px; padding: 10px; text-align: center; }',
      '.scout-wx-stat-icon { font-size: 18px; margin-bottom: 4px; }',
      '.scout-wx-stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #9a9a9a; margin-bottom: 2px; }',
      '.scout-wx-stat-value { font-size: 15px; font-weight: 600; color: #1a1a1a; font-variant-numeric: tabular-nums; }',
      '.scout-wx-advisory { display: flex; align-items: flex-start; gap: 8px; background: #fef9e7; border: 1px solid #f9e79f; border-radius: 10px; padding: 10px 12px; margin-top: 10px; font-size: 12px; color: #7d6608; line-height: 1.4; }',
      '.scout-wx-footer { text-align: center; font-size: 10px; color: #9a9a9a; padding-top: 10px; margin-top: 10px; border-top: 1px solid #edf2f4; }'
    ].join('\n');

    var el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── React component ───────────────────────────────────────
  function WeatherCardComponent(props) {
    var React = window.__COGNIGY_WEBCHAT ? window.__COGNIGY_WEBCHAT.React : null;
    if (!React) {
      // Fallback: try global React
      React = window.React;
    }
    if (!React) return null;

    injectStyles();

    var d = props.message.data._plugin || {};
    var temp = d.temp != null ? Math.round(d.temp) : '--';
    var icon = getIcon(d.description);
    var desc = d.description || 'Unknown';
    var loc = d.location || 'Airport';
    var feelsLike = d.feels_like != null ? Math.round(d.feels_like) + '\u00B0F' : '--';
    var wind = d.wind_speed != null ? Math.round(d.wind_speed) + ' mph' : '--';
    var humidity = d.humidity != null ? d.humidity + '%' : '--';
    var vis = d.visibility != null ? Math.round(d.visibility / 1609) + ' mi' : '--';
    var updated = d.updated || 'just now';

    var h = React.createElement;

    return h('div', Object.assign({}, props.attributes, { className: 'scout-wx' }),
      // Header
      h('div', { className: 'scout-wx-header' },
        h('div', { className: 'scout-wx-hero' },
          h('span', { className: 'scout-wx-icon' }, icon),
          h('span', { className: 'scout-wx-temp' }, temp, h('span', { className: 'scout-wx-unit' }, '\u00B0F'))
        ),
        h('div', { className: 'scout-wx-desc' }, desc),
        h('div', { className: 'scout-wx-loc' }, loc)
      ),
      // Body
      h('div', { className: 'scout-wx-body' },
        h('div', { className: 'scout-wx-grid' },
          h('div', { className: 'scout-wx-stat' },
            h('div', { className: 'scout-wx-stat-icon' }, '\uD83C\uDF21\uFE0F'),
            h('div', { className: 'scout-wx-stat-label' }, 'Feels Like'),
            h('div', { className: 'scout-wx-stat-value' }, feelsLike)
          ),
          h('div', { className: 'scout-wx-stat' },
            h('div', { className: 'scout-wx-stat-icon' }, '\uD83D\uDCA8'),
            h('div', { className: 'scout-wx-stat-label' }, 'Wind'),
            h('div', { className: 'scout-wx-stat-value' }, wind)
          ),
          h('div', { className: 'scout-wx-stat' },
            h('div', { className: 'scout-wx-stat-icon' }, '\uD83D\uDCA7'),
            h('div', { className: 'scout-wx-stat-label' }, 'Humidity'),
            h('div', { className: 'scout-wx-stat-value' }, humidity)
          ),
          h('div', { className: 'scout-wx-stat' },
            h('div', { className: 'scout-wx-stat-icon' }, '\uD83D\uDC41\uFE0F'),
            h('div', { className: 'scout-wx-stat-label' }, 'Visibility'),
            h('div', { className: 'scout-wx-stat-value' }, vis)
          )
        ),
        // Advisory (conditional)
        d.advisory ? h('div', { className: 'scout-wx-advisory' },
          h('span', null, '\u26A0\uFE0F'),
          h('span', null, d.advisory)
        ) : null,
        // Footer
        h('div', { className: 'scout-wx-footer' }, 'Data from OpenWeather \u00B7 Updated ' + updated)
      )
    );
  }

  // ── Register as Webchat v3 message plugin ─────────────────
  var plugin = {
    match: 'scout-weather',
    component: WeatherCardComponent,
    options: { fullwidth: true }
  };

  if (!window.cognigyWebchatMessagePlugins) {
    window.cognigyWebchatMessagePlugins = [];
  }
  window.cognigyWebchatMessagePlugins.push(plugin);
})();
