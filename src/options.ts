import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

import { DEFAULT_SERVER_URL } from './constants';
import { Desktop } from './desktop';
import { Logger } from './logger';
import { Utils } from './utils';

export class Options {
  private configFile: string;
  private internalConfigFile: string;
  private logFile: string;
  private logger: Logger;
  private cache: any = {};

  constructor(logger: Logger, resourcesFolder: string) {
    this.logger = logger;
    this.configFile = path.join(Desktop.getHomeDirectory(), '.chronos.cfg');
    this.internalConfigFile = path.join(resourcesFolder, 'chronos-internal.cfg');
    this.logFile = path.join(resourcesFolder, 'chronos.log');
  }

  public async getSettingAsync<T = any>(section: string, key: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.getSetting(section, key, false, (setting) => {
        setting.error ? reject(setting.error) : resolve(setting.value);
      });
    });
  }

  public getSetting(
    section: string,
    key: string,
    internal: boolean,
    callback: (Setting) => void
  ): void {
    fs.readFile(
      this.getConfigFile(internal),
      'utf-8',
      (err: NodeJS.ErrnoException | null, content: string) => {
        if (err) {
          callback({
            key,
            error: new Error(`could not read ${this.getConfigFile(internal)}`),
            value: null,
          });
        } else {
          let currentSection = '';
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (this.startsWith(line.trim(), '[') && this.endsWith(line.trim(), ']')) {
              currentSection = line
                .trim()
                .substring(1, line.trim().length - 1)
                .toLowerCase();
            } else if (currentSection === section) {
              const parts = line.split('=');
              const currentKey = parts[0].trim();
              if (currentKey === key && parts.length > 1) {
                callback({ key, value: this.removeNulls(parts[1].trim()) });
                return;
              }
            }
          }

          callback({ key, value: null });
        }
      }
    );
  }

  public async getApiKey(): Promise<string> {
    if (!Utils.apiKeyInvalid(this.cache.api_key)) {
      return this.cache.api_key;
    }

    let from = '';

    const keyFromSettings = this.getApiKeyFromEditor();
    if (!Utils.apiKeyInvalid(keyFromSettings)) {
      this.cache.api_key = keyFromSettings;
      from = 'settings.json editor';
    }

    const keyFromEnv = this.getApiKeyFromEnv();
    if (!Utils.apiKeyInvalid(keyFromEnv)) {
      if (this.cache.api_key && this.cache.api_key !== keyFromEnv) {
        vscode.window.showErrorMessage(
          `Chronos API Key conflict. Your env key doesn't match your ${from} key.`
        );
        return this.cache.api_key;
      }
      this.cache.api_key = keyFromEnv;
      from = 'env var';
    }

    try {
      const apiKeyFromVault = await this.getApiKeyFromVaultCmd();
      if (!Utils.apiKeyInvalid(apiKeyFromVault)) {
        if (this.cache.api_key && this.cache.api_key !== apiKeyFromVault) {
          vscode.window.showErrorMessage(
            `Chronos API Key conflict. Your vault command key doesn't match your ${from} key.`
          );
          return this.cache.api_key;
        }
        this.cache.api_key = apiKeyFromVault;
        from = 'vault command';
      }
    } catch (err) {
      this.logger.debug(`Exception while reading API Key from vault command: ${err}`);
    }

    try {
      const apiKey = await this.getSettingAsync<string>('settings', 'api_key');
      if (!Utils.apiKeyInvalid(apiKey)) {
        if (this.cache.api_key && this.cache.api_key !== apiKey) {
          vscode.window.showErrorMessage(
            `Chronos API Key conflict. Your ~/.chronos.cfg key doesn't match your ${from} key.`
          );
        }
        this.cache.api_key = apiKey;
      }
    } catch (err) {
      this.logger.debug(`Exception while reading API Key from config file: ${err}`);
      if (!this.cache.api_key && `${err}`.includes('spawn EPERM')) {
        vscode.window.showErrorMessage(
          'Microsoft Defender is blocking Chronos. Please allow Chronos to run so it can upload code stats to your dashboard.'
        );
      }
    }

    return this.cache.api_key ?? '';
  }

  public async getApiKeyFromVaultCmd(): Promise<string> {
    try {
      const cmdStr = await this.getSettingAsync<string>('settings', 'api_key_vault_cmd');
      if (!cmdStr?.trim()) return '';

      const cmdParts = cmdStr.trim().split(' ');
      if (cmdParts.length === 0) return '';

      const [cmdName, ...cmdArgs] = cmdParts;

      const options = Desktop.buildOptions();
      const proc = child_process.spawn(cmdName, cmdArgs, options);

      let stdout = '';
      for await (const chunk of proc.stdout) {
        stdout += chunk;
      }
      let stderr = '';
      for await (const chunk of proc.stderr) {
        stderr += chunk;
      }
      const exitCode = await new Promise((resolve) => {
        proc.on('close', resolve);
      });

      if (exitCode) this.logger.warn(`api key vault command error (${exitCode}): ${stderr}`);
      else if (stderr && stderr.trim()) this.logger.warn(stderr.trim());

      const apiKey = stdout.toString().trim();
      return apiKey;
    } catch (err) {
      this.logger.debug(`Exception while reading API Key Vault Cmd from config file: ${err}`);
      return '';
    }
  }

  public getApiKeyFromEnv(): string {
    if (this.cache.api_key_from_env !== undefined) return this.cache.api_key_from_env;

    this.cache.api_key_from_env = process.env.CHRONOS_API_KEY || '';

    return this.cache.api_key_from_env;
  }

  public getApiKeyFromEditor(): string {
    return vscode.workspace.getConfiguration().get('chronos.apiKey') || '';
  }

  public async getServerUrl(): Promise<string> {
    let serverUrl = this.getServerUrlFromEditor();

    if (!serverUrl) {
      serverUrl = this.getServerUrlFromEnv();
    }

    if (!serverUrl) {
      try {
        serverUrl = await this.getSettingAsync<string>('settings', 'server_url');
      } catch (err) {
        this.logger.debug(`Exception while reading Server Url from config file: ${err}`);
      }
    }

    if (!serverUrl) serverUrl = DEFAULT_SERVER_URL;

    return serverUrl;
  }

  private getServerUrlFromEnv(): string {
    if (this.cache.server_url_from_env !== undefined) return this.cache.server_url_from_env;

    this.cache.server_url_from_env = process.env.CHRONOS_SERVER_URL || '';

    return this.cache.server_url_from_env;
  }

  private getServerUrlFromEditor(): string {
    return vscode.workspace.getConfiguration().get('chronos.serverUrl') || '';
  }

  public setSetting(section: string, key: string, val: string, internal: boolean): void {
    const configFile = this.getConfigFile(internal);
    fs.readFile(configFile, 'utf-8', (err: NodeJS.ErrnoException | null, content: string) => {
      if (err) content = '';

      const contents: string[] = [];
      let currentSection = '';

      let found = false;
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (this.startsWith(line.trim(), '[') && this.endsWith(line.trim(), ']')) {
          if (currentSection === section && !found) {
            contents.push(this.removeNulls(`${key} = ${val}`));
            found = true;
          }
          currentSection = line
            .trim()
            .substring(1, line.trim().length - 1)
            .toLowerCase();
          contents.push(this.removeNulls(line));
        } else if (currentSection === section) {
          const parts = line.split('=');
          const currentKey = parts[0].trim();
          if (currentKey === key) {
            if (!found) {
              contents.push(this.removeNulls(`${key} = ${val}`));
              found = true;
            }
          } else {
            contents.push(this.removeNulls(line));
          }
        } else {
          contents.push(this.removeNulls(line));
        }
      }

      if (!found) {
        if (currentSection !== section) {
          contents.push(`[${section}]`);
        }
        contents.push(this.removeNulls(`${key} = ${val}`));
      }

      fs.writeFile(configFile as string, contents.join('\n'), (err) => {
        if (err) throw err;
      });
    });
  }

  public getConfigFile(internal: boolean): string {
    return internal ? this.internalConfigFile : this.configFile;
  }

  public getLogFile(): string {
    return this.logFile;
  }

  private startsWith(outer: string, inner: string): boolean {
    return outer.slice(0, inner.length) === inner;
  }

  private endsWith(outer: string, inner: string): boolean {
    return inner === '' || outer.slice(-inner.length) === inner;
  }

  private removeNulls(s: string): string {
    return s.replace(/\0/g, '');
  }
}
