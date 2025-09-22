import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

import { Api } from './api';
import { AI_RECENT_PASTES_TIME, Command, SEND_BUFFER } from './constants';
import { Desktop } from './desktop';
import { Logger } from './logger';
import { Options } from './options';
import { Utils } from './utils';

import type { FileSelectionMap, Heartbeat, LineCounts, Lines, Setting } from './types';

export class Chronos {
  private extension: any;
  private disposable: vscode.Disposable;
  private statusBar?: vscode.StatusBarItem = undefined;

  private logger: Logger;
  private options: Options;
  private api: Api;
  private extensionPath: string;
  private resourcesLocation: string;
  private debounce = 0.05;
  private fetchTodayInterval: number = 60;
  private lastFetchToday: number = 0;
  private lastHeartbeat: number = 0;
  private lastSent: number = 0;
  private lastFile: string;
  private linesInFiles: Lines = {};
  private lineChanges: LineCounts = { ai: {}, human: {} };
  private dedupe: FileSelectionMap = {};
  private heartbeats: Heartbeat[] = [];
  private debounceId: any = null;
  private AIDebounceId: any = null;
  private AIdebounce = 1;
  private AIdebounceCount = 0;
  private AIrecentPastes: number[] = [];

  private isAICodeGenerating: boolean = false;
  private hasAICapabilities: boolean = false;
  private lastAICodeGenerating: boolean = false;
  private disabled: boolean = false;
  private lastDebug: boolean = false;
  private lastCompile: boolean = false;
  private isDebugging: boolean = false;
  private isCompiling: boolean = false;
  private showStatusBar: boolean = true;
  private showCodingActivity: boolean = true;

  constructor(extensionPath: string, logger: Logger) {
    this.extensionPath = extensionPath;
    this.logger = logger;
    this.setResourcesLocation();
    this.options = new Options(logger, this.resourcesLocation);
  }

  public async initialize() {
    const extension = vscode.extensions.getExtension('Chronos.vscode-chronos');
    this.extension = (extension !== undefined && extension.packageJSON) || { version: '0.0.0' };
    this.logger.debug(`Initializing Chronos v${this.extension.version}`);

    this.api = new Api(this.logger, await this.options.getServerUrl());
    const apiKey = await this.options.getApiKey();
    if (apiKey) this.api.setApiKey(apiKey);

    this.statusBar = vscode.window.createStatusBarItem(
      'com.chronos.statusbar',
      vscode.StatusBarAlignment.Left,
      3
    );
    this.statusBar.name = 'Chronos';
    this.statusBar.command = Command.DASHBOARD;

    this.options.getSetting(
      'settings',
      'status_bar_enabled',
      false,
      (statusBarEnabled: Setting) => {
        this.showStatusBar = statusBarEnabled.value !== 'false';
        this.setStatusBarVisibility(this.showStatusBar);
        this.updateStatusBarText('Chronos Initializing...');

        this.options.getSetting(
          'settings',
          'status_bar_coding_activity',
          false,
          (showCodingActivity: Setting) => {
            this.showCodingActivity = showCodingActivity.value !== 'false';
            this.getCodingActivity();
          }
        );
      }
    );

    this.setEventListeners();
  }

  public dispose() {
    this.disposable?.dispose();
  }

  private setResourcesLocation() {
    const home = Desktop.getHomeDirectory();
    const folder = path.join(home, '.chronos');

    try {
      fs.mkdirSync(folder, { recursive: true });
      this.resourcesLocation = folder;
    } catch (e) {
      this.resourcesLocation = this.extensionPath;
    }
  }

