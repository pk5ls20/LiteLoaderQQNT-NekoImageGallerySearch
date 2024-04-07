import {log} from "../../logs";

export const handleCatchError = (e: any) => {
    let errorMsg = '';
    errorMsg += `${e.toString()}\n`
    if (e && e.isAxiosError && e.response && e.response.status && e.response.data) {
        errorMsg += `${JSON.stringify(e.response.data)}\n`;
    }
    else{
        errorMsg += `${e.stack.toString()}\n`;
    }
    log(errorMsg)
    return errorMsg
}