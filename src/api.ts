import axios from 'axios';

import { Logger } from './logger';
import { Utils } from './utils';

import type { Heartbeat } from './types';

export class Api {
  private apiKey: string | null = null;
  private apiUrl: string;
  private logger: Logger;

  constructor(logger: Logger, serverUrl: string) {
    this.logger = logger;
    this.apiUrl = `${serverUrl}/api/v1`;
    this.logger.debug(`API URL: ${this.apiUrl}`);
  }

  setApiKey(apiKey: string) {
    // Validate API key before saving
    const validationMsg = Utils.apiKeyInvalid(apiKey);
    if (validationMsg) {
      this.logger.error(validationMsg);
      return;
    }

    this.apiKey = apiKey;
    this.logger.debug(`API Key: ${this.apiKey}`);
  }

  hasApiKey(): boolean {
    return !Utils.apiKeyInvalid(this.apiKey);
  }

  /** Send a batch of heartbeats */
  async sendHeartbeats(heartbeats: Heartbeat[]): Promise<void> {
    if (!heartbeats.length) return;

    await axios.post(
      `${this.apiUrl}/heartbeats`,
      { heartbeats },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
        },
      }
    );
  }

  /** Fetch coding activity summary */
  async getToday(untilNow: boolean = true): Promise<any> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    let endDate: Date;
    if (untilNow) {
      endDate = now;
    } else {
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    }
    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    const res = await axios.get(`${this.apiUrl}/summaries/range?start=${start}&end=${end}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
      },
    });
    return res.data;
  }
}
