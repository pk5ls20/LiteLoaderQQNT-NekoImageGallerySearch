import type {
  ArkElement,
  AtType,
  ElementType,
  FaceElement,
  FileElement,
  GrayTipElement,
  InlineKeyboardElement,
  MarkdownElement,
  MarketFaceElement,
  MultiForwardMsgElement,
  PicElement,
  PttElement,
  VideoElement
} from 'napcat.core';

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

// reference https://github.com/NapNeko/LiteLoader-NapCatCore/blob/main/src/entities/msg.ts#L513
export type NTQQMsgElement = {
  elementId: string;
  elementType: ElementType;
  replyElement: {
    senderUid: string;
    sourceMsgIsIncPic: boolean;
    sourceMsgText: string;
    replayMsgSeq: string;
  };
  textElement: {
    atType: AtType;
    atUid: string;
    content: string;
    atNtUid: string;
  };
  picElement: PicElement;
  pttElement: PttElement;
  arkElement: ArkElement;
  grayTipElement: GrayTipElement;
  faceElement: FaceElement;
  videoElement: VideoElement;
  fileElement: FileElement;
  marketFaceElement: MarketFaceElement;
  inlineKeyboardElement: InlineKeyboardElement;
  markdownElement: MarkdownElement;
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
