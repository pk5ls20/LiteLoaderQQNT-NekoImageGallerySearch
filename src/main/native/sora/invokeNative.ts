// reference https://github.com/psrx/LiteLoaderQQNT-BeginnerTutorial & https://github.com/LLOneBot/LLOneBot
// also thanks https://github.com/ilharp/ipcman
import { ipcMain } from 'electron';
import { randomUUID, type UUID } from 'crypto';
import type { GeneralCallResult } from 'napcat.core';
import { activeCallbackIds as firstStageCallbackIds, cleanFCListeners, eventEmitter, SCListener } from './event';

const IPC_TIMEOUT = 10000;

type RTS1B = unknown;
type RTS2B = unknown;

const SCListeners = new SCListener<RTS1B, RTS2B>(eventEmitter);

type INPRT<RTF1, RTF2, RTS1, RTS2> = [RTS1, RTS2] extends [never, never] ? RTF1 & RTF2 : RTS1 & RTS2;

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
  AGT extends Array<unknown> = unknown[],
  RTF1 = GeneralCallResult,
  RTF2 = unknown,
  RTS1 extends RTS1B = never,
  RTS2 extends RTS2B = never
>(
  cmdName: string,
  eventName: string,
  channel: string,
  args: AGT = [] as unknown as AGT,
  timeout: number = IPC_TIMEOUT,
  secondCmdName?: string | null,
  secondCmdResCond?: ((stageTwoData: RTS1 & RTS2) => boolean) | null
): Promise<INPRT<RTF1, RTF2, RTS1, RTS2>> {
  const callbackId = randomUUID();
  let secondCmdId: UUID | null = null;
  firstStageCallbackIds.add(callbackId);

  const operationPromise = new Promise<INPRT<RTF1, RTF2, RTS1, RTS2>>(async (resolve, reject) => {
    // log.debug('invokeNative: Sent request:', { type: 'request', callbackId, eventName }, [cmdName, ...args]);
    ipcMain.emit(channel, {}, { type: 'request', callbackId, eventName }, [cmdName, ...(args as AGT)]);
    eventEmitter.once(callbackId, (result: RTF1 & RTF2) => {
      if (result && !secondCmdName && !secondCmdResCond) {
        resolve(result as INPRT<RTF1, RTF2, RTS1, RTS2>);
        cleanFCListeners(callbackId);
      }
      if (!result && !secondCmdName && !secondCmdResCond) {
        reject(new Error('invokeNative: in stage1, no result returned!'));
      }
    });
    if (secondCmdName && secondCmdResCond) {
      const { uuid, promise } = SCListeners.waitListener(
        secondCmdName,
        secondCmdResCond as (stageTwoData: RTS1B & RTS2B) => boolean
      );
      secondCmdId = uuid;
      await promise; // will never reject
      // log.debug('invokeNative: Second command resolved:', secondCmdId);
      resolve(promise as INPRT<RTF1, RTF2, RTS1, RTS2>);
    }
  });

  const timeoutPromise = new Promise<INPRT<RTF1, RTF2, RTS1, RTS2>>((_, reject) => {
    setTimeout(() => {
      if (secondCmdName && secondCmdResCond && secondCmdId) SCListeners.manuallyRemoveListener(secondCmdId);
      reject(new Error(`invokeNative: call ${cmdName} timeout after ${timeout} milliseconds`));
    }, timeout);
  });

  return await Promise.race([operationPromise, timeoutPromise]);
}
