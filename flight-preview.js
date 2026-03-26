/**
 * Scout Flight Status Preview — Webchat v3 Message Plugin
 *
 * Renders a compact, inline flight status card in the chat stream.
 * Frontier Airlines branded — Montserrat, color-coded status, animated.
 *
 * Trigger payload (from Code Node):
 *   actions.output('', { _plugin: { type: 'scout-flight-preview', ...flightData } })
 *
 * Data contract:
 *   { flight, origin, destination, departTime, arriveTime, status,
 *     depGate, depTerminal, duration, aircraft, date }
 *
 * Webchat v3 plugin format: match + component (React) + options
 */
(function () {
  'use strict';

  // ── Status config ─────────────────────────────────────────
  var STATUS_CONFIG = {
    'on time':   { bg: '#e8f5ee', color: '#006643', dot: '#006643' },
    'delayed':   { bg: '#fef9e7', color: '#7d6608', dot: '#e0b774' },
    'cancelled': { bg: '#fdf0f0', color: '#9b2c2c', dot: '#bd696a' },
    'in flight': { bg: '#e8f4fd', color: '#1a5276', dot: '#00acec' },
    'landed':    { bg: '#e8f5ee', color: '#006643', dot: '#006643' }
  };

  function getStatus(s) {
    return STATUS_CONFIG[(s || '').toLowerCase()] || STATUS_CONFIG['on time'];
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
      '@keyframes scoutFlightSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }',
      '@keyframes scoutFlightPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }',
      '.scout-flight { font-family: "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06); animation: scoutFlightSlideIn 0.4s ease-out both; max-width: 340px; background: #fff; border: 1px solid rgba(0,102,67,0.08); }',
      '.scout-flight-header { background: linear-gradient(135deg, #006643 0%, #008855 50%, #33826a 100%); padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; }',
      '.scout-flight-header::before { content: ""; position: absolute; top: -20px; right: -10px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }',
      '.scout-flight-number { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: 0.5px; position: relative; z-index: 1; }',
      '.scout-flight-date { font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 400; position: relative; z-index: 1; }',
      '.scout-flight-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; position: relative; z-index: 1; }',
      '.scout-flight-badge-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }',
      '.scout-flight-badge-dot.pulse { animation: scoutFlightPulse 1.5s ease-in-out infinite; }',
      '.scout-flight-route { padding: 16px; display: flex; align-items: center; }',
      '.scout-flight-point { text-align: center; flex: 0 0 auto; min-width: 60px; }',
      '.scout-flight-code { font-size: 22px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }',
      '.scout-flight-time { font-size: 13px; font-weight: 600; color: #576e77; margin-top: 2px; }',
      '.scout-flight-line { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0 8px; }',
      '.scout-flight-line-track { width: 100%; height: 2px; background: #e8e8e8; border-radius: 1px; }',
      '.scout-flight-line-plane { font-size: 14px; margin-bottom: 4px; }',
      '.scout-flight-line-duration { font-size: 10px; color: #9a9a9a; margin-top: 4px; }',
      '.scout-flight-info { display: flex; border-top: 1px solid #edf2f4; }',
      '.scout-flight-info-item { flex: 1; padding: 10px 12px; text-align: center; }',
      '.scout-flight-info-item + .scout-flight-info-item { border-left: 1px solid #edf2f4; }',
      '.scout-flight-info-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: #9a9a9a; margin-bottom: 2px; }',
      '.scout-flight-info-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }',
      '.scout-flight-action { display: block; width: calc(100% - 32px); margin: 0 16px 16px; padding: 10px; background: #006643; color: #fff; border: none; border-radius: 10px; font-family: "Montserrat", sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; transition: background 0.15s; }',
      '.scout-flight-action:hover { background: #005536; }'
    ].join('\n');

    var el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── React component ───────────────────────────────────────
  function FlightPreviewComponent(props) {
    var React = window.__COGNIGY_WEBCHAT ? window.__COGNIGY_WEBCHAT.React : null;
    if (!React) React = window.React;
    if (!React) return null;

    injectStyles();

    var d = props.message.data._plugin || {};
    var st = getStatus(d.status);
    var isLive = (d.status || '').toLowerCase() === 'in flight';
    var h = React.createElement;

    function handleDashboardClick() {
      if (props.onSendMessage) {
        props.onSendMessage('Show me the full flight dashboard');
      }
    }

    return h('div', Object.assign({}, props.attributes, { className: 'scout-flight' }),
      // Header
      h('div', { className: 'scout-flight-header' },
        h('div', null,
          h('div', { className: 'scout-flight-number' }, d.flight || 'F9-0000'),
          h('div', { className: 'scout-flight-date' }, d.date || '')
        ),
        h('div', { className: 'scout-flight-badge', style: { background: st.bg, color: st.color } },
          h('span', {
            className: 'scout-flight-badge-dot' + (isLive ? ' pulse' : ''),
            style: { background: st.dot }
          }),
          d.status || 'On Time'
        )
      ),
      // Route
      h('div', { className: 'scout-flight-route' },
        h('div', { className: 'scout-flight-point' },
          h('div', { className: 'scout-flight-code' }, d.origin || '???'),
          h('div', { className: 'scout-flight-time' }, d.departTime || '--:--')
        ),
        h('div', { className: 'scout-flight-line' },
          h('div', { className: 'scout-flight-line-plane' }, '\u2708\uFE0F'),
          h('div', { className: 'scout-flight-line-track' }),
          h('div', { className: 'scout-flight-line-duration' }, d.duration || '')
        ),
        h('div', { className: 'scout-flight-point' },
          h('div', { className: 'scout-flight-code' }, d.destination || '???'),
          h('div', { className: 'scout-flight-time' }, d.arriveTime || '--:--')
        )
      ),
      // Info strip
      h('div', { className: 'scout-flight-info' },
        h('div', { className: 'scout-flight-info-item' },
          h('div', { className: 'scout-flight-info-label' }, 'Gate'),
          h('div', { className: 'scout-flight-info-value' }, d.depGate || '--')
        ),
        h('div', { className: 'scout-flight-info-item' },
          h('div', { className: 'scout-flight-info-label' }, 'Terminal'),
          h('div', { className: 'scout-flight-info-value' }, d.depTerminal || '--')
        ),
        h('div', { className: 'scout-flight-info-item' },
          h('div', { className: 'scout-flight-info-label' }, 'Aircraft'),
          h('div', { className: 'scout-flight-info-value' }, d.aircraft || '--')
        )
      ),
      // Action button
      h('button', { className: 'scout-flight-action', onClick: handleDashboardClick }, 'View Full Dashboard')
    );
  }

  // ── Register as Webchat v3 message plugin ─────────────────
  var plugin = {
    match: 'scout-flight-preview',
    component: FlightPreviewComponent,
    options: { fullwidth: true }
  };

  if (!window.cognigyWebchatMessagePlugins) {
    window.cognigyWebchatMessagePlugins = [];
  }
  window.cognigyWebchatMessagePlugins.push(plugin);
})();
