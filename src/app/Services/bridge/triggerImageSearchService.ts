// import { ipcRenderer } from 'electron';

interface TriggerImageSearchService {
    init(callback: (file_content: Buffer | null) => Promise<void>): void;

    reset(): void;
}

export class devTriggerImageSearchService implements TriggerImageSearchService {
    init(callback: (file_content: Buffer | null) => Promise<void>): void {
        console.log('init', callback);
    }

    reset(): void {
        console.log('reset');
    }
}

export class LLNTTriggerImageSearchService implements TriggerImageSearchService {
    init(callback: (file_content: Buffer | null) => Promise<void>): void {
        window.imageSearch.postAppImageSearchRes(async (file_content: Buffer | null) => {
            await callback(file_content);
        });
    }

    reset(): void {
        // if (ipcRenderer) {
        //     ipcRenderer.removeAllListeners('LiteLoader.imageSearch.imageSearchResponse');
        // }
    }
}
