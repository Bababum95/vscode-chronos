import axios from 'axios';

import { Logger } from './logger';
import type { Heartbeat } from './types';
import { Utils } from './utils';

export class Api {
  private apiKey: string | null = null;
  private apiUrl: string;
  private logger: Logger;
  private prefix: string = 'api/v1';

  constructor(logger: Logger, serverUrl: string) {
    this.logger = logger;
    this.apiUrl = `${serverUrl}/${this.prefix}`;
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

  setServerUrl(serverUrl: string) {
    this.apiUrl = `${serverUrl}/${this.prefix}`;
    this.logger.debug(`API URL updated to: ${this.apiUrl}`);
  }

  hasApiKey(): boolean {
    return !Utils.apiKeyInvalid(this.apiKey);
  }

  /** Send a batch of heartbeats */
  async sendHeartbeats(heartbeats: Heartbeat[]): Promise<void> {
    if (!heartbeats.length) return;

    try {
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
    } catch (err: any) {
      // Пробрасываем ошибку дальше для обработки в вызывающем коде
      const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error';
      this.logger.error(`Failed to send heartbeats: ${errorMessage}`);
      throw err;
    }
  }

  /** Fetch coding activity summary */
  async getToday(untilNow: boolean = true): Promise<any> {
    try {
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
    } catch (err: any) {
      // Пробрасываем ошибку дальше для обработки в вызывающем коде
      const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error';
      this.logger.error(`Failed to fetch today's coding activity: ${errorMessage}`);
      throw err;
    }
  }
}
