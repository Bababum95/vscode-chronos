export enum Command {
  HELLO = 'chronos.hello',
  SET_API_KEY = 'chronos.setApiKey',
  TEST = 'chronos.test',
  DASHBOARD = 'chronos.dashboard',
}

export enum LogLevel {
  DEBUG = 0,
  INFO,
  WARN,
  ERROR,
}

export const DEFAULT_SERVER_URL = 'http://localhost:3000';

// All time in seconds
export const AI_RECENT_PASTES_TIME = 0.5;
export const TIME_BETWEEN_HEARTBEATS = 120;
export const SEND_BUFFER = 30;
