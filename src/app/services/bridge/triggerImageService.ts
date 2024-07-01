/// <reference types="../../../global.d.ts" />
import { sharedAdapter } from '../../adapter/SharedAdapter';

interface TriggerImageService {
  init(
    callback: (file_content: Uint8Array | null) => Promise<void>,
    registerNum: sharedAdapter.TriggerImageRegisterNameType[keyof sharedAdapter.TriggerImageRegisterNameType]
  ): void;

  reset(): void;
}

export class devTriggerImageSearchService implements TriggerImageService {
  init(
    callback: (file_content: Uint8Array | null) => Promise<void>,
    registerNum: sharedAdapter.TriggerImageRegisterNameType[keyof sharedAdapter.TriggerImageRegisterNameType]
  ): void {
    console.log('devTriggerImageSearchService init with registerNum', callback, registerNum);
  }

  reset(): void {
    console.log('devTriggerImageSearchService reset');
  }
}

export class LLNTTriggerImageSearchService implements TriggerImageService {
  init(
    callback: (file_content: Uint8Array | null) => Promise<void>,
    registerNum: sharedAdapter.TriggerImageRegisterNameType[keyof sharedAdapter.TriggerImageRegisterNameType]
  ): void {
    window.imageSearch.postAppImageRes(async (file_content: Uint8Array | null) => {
      await callback(file_content);
    }, registerNum);
  }

  reset(): void {}
}
