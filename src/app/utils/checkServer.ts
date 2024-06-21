import { EnvAdapter } from '../adapter/EnvAdapter';
import { getClient } from '../services/search/baseSearchService';
import { serverStatus } from '../models/searchWindowEnum';
import { handleCatchError } from './handleCatchError';

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
    const client = getClient();
    const response = await client.get(`${endpoint}/`);
    const data = response.data;

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
