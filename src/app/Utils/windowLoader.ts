import {isDevEnv} from './envFlag'
import {log} from '../../logs'

export const adjustVisible = (state: boolean) => {
    if (isDevEnv) {
        log(`Switched to ${state.toString()}`)
    } else {
        import("../../renderer/injectIframe").then(module => {
            const { hideIframe, showIframe } = module;
            state ? showIframe() : hideIframe();
        });
    }
}