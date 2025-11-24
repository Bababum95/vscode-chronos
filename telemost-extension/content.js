(function detectTelemost() {
  const isTelemostHost = window.location.hostname === 'telemost.yandex.ru';
  const hasConferencePath = /^\/w\//.test(window.location.pathname);

  if (isTelemostHost && hasConferencePath) {
    console.debug('[Telemost CRM Helper] Telemost conference detected:', window.location.href);
  } else {
    console.debug('[Telemost CRM Helper] Content script loaded outside a Telemost conference.');
  }
})();
