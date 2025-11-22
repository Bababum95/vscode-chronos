const STORAGE_KEY = 'crmApiKey';

async function getStoredApiKey() {
  const result = await chrome.storage.sync.get([STORAGE_KEY]);
  return result[STORAGE_KEY] || '';
}

async function logStoredApiKey() {
  const apiKey = await getStoredApiKey();
  if (apiKey) {
    console.info('[Telemost CRM Helper] Stored CRM API key:', apiKey);
  } else {
    console.info('[Telemost CRM Helper] No CRM API key saved yet.');
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  console.info('[Telemost CRM Helper] Extension installed.');
  await logStoredApiKey();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'REQUEST_API_KEY') {
    getStoredApiKey()
      .then((apiKey) => sendResponse({ apiKey }))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // keep the message channel open for async reply
  }

  if (message?.type === 'LOG_API_KEY') {
    logStoredApiKey().then(() => sendResponse({ success: true }));
    return true;
  }

  return false;
});

// Expose function on global scope for manual invocation during debugging
self.logStoredApiKey = logStoredApiKey;
