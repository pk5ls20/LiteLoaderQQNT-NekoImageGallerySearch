import path from 'node:path';
import fs from 'node:fs';
import { ipcMain } from 'electron';
import {
  forwardMsgData,
  GeneralCallResult,
  GetReq,
  marketFaceMsgData,
  picMsgData,
  RawMessage
} from '../common/NTQQMsgModel';
import { invokeNative } from './native/sora/invokeNative';
import { ImgObject } from '../common/imgObject';
import * as channel from '../common/channels';
import { log } from '../common/share/logs';

type ApiParams = [{ getReq: GetReq }, null];
type multiPicDataT = picMsgData | marketFaceMsgData;

const IPC_CHANNEL = LiteLoader.package.qqnt.buildVersion >= 28788 ? 'IPC_UP_3' : 'IPC_UP_2';
const IPC_EVENT = LiteLoader.package.qqnt.buildVersion >= 28788 ? 'ns-ntApi-3' : 'ns-ntApi-2';

const getForwardMsgContent = async (msgData: forwardMsgData): Promise<RawMessage[]> => {
  const args = [
    {
      peer: { chatType: msgData.chatType, guildId: '', peerUid: msgData.peerUid },
      rootMsgId: msgData.rootMsgId,
      parentMsgId: msgData.parentMsgId ?? msgData.rootMsgId
    }
  ];
  // log.debug(`await invokeNative in args: ${JSON.stringify(args)}`);
  const res = await invokeNative<unknown[], GeneralCallResult, { msgList: RawMessage[] }>(
    'nodeIKernelMsgService/getMultiMsg',
    IPC_EVENT,
    IPC_CHANNEL,
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

const convertPicListToImgObject = async <T>(picList: T[]): Promise<ImgObject[]> => {
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
    msgData: multiPicDataT[]
  ): Promise<{
    onDiskMsgContentList: ImgObject[];
    notOnDiskMsgContentList: multiPicDataT[];
  }> => {
    const onDisk: multiPicDataT[] = [];
    const notOnDiskList: multiPicDataT[] = [];
    msgData?.forEach((pic: multiPicDataT) => {
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
    const onDiskImg = await convertPicListToImgObject<multiPicDataT>(onDisk);
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
    const onDiskImg = await convertPicListToImgObject<picMsgData>(onDisk);
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
        } as GetReq
      },
      null
    ];
    return invokeNative<ApiParams, GeneralCallResult, null, any, { notifyInfo: { filePath: string; msgId: string } }>(
      'nodeIKernelMsgService/downloadRichMedia',
      IPC_EVENT,
      IPC_CHANNEL,
      apiParams,
      100000,
      'nodeIKernelMsgListener/onRichMediaDownloadComplete',
      (stageTwoData: [{ payload: { notifyInfo: { filePath: string; msgId: string; fileErrCode: string } } }]) => {
        return stageTwoData[0].payload.notifyInfo.filePath === ele.pic.sourcePath;
      }
    );
  });
  await Promise.all(downloadPromises);
  return convertPicListToImgObject(picList);
});
