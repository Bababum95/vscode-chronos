# Module: `src/types.ts`

## Types

### `Lines`
Mapping of file path to total line count.

```ts
type Lines = { [fileName: string]: number };
```

### `LineCounts`
Separate AI and human line deltas per file.

```ts
type LineCounts = { ai: Lines; human: Lines };
```

### `FileSelectionMap`
Tracks last heartbeat per file with caret position.

```ts
type FileSelectionMap = { [key: string]: { selection: Position; lastHeartbeatAt: number } };
```

### `Heartbeat`
Payload sent to Chronos API.

Key fields: `time`, `entity`, `is_write`, `lineno`, `cursorpos`, `lines_in_file`, optional `alternate_project`, `project_folder`, `git_branch`, `language`, `category`, `ai_line_changes`, `human_line_changes`, `is_unsaved_entity`.

### `Setting`
Key/value pair returned from config reads.

```ts
type Setting = { key: string; value: string; error?: string };
```

## Usage Example

```ts
import type { Heartbeat } from './types';

const hb: Heartbeat = {
  time: Date.now() / 1000,
  entity: '/path/main.ts',
  is_write: false,
  lineno: 1,
  cursorpos: 1,
  lines_in_file: 100,
};
```
