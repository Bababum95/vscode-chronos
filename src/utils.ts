import * as vscode from 'vscode';

import { TIME_BETWEEN_HEARTBEATS } from './constants';

export class Utils {
  // private static appNames = {
  //   'Arduino IDE': 'arduino',
  //   'Azure Data Studio': 'azdata',
  //   Cursor: 'cursor',
  //   Onivim: 'onivim',
  //   'Onivim 2': 'onivim',
  //   'SQL Operations Studio': 'sqlops',
  //   Trae: 'trae',
  //   'Visual Studio Code': 'vscode',
  //   Windsurf: 'windsurf',
  // };

  public static secToMs(seconds: number): number {
    return seconds * 1000;
  }

  public static secToMin(seconds: number): number {
    return seconds / 60;
  }

  public static quote(str: string): string {
    if (str.includes(' ')) return `"${str.replace('"', '\\"')}"`;
    return str;
  }

  public static getProjectName(uri: vscode.Uri): string {
    if (!vscode.workspace) return '';
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      try {
        return workspaceFolder.name;
      } catch (e) {}
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
      return vscode.workspace.workspaceFolders[0].name;
    }
    return vscode.workspace.name || '';
  }

  public static getProjectFolder(uri: vscode.Uri): string {
    if (!vscode.workspace) return '';
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      try {
        return workspaceFolder.uri.fsPath;
      } catch (e) {}
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
      return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return '';
  }

  public static getFocusedFile(document?: vscode.TextDocument): string | undefined {
    const doc = document ?? vscode.window.activeTextEditor?.document;
    if (doc) {
      return doc.fileName;
    }
  }

  public static getGitBranch(uri: vscode.Uri): string | undefined {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    if (!gitExtension) return;
    const api = gitExtension.getAPI(1);

    const repo = api.getRepository(uri);
    return repo?.state.HEAD?.name;
  }

  public static isAIChatSidebar(uri: vscode.Uri | undefined): boolean {
    if (!uri) return false;
    if (uri.fsPath.endsWith('.log')) return false;
    return uri.scheme === 'vscode-chat-code-block';
  }

  public static isPossibleAICodeInsert(e: vscode.TextDocumentChangeEvent): boolean {
    if (e.document.fileName.endsWith('.log')) return false;
    return e.contentChanges.length === 1 && e.contentChanges?.[0].text.trim().length > 2;
  }

  public static isPossibleHumanCodeInsert(e: vscode.TextDocumentChangeEvent): boolean {
    if (e.contentChanges.length !== 1) return false;
    if (
      e.contentChanges?.[0].text.trim().length === 1 &&
      e.contentChanges?.[0].text !== '\n' &&
      e.contentChanges?.[0].text !== '\r'
    )
      return true;
    if (e.contentChanges?.[0].text.length === 0) return true;
    return false;
  }

  public static apiKeyInvalid(key?: string): string {
    const err = 'Invalid api key...';
    if (!key) return err;
    // const re = new RegExp(
    //   '^(waka_)?[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$',
    //   'i',
    // );
    // if (!re.test(key)) return err;
    return '';
  }

  public static enoughTimePassed(lastHeartbeat: number, now: number): boolean {
    return lastHeartbeat + TIME_BETWEEN_HEARTBEATS * 1000 < now;
  }

  public static isPullRequest(uri: vscode.Uri): boolean {
    if (!uri) return false;
    return uri.scheme === 'pr';
  }

  public static formatArguments(binary: string, args: string[]): string {
    const clone = args.slice(0);
    clone.unshift(this.wrapArg(binary));
    const newCmds: string[] = [];
    let lastCmd = '';
    for (let i = 0; i < clone.length; i++) {
      if (lastCmd == '--key') newCmds.push(this.wrapArg(this.obfuscateKey(clone[i])));
      else newCmds.push(this.wrapArg(clone[i]));
      lastCmd = clone[i];
    }
    return newCmds.join(' ');
  }

  public static wrapArg(arg: string): string {
    if (arg.indexOf(' ') > -1) return `"${arg.replace(/"/g, '\\"')}"`;
    return arg;
  }

  public static obfuscateKey(key: string): string {
    let newKey = '';
    if (key) {
      newKey = key;
      if (key.length > 4)
        newKey = `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX${key.substring(key.length - 4)}`;
    }
    return newKey;
  }
}
