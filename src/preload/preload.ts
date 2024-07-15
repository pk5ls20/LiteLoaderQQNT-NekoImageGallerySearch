import { contextBridge } from 'electron';
import * as channel from '../common/channels';
import * as settings from './settings';
import * as fs from './fs';
import * as nekoSync from './nekoSync';
import * as misc from './misc';
import * as callNative from './callNative';

const imageSearch = {
  ...settings,
  ...fs,
  ...nekoSync,
  ...misc,
  ...callNative
};

contextBridge.exposeInMainWorld(channel.API_KEY, imageSearch);
