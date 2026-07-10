/**
 * Scout Webchat v3 Plugin
 *
 * Loaded via pluginUrls on the Cognigy endpoint.
 * Works on BOTH the hosted Webchat URL and custom embed pages.
 *
 * Features:
 * - Montserrat font injection
 * - Post-closeout input disable + "Start New Conversation" button
 * - Session persistence via localStorage
 * - ARIA label enhancements
 */
(function() {
  'use strict';

  // --- 1. Inject Montserrat font ---
  var fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);

  var style = document.createElement('style');
  style.textContent = [
    // Montserrat everywhere
    '[data-cognigy-webchat-root] * { font-family: "Montserrat", sans-serif !important; }',
    '[data-cognigy-webchat-root] .regular-message { font-size: 14px; line-height: 1.5; }',
    // Header title: single line — never wrap "Airlines" onto a second row
    '[data-cognigy-webchat-root] .webchat-header-title,',
    '[data-cognigy-webchat-root] .webchat-header-bar h1,',
    '[data-cognigy-webchat-root] .webchat-header-bar h2,',
    '[data-cognigy-webchat-root] .webchat-header-logo-name-container span,',
    '[data-cognigy-webchat-root] .webchat-header-logo-name-container p {',
    '  font-weight: 600 !important; letter-spacing: 0.01em; white-space: nowrap !important;',
    '  overflow: hidden !important; text-overflow: ellipsis !important;',
    '  font-size: 13px !important; line-height: 1.2 !important; max-width: 100% !important;',
    '  display: block !important;',
    '}',
    '[data-cognigy-webchat-root] .webchat-header-logo-name-container {',
    '  flex: 1 1 auto !important; min-width: 0 !important; margin-left: 0 !important;',
    '  margin-right: 8px !important; max-width: calc(100% - 96px) !important;',
    '  align-items: center !important; overflow: hidden !important;',
    '}',
    '[data-cognigy-webchat-root] .webchat-header-logo-name-container > div {',
    '  min-width: 0 !important; overflow: hidden !important; flex: 1 1 auto !important;',
    '}',

    // Header — left-justify logo + title, fixed logo size
    '[data-cognigy-webchat-root] .webchat-header-bar { justify-content: flex-start !important; gap: 8px !important; flex-wrap: nowrap !important; }',
    '[data-cognigy-webchat-root] .webchat-header-logo-name-container img, [data-cognigy-webchat-root] .webchat-header-logo { width: 32px !important; height: 32px !important; flex-shrink: 0 !important; object-fit: contain !important; }',

    // Hide Cognigy watermark
    '[data-cognigy-webchat-root] .webchat-branding-link,',
    '[data-cognigy-webchat-root] a[href*="cognigy.com"][href*="webchat"] { display: none !important; }',

    // Session ended state
    'body.scout-session-ended [data-cognigy-webchat-root] .webchat-input { display: none !important; }',
    '#scout-restart-bar { display: none; position: fixed; bottom: 0; right: 0; width: 450px;',
    '  background: #f8f9fa; border-top: 1px solid #e5e7eb; padding: 12px 16px;',
    '  text-align: center; z-index: 10000; font-family: "Montserrat", sans-serif; }',
    'body.scout-session-ended #scout-restart-bar { display: block; }',
    '#scout-restart-bar p { margin: 0 0 8px; font-size: 13px; color: #6b7280; }',
    '#scout-restart-btn { background: #006643; color: #fff; border: none; border-radius: 8px;',
    '  padding: 10px 24px; font-family: "Montserrat", sans-serif; font-size: 14px;',
    '  font-weight: 600; cursor: pointer; }',
    '#scout-restart-btn:hover { background: #005535; }'
  ].join('\n');
  document.head.appendChild(style);

  // --- 2. Create restart bar ---
  var restartBar = document.createElement('div');
  restartBar.id = 'scout-restart-bar';
  restartBar.innerHTML = '<p>This conversation has ended.</p>' +
    '<button type="button" id="scout-restart-btn">Start New Conversation</button>';
  document.body.appendChild(restartBar);

  document.getElementById('scout-restart-btn').addEventListener('click', function() {
    document.body.classList.remove('scout-session-ended');
    // Generate new session
    var newId = 'scout-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    try { localStorage.setItem('SCOUT_SESSION_ID', newId); } catch(e) {}
    window.location.reload();
  });

  // --- 3. Listen for session end signals ---
  // Poll for webchat instance (plugin loads before initWebchat resolves)
  var checkInterval = setInterval(function() {
    var wc = window.cognigyWebchat || window.__cognigyWebchat;
    if (!wc) return;
    clearInterval(checkInterval);

    wc.registerAnalyticsService(function(event) {
      // Session persistence
      if (event.type === 'webchat/switch-session') {
        try { localStorage.setItem('SCOUT_SESSION_ID', event.payload); } catch(e) {}
      }

      // Detect closeout
      if (event.type === 'webchat/incoming-message' && event.payload) {
        var text = (event.payload.text || '').toLowerCase();
        var data = event.payload.data || {};
        var isEnded = data._sessionEnded === true;

        if (!isEnded && text) {
          var patterns = ['have a great', 'have a wonderful', 'take care',
            'thanks for chatting', 'thank you for flying', 'goodbye',
            'conversation has ended'];
          for (var i = 0; i < patterns.length; i++) {
            if (text.indexOf(patterns[i]) >= 0) { isEnded = true; break; }
          }
        }

        if (isEnded) {
          document.body.classList.add('scout-session-ended');
        }
      }
    });
  }, 500);
})();
