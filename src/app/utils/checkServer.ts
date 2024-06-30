import { EnvAdapter } from '../adapter/EnvAdapter';
import { serverStatus } from '../models/search/SearchWindowEnum';
import { handleCatchError } from './handleCatchError';
import { WelcomeApi } from '../services/search/WelcomeApi';
import type { HomeApiResponse } from '../models/search/HomeApiResponse';

type CheckServerResult = {
  status: serverStatus;
  message: string;
  raw?: HomeApiResponse;
};

export const checkServer = async (endpoint: string): Promise<CheckServerResult> => {
  EnvAdapter.log('Start to checkServer...');
  if (endpoint === '') {
    return {
      status: serverStatus.DISCONNECTED,
      message: 'Server endpoint is empty.'
    };
  }
  try {
    const data = await WelcomeApi();
    const isAuthPass = !data.authorization?.required || data.authorization.passed;
    return {
      status: isAuthPass ? serverStatus.CONNECTED : serverStatus.UNAUTHORIZED,
      message: JSON.stringify(data),
      raw: data
    };
  } catch (error) {
    return {
      status: serverStatus.DISCONNECTED,
      message: handleCatchError(error)
    };
  }
};
