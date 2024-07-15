import { ipcMain } from 'electron';
import * as channel from '../common/channels';
import { TriggerImageRegisterName } from '../common/share/triggerImageRegisterName';
import { log } from '../common/share/logs';
import { fileTypeFromBuffer } from 'file-type';
import { ImgObject } from '../common/imgObject';

ipcMain.on(
  channel.POST_APP_IMAGE_SEARCH_REQ,
  async (event, file_buffer: Uint8Array | null, registerNum: TriggerImageRegisterName): Promise<void> => {
    // In the current situation, both the channel sending the signal and the channel receiving the signal
    // are within the same window (i.e., the main NTQQ chat window), so the signal can be sent directly
    // calculate mine type
    if (!file_buffer) {
      log.debug('No file buffer received');
      return;
    }
    const type = await fileTypeFromBuffer(file_buffer);
    event.sender.send(channel.POST_APP_IMAGE_SEARCH_RES, file_buffer, type?.mime ?? 'image/png', registerNum);
  }
);

ipcMain.on(channel.ADD_UPLOAD_FILE_REQ, (event, imgList: ImgObject[]) => {
  event.sender.send(channel.ADD_UPLOAD_FILE_RES, imgList);
});
