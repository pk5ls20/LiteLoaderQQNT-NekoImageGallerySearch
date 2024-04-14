interface adjustVisibleService {
    set(state: boolean): Promise<void>;
}

export class devAdjustVisibleService implements adjustVisibleService {
    async set(state: boolean): Promise<void> {
        console.log(`Switched to ${state.toString()}`)
    }
}

export class LLNTAdjustVisibleService implements adjustVisibleService {
    async set(state: boolean): Promise<void> {
        const injectIframeModule = await import("../../../renderer/injectIframe");
        const {iframeID} = injectIframeModule;
        const controlIframeModule = await import("../../../renderer/controlIframe");
        const {hideIframe, showIframe} = controlIframeModule;
        state ? showIframe(iframeID) : hideIframe(iframeID);
    }
}