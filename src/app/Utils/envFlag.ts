export const devEnvFlag = 'VITE_LLNT_NEKOIMAGE_DEV';
export const devEnvWrap: (val: string) => string | undefined = (val: string) => {
    return import.meta.env[`${devEnvFlag}__${val}`];
};
export const isDevEnv = typeof import.meta !== 'undefined' &&
    typeof import.meta.env !== 'undefined' &&
    import.meta.env[devEnvFlag] === '1';