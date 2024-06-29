import { EnvAdapter } from '../adapter/EnvAdapter';
import { serverStatus } from '../models/search/SearchWindowEnum';
import { handleCatchError } from './handleCatchError';
import { WelcomeApi } from '../services/search/WelcomeApi';

type CheckServerResult = {
  status: serverStatus;
  message: string;
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
      message: JSON.stringify(data)
    };
  } catch (error) {
    return {
      status: serverStatus.DISCONNECTED,
      message: handleCatchError(error)
    };
  }
};
