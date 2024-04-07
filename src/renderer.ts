/// <reference path="global.d.ts" />
import {log} from './logs';
import iconHtml from './assets/logo.svg?raw';
import AppEntry from './app/appEntry';

// dynamic inject vue
const mountPoint = document.createElement('div');
mountPoint.id = 'nekoImagePluginView';
document.body.insertAdjacentElement('afterbegin', mountPoint);
AppEntry('mainApp', '#nekoImagePluginView')
    .then(r => log("AppEntry Success", r))
    .catch(e => log("AppEntry Failed", e))

// inject global css
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = `local:///${LiteLoader.plugins["image_search"].path.plugin}/renderer/style.css`;
document.head.appendChild(link);

// export settings
export const onSettingWindowCreated = async (view: any) => {
    try {
        const plugin_path = LiteLoader.plugins["image_search"].path.plugin;
        const html_file_path = `local:///${plugin_path}/app/settings.html`;
        view.innerHTML = await (await fetch(html_file_path)).text();
        document.querySelectorAll(".nav-item.liteloader").forEach((node) => {
            if (node.textContent === "Image Search") {
                node.querySelector(".q-icon").innerHTML = iconHtml;
            }
        });
        const settings = await window.imageSearch.getSettings();
        log("Settings", JSON.stringify(settings))
        const api_input = view.querySelector(".image_search .api-input");
        const reset = view.querySelector(".image_search .reset");
        const apply = view.querySelector(".image_search .apply");
        api_input.value = settings.nekoimage_api;
        apply.addEventListener("click", () => {
            settings.nekoimage_api = api_input.value;
            window.imageSearch.setSettings(settings);
            alert("API Applied");
        });
        reset.addEventListener("click", () => {
            api_input.value = "";
            settings.nekoimage_api = api_input.value;
            window.imageSearch.setSettings(settings);
            alert("API Reset");
        });
        const nekoimage_access_token = view.querySelector(".image_search .right-target-lang");
        const nekoimage_access_token_apply = view.querySelector(".image_search .right-target-lang-apply");
        const nekoimage_access_token_reset = view.querySelector(".image_search .right-target-lang-reset");
        const nekoimage_admin_token = view.querySelector(".image_search .chat-target-lang");
        const nekoimage_admin_token_apply = view.querySelector(".image_search .chat-target-lang-apply");
        const nekoimage_admin_token_reset = view.querySelector(".image_search .chat-target-lang-reset");

        nekoimage_access_token.value = settings.nekoimage_admin_token;
        nekoimage_admin_token.value = settings.nekoimage_admin_token;
        nekoimage_access_token_apply.addEventListener("click", () => {
            settings.nekoimage_access_token = nekoimage_access_token.value;
            window.imageSearch.setSettings(settings);
            alert("Access Token Applied");
        });
        nekoimage_access_token_reset.addEventListener("click", () => {
            nekoimage_access_token.value = "";
            settings.nekoimage_access_token = "";
            window.imageSearch.setSettings(settings);
            alert("Access Token Reset");
        });
        nekoimage_admin_token_apply.addEventListener("click", () => {
            settings.nekoimage_admin_token = nekoimage_admin_token.value;
            window.imageSearch.setSettings(settings);
            alert("Admin Token Applied");
        });
        nekoimage_admin_token_reset.addEventListener("click", () => {
            nekoimage_admin_token.value = "";
            settings.nekoimage_admin_token = "";
            window.imageSearch.setSettings(settings);
            alert("Admin Token Reset");
        });
    } catch (error) {
        log("[Error in setting]", error);
    }
}
