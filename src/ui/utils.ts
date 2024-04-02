import {ref} from "vue";
import {log} from "../logs";

export const devEnvFlag = 'VITE_LLNT_NEKOIMAGE_DEV';
export const devEnvWrap: (val: string) => string | undefined = (val: string) => {
    // 动态访问import.meta.env中的属性
    return import.meta.env[`${devEnvFlag}__${val}`];
};
export const isDevEnv = typeof import.meta !== 'undefined' &&
    typeof import.meta.env !== 'undefined' &&
    import.meta.env[devEnvFlag] === '1';


export async function pluginSettings() {
    log('isDevEnv=', isDevEnv)
    const settings = ref(isDevEnv ? {
        "nekoimage_api": devEnvWrap('NEKOIMAGE_API'),
        "nekoimage_access_token": devEnvWrap('ACCESS_TOKEN'),
        "nekoimage_admin_token": devEnvWrap('ADMIN_TOKEN'),
    } : null);
    if (!settings.value) {
        settings.value = await window.imageSearch.getSettings();
    }
    return settings;
}