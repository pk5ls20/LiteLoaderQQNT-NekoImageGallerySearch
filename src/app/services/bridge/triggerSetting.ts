/// <reference types="../../../global.d.ts" />
// import { ipcRenderer } from 'electron';

interface TriggerSettingService {
  init(callback: (setting: string) => Promise<void>): void;

  reset(): void;
}

export class devTriggerSettingService implements TriggerSettingService {
  init(callback: (setting: string) => Promise<void>): void {
    console.log('devTriggerSettingService init');
  }

  reset(): void {
    console.log('devTriggerSettingService reset');
  }
}

export class LLNTTriggerSettingService implements TriggerSettingService {
  init(callback: (setting: string) => Promise<void>): void {
    window.imageSearch.TriggerSetting(async (setting: string) => {
      await callback(setting);
    });
  }

  reset(): void {}
}
