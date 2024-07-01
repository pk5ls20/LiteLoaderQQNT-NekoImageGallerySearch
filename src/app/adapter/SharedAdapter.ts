// @ts-ignore
import { pluginSettingsModel as PSM } from '../../common/share/PluginSettingsModel';
import { log as L } from '../../common/share/logs';
import { TriggerImageRegisterName as TIRN } from '../../common/share/triggerImageRegisterName';
import { generateUUID as G } from '../../common/share/uuidGenerate';

export namespace sharedAdapter {
  export const PluginSettingsModel = PSM;
  export type PluginSettingsModelType = PSM;
  export const Log = L;
  export type LogType = typeof L;
  export const TriggerImageRegisterName = TIRN;
  export type TriggerImageRegisterNameType = typeof TIRN;
  export const generateUUID = G;
  export type generateUUID = typeof G;
}
