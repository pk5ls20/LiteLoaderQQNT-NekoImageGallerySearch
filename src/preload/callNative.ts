import { nekoMsgData } from '../common/NTQQMsgModel';
import { ipcRenderer } from 'electron';
import { log } from '../common/share/logs';

export const downloadMsgContent = async <
  DT extends nekoMsgData | nekoMsgData[],
  SDT1 extends unknown,
  SDT2 extends unknown,
  EDT1 extends unknown
>(
  msgData: DT,
  startDownloadChannel: string,
  finishDownloadChannel: string
): Promise<{
  startDownload: Promise<Awaited<{ onDiskMsgContentList: SDT1[]; notOnDiskMsgContentList: SDT2[] }>>;
  endDownload: Promise<EDT1[]>;
}> => {
  try {
    const downloadHandle = async () => {
      // log.debug('Downloading forward message content:', msgData);
      const result: { onDiskMsgContentList: SDT1[]; notOnDiskMsgContentList: SDT2[] } = await ipcRenderer.invoke(
        startDownloadChannel,
        msgData
      );
      // log.debug('Downloaded forward message content:', result);
      const onDiskMsgContentList: SDT1[] = result.onDiskMsgContentList;
      const notOnDiskMsgContentList: SDT2[] = result.notOnDiskMsgContentList;
      const startDownload: Promise<Awaited<{ onDiskMsgContentList: SDT1[]; notOnDiskMsgContentList: SDT2[] }>> =
        Promise.resolve({
          onDiskMsgContentList,
          notOnDiskMsgContentList
        });
      // log.debug(
      //   'Downloaded forward message content:',
      //   'on disk:',
      //   onDiskMsgContentList,
      //   'not on disk',
      //   notOnDiskMsgContentList
      // );
      const endDownload: Promise<EDT1[]> = ipcRenderer.invoke(finishDownloadChannel, notOnDiskMsgContentList);
      return { startDownload, endDownload };
    };
    return downloadHandle();
  } catch (error) {
    log.error('Error retrieving forward message content:', error);
    return {
      startDownload: Promise.reject(error),
      endDownload: Promise.reject([])
    };
  }
};
