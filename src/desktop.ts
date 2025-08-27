import * as child_process from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

import type { StdioOptions } from 'child_process';

export class Desktop {
  public static isWindows(): boolean {
    return os.platform() === 'win32';
  }

  public static isPortable(): boolean {
    return !!process.env['VSCODE_PORTABLE'];
  }

  public static getHomeDirectory(): string {
    const home = process.env.CHRONOS_HOME;
    if (home && home.trim() && fs.existsSync(home.trim())) return home.trim();
    if (this.isPortable()) return process.env['VSCODE_PORTABLE'] as string;
    return process.env[this.isWindows() ? 'USERPROFILE' : 'HOME'] || process.cwd();
  }

  public static buildOptions(stdin?: boolean): Object {
    const options: child_process.ExecFileOptions = {
      windowsHide: true,
    };
    if (stdin) {
      (options as any).stdio = ['pipe', 'pipe', 'pipe'] as StdioOptions;
    }
    if (!this.isWindows() && !process.env.CHRONOS_HOME && !process.env.HOME) {
      options['env'] = { ...process.env, CHRONOS_HOME: this.getHomeDirectory() };
    }
    return options;
  }
}
