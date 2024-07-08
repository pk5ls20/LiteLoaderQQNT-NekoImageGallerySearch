/// <reference path="../global.d.ts" />
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import * as channel from '../common/channels';
import { FileObject } from '../common/fileObject';
import { fileTypeFromBuffer, type MimeType } from 'file-type';
import { log } from '../common/share/logs';
import { pluginSettingsModel } from '../common/share/PluginSettingsModel';
import { TriggerImageRegisterName } from '../common/share/triggerImageRegisterName';
import { hookIpc } from './invokeNTQQ/hookipc';
import { invokeNative } from './invokeNTQQ/invokeNative';
import { forwardMsgData } from '../renderer/NTQQMsgModel';

export const onBrowserWindowCreated = (window: BrowserWindow) => {
  hookIpc(window);
};

const pluginDataPath = LiteLoader.plugins['image_search'].path.data;
const settingsPath = path.join(pluginDataPath, 'settings.json');

if (!fs.existsSync(pluginDataPath)) {
  log.debug('Plugin data path not found, creating new plugin data path');
  fs.mkdirSync(pluginDataPath, { recursive: true });
}
if (!fs.existsSync(settingsPath)) {
  log.debug('Settings file not found, creating new settings file');
  const setting = new pluginSettingsModel('', '', '');
  fs.writeFileSync(settingsPath, JSON.stringify(setting));
}

// ipcMain handle
ipcMain.handle(channel.GET_SETTING, (_): pluginSettingsModel | null => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log.error('Error occurred in ipcMain.handle channel.GET_SETTING', error);
    return null;
  }
});

ipcMain.handle(channel.SET_SETTING, (_, content: pluginSettingsModel): pluginSettingsModel | {} => {
  try {
    const new_config = JSON.stringify(content);
    fs.writeFileSync(settingsPath, new_config, 'utf-8');
    return content;
  } catch (error) {
    log.debug('Error occurred in ipcMain.handle channel.SET_SETTING', content, error);
    return {};
  }
});

ipcMain.handle(channel.GET_LOCAL_FILE, (_, file_path: string): Buffer | null => {
  try {
    return fs.readFileSync(file_path);
  } catch (error) {
    log.error('Error occurred in ipcMain.handle channel.GET_LOCAL_FILE', error);
    return null;
  }
});

ipcMain.on(
  channel.POST_APP_IMAGE_SEARCH_REQ,
  async (event, file_buffer: Uint8Array | null, registerNum: TriggerImageRegisterName): Promise<void> => {
    // In the current situation, both the channel sending the signal and the channel receiving the signal
    // are within the same window (i.e., the main NTQQ chat window), so the signal can be sent directly
    // calculate mine type
    if (!file_buffer) {
      log.debug('No file buffer received');
      return;
    }
    const type = await fileTypeFromBuffer(file_buffer);
    event.sender.send(channel.POST_APP_IMAGE_SEARCH_RES, file_buffer, type?.mime ?? 'image/png', registerNum);
  }
);

ipcMain.on(channel.TRIGGER_SETTING_REQ, (_, setting: pluginSettingsModel | null): void => {
  let settingStr: string | null = null;
  if (setting) {
    log.debug('Received updated settings');
    settingStr = JSON.stringify(setting);
  }
  // Since we have multiple windows (i.e. NTQQ setting window & NTQQ chat window),
  // we need to send the updated settings to all windows
  BrowserWindow.getAllWindows().forEach((win, index) => {
    log.debug('Sending updated settings to window:', index);
    win.webContents.send(channel.TRIGGER_SETTING_RES, settingStr);
  });
});

// TODO: add callback for vue app show warning for failure
const readDirectory = async (paths: string[], allow_mine: MimeType[]): Promise<FileObject[]> => {
  log.debug(allow_mine);
  const filePromises: Promise<FileObject[]>[] = [];
  for (const singlePath of paths) {
    const stats = await fs.promises.stat(singlePath);
    if (stats.isDirectory()) {
      const entries = await fs.promises.readdir(singlePath, { withFileTypes: true });
      const dirPaths = entries.map((entry: fs.Dirent) => path.join(singlePath, entry.name));
      filePromises.push(readDirectory(dirPaths, allow_mine));
    } else {
      const content = await fs.promises.readFile(singlePath);
      const type = await fileTypeFromBuffer(content);
      if (type?.mime && allow_mine.includes(type?.mime)) {
        filePromises.push(
          Promise.resolve([
            new FileObject(
              path.basename(singlePath),
              singlePath,
              path.extname(singlePath).substring(1),
              new Uint8Array(content).buffer
            )
          ])
        );
      } else {
        log.debug('File type not allowed:', JSON.stringify(type), singlePath, allow_mine);
      }
    }
  }
  const filesArrays = await Promise.all(filePromises);
  return filesArrays.flat();
};

const handleOpenDialog = async (result: Electron.OpenDialogReturnValue, accept: MimeType[]): Promise<FileObject[]> => {
  if (result.canceled) {
    log.debug('No directory selected');
    return Promise.reject(new Error('No directory selected'));
  } else {
    log.debug('Selected directory:', JSON.stringify(result.filePaths));
    return await readDirectory(result.filePaths, accept);
  }
};

ipcMain.handle(channel.SELECT_FILE, async (_, multiple: boolean, accept: MimeType[]): Promise<FileObject[]> => {
  const result = await dialog.showOpenDialog({
    properties: multiple ? ['openFile', 'multiSelections'] : ['openFile']
  });
  return handleOpenDialog(result, accept);
});

ipcMain.handle(channel.SELECT_FOLDER, async (_, accept: MimeType[]): Promise<FileObject[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  });
  return handleOpenDialog(result, accept);
});

ipcMain.handle(channel.CALCULATE_FILE_TYPE, async (_, file_content: Uint8Array): Promise<MimeType> => {
  const res = await fileTypeFromBuffer(file_content);
  return res?.mime ?? 'image/png';
});

ipcMain.on(channel.OPEN_WEB, (_, url: string) => shell.openExternal(url).then());

ipcMain.handle(channel.GET_FORWARD_MSG_CONTENT, async (_, msgData: forwardMsgData) => {
  log.debug('getForwardMsgContent', JSON.stringify(msgData));
  const res = await invokeNative('ns-ntApi-2', 'nodeIKernelMsgService/getMultiMsg', 'IPC_UP_2', {
    peer: { chatType: msgData.chatType, guildId: '', peerUid: msgData.peerUid },
    rootMsgId: msgData.msgId,
    parentMsgId: msgData.msgId
  });
  const picPathList = res.msgList
    .map((msg) => {
      const picElement = msg.elements.find((element) => element.picElement);
      return picElement?.picElement?.sourcePath;
    })
    .filter((path): path is string => path !== undefined);
  log.debug('channel.GET_FORWARD_MSG_CONTENT now have picList', JSON.stringify(picPathList));
  const picNotExistPathList = picPathList.filter((path) => !fs.existsSync(path));
  if (picNotExistPathList.length > 0) {
    log.debug('Need to download picNotExistPathList', JSON.stringify(picNotExistPathList));
  }
  // TODO: Files in this list may not have been downloaded yet
  // TODO: It is necessary to call `nodeIKernelMsgService/downloadRichMedia` to download files that do not exist locally
  // TODO: see https://github.com/LLOneBot/LLOneBot/blob/v3.26.7/src/ntqqapi/api/file.ts#L109
  return picPathList;
});
