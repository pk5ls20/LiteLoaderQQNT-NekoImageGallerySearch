import { nekoMsgData } from '../common/NTQQMsgModel';
import { ipcRenderer } from 'electron';
import { log } from '../common/share/logs';

export const downloadMsgContent = async <DT extends nekoMsgData | nekoMsgData[], SDT1, SDT2, EDT1>(
  msgData: DT,
  startDownloadChannel: string,
  finishDownloadChannel: string
): Promise<{
  startDownload: { onDiskMsgContentList: SDT1[]; notOnDiskMsgContentList: SDT2[] };
  endDownload: EDT1[];
}> => {
  try {
    const downloadHandle = async () => {
      const result: { onDiskMsgContentList: SDT1[]; notOnDiskMsgContentList: SDT2[] } = await ipcRenderer.invoke(
        startDownloadChannel,
        msgData
      );
      const { onDiskMsgContentList, notOnDiskMsgContentList } = result;
      const startDownload = { onDiskMsgContentList, notOnDiskMsgContentList };
      const endDownload = await ipcRenderer.invoke(finishDownloadChannel, notOnDiskMsgContentList);
      return { startDownload, endDownload };
    };
    return downloadHandle();
  } catch (error) {
    log.error('Error retrieving forward message content:', error);
    return {
      startDownload: { onDiskMsgContentList: [], notOnDiskMsgContentList: [] },
      endDownload: []
    };
  }
};
