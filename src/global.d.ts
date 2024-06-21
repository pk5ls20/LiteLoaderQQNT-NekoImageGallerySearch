import 'vite/client';

declare global {
  let LiteLoader: any;

  interface Window {
    imageSearch: {
      getSettings: () => Promise<any>;
      setSettings: (content: any) => Promise<void>;
      logToMain: (...args: any[]) => Promise<void>;
      getLocalFileAsBlob: (filePath: string) => Promise<Blob | null>;
      postAppImageSearchReq: (file_content: Blob | null) => void;
      postAppImageSearchRes: (callback: (file_content: Buffer | null) => Promise<void>) => void;
      TriggerSetting: (callback: (setting: string) => Promise<void>) => void;
      openWeb: (url: string) => void;
    };
  }
}

declare module '*.svg' {
  const content: any;
}

export {};
