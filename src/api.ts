import axios from 'axios';

import type { Heartbeat } from './types';

export class Api {
  private apiKey: string | null = null;
  private apiUrl: string;

  constructor(serverUrl: string) {
    this.apiUrl = `${serverUrl}/api/v1`;
    console.log(this.apiUrl);
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    console.log(this.apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
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
  async getToday(): Promise<any> {
    const today = new Date().toISOString().slice(0, 10);
    const res = await axios.get(`${this.apiUrl}/summaries?start=${today}&end=${today}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
      },
    });
    return res.data;
  }
}
