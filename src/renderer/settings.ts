import { log } from '../common/share/logs';

// reference https://github.com/MUKAPP/LiteLoaderQQNT-DeepL/blob/main/src/renderer.js#L377
export const settings = async (view: any) => {
  try {
    const plugin_path = LiteLoader.plugins['image_search'].path.plugin;
    const html_file_path = `local:///${plugin_path}/settings.html`;
    view.innerHTML = await (await fetch(html_file_path)).text();
    // TODO: seems not valid in newest NTQQ
    // document.querySelectorAll('.nav-item.liteloader').forEach((node) => {
    //   if (node.textContent === 'Image Search') {
    //     const qIcon = node.querySelector('.q-icon');
    //     if (qIcon) {
    //       qIcon.innerHTML = iconHtml;
    //     }
    //   }
    // });
    const settings = await window.imageSearch.getSettings();
    if (!settings) {
      alert('Failed to get settings');
      return;
    }
    const api_input = view.querySelector('.image_search .api-input');
    const reset = view.querySelector('.image_search .reset');
    const apply = view.querySelector('.image_search .apply');
    api_input.value = settings.nekoimage_api ?? '';
    apply.addEventListener('click', async () => {
      settings.nekoimage_api = api_input.value;
      await window.imageSearch.setSettings(settings);
      alert('API Applied');
    });
    reset.addEventListener('click', async () => {
      api_input.value = '';
      settings.nekoimage_api = api_input.value;
      await window.imageSearch.setSettings(settings);
      alert('API Reset');
    });
    const nekoimage_access_token = view.querySelector('.image_search .right-target-lang');
    const nekoimage_access_token_apply = view.querySelector('.image_search .right-target-lang-apply');
    const nekoimage_access_token_reset = view.querySelector('.image_search .right-target-lang-reset');
    const nekoimage_admin_token = view.querySelector('.image_search .chat-target-lang');
    const nekoimage_admin_token_apply = view.querySelector('.image_search .chat-target-lang-apply');
    const nekoimage_admin_token_reset = view.querySelector('.image_search .chat-target-lang-reset');
    const nekoimage_lang = view.querySelector('.image_search .neko-lang');
    const nekoimage_lang_apply = view.querySelector('.image_search .neko-lang-apply');
    const nekoimage_lang_reset = view.querySelector('.image_search .neko-lang-reset');

    // console.log(JSON.stringify(settings));
    nekoimage_access_token.value = settings.nekoimage_admin_token ?? '';
    nekoimage_admin_token.value = settings.nekoimage_admin_token ?? '';
    nekoimage_lang.value = settings.nekoimage_lang ?? 'en-US';
    nekoimage_access_token_apply.addEventListener('click', async () => {
      settings.nekoimage_access_token = nekoimage_access_token.value;
      await window.imageSearch.setSettings(settings);
      alert('Access Token Applied');
    });
    nekoimage_access_token_reset.addEventListener('click', async () => {
      nekoimage_access_token.value = '';
      settings.nekoimage_access_token = '';
      await window.imageSearch.setSettings(settings);
      alert('Access Token Reset');
    });
    nekoimage_admin_token_apply.addEventListener('click', async () => {
      settings.nekoimage_admin_token = nekoimage_admin_token.value;
      await window.imageSearch.setSettings(settings);
      alert('Admin Token Applied');
    });
    nekoimage_admin_token_reset.addEventListener('click', async () => {
      nekoimage_admin_token.value = '';
      settings.nekoimage_admin_token = '';
      await window.imageSearch.setSettings(settings);
      alert('Admin Token Reset');
    });
    nekoimage_lang_apply.addEventListener('click', async () => {
      settings.nekoimage_lang = nekoimage_lang.value as 'en-US' | 'zh-CN';
      await window.imageSearch.setSettings(settings);
      alert('Language Applied');
    });
    nekoimage_lang_reset.addEventListener('click', async () => {
      nekoimage_lang.value = 'en-US';
      settings.nekoimage_lang = 'en-US';
      await window.imageSearch.setSettings(settings);
      alert('Language Reset');
    });
  } catch (error) {
    log.error('[Error in setting]', error);
  }
};
