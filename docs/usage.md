# Usage

## Commands

The extension contributes the following commands (Command Palette):

- Chronos: Api Key (`chronos.setApiKey`)
- Chronos: Set Server URL (`chronos.setUri`)
- Chronos: Open Log File (`chronos.openLogs`)
- Chronos: Dashboard (click status bar or open externally)

## Status Bar

- Shows a clock icon by default.
- When coding activity summaries are available, shows total time today.
- Hover tooltip displays additional context.

## Heartbeats

- The extension records heartbeats (file, cursor position, line counts, category) on edits and tab changes, debounced to avoid noise.
- Batched heartbeats are sent to the Chronos API when conditions are met.

## Examples

### Open Dashboard

- Use the "Chronos: Dashboard" command or click the status bar item.

### Update Server URL

- Use the command "Chronos: Set Server URL" and enter the new URL.

### Open Logs

- Use the command "Chronos: Open Log File" to open `chronos.log` from the resources directory.
