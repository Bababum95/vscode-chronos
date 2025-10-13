# Class: `Logger` (`src/logger.ts`)

Lightweight console-based logger with runtime level filtering.

## Constructor

```ts
new Logger(level: LogLevel)
```

- **level**: initial minimum level (messages below this are ignored)

## Methods

- `getLevel(): LogLevel`
- `setLevel(level: LogLevel): void`
- `debug(msg: string): void`
- `debugException(msg: unknown): void`
- `info(msg: string): void`
- `warn(msg: string): void`
- `warnException(msg: unknown): void`
- `error(msg: string): void`
- `errorException(msg: unknown): void`

## Example

```ts
import { Logger } from './logger';
import { LogLevel } from './constants';

const logger = new Logger(LogLevel.DEBUG);
logger.info('Chronos started');
```