  private onEvent(isWrite: boolean): void {
    if (Date.now() - this.lastSent > Utils.secToMs(SEND_BUFFER)) {
      this.sendHeartbeats();
    }

    clearTimeout(this.debounceId);
    this.debounceId = setTimeout(() => {
      if (this.disabled) return;
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const doc = editor.document;
        if (doc) {
          const file = Utils.getFocusedFile(doc);
          if (!file) {
            return;
          }

          const time: number = Date.now();
          if (
            isWrite ||
            Utils.enoughTimePassed(this.lastHeartbeat, time) ||
            this.lastFile !== file ||
            this.lastDebug !== this.isDebugging ||
            this.lastCompile !== this.isCompiling ||
            this.lastAICodeGenerating !== this.isAICodeGenerating
          ) {
            this.appendHeartbeat(
              doc,
              time,
              editor.selection.start,
              isWrite,
              this.isCompiling,
              this.isDebugging,
              this.isAICodeGenerating
            );
            this.lastFile = file;
            this.lastHeartbeat = time;
            this.lastDebug = this.isDebugging;
            this.lastCompile = this.isCompiling;
            this.lastAICodeGenerating = this.isAICodeGenerating;
          }
        }
      }
    }, Utils.secToMs(this.debounce));
  }

  private async appendHeartbeat(
    doc: vscode.TextDocument,
    time: number,
    selection: vscode.Position,
    isWrite: boolean,
    isCompiling: boolean,
    isDebugging: boolean,
    isAICoding: boolean
  ): Promise<void> {
    const file = Utils.getFocusedFile(doc);
    if (!file) return;

    if (isWrite && this.isDuplicateHeartbeat(file, time, selection)) return;

    const now = Date.now();

    const heartbeat: Heartbeat = {
      entity: file,
      time: now / 1000,
      is_write: isWrite,
      lineno: selection.line + 1,
      cursorpos: selection.character + 1,
      lines_in_file: doc.lineCount,
      ai_line_changes: this.lineChanges.ai[file],
      human_line_changes: this.lineChanges.human[file],
    };

    this.lineChanges = { ai: {}, human: {} };

    if (isDebugging) {
      heartbeat.category = 'debugging';
    } else if (isCompiling) {
      heartbeat.category = 'building';
    } else if (isAICoding) {
      heartbeat.category = 'ai coding';
    } else if (Utils.isPullRequest(doc.uri)) {
      heartbeat.category = 'code reviewing';
    }

    const project = Utils.getProjectName(doc.uri);
    if (project) heartbeat.alternate_project = project;

    const folder = Utils.getProjectFolder(doc.uri);
    if (folder) heartbeat.project_folder = folder;

    const branch = Utils.getGitBranch(doc.uri);
    if (branch) heartbeat.git_branch = branch;

    if (doc.isUntitled) heartbeat.is_unsaved_entity = true;

    this.logger.debug(`Appending heartbeat to local buffer: ${JSON.stringify(heartbeat, null, 2)}`);
    this.heartbeats.push(heartbeat);

    if (now - this.lastSent > Utils.secToMs(SEND_BUFFER)) {
      await this.sendHeartbeats();
    }
  }

  private updateLineNumbers(): void {
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc) return;
    const file = Utils.getFocusedFile(doc);
    if (!file) return;

    const current = doc.lineCount;
    if (this.linesInFiles[file] === undefined) {
      this.linesInFiles[file] = current;
    }

    const prev = this.linesInFiles[file] ?? current;
    const delta = current - prev;

    const changes = this.isAICodeGenerating ? this.lineChanges.ai : this.lineChanges.human;
    changes[file] = (changes[file] ?? 0) + delta;

    this.linesInFiles[file] = current;
  }

  private setEventListeners(): void {
    const subscriptions: vscode.Disposable[] = [];

    vscode.workspace.onDidChangeTextDocument(this.onChangeTextDocument, this, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.onSave, this, subscriptions);
    // vscode.workspace.onDidChangeNotebookDocument(this.onChangeNotebook, this, subscriptions);
    // vscode.workspace.onDidSaveNotebookDocument(this.onSaveNotebook, this, subscriptions);

    // vscode.window.onDidChangeTextEditorSelection(this.onChangeSelection, this, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this.onChangeTab, this, subscriptions);

    // vscode.tasks.onDidStartTask(this.onDidStartTask, this, subscriptions);
    // vscode.tasks.onDidEndTask(this.onDidEndTask, this, subscriptions);

    // vscode.debug.onDidChangeActiveDebugSession(this.onDebuggingChanged, this, subscriptions);
    // vscode.debug.onDidChangeBreakpoints(this.onDebuggingChanged, this, subscriptions);
    // vscode.debug.onDidStartDebugSession(this.onDidStartDebugSession, this, subscriptions);
    //vscode.debug.onDidTerminateDebugSession(this.onDidTerminateDebugSession, this, subscriptions);

    this.disposable = vscode.Disposable.from(...subscriptions);
  }

  private onChangeTextDocument(e: vscode.TextDocumentChangeEvent): void {
    if (Utils.isAIChatSidebar(e.document?.uri)) {
      this.isAICodeGenerating = true;
      this.AIdebounceCount = 0;
    } else if (Utils.isPossibleAICodeInsert(e)) {
      const now = Date.now();
      if (this.recentlyAIPasted(now) && this.hasAICapabilities) {
        this.isAICodeGenerating = true;
        this.AIdebounceCount = 0;
      }
      this.AIrecentPastes.push(now);
    } else if (Utils.isPossibleHumanCodeInsert(e)) {
      this.AIrecentPastes = [];
      if (this.isAICodeGenerating) {
        this.AIdebounceCount++;
        clearTimeout(this.AIDebounceId);
        this.AIDebounceId = setTimeout(() => {
          if (this.AIdebounceCount > 1) {
            this.isAICodeGenerating = false;
          }
        }, Utils.secToMs(this.AIdebounce));
      }
    } else if (this.isAICodeGenerating) {
      this.AIdebounceCount = 0;
      clearTimeout(this.AIDebounceId);
      this.updateLineNumbers();
    }

    if (!this.isAICodeGenerating) return;

    this.onEvent(false);
  }

  private onSave(): void {
    this.updateLineNumbers();
    this.onEvent(true);
  }

  private onChangeTab(): void {
    this.updateLineNumbers();
    this.onEvent(false);
  }

  private recentlyAIPasted(time: number): boolean {
    this.AIrecentPastes = this.AIrecentPastes.filter(
      (x) => x + Utils.secToMs(AI_RECENT_PASTES_TIME) >= time
    );
    return this.AIrecentPastes.length > 3;
  }

  private async sendHeartbeats(): Promise<void> {
    if (this.api.hasApiKey()) {
      await this._sendHeartbeats();
    } else {
      await this.promptForApiKey();
    }
  }

  private async _sendHeartbeats(): Promise<void> {
    const heartbeat = this.heartbeats.shift();
    if (!heartbeat) return;

    this.lastSent = Date.now();

    const extraHeartbeats = this.getExtraHeartbeats();
    const payload = [heartbeat, ...extraHeartbeats];

    try {
      await this.api.sendHeartbeats(payload);

      this.logger.debug(
        `Sent ${payload.length} heartbeat(s) to API: ${JSON.stringify(payload, null, 2)}`
      );

      if (this.showStatusBar) {
        await this.getCodingActivity();
      }
    } catch (err: any) {
      this.logger.error(`Error sending heartbeats: ${err?.message || err}`);

      // if error, put back in queue for retry
      this.heartbeats.unshift(...payload);
    }
  }

  private getExtraHeartbeats() {
    const heartbeats: Heartbeat[] = [];
    while (true) {
      const h = this.heartbeats.shift();
      if (!h) return heartbeats;
      heartbeats.push(h);
    }
  }

  public async promptForApiKey(hidden: boolean = true): Promise<void> {
    let defaultVal = await this.options.getApiKey();
    if (Utils.apiKeyInvalid(defaultVal)) defaultVal = '';
    const promptOptions = {
      prompt: 'Api Key',
      placeHolder: 'Enter your api key',
      value: defaultVal!,
      ignoreFocusOut: true,
      password: hidden,
      validateInput: Utils.apiKeyInvalid.bind(this),
    };
    vscode.window.showInputBox(promptOptions).then((val) => {
      if (val !== undefined) {
        const invalid = Utils.apiKeyInvalid(val);
        if (!invalid) {
          this.options.setSetting('settings', 'api_key', val, false);
          this.api.setApiKey(val);
        } else vscode.window.setStatusBarMessage(invalid);
      } else vscode.window.setStatusBarMessage('api key not provided');
    });
  }

  private isDuplicateHeartbeat(file: string, time: number, selection: vscode.Position): boolean {
    let duplicate = false;
    const minutes = 30;
    const milliseconds = minutes * 60000;
    if (
      this.dedupe[file] &&
      this.dedupe[file].lastHeartbeatAt + milliseconds < time &&
      this.dedupe[file].selection.line === selection.line &&
      this.dedupe[file].selection.character === selection.character
    ) {
      duplicate = true;
    }
    this.dedupe[file] = {
      selection,
      lastHeartbeatAt: time,
    };
    return duplicate;
  }

  private async getCodingActivity() {
    if (!this.showStatusBar) return;

    const cutoff = Date.now() - Utils.secToMs(this.fetchTodayInterval);
    if (this.lastFetchToday > cutoff) return;

    this.lastFetchToday = Date.now();

    if (!this.api.hasApiKey()) return;

    try {
      const summary = await this.api.getToday();

      this.logger.debug(`Today coding activity: ${JSON.stringify(summary, null, 2)}`);

      if (summary) {
        if (summary?.data?.totalTimeStr) {
          if (this.showCodingActivity) {
            this.updateStatusBarText(summary.data.totalTimeStr);
            this.updateStatusBarTooltip('Chronos: Today’s coding time. Click to visit dashboard.');
          } else {
            this.updateStatusBarText();
            this.updateStatusBarTooltip(summary.data.totalTimeStr);
          }
        } else {
          this.updateStatusBarText();
          this.updateStatusBarTooltip('Chronos: Calculating time spent today in background...');
        }
      }
    } catch (err: any) {
      this.logger.error(`Error fetching today coding activity from API: ${err?.message || err}`);
      this.updateStatusBarText();
      this.updateStatusBarTooltip('Chronos: Error fetching today’s coding time.');
    }
  }

  private updateStatusBarText(text?: string): void {
    if (!this.statusBar) return;

    if (!text) {
      this.statusBar.text = '$(clock)';
    } else {
      this.statusBar.text = `$(clock) ${text}`;
    }
  }

  private updateStatusBarTooltip(tooltipText: string): void {
    if (!this.statusBar) return;
    this.statusBar.tooltip = tooltipText;
  }

  private setStatusBarVisibility(isVisible: boolean): void {
    if (isVisible) {
      this.statusBar?.show();
      this.logger.debug('Status bar icon enabled.');
    } else {
      this.statusBar?.hide();
      this.logger.debug('Status bar icon disabled.');
    }
  }

  public async test() {}
}
