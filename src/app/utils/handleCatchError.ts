import { EnvAdapter } from '../adapter/EnvAdapter';
import { fetchStatus } from '../models/search/SearchWindowEnum';
import { useSearchStore } from '../states/searchWindowState';
import { AxiosError, AxiosResponse } from 'axios';

export const handleCatchError = (e: AxiosError | Error | unknown) => {
  let errorMsg = '';
  errorMsg += `${e?.toString()}\n`;
  if (
    e &&
    (e as AxiosError).isAxiosError &&
    (e as AxiosError).response &&
    ((e as AxiosError).response as AxiosResponse).status &&
    ((e as AxiosError).response as AxiosResponse).data
  ) {
    errorMsg += `${JSON.stringify(((e as AxiosError).response as AxiosResponse).data)}\n`;
  } else if ((e as Error).stack) {
    errorMsg += `${(e as Error).stack?.toString()}\n`;
  }
  EnvAdapter.log(errorMsg);
  return errorMsg;
};

export const displayErrorDialog = (e: any) => {
  const store = useSearchStore();
  store.isFetchError = true;
  store.fetchingStatus = fetchStatus.NONE;
  store.fetchErrorMsg = handleCatchError(e);
};
