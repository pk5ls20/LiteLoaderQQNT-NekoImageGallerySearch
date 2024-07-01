<template>
  <div class="q-dialog-upload">
    <div class="q-dialog-upload-bottom">
      <div class="q-dialog-upload-bottom-left">
        <ui-icon-button class="q-dialog-upload-bottom-button" icon="arrow_back_ios" @click="changeComponent">
        </ui-icon-button>
        <span class="upload-text">
          {{
            uploadStore.isUploading
              ? `${(uploadStore.uploadProgress * 100).toFixed(0)}% ${$t('upload.uploadWindow.windowTitleUploadTip')} (${uploadStore.finishedTasksCount} / ${uploadStore.totalTasksCount})`
              : $t('upload.uploadWindow.windowTitleNotUploadTip')
          }}
        </span>
      </div>
      <div class="q-dialog-upload-bottom-right">
        <ui-button :disabled="isUINotAvailable" class="q-dialog-upload-select-add" icon="upload" @click="startUpload">
          {{ $t('upload.uploadWindow.uploadButtonTitle') }}
        </ui-button>
      </div>
    </div>
    <div class="q-dialog-upload-select">
      <div class="q-dialog-upload-select-left">
        <ui-button :disabled="isUINotAvailable" class="q-dialog-upload-select-add" raised @click="handleUploadFile">
          {{ $t('upload.uploadWindow.addFile') }}
        </ui-button>
        <ui-button :disabled="isUINotAvailable" class="q-dialog-upload-select-add2" raised @click="handleUploadFolder">
          {{ $t('upload.uploadWindow.addFolder') }}
        </ui-button>
      </div>
      <div class="q-dialog-upload-select-right">
        <complex-button
          v-if="uploadStore.globalLikeSwitch"
          :disabled="isUINotAvailable || !uploadStore.queue.some((e) => e.selected)"
          :title="$t('upload.uploadWindow.likeTitle')"
          icon="image"
          secondIcon="favorite"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.starred = true) : e.starred))"
          @contextmenu.prevent="uploadStore.globalLikeSwitch = !uploadStore.globalLikeSwitch"
        >
        </complex-button>
        <complex-button
          v-if="!uploadStore.globalLikeSwitch"
          :disabled="isUINotAvailable || !uploadStore.queue.some((e) => e.selected)"
          :title="$t('upload.uploadWindow.disLikeTitle')"
          icon="image"
          secondIcon="favorite_border"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.starred = false) : e.starred))"
          @contextmenu.prevent="uploadStore.globalLikeSwitch = !uploadStore.globalLikeSwitch"
        >
        </complex-button>
        <complex-button
          v-if="uploadStore.globalSkipOcrSwitch"
          :disabled="isUINotAvailable || !uploadStore.queue.some((e) => e.selected)"
          :title="$t('upload.uploadWindow.skipOcrTitle')"
          icon="image"
          secondIcon="font_download"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.skipOcr = false) : e.skipOcr))"
          @contextmenu.prevent="uploadStore.globalSkipOcrSwitch = !uploadStore.globalSkipOcrSwitch"
        ></complex-button>
        <complex-button
          v-if="!uploadStore.globalSkipOcrSwitch"
          :disabled="isUINotAvailable || !uploadStore.queue.some((e) => e.selected)"
          :title="$t('upload.uploadWindow.notSkipOcrTitle')"
          icon="image"
          secondIcon="font_download_off"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.skipOcr = true) : e.skipOcr))"
          @contextmenu.prevent="uploadStore.globalSkipOcrSwitch = !uploadStore.globalSkipOcrSwitch"
        ></complex-button>
        <complex-button
          :disabled="isUINotAvailable || !uploadStore.queue.some((e) => e.selected)"
          icon="image"
          secondIcon="add_to_photos"
          @click="uploadStore.categoriesDialogOpen = true"
        ></complex-button>
        <ui-dialog
          v-model="uploadStore.categoriesDialogOpen"
          @confirm="
            uploadStore.queue.forEach(
              (e) => (e.categories = e.selected ? uploadStore.categoriesDialogContent : e.categories)
            )
          "
        >
          <ui-dialog-title>{{ $t('upload.uploadWindow.categoriesDialogTitle') }}</ui-dialog-title>
          <ui-dialog-content>
            <ui-textfield v-model="uploadStore.categoriesDialogContent">
              {{ $t('upload.uploadWindow.categoriesDialogContent') }}
            </ui-textfield>
          </ui-dialog-content>
          <ui-dialog-actions></ui-dialog-actions>
        </ui-dialog>
        <ui-icon-button
          :disabled="isUINotAvailable"
          icon="done_all"
          @click="uploadStore.queue.forEach((e) => (e.selected = true))"
        >
        </ui-icon-button>
        <ui-icon-button
          icon="remove_done"
          @click="uploadStore.queue.forEach((e) => (e.selected = false))"
          :disabled="isUINotAvailable"
        ></ui-icon-button>
        <ui-icon-button
          :disabled="isUINotAvailable"
          icon="playlist_remove"
          @click="uploadStore.queue.splice(0, uploadStore.queue.length)"
        ></ui-icon-button>
      </div>
    </div>
    <UiProgress :buffer="1" :progress="uploadStore.uploadProgress" class="q-dialog-upload-divider" />
    <ui-list v-if="uploadStore.queue.length" :type="2" class="q-dialog-upload-list">
      <RecycleScroller
        :item-size="60"
        :items="uploadStore.queue"
        class="q-dialog-upload-list-scroller"
        key-field="id"
        minItemSize="100"
      >
        <template #default="{ item }">
          <ui-item :title="`${item.file.name} ${humanReadableBytes(item.file.size)}`">
            <ui-checkbox v-model="item.selected" @click.stop></ui-checkbox>
            <!-- //TODO: color chips -->
            <ui-chips
              v-if="item.errorText !== ''"
              :options="[
                {
                  label: item.errorText,
                  value: 0
                }
              ]"
              type="0"
            ></ui-chips>
            <ui-item-text-content>
              <ui-item-text1>{{ item.file.name }}</ui-item-text1>
              <ui-item-text2>
                {{ item.categories === '' ? $t('upload.uploadWindow.uncategorizedTip') : '#' + item.categories }}
              </ui-item-text2>
            </ui-item-text-content>
            <ui-item-last-content>{{ humanReadableBytes(item.file.size) }}</ui-item-last-content>
            <ui-icon-button
              v-if="!item.starred"
              icon="favorite_border"
              @click="item.starred = !item.starred"
            ></ui-icon-button>
            <ui-icon-button v-if="item.starred" icon="favorite" @click="item.starred = !item.starred"></ui-icon-button>
            <ui-icon-button
              v-if="!item.skipOcr"
              icon="font_download"
              @click="item.skipOcr = !item.skipOcr"
            ></ui-icon-button>
            <ui-icon-button
              v-if="item.skipOcr"
              icon="font_download_off"
              @click="item.skipOcr = !item.skipOcr"
            ></ui-icon-button>
          </ui-item>
        </template>
      </RecycleScroller>
    </ui-list>
    <div v-if="!uploadStore.queue.length" v-ripple class="q-dialog-upload-list-none">
      {{ isUINotAvailable ? $t('upload.uploadWindow.adminUnavailableTip') : $t('upload.uploadWindow.noUploadTaskTip') }}
    </div>
    <ui-dialog v-model="uploadStore.errorDialogOpen">
      <ui-dialog-title>🤯{{ $t('upload.uploadWindow.errorDialogTitle') }}</ui-dialog-title>
      <ui-dialog-content> {{ uploadStore.errorDialogContent }}</ui-dialog-content>
      <ui-dialog-actions>
        <ui-button @click="uploadStore.errorDialogOpen = false">OK</ui-button>
      </ui-dialog-actions>
    </ui-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed, defineComponent, onMounted } from 'vue';
import { EnvAdapter } from '../adapter/EnvAdapter';
import SearchWindow from '../views/searchWindow.vue';
import complexButton from '../components/utils/complexButton.vue';
import { UploadService } from '../services/search/UploadService';
import { UploadTask, UploadTaskStatus } from '../models/search/UploadTaskModel';
import { useUploadStore } from '../states/uploadWindowState';
import { useMainStore } from '../states/mainWindowState';
import { useSearchStore } from '../states/searchWindowState';
import { humanReadableBytes } from '../utils/StringUtils';
import { handleCatchError } from '../utils/handleCatchError';

const mainWindowStore = useMainStore();
const searchStore = useSearchStore();
const uploadStore = useUploadStore();
const { t } = useI18n();

const isUINotAvailable = computed(() => uploadStore.isUploading || !searchStore.serverAdminAvailable);

const changeComponent = () => {
  mainWindowStore.mainWindowShowMark = false;
  mainWindowStore.mainWindowUseCSSAnimate = true;
  mainWindowStore.mainWindowActiveComponent = SearchWindow;
};

const handleUploadFile = () => {
  EnvAdapter.UploadAddFileService()
    .selectFiles()
    .then((file: File[]) => {
      uploadStore.queue.push(...file.map((f) => new UploadTask(f)));
    })
    .catch((e) => {
      uploadStore.errorDialogContent = handleCatchError(e);
      uploadStore.errorDialogOpen = true;
    });
};

