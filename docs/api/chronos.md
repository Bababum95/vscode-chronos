# Class: `Chronos` (`src/chronos.ts`)

The core extension controller: manages VS Code event hooks, buffers heartbeats, sends data to the API, and updates the status bar.

## Constructor

```ts
new Chronos(extensionPath: string, logger: Logger)
```

## Lifecycle

- `initialize(): Promise<void>` — Sets up status bar, loads API key and server URL, registers event listeners, starts activity polling.
- `dispose(): void` — Disposes subscriptions.

## Commands & actions

- `promptForApiKey(hidden: boolean = true): Promise<void>` — Prompts for and saves API key.
- `promptForServerUrl(): Promise<void>` — Prompts and saves server URL, updates VS Code config.
- `dashboard(): Promise<void>` — Opens Chronos dashboard in the browser.
- `openLogs(): Promise<void>` — Opens the local log file in an editor tab.
- `test(): Promise<void>` — Internal helper to log current repo information.

## Internals (selected)

- Debounced `onEvent` to append heartbeats on edits/tab changes.
- `appendHeartbeat(...)` constructs the `Heartbeat` and enriches with project and Git info.
- `_sendHeartbeats()` batches and transmits heartbeats; refreshes status bar on success.
- `getCodingActivity()` periodically fetches today's coding activity summary and updates status bar text/tooltip.

## Example

```ts
import { Chronos } from './chronos';
import { Logger } from './logger';
import { LogLevel } from './constants';

const chronos = new Chronos(context.extensionPath, new Logger(LogLevel.DEBUG));
await chronos.initialize();
```
