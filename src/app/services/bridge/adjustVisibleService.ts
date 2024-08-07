import { sharedAdapter } from '../../adapter/SharedAdapter';

interface adjustVisibleService {
  set(state: boolean): Promise<void>;
}

export class devAdjustVisibleService implements adjustVisibleService {
  async set(state: boolean): Promise<void> {
    sharedAdapter.Log.debug(`Switched to ${state.toString()}`);
  }
}

export class LLNTAdjustVisibleService implements adjustVisibleService {
  async set(state: boolean): Promise<void> {
    // @ts-ignore
    const injectIframeModule = await import('../../../renderer/iframe/injectIframe');
    const { iframeID } = injectIframeModule;
    const controlIframeModule = await import('../../../renderer/iframe/controlIframe');
    const { hideIframe, showIframe } = controlIframeModule;
    state ? showIframe(iframeID) : hideIframe(iframeID);
  }
}
