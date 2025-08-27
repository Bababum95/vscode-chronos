import * as vscode from 'vscode';

import { Chronos } from './chronos';
import { Command, LogLevel } from './constants';
import { Logger } from './logger';

const logger = new Logger(LogLevel.INFO);
let chronos: Chronos;

/** Entry point of the VS Code extension. */
export function activate(context: vscode.ExtensionContext) {
  chronos = new Chronos(context.extensionPath, logger);

  context.subscriptions.push(
    vscode.commands.registerCommand(Command.HELLO, () => {
      vscode.window.showInformationMessage('Chronos is alive!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Command.TEST, () => {
      chronos.test();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Command.SET_API_KEY, () => {
      chronos.promptForApiKey();
    })
  );

  context.subscriptions.push(chronos);
  chronos.initialize();
}

/** Called when the extension is deactivated. */
export function deactivate() {
  chronos.dispose();
}
