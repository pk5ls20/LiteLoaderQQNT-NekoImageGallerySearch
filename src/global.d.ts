import 'vite/client';

declare global {
  let LiteLoader: any;

  interface Window {
    imageSearch: {
      getSettings: () => Promise<any>;
      setSettings: (content: object) => Promise<void>;
      getLocalFileAsBlob: (filePath: string) => Promise<Blob | null>;
      postAppImageSearchReq: (file_content: Blob | null) => void;
      postAppImageSearchRes: (callback: (file_content: Buffer | null) => Promise<void>) => void;
      triggerSettingReq: (setting: string | null) => void;
      triggerSettingRes: (callback: (setting: string | null) => Promise<void>) => void;
      openWeb: (url: string) => void;
    };
  }
}

declare module '*.svg' {
  const content: any;
}

export {};
