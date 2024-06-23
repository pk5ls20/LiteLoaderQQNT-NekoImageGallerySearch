/// <reference types="../../../global.d.ts" />
// import { ipcRenderer } from 'electron';

interface TriggerSettingService {
  init(callback: (setting: string | null) => Promise<void>): void;

  reset(): void;
}

export class devTriggerSettingService implements TriggerSettingService {
  init(callback: (setting: string | null) => Promise<void>): void {
    console.log('devTriggerSettingService init with callback', callback);
  }

  reset(): void {
    console.log('devTriggerSettingService reset');
  }
}

export class LLNTTriggerSettingService implements TriggerSettingService {
  init(callback: (setting: string | null) => Promise<void>): void {
    window.imageSearch.triggerSettingRes(async (setting: string | null) => {
      await callback(setting);
    });
  }

  reset(): void {}
}
