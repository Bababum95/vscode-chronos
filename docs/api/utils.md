# Class: `Utils` (`src/utils.ts`)

Collection of static utility helpers used throughout the extension.

## Time & formatting

- `secToMs(seconds: number): number`
- `secToMin(seconds: number): number`
- `quote(str: string): string` — Quote strings containing spaces.
- `wrapArg(arg: string): string` — Quote CLI arg if needed.
- `formatArguments(binary: string, args: string[]): string` — Formats CLI command line, obfuscating API keys.
- `obfuscateKey(key: string): string`

## VS Code workspace helpers

- `getProjectName(uri: vscode.Uri): string`
- `getProjectFolder(uri: vscode.Uri): string`
- `getFocusedFile(document?: vscode.TextDocument): string | undefined`

## Git helpers (via built-in Git extension)

- `getGitBranch(uri: vscode.Uri): string | undefined`
- `getGitRepo(uri: vscode.Uri)` — Returns the Git repo object or `undefined`.

## AI / editing heuristics

- `isAIChatSidebar(uri?: vscode.Uri): boolean`
- `isPossibleAICodeInsert(e: vscode.TextDocumentChangeEvent): boolean`
- `isPossibleHumanCodeInsert(e: vscode.TextDocumentChangeEvent): boolean`
- `enoughTimePassed(lastHeartbeat: number, now: number): boolean`
- `isPullRequest(uri: vscode.Uri): boolean`

## Examples

```ts
import { Utils } from './utils';

const shouldSend = Utils.enoughTimePassed(last, Date.now());
const wrapped = Utils.wrapArg('--key');
```
