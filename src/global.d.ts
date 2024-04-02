declare global {
    let LiteLoader: any;
    interface Window {
        imageSearch: {
            getSettings: () => Promise<any>;
            setSettings: (content: any) => Promise<void>;
            logToMain: (...args: any[]) => Promise<void>;
            openWeb: (url: string) => void;
        };
    }
}

declare module "*.svg" {
    const content: any;
    export default content;
}

export {};