# Module: `src/extension.ts`

Entry point that wires VS Code activation to `Chronos` and registers commands.

## Exports

- `activate(context: vscode.ExtensionContext): void`
- `deactivate(): void`

## Behavior

- Instantiates a `Logger` and a `Chronos` controller.
- Registers commands:
  - `chronos.setApiKey` → `chronos.promptForApiKey()`
  - `chronos.setUri` → `chronos.promptForServerUrl()`
  - `chronos.openLogs` → `chronos.openLogs()`
- Subscribes the controller to extension lifecycle and calls `initialize()` on activation.

## Example

```ts
import { activate, deactivate } from './extension';
// VS Code calls these automatically.
```
