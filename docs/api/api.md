# Class: `Api` (`src/api.ts`)

HTTP client for the Chronos backend API.

## Constructor

```ts
new Api(logger: Logger, serverUrl: string)
```

- Initializes base URL as `${serverUrl}/api/v1`

## Methods

- `setApiKey(apiKey: string): void`
  - Validates and stores an API key; logs validation errors.
- `setServerUrl(serverUrl: string): void`
  - Updates base URL; useful if the user changes settings at runtime.
- `hasApiKey(): boolean`
  - Returns `true` if a valid API key is set.
- `sendHeartbeats(heartbeats: Heartbeat[]): Promise<void>`
  - POSTs to `/heartbeats` with Basic auth (key as username, empty password).
- `getToday(untilNow: boolean = true): Promise<any>`
  - GETs summaries for the current day (start to now or start to end-of-day).

## Example

```ts
import { Api } from './api';
import { Logger } from './logger';
import { LogLevel } from './constants';

const api = new Api(new Logger(LogLevel.DEBUG), 'https://next-chronos.vercel.app');
api.setApiKey('chronos_...');
await api.sendHeartbeats([{ /* Heartbeat */ } as any]);
```
