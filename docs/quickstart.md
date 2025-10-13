# Quickstart

Chronos is a VS Code extension that tracks coding time and activity, and displays status in the VS Code status bar.

## Install

1. Install the extension (from marketplace or local build)
2. Reload VS Code

## Configure API Key

- Command Palette → "Chronos: Api Key"
- Paste your Chronos API Key (format: `chronos_XXXXXXXX-XXXX-4XXX-8XXX-XXXXXXXXXXXX`)

Alternatively:
- Settings JSON: `"chronos.apiKey": "chronos_..."`
- Env var: `CHRONOS_API_KEY=chronos_...`
- Config file: `~/.chronos.cfg` under `[settings]` as `api_key = chronos_...`

## Configure Server URL (optional)

- Command Palette → "Chronos: Set Server URL"
- Or Settings JSON: `"chronos.serverUrl": "https://your-domain.tld"`
- Or Env var: `CHRONOS_SERVER_URL=https://your-domain.tld`
- Or Config file: `~/.chronos.cfg` `[settings]` `server_url = ...`

## Verify

- Status bar should show a clock icon. After some activity, it will show your total coding time for today.
- Open the Chronos dashboard via the command "Chronos: Dashboard" or click the status bar item.
