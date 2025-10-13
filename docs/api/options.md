# Class: `Options` (`src/options.ts`)

Resolves settings and file paths from multiple sources and manages config writes.

## Constructor

```ts
new Options(logger: Logger, resourcesFolder: string)
```

- `resourcesFolder` is a writable folder (e.g. `~/.chronos`).

## Key methods

- `getSetting(section, key, internal, callback): void`
- `getSettingAsync<T>(section, key): Promise<T>`
- `setSetting(section: string, key: string, val: string, internal: boolean): void`
- `getConfigFile(internal: boolean): string`
- `getLogFile(): string`

### API Key resolution

- `getApiKey(): Promise<string>` checks, in order:
  1. VS Code `chronos.apiKey` setting
  2. Env var `CHRONOS_API_KEY`
  3. Vault command `api_key_vault_cmd`
  4. Config file `~/.chronos.cfg`
  - Warns about conflicts across sources.

### Server URL resolution

- `getServerUrl(): Promise<string>` checks editor setting, env var, then config file; defaults to `DEFAULT_SERVER_URL`.
- `getServerUrlFromEditor()`, `getServerUrlFromEnv()` are helpers.

## Example

```ts
const options = new Options(logger, resourcesPath);
const apiKey = await options.getApiKey();
const serverUrl = await options.getServerUrl();
```
