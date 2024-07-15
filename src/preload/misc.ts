import { ipcRenderer } from 'electron';
import * as channel from '../common/channels';

export const openWeb = (url: string): void => {
  ipcRenderer.send(channel.OPEN_WEB, url);
};
