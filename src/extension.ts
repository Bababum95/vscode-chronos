import * as vscode from 'vscode';

import { Chronos } from './chronos';
import { Command, DEFAULT_LOG_LEVEL } from './constants';
import { Logger } from './logger';

const logger = new Logger(DEFAULT_LOG_LEVEL);
let chronos: Chronos;

export function activate(context: vscode.ExtensionContext) {
  chronos = new Chronos(context.extensionPath, logger);

  context.subscriptions.push(
    vscode.commands.registerCommand(Command.SET_API_KEY, () => {
      chronos.promptForApiKey();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Command.DASHBOARD, () => {
      chronos.dashboard();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Command.SET_URI, () => {
      chronos.promptForServerUrl();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Command.OPEN_LOGS, () => {
      chronos.openLogs();
    })
  );

  context.subscriptions.push(chronos);
  chronos.initialize();
}

/** Called when the extension is deactivated. */
export function deactivate() {
  chronos.dispose();
}
