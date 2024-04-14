import {log} from "../../logs";
import {fetchStatus} from "../Models/searchWindowEnum";
import {useSearchStore} from "../States/searchWindowState";

export const handleCatchError = (e: any) => {
    let errorMsg = '';
    errorMsg += `${e.toString()}\n`
    if (e && e.isAxiosError && e.response && e.response.status && e.response.data) {
        errorMsg += `${JSON.stringify(e.response.data)}\n`;
    } else if ("stack" in e) {
        errorMsg += `${e.stack.toString()}\n`;
    } else {
        errorMsg += `${e.toString()}\n`;
    }
    log(errorMsg)
    return errorMsg
}

export const displayErrorDialog = (e: any) => {
    const store = useSearchStore();
    store.isFetchError = true;
    store.fetchingStatus = fetchStatus.NONE
    store.fetchErrorMsg = handleCatchError(e);
}