/// <reference types="../../../global.d.ts" />
// import { ipcRenderer } from 'electron';
import { sharedAdapter } from '../../adapter/SharedAdapter';

interface TriggerSettingService {
  init(callback: (setting: string | null) => Promise<void>): void;

  reset(): void;
}

export class devTriggerSettingService implements TriggerSettingService {
  init(callback: (setting: string | null) => Promise<void>): void {
    sharedAdapter.Log.debug('devTriggerSettingService init with callback', callback);
  }

  reset(): void {
    sharedAdapter.Log.debug('devTriggerSettingService reset');
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
