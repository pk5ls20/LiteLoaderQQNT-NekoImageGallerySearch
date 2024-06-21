import { EnvAdapter } from '../adapter/EnvAdapter';
import { fetchStatus } from '../models/searchWindowEnum';
import { useSearchStore } from '../states/searchWindowState';

export const handleCatchError = (e: any) => {
  let errorMsg = '';
  errorMsg += `${e.toString()}\n`;
  if (e && e.isAxiosError && e.response && e.response.status && e.response.data) {
    errorMsg += `${JSON.stringify(e.response.data)}\n`;
  } else if ('stack' in e) {
    errorMsg += `${e.stack.toString()}\n`;
  } else {
    errorMsg += `${e.toString()}\n`;
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
