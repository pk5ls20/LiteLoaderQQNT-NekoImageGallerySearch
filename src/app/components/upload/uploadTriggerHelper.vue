<script lang="ts" setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { type MimeType } from 'file-type';
import { EnvAdapter } from '../../adapter/EnvAdapter';
import { sharedAdapter } from '../../adapter/SharedAdapter';
import { displayUploadErrorDialog } from '../../utils/handleCatchError';
import { useUploadStore } from '../../states/uploadWindowState';
import { useSearchStore } from '../../states/searchWindowState';
import { useMainStore } from '../../states/mainWindowState';
import { UploadTask } from '../../models/search/UploadTaskModel';
import UploadWindow from '../../views/uploadWindow.vue';

const { t } = useI18n();
const mainStore = useMainStore();
const searchStore = useSearchStore();
const uploadStore = useUploadStore();

const switchToUploadWindow = async () => {
  mainStore.mainWindowActiveComponent = UploadWindow;
  await EnvAdapter.adjustVisible(true);
};

// TODO: see src/app/states/uploadWindowState.ts
const waitAndDisplayUploadErrorDialog = async (e: any) => {
  await uploadStore.waitMounted();
  displayUploadErrorDialog(e);
};

const postAppImageSearchResCallBack = async (file_content: Uint8Array | null, file_mine: MimeType) => {
  await switchToUploadWindow();
  try {
    if (file_content === null) {
      await waitAndDisplayUploadErrorDialog(t('upload.uploadTriggerHelper.noFileContentTip'));
    } else if (!searchStore.serverAdminAvailable) {
      await waitAndDisplayUploadErrorDialog(t('upload.uploadTriggerHelper.noServerAdminTip'));
    } else {
      const uuid = await sharedAdapter.generateUUID(file_content);
      const ext = file_mine.split('/')[1];
      uploadStore.queue.push(new UploadTask(new File([file_content], `${uuid}.${ext}`)));
    }
  } catch (e: any) {
    await waitAndDisplayUploadErrorDialog(e);
  }
};

onMounted(() => {
  EnvAdapter.triggerImageService().init(
    postAppImageSearchResCallBack,
    sharedAdapter.TriggerImageRegisterName.IMAGE_UPLOAD
  );
});
</script>
