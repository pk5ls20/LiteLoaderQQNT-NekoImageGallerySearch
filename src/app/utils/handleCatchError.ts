import { EnvAdapter } from '../adapter/EnvAdapter';
import { fetchStatus } from '../models/search/SearchWindowEnum';
import { useSearchStore } from '../states/searchWindowState';
import { useUploadStore } from '../states/uploadWindowState';
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

export const displaySearchErrorDialog = (e: any) => {
  const searchStore = useSearchStore();
  searchStore.isFetchError = true;
  searchStore.fetchingStatus = fetchStatus.NONE;
  searchStore.fetchErrorMsg = handleCatchError(e);
};

export const displayUploadErrorDialog = (message: string) => {
  const uploadStore = useUploadStore();
  uploadStore.errorDialogContent = handleCatchError(message);
  uploadStore.errorDialogOpen = true;
};
