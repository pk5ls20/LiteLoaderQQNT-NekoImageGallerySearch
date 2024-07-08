// reference https://github.com/psrx/LiteLoaderQQNT-BeginnerTutorial
import { activeCallbackIds, eventEmitter } from './eventEmitter';
import { type BrowserWindow } from 'electron';

const hookIpcSend = (sendData: any) => {
  const [_, event, data] = sendData;
  if (event.callbackId && activeCallbackIds.has(event.callbackId)) {
    eventEmitter.emit(event.callbackId, data);
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
