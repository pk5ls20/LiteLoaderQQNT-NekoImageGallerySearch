// reference https://github.com/psrx/LiteLoaderQQNT-BeginnerTutorial
import { EventEmitter } from 'events';
import type { UUID } from 'crypto';
import { randomUUID } from 'crypto';

// stage1
export const activeCallbackIds = new Set();
export const eventEmitter = new EventEmitter();

export const cleanFCListeners = (callbackId: UUID) => {
  activeCallbackIds.delete(callbackId);
  eventEmitter.removeAllListeners(callbackId);
};

// stage2 extend stage1
export class SCListener<CB1, CB2> {
  private checkMap: Map<UUID, (stageTwoData: CB1 & CB2) => boolean>;
  private promiseResolvers: Map<UUID, () => void>;

  constructor(private eventEmitter: EventEmitter) {
    this.checkMap = new Map();
    this.promiseResolvers = new Map();
  }

  // TODO: auto clean listener
  waitListener(eventName: string, cond: (stageTwoData: CB1 & CB2) => boolean): { uuid: UUID; promise: Promise<void> } {
    const uuid = randomUUID();
    this.checkMap.set(uuid, cond as (stageTwoData: CB1 & CB2) => boolean);
    if (!this.eventEmitter.listenerCount(eventName)) {
      this.setupListener(eventName);
    }
    return {
      uuid,
      promise: new Promise<void>((resolve) => {
        this.promiseResolvers.set(uuid, resolve);
      })
    };
  }

  manuallyRemoveListener(uuid: UUID) {
    this.checkMap.delete(uuid);
    this.promiseResolvers.delete(uuid);
  }

  private setupListener(eventName: string) {
    this.eventEmitter.on(eventName, (result: CB1 & CB2) => {
      // log.debug('SCListeners: Received event:', eventName, result);
      for (const [uuid, cond] of this.checkMap.entries()) {
        if (cond(result)) {
          // log.debug('SCListeners: Condition met:', uuid, result);
          this.checkMap.delete(uuid);
          const resolve = this.promiseResolvers.get(uuid);
          if (resolve) {
            resolve();
            this.promiseResolvers.delete(uuid);
          }
        }
      }
    });
  }
}
