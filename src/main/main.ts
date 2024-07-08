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
import { forwardMsgData, forwardMsgPic, GetReq } from '../renderer/NTQQMsgModel';
import type { GeneralCallResult, PicElement, RawMessage } from 'napcat.core';

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

const getForwardMsgContent = async (msgData: forwardMsgData): Promise<RawMessage[]> => {
  const args = [
    {
      peer: { chatType: msgData.chatType, guildId: '', peerUid: msgData.peerUid },
      rootMsgId: msgData.rootMsgId,
      parentMsgId: msgData.parentMsgId ?? msgData.rootMsgId
    }
  ];
  // log.debug('await invokeNative in args: ', JSON.stringify(args));
  const res = await invokeNative<unknown[], GeneralCallResult, { msgList: RawMessage[] }>(
    'nodeIKernelMsgService/getMultiMsg',
    'ns-ntApi-2',
    'IPC_UP_2',
    args
  );
  // log.debug('getForwardMsgContent', JSON.stringify(res));
  const nonNestedMessages = res.msgList.filter(
    (msg) => !msg.elements.some((element) => element.multiForwardMsgElement)
  );
  const nestedMessages = res.msgList.filter((msg) => msg.elements.some((element) => element.multiForwardMsgElement));
  // log.debug(
  //   `currently, have ${nonNestedMessages.length} nonNestedMessages and ${nestedMessages.length} nestedMessages`
  // );
  const nestedResults = await Promise.all(
    nestedMessages.map(async (msg) => {
      const nestedMsgData: forwardMsgData = {
        peerUid: msgData.peerUid,
        chatType: msgData.chatType,
        rootMsgId: msgData.rootMsgId,
        parentMsgId: msg.msgId
      };
      // log.debug('getForwardMsgContent nestedMessages in loop prepare to get', JSON.stringify(nestedMsgData));
      return await getForwardMsgContent(nestedMsgData);
    })
  );
  return [...nonNestedMessages, ...nestedResults.flat()];
};

type ApiParams = [{ getReq: GetReq }, null];

ipcMain.handle(channel.GET_FORWARD_MSG_CONTENT, async (_, msgData: forwardMsgData): Promise<string[]> => {
  const res = await getForwardMsgContent(msgData);
  const picRawList: RawMessage[] = res.filter((msg) =>
    msg.elements.some((element) => element.picElement && element.picElement.sourcePath !== undefined)
  );
  const picList: forwardMsgPic[] = picRawList.map((rawMsg) => {
    const t = rawMsg.elements.find((ele) => ele.picElement !== undefined);
    return {
      pic: t?.picElement as PicElement,
      msgId: msgData.rootMsgId!,
      chatType: msgData?.chatType!,
      peerUid: msgData?.peerUid!,
      elementId: t?.elementId as string
    };
  });
  log.debug(`channel.GET_FORWARD_MSG_CONTENT now have valid picList len=${picList.length}`);
  const picNotExistPathList = picList.filter((ele) => !fs.existsSync(ele.pic.sourcePath));
  if (picNotExistPathList.length > 0) {
    log.debug(`Need to download picNotExistPathList len=${picNotExistPathList.length}`);
    // TODO: maybe not necessary
    // await invokeNative<GeneralCallResult, null>(
    //   'ns-ntApi-2-register',
    //   'nodeIKernelMsgService/downloadRichMedia',
    //   'IPC_UP_2'
    // );
    const downloadPromises = picNotExistPathList.map((ele) => {
      const apiParams: ApiParams = [
        {
          getReq: {
            fileModelId: '0',
            downSourceType: 0,
            triggerType: 1,
            msgId: ele.msgId,
            chatType: ele.chatType,
            peerUid: ele.peerUid,
            elementId: ele.elementId,
            thumbSize: 0,
            downloadType: 1,
            filePath: ele.pic.sourcePath
          }
        },
        null
      ];
      return invokeNative<ApiParams, GeneralCallResult, null, any, { notifyInfo: { filePath: string; msgId: string } }>(
        'nodeIKernelMsgService/downloadRichMedia',
        'ns-ntApi-2',
        'IPC_UP_2',
        apiParams,
        100000,
        'nodeIKernelMsgListener/onRichMediaDownloadComplete',
        (stageTwoData: [{ payload: { notifyInfo: { filePath: string; msgId: string; fileErrCode: string } } }]) => {
          return stageTwoData[0].payload.notifyInfo.filePath === ele.pic.sourcePath;
        }
      );
    });
    // TODO: it will stuck UI
    await Promise.all(downloadPromises);
  }
  return picList.map((ele) => {
    return ele.pic.sourcePath;
  });
});
