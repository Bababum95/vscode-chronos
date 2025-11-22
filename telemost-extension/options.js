const STORAGE_KEY = 'crmApiKey';

const form = document.getElementById('api-key-form');
const input = document.getElementById('crm-api-key');
const statusEl = document.getElementById('status');
const logButton = document.getElementById('log-key-button');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#a40000' : '#0a6e2d';
}

async function restoreOptions() {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    input.value = result[STORAGE_KEY] ?? '';
  } catch (error) {
    console.error('Failed to load CRM API key', error);
    setStatus('Unable to load saved key', true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const apiKey = input.value.trim();

  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: apiKey });
    setStatus('API key saved successfully.');
  } catch (error) {
    console.error('Failed to save CRM API key', error);
    setStatus('Error saving key', true);
  }
});

logButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'LOG_API_KEY' }, ({ error } = {}) => {
    if (error) {
      setStatus('Unable to log API key', true);
    } else {
      setStatus('Logged API key to the console.');
    }
  });
});

restoreOptions();
