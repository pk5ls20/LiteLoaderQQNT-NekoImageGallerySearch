// reference https://github.com/psrx/LiteLoaderQQNT-BeginnerTutorial & https://github.com/LLOneBot/LLOneBot
// also thanks https://github.com/ilharp/ipcman
import { ipcMain } from 'electron';
import type { GeneralCallResult, RawMessage } from 'napcat.core';
import { randomUUID } from 'crypto';
import { activeCallbackIds, eventEmitter } from './eventEmitter';

const IPC_TIMEOUT = 10000;

type NTQQRawMsgList = GeneralCallResult & { msgList: RawMessage[] };

export const invokeNative = (
  eventName: string,
  cmdName: string,
  channel: string = 'IPC_UP_2',
  ...args: any[]
): Promise<NTQQRawMsgList> => {
  const callbackId = randomUUID();
  activeCallbackIds.add(callbackId);

  const operationPromise = new Promise<NTQQRawMsgList>((resolve, reject) => {
    ipcMain.emit(channel, {}, { type: 'request', callbackId, eventName }, [cmdName, ...args]);
    eventEmitter.once(callbackId, (result: NTQQRawMsgList) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('No result returned'));
      }
      activeCallbackIds.delete(callbackId);
    });
  });

  const timeoutPromise = new Promise<NTQQRawMsgList>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout after ' + IPC_TIMEOUT + ' milliseconds'));
      activeCallbackIds.delete(callbackId);
      eventEmitter.removeAllListeners(callbackId);
    }, IPC_TIMEOUT);
  });

  return Promise.race([operationPromise, timeoutPromise]);
};
