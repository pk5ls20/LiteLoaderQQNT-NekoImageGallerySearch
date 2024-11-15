export interface GeneralCallResult {
  result: number;
  errMsg: string;
}

export interface PicElement {
  picSubType?: number;
  originImageUrl: string;
  originImageMd5?: string;
  sourcePath: string;
  thumbPath: Map<number, string>;
  picWidth: number;
  picHeight: number;
  fileSize: number;
  fileName: string;
  fileUuid: string;
  md5HexStr?: string;
}

export interface ArkElement {
  bytesData: string;
  linkInfo: null;
  subElementType: null;
}

export interface MarketFaceElement {
  emojiPackageId: number;
  faceName: string;
  emojiId: string;
  key: string;
}

export interface MultiForwardMsgElement {
  xmlContent: string;
  resId: string;
  fileName: string;
}

export type vueMsgElement = {
  data: vueMsgElementData;
  height: number;
  id: string;
  msgId: string;
  pos: number;
};

export type vueMsgElementData = {
  anonymousExtInfo: unknown;
  atType: number;
  avatarFlag: number;
  avatarMeta: string;
  avatarPendant: string;
  categoryManage: number;
  channelId: string;
  chatType: number;
  clientIdentityInfo: any;
  clientSeq: string;
  cntSeq: string;
  commentCnt: string;
  directMsgFlag: number;
  directMsgMembers: any[];
  editable: boolean;
  elements: NTQQMsgElement[];
  emojiLikesList: any[];
  feedId: string;
  fileGroupSize: any;
  foldingInfo: any;
  fromAppid: string;
  fromChannelRoleInfo: RoleInfo;
  fromGuildRoleInfo: RoleInfo;
  fromUid: string;
  freqLimitInfo: any;
  generalFlags: string;
  guildCode: string;
  guildId: string;
  guildName: string;
  id: string;
  isImportMsg: boolean;
  isOnlineMsg: boolean;
  levelRoleInfo: RoleInfo;
  msgAttrs: any;
  msgEventInfo: any;
  msgId: string;
  msgMeta: string;
  msgTime: string;
  msgType: number;
  multiTransInfo: any;
  nameType: number;
  peerName: string;
  peerUid: string;
  peerUin: string;
  personalMedal: any;
  recallTime: string;
  records: any[];
  roleId: string;
  roleType: number;
  sendMemberName: string;
  sendNickName: string;
  sendRemarkName: string;
  sendStatus: number;
  sendType: number;
  senderUid: string;
  senderUin: string;
  showTimestamp: boolean;
  subMsgType: number;
  timeStamp: string;
};

export interface RawMessage {
  msgId: string;
  senderUid: string;
  senderUin: string;
  peerUid: string;
  peerUin: string;
  sendNickName: string;
  sendMemberName?: string;
  chatType: number;
  sendStatus?: number;
  recallTime: string;
  elements: Array<NTQQMsgElement>;
}

// reference https://github.com/NapNeko/LiteLoader-NapCatCore/blob/main/src/entities/msg.ts#L513
export type NTQQMsgElement = {
  elementId: string;
  replyElement: {
    senderUid: string;
    sourceMsgIsIncPic: boolean;
    sourceMsgText: string;
    replayMsgSeq: string;
  };
  textElement: {
    atType: number;
    atUid: string;
    content: string;
    atNtUid: string;
  };
  picElement: PicElement;
  arkElement: ArkElement;
  marketFaceElement: MarketFaceElement;
  multiForwardMsgElement: MultiForwardMsgElement;
};

type RoleInfo = {
  color: number;
  name: string;
  roleId: string;
};

export interface nekoMsgData {
  chatType?: number;
  peerUid?: string;
}

export interface forwardMsgData extends nekoMsgData {
  peerUid?: string; // used in ipcChannel
  chatType?: number; // used in ipcChannel
  rootMsgId?: string; // used in ipcChannel
  parentMsgId?: string; // used in ipcChannel
  resId?: string; // used in raw packet
}

export interface arkForwardMsgBytesData {
  app?: string;
  config?: {
    autosize?: number;
    forward?: number;
    round?: number;
    type?: string;
    width?: number;
  };
  desc?: string;
  extra?: string;
  meta?: {
    detail?: {
      news?: Array<{ text?: string }>;
      resid?: string;
      source?: string;
      summary?: string;
      uniseq?: string;
    };
  };
  prompt?: string;
  ver?: string;
  view?: string;
}

export interface picMsgData extends nekoMsgData {
  pic: PicElement;
  msgId: string;
  chatType: number;
  peerUid: string;
  elementId: string;
}

export interface NTQQVueMarketFaceElement extends MarketFaceElement {
  staticFacePath: string;
}

export interface marketFaceMsgData extends nekoMsgData {
  marketFace: NTQQVueMarketFaceElement;
}

export interface GetReq {
  fileModelId: string;
  downSourceType: number;
  triggerType: number;
  msgId: string;
  chatType: number;
  peerUid: string;
  elementId: string;
  thumbSize: number;
  downloadType: number;
  filePath: string;
}
