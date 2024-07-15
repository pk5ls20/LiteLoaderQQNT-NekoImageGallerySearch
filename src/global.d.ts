import 'vite/client';
import { pluginSettingsModel } from './common/share/PluginSettingsModel';
import { TriggerImageRegisterName } from './common/share/triggerImageRegisterName';
import type { MimeType } from 'file-type';
import type { nekoMsgData } from './common/NTQQMsgModel';
import { ImgObject } from './common/imgObject';

declare global {
  interface Window {
    imageSearch: {
      // settings
      getSettings: () => Promise<pluginSettingsModel | null>;
      setSettings: (content: pluginSettingsModel) => Promise<void>;
      triggerSettingReq: (setting: string | null) => void;
      triggerSettingRes: (callback: (setting: string | null) => Promise<void>) => void;
      // fs
      getLocalFileAsUInt8Array: (filePath: string) => Promise<Uint8Array | null>;
      selectFiles: (multiple: boolean, accept: string[]) => Promise<File[]>;
      selectDirectory: (accept: string[] | null) => Promise<File[]>;
      // nekoSync
      postAppImageReq: (file_content: Uint8Array | null, registerNum: TriggerImageRegisterName) => void;
      postAppImageRes: (
        callback: (file_content: Uint8Array | null, file_mine: MimeType) => Promise<void>,
        registerNum: TriggerImageRegisterName
      ) => void;
      addUploadFileReq: (imgList: ImgObject[]) => Promise<void>;
      addUploadFileRes: (callback: (file: File[]) => void) => void;
      // misc
      openWeb: (url: string) => void;
      // callNative
      downloadMsgContent: <
        DT extends nekoMsgData | nekoMsgData[],
        SDT1 extends unknown,
        SDT2 extends unknown,
        EDT1 extends unknown
      >(
        msgData: DT,
        startDownloadChannel: string,
        finishDownloadChannel: string
      ) => Promise<{
        startDownload: Promise<Awaited<{ onDiskMsgContentList: SDT1[]; notOnDiskMsgContentList: SDT2[] }>>;
        endDownload: Promise<EDT1[]>;
      }>;
    };
  }
}

declare module '*.svg' {
  const content: unknown;
}

export {};
