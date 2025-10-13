# Class: `Desktop` (`src/desktop.ts`)

OS and environment helpers.

## Static methods

- `isWindows(): boolean`
- `isPortable(): boolean` — Whether VS Code portable mode is detected.
- `getHomeDirectory(): string` — Honors `CHRONOS_HOME`, portable path, or OS default.
- `buildOptions(stdin?: boolean): Object` — Child process options with sane defaults.

## Example

```ts
import { Desktop } from './desktop';

const home = Desktop.getHomeDirectory();
```
