/// <reference path="../global.d.ts" />
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import * as channel from '../common/channels';
import { ImgObject } from '../common/imgObject';
import { fileTypeFromBuffer, type MimeType } from 'file-type';
import { log } from '../common/share/logs';
import { pluginSettingsModel } from '../common/share/PluginSettingsModel';
import { TriggerImageRegisterName } from '../common/share/triggerImageRegisterName';
import { readDirectory } from './fs';
import { hookIpc } from './native/sora/hookipc';
import { invokeNative } from './native/sora/invokeNative';
import { forwardMsgData, GetReq, marketFaceMsgData, picMsgData } from '../renderer/NTQQMsgModel';
import type { GeneralCallResult, RawMessage } from 'napcat.core';

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

const handleOpenDialog = async (result: Electron.OpenDialogReturnValue, accept: MimeType[]): Promise<ImgObject[]> => {
  if (result.canceled) {
    log.debug('No directory selected');
    return Promise.reject(new Error('No directory selected'));
  } else {
    log.debug('Selected directory:', JSON.stringify(result.filePaths));
    return await readDirectory(result.filePaths, accept);
  }
};

ipcMain.handle(channel.SELECT_FILE, async (_, multiple: boolean, accept: MimeType[]): Promise<ImgObject[]> => {
  const result = await dialog.showOpenDialog({
    properties: multiple ? ['openFile', 'multiSelections'] : ['openFile']
  });
  return handleOpenDialog(result, accept);
});

ipcMain.handle(channel.SELECT_FOLDER, async (_, accept: MimeType[]): Promise<ImgObject[]> => {
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

type ApiParams = [{ getReq: GetReq }, null];

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
  // log.debug('downloadMsgContent', JSON.stringify(res));
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
      // log.debug('downloadMsgContent nestedMessages in loop prepare to get', JSON.stringify(nestedMsgData));
      return await getForwardMsgContent(nestedMsgData);
    })
  );
  return [...nonNestedMessages, ...nestedResults.flat()];
};

const convertPicToImgObject = async (picList: (picMsgData | marketFaceMsgData)[]): Promise<ImgObject[]> => {
  return Promise.all(
    picList.map(async (ele) => {
      let sourcePath: string | null = null;
      if ((ele as picMsgData)?.pic) {
        sourcePath = (ele as picMsgData).pic.sourcePath;
      } else if ((ele as marketFaceMsgData)?.marketFace?.staticFacePath) {
        sourcePath = (ele as marketFaceMsgData).marketFace.staticFacePath;
      }
      if (sourcePath) {
        const fileName = path.basename(sourcePath);
        const fileExtension = path.extname(sourcePath).substring(1);
        const fileContent = await fs.promises.readFile(sourcePath);
        return new ImgObject(fileName, fileExtension, fileContent, sourcePath);
      } else {
        throw new Error(`convertPicToImgObject: sourcePath is null, ele=${JSON.stringify(ele)}`);
      }
    })
  );
};

// TODO: maybe can be refactored using generics
ipcMain.handle(
  channel.GET_MSG_MULTI_PIC,
  async (
    _,
    msgData: (picMsgData | marketFaceMsgData)[]
  ): Promise<{
    onDiskMsgContentList: ImgObject[];
    notOnDiskMsgContentList: (picMsgData | marketFaceMsgData)[];
  }> => {
    const onDisk: (picMsgData | marketFaceMsgData)[] = [];
    const notOnDiskList: (picMsgData | marketFaceMsgData)[] = [];
    msgData?.forEach((pic: picMsgData | marketFaceMsgData) => {
      if ((pic as picMsgData)?.pic && fs.existsSync((pic as picMsgData).pic.sourcePath)) {
        fs.existsSync((pic as picMsgData).pic.sourcePath)
          ? onDisk.push(<picMsgData>pic)
          : notOnDiskList.push(<picMsgData>pic);
      }
      if (
        (pic as marketFaceMsgData)?.marketFace?.staticFacePath &&
        fs.existsSync((pic as marketFaceMsgData).marketFace.staticFacePath)
      ) {
        fs.existsSync((pic as marketFaceMsgData).marketFace.staticFacePath)
          ? onDisk.push(<marketFaceMsgData>pic)
          : notOnDiskList.push(<marketFaceMsgData>pic);
      }
    });
    // log.debug(`channel.GET_MSG_MULTI_PIC got msgData ${JSON.stringify(msgData)}`);
    // log.debug('onDisk', JSON.stringify(onDisk));
    // log.debug('notOnDiskList', JSON.stringify(notOnDiskList));
    const onDiskImg = await convertPicToImgObject(onDisk);
    log.debug(
      `channel.GET_MSG_MULTI_PIC now have valid picList len=${msgData.length}, onDisk=${onDisk.length}, notOnDisk=${notOnDiskList.length}`
    );
    return { onDiskMsgContentList: onDiskImg, notOnDiskMsgContentList: notOnDiskList };
  }
);

// TODO: maybe can be refactored using generics
ipcMain.handle(
  channel.GET_FORWARD_MSG_PIC,
  async (
    _,
    msgData: forwardMsgData
  ): Promise<{
    onDiskMsgContentList: ImgObject[];
    notOnDiskMsgContentList: picMsgData[];
  }> => {
    // log.debug(`channel.GET_FORWARD_MSG_PIC got msgData ${JSON.stringify(msgData)}`);
    const res = await getForwardMsgContent(msgData);
    const picList: picMsgData[] = res.flatMap((rawMsg) =>
      rawMsg.elements
        .filter((ele) => ele?.elementId !== undefined && ele?.picElement?.sourcePath !== undefined)
        .map(
          (ele) =>
            ({
              pic: ele.picElement,
              elementId: ele.elementId,
              msgId: msgData.rootMsgId!,
              chatType: msgData?.chatType!,
              peerUid: msgData?.peerUid!
            }) as picMsgData
        )
    );
    // log.debug(`channel.GET_FORWARD_MSG_PIC got picList ${JSON.stringify(picList)}`);
    const onDisk: picMsgData[] = [];
    const notOnDiskList: picMsgData[] = [];
    picList.forEach((pic) => {
      if (fs.existsSync(pic.pic.sourcePath)) {
        onDisk.push(pic);
      } else {
        notOnDiskList.push(pic);
      }
    });
    const onDiskImg = await convertPicToImgObject(onDisk);
    log.debug(
      `channel.GET_FORWARD_MSG_PIC now have valid picList len=${picList.length}, onDisk=${onDisk.length}, notOnDisk=${notOnDiskList.length}`
    );
    return { onDiskMsgContentList: onDiskImg, notOnDiskMsgContentList: notOnDiskList };
  }
);

ipcMain.handle(channel.DOWNLOAD_MULTI_MSG_IMAGE, async (_, picList: picMsgData[]): Promise<ImgObject[]> => {
  const downloadPromises = picList.map((ele) => {
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
  await Promise.all(downloadPromises);
  return convertPicToImgObject(picList);
});

ipcMain.on(channel.ADD_UPLOAD_FILE_REQ, (event, imgList: ImgObject[]) => {
  event.sender.send(channel.ADD_UPLOAD_FILE_RES, imgList);
});
