// @ts-ignore
import { pluginSettingsModel as PSM } from '../../common/share/PluginSettingsModel';
// @ts-ignore
import { log as L } from '../../common/share/logs';

export namespace sharedAdapter {
  export const PluginSettingsModel = PSM;
  export type PluginSettingsModelType = PSM;
  export const Log = L;
  export type LogType = typeof L;
}
