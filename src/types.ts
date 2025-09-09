import type { Position } from 'vscode';

export type Lines = {
  [fileName: string]: number;
};

export type LineCounts = {
  ai: Lines;
  human: Lines;
};

type FileSelection = {
  selection: Position;
  lastHeartbeatAt: number;
};

export type FileSelectionMap = {
  [key: string]: FileSelection;
};

export type Heartbeat = {
  time: number;
  entity: string;
  is_write: boolean;
  lineno: number;
  cursorpos: number;
  lines_in_file: number;
  alternate_project?: string;
  project_folder?: string;
  project_root_count?: number;
  git_branch?: string;
  language?: string;
  category?: 'debugging' | 'ai coding' | 'building' | 'code reviewing';
  ai_line_changes?: number;
  human_line_changes?: number;
  is_unsaved_entity?: boolean;
};

export type Setting = {
  key: string;
  value: string;
  error?: string;
};
