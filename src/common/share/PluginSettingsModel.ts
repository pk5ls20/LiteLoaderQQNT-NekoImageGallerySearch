export class pluginSettingsModel {
  public nekoimage_api: string;
  public nekoimage_access_token: string;
  public nekoimage_admin_token: string;
  public nekoimage_lang: 'en-US' | 'zh-CN';
  public nekoimage_pic_subtype: 0 | 1;

  constructor(
    api: string,
    accessToken: string,
    adminToken: string,
    lang: 'en-US' | 'zh-CN' = 'en-US',
    picSubtype: 0 | 1 = 0
  ) {
    this.nekoimage_api = api;
    this.nekoimage_access_token = accessToken;
    this.nekoimage_admin_token = adminToken;
    this.nekoimage_lang = lang;
    this.nekoimage_pic_subtype = picSubtype;
  }
}