const handleUploadFolder = () => {
  EnvAdapter.UploadAddFileService()
    .selectDirectory()
    .then((file: File[]) => {
      uploadStore.queue.push(...file.map((f) => new UploadTask(f)));
    })
    .catch((e) => {
      uploadStore.errorDialogContent = handleCatchError(e);
      uploadStore.errorDialogOpen = true;
    });
};

const uploadServiceCallback = () => {
  const queue = uploadStore.uploadService.queue;
  uploadStore.finishedTasksCount = uploadStore.uploadService.finishedTasksCount;
  uploadStore.errorTasksCount = uploadStore.uploadService.errorTasksCount;
  uploadStore.duplicateTasksCount = uploadStore.uploadService.duplicateTasksCount;
  uploadStore.queue = queue.filter((t) => t.status !== UploadTaskStatus.Complete);
};

const startUpload = () => {
  uploadStore.isUploading = true;
  const queue = uploadStore.queue
    .filter((t) => t.status === UploadTaskStatus.Pending || t.status === UploadTaskStatus.Error)
    .map((t) => ({ ...t, status: UploadTaskStatus.Pending }));
  if (queue.length === 0) {
    uploadStore.isUploading = false;
    uploadStore.errorDialogContent = t('upload.uploadWindow.errorDialogNoFileContent');
    uploadStore.errorDialogOpen = true;
    return;
  }
  uploadStore.totalTasksCount = queue.length;
  uploadStore.uploadService = new UploadService(queue, 4, uploadServiceCallback);
  uploadStore.uploadService
    .upload()
    .then(() => {
      uploadStore.isUploading = false;
      uploadStore.uploadSnackbarContent = t('upload.uploadConfirmSnackbar.snackbarContent', [
        uploadStore.finishedTasksCount,
        uploadStore.duplicateTasksCount,
        uploadStore.errorTasksCount
      ]);
      uploadStore.uploadSnackbarOpen = true;
    })
    .catch((e) => {
      uploadStore.errorDialogContent = handleCatchError(e);
      uploadStore.errorDialogOpen = true;
    });
};

defineComponent({
  name: 'uploadWindow'
});

onMounted(() => {
  EnvAdapter.log('uploadWindow mounted');
  uploadStore.markMounted();
});
</script>

<style scoped>
.q-dialog-upload-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.q-dialog-upload-bottom-left {
  display: flex;
  align-items: center;
}

.q-dialog-upload-bottom-button {
  margin-right: 10px;
}

.q-dialog-upload-select {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-left: 25px;
}

.q-dialog-upload-select-left {
  margin-top: 10px;
}

.q-dialog-upload-select-add {
  margin-right: 10px;
}

.q-dialog-upload-divider {
  margin-top: 20px;
}

.q-dialog-upload-list {
  height: 400px;
  overflow-y: auto;
}

.q-dialog-upload-list-none {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: rgba(29, 30, 30, 0.21);
}

.q-dialog-upload-list-scroller {
  height: 100%;
}
</style>
