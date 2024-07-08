// reference https://github.com/psrx/LiteLoaderQQNT-BeginnerTutorial & https://github.com/LLOneBot/LLOneBot
// also thanks https://github.com/ilharp/ipcman
import { ipcMain } from 'electron';
import { randomUUID, type UUID } from 'crypto';
import type { GeneralCallResult } from 'napcat.core';
import { type EventEmitter } from 'events';
import { activeCallbackIds as firstStageCallbackIds, eventEmitter } from './eventEmitter';
import { log } from '../../common/share/logs';

const IPC_TIMEOUT = 10000;

type RTS1B = unknown;
type RTS2B = unknown;

const cleanFCListeners = (callbackId: UUID) => {
  firstStageCallbackIds.delete(callbackId);
  eventEmitter.removeAllListeners(callbackId);
};

class SCListener<CB1, CB2> {
  private checkMap: Map<UUID, (stageTwoData: CB1 & CB2) => boolean>;
  private promiseResolvers: Map<UUID, () => void>;

  constructor(private eventEmitter: EventEmitter) {
    this.checkMap = new Map();
    this.promiseResolvers = new Map();
  }

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
    this.eventEmitter.on(eventName, (result: any) => {
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

const SCListeners = new SCListener<RTS1B, RTS2B>(eventEmitter);

/**
 * Invokes a native NTQQ API call.
 *
 * @template AGT - The type of the arguments array.
 * @template RTF1 - The type for NTQQ ipc call stage1 return type part A
 * @template RTF2 - The type for NTQQ ipc call stage1 return type part B
 * @template RTS1 - The type for NTQQ ipc call stage2 return type part A
 * @template RTS2 - The type for NTQQ ipc call stage2 return type part B
 */
export async function invokeNative<
  AGT extends Array<any> = unknown[],
  RTF1 = GeneralCallResult,
  RTF2 = any,
  RTS1 = never extends RTS1B ? never : RTS1B,
  RTS2 = never extends RTS2B ? never : RTS2B
>(
  eventName: string = 'ns-ntApi-2',
  cmdName: string,
  channel: string = 'IPC_UP_2',
  args: AGT = [] as unknown as AGT,
  timeout: number = IPC_TIMEOUT,
  secondCmdName?: string | null,
  secondCmdResCond?: ((stageTwoData: RTS1 & RTS2) => boolean) | null
): Promise<(RTF1 & RTF2) | (RTS1 & RTS2)> {
  const callbackId = randomUUID();
  let secondCmdId: UUID | null = null;
  firstStageCallbackIds.add(callbackId);

  const operationPromise = new Promise<(RTF1 & RTF2) | (RTS1 & RTS2)>(async (resolve, reject) => {
    // log.debug('invokeNative: Sent request:', { type: 'request', callbackId, eventName }, [cmdName, ...args]);
    ipcMain.emit(channel, {}, { type: 'request', callbackId, eventName }, [cmdName, ...(args as AGT)]);
    eventEmitter.once(callbackId, (result: RTF1 & RTF2) => {
      if (result && !secondCmdName && !secondCmdResCond) {
        resolve(result as RTF1 & RTF2);
        cleanFCListeners(callbackId);
      }
      if (!result && !secondCmdName && !secondCmdResCond) {
        reject(new Error('No result returned'));
      }
    });
    if (secondCmdName && secondCmdResCond) {
      const { uuid, promise } = SCListeners.waitListener(
        secondCmdName,
        secondCmdResCond as (stageTwoData: RTS1B & RTS2B) => boolean
      );
      secondCmdId = uuid;
      await promise;
      // log.debug('invokeNative: Second command resolved:', secondCmdId);
      resolve(promise as RTS1 & RTS2);
    }
  });

  const timeoutPromise = new Promise<(RTF1 & RTF2) | (RTS1 & RTS2)>((_, reject) => {
    setTimeout(() => {
      if (secondCmdName && secondCmdResCond && secondCmdId) SCListeners.manuallyRemoveListener(secondCmdId);
      reject(new Error(`Timeout after ${timeout} milliseconds`));
    }, timeout);
  });

  return await Promise.race([operationPromise, timeoutPromise]);
}
