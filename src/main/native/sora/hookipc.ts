// reference https://github.com/psrx/LiteLoaderQQNT-BeginnerTutorial
import { activeCallbackIds, eventEmitter } from './event';
import { type BrowserWindow } from 'electron';

const hookIpcSend = (sendData: any) => {
  const [_, event, data] = sendData;
  if (data) {
    // console.log('hookIpcSend-0', data);
  }
  if (event.callbackId && activeCallbackIds.has(event.callbackId)) {
    // console.log('hookIpcSend-1', event.callbackId);
    eventEmitter.emit(event.callbackId, data);
  } else if (Array.isArray(data) && data[0]?.cmdName) {
    // console.log('hookIpcSend-2', data[0]?.cmdName);
    eventEmitter.emit(data[0]?.cmdName, data);
  }
  return sendData;
};

export const hookIpc = (window: BrowserWindow) => {
  window.webContents.send = new Proxy(window.webContents.send, {
    apply(target, thisArg, args) {
      const ret = hookIpcSend(args);
      if (!ret) return;
      return Reflect.apply(target, thisArg, ret);
    }
  });
};
