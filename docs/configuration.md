# Configuration

Chronos reads settings from, in priority order:

1. VS Code Settings (`chronos.*`)
2. Environment variables
3. `~/.chronos.cfg` (user config file)
4. Internal config `~/.chronos/chronos-internal.cfg` (managed by the extension)

## Settings

- `chronos.serverUrl` (string)
  - Default: `https://next-chronos.vercel.app`

## Environment Variables

- `CHRONOS_API_KEY`: Your Chronos API key
- `CHRONOS_SERVER_URL`: Override server URL
- `CHRONOS_HOME`: Override home directory resolution used by the extension

## Config File `~/.chronos.cfg`

INI-like format with sections:

```
[settings]
api_key = chronos_...
server_url = https://...
api_key_vault_cmd = secret-tool lookup chronos key
```

Notes:
- `api_key_vault_cmd` runs a command to fetch the API key at runtime.
- The extension will reconcile conflicts between different sources and surface warnings in VS Code.
