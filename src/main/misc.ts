import { ipcMain, shell } from 'electron';
import * as channel from '../common/channels';

ipcMain.on(channel.OPEN_WEB, (_, url: string) => shell.openExternal(url).then());
