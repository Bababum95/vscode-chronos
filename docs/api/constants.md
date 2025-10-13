# Module: `src/constants.ts`

## Enums

### `Command`
- `SET_API_KEY = 'chronos.setApiKey'`
- `DASHBOARD = 'chronos.dashboard'`
- `SET_URI = 'chronos.setUri'`
- `OPEN_LOGS = 'chronos.openLogs'`

### `LogLevel`
- `DEBUG = 0`
- `INFO`
- `WARN`
- `ERROR`

## Constants

- `DEFAULT_SERVER_URL: string` — Default API server base URL.
- `DASHBOARD_URL: string` — Dashboard URL.
- `DEFAULT_LOG_LEVEL: LogLevel` — Default logger level (`DEBUG`).
- Time constants (seconds):
  - `AI_RECENT_PASTES_TIME = 0.5`
  - `TIME_BETWEEN_HEARTBEATS = 120`
  - `SEND_BUFFER = 30`

## Usage Example

```ts
import { Command, LogLevel, DEFAULT_SERVER_URL } from './constants';

console.log(DEFAULT_SERVER_URL);
```
