export class pluginSettingsModel {
    public nekoimage_api: string;
    public nekoimage_access_token: string;
    public nekoimage_admin_token: string;

    constructor(api: string | null, accessToken: string | null, adminToken: string | null) {
        this.nekoimage_api = api;
        this.nekoimage_access_token = accessToken;
        this.nekoimage_admin_token = adminToken;
    }
}
