const statusEl = document.getElementById('status');
const logButton = document.getElementById('log-key');
const openOptionsButton = document.getElementById('open-options');

openOptionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

logButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'LOG_API_KEY' }, ({ error } = {}) => {
    if (error) {
      statusEl.textContent = 'Unable to log API key.';
    } else {
      statusEl.textContent = 'Check the service worker console for the API key.';
    }
  });
});
