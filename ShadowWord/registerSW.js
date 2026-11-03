if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    const base = new URL('./', document.baseURI);
    navigator.serviceWorker.register(new URL('sw.js', base).href, { scope: base.href })
      .catch(error => console.warn('ShadowWord offline setup failed:', error));
  });
}
