import {isDevEnv} from './envFlag'
import {log} from '../../logs'

export const adjustVisible = async (state: boolean) => {
    if (isDevEnv) {
        log(`Switched to ${state.toString()}`)
    } else {
        const injectIframeModule = await import("../../renderer/injectIframe");
        const { iframeID } = injectIframeModule;
        const controlIframeModule = await import("../../renderer/controlIframe");
        const { hideIframe, showIframe } = controlIframeModule;
        state ? showIframe(iframeID) : hideIframe(iframeID);
    }
}