<template>
  <div class="q-dialog-upload">
    <div class="q-dialog-upload-bottom">
      <div class="q-dialog-upload-bottom-left">
        <ui-icon-button class="q-dialog-upload-bottom-button" icon="arrow_back_ios" @click="changeComponent">
        </ui-icon-button>
        <span class="upload-text">
          {{
            uploadStore.isUploading
              ? `${(uploadStore.uploadProgress * 100).toFixed(0)}% Uploading (${uploadStore.finishedTasksCount} / ${uploadStore.totalTasksCount})`
              : 'Upload New Images'
          }}
        </span>
      </div>
      <div class="q-dialog-upload-bottom-right">
        <ui-button
          :disabled="uploadStore.isUploading"
          class="q-dialog-upload-select-add"
          icon="upload"
          @click="startUpload"
        >
          Upload
        </ui-button>
      </div>
    </div>
    <div class="q-dialog-upload-select">
      <div class="q-dialog-upload-select-left">
        <ui-button class="q-dialog-upload-select-add" raised @click="handleUploadFile">Add File</ui-button>
        <ui-button class="q-dialog-upload-select-add2" raised @click="handleUploadFolder">Add Folder</ui-button>
      </div>
      <div class="q-dialog-upload-select-right">
        <complex-button
          v-if="uploadStore.globalLikeSwitch"
          :disabled="!uploadStore.queue.some((e) => e.selected)"
          :title="LikeTitle"
          icon="image"
          secondIcon="favorite"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.starred = true) : e.starred))"
          @contextmenu.prevent="uploadStore.globalLikeSwitch = !uploadStore.globalLikeSwitch"
        >
        </complex-button>
        <complex-button
          v-if="!uploadStore.globalLikeSwitch"
          :disabled="!uploadStore.queue.some((e) => e.selected)"
          :title="DisLikeTitle"
          icon="image"
          secondIcon="favorite_border"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.starred = false) : e.starred))"
          @contextmenu.prevent="uploadStore.globalLikeSwitch = !uploadStore.globalLikeSwitch"
        >
        </complex-button>
        <complex-button
          v-if="uploadStore.globalSkipOcrSwitch"
          :disabled="!uploadStore.queue.some((e) => e.selected)"
          :title="SkipOcrTitle"
          icon="image"
          secondIcon="font_download"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.skipOcr = false) : e.skipOcr))"
          @contextmenu.prevent="uploadStore.globalSkipOcrSwitch = !uploadStore.globalSkipOcrSwitch"
        ></complex-button>
        <complex-button
          v-if="!uploadStore.globalSkipOcrSwitch"
          :disabled="!uploadStore.queue.some((e) => e.selected)"
          :title="DisSkipOcrTitle"
          icon="image"
          secondIcon="font_download_off"
          @click="uploadStore.queue.forEach((e) => (e.selected ? (e.skipOcr = true) : e.skipOcr))"
          @contextmenu.prevent="uploadStore.globalSkipOcrSwitch = !uploadStore.globalSkipOcrSwitch"
        ></complex-button>
        <complex-button
          :disabled="!uploadStore.queue.some((e) => e.selected)"
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
          <ui-dialog-title>Enter Categories of selection</ui-dialog-title>
          <ui-dialog-content>
            <ui-textfield v-model="uploadStore.categoriesDialogContent"> Categories</ui-textfield>
          </ui-dialog-content>
          <ui-dialog-actions></ui-dialog-actions>
        </ui-dialog>
        <ui-icon-button icon="done_all" @click="uploadStore.queue.forEach((e) => (e.selected = true))"></ui-icon-button>
        <ui-icon-button
          icon="remove_done"
          @click="uploadStore.queue.forEach((e) => (e.selected = false))"
        ></ui-icon-button>
        <ui-icon-button icon="playlist_remove" @click="uploadStore.queue = []"></ui-icon-button>
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
                {{ item.categories === '' ? 'Uncategorized' : '#' + item.categories }}
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
      There are currently no upload tasks...
    </div>
    <ui-dialog v-model="uploadStore.errorDialogOpen" fullscreen>
      <ui-dialog-title>🤯Error</ui-dialog-title>
      <ui-dialog-content> {{ uploadStore.errorDialogContent }}</ui-dialog-content>
      <ui-dialog-actions>
        <ui-button @click="uploadStore.errorDialogOpen = false">OK</ui-button>
      </ui-dialog-actions>
    </ui-dialog>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import { EnvAdapter } from '../adapter/EnvAdapter';
import SearchWindow from '../views/searchWindow.vue';
import complexButton from '../components/utils/complexButton.vue';
import { UploadService } from '../services/search/UploadService';
import { UploadTask, UploadTaskStatus } from '../models/search/UploadTaskModel';
import { useUploadStore } from '../states/uploadWindowState';
import { useMainStore } from '../states/mainWindowState';
import { humanReadableBytes } from '../utils/StringUtils';
import { handleCatchError } from '../utils/handleCatchError';

const mainWindowStore = useMainStore();
const uploadStore = useUploadStore();

const LikeTitle = 'Right-click me to switch dislike!';
const DisLikeTitle = 'Right-click me to switch like!';
const SkipOcrTitle = 'Right-click me to switch skip OCR!';
const DisSkipOcrTitle = 'Right-click me to switch not skip OCR!';

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
    uploadStore.errorDialogContent = '=w= Please select the file to upload!';
    uploadStore.errorDialogOpen = true;
    return;
  }
  uploadStore.totalTasksCount = queue.length;
  uploadStore.uploadService = new UploadService(queue, 4, uploadServiceCallback);
  uploadStore.uploadService
    .upload()
    .then(() => {
      uploadStore.isUploading = false;
      uploadStore.uploadEndDialogOpen = true;
    })
    .catch((e) => {
      uploadStore.errorDialogContent = handleCatchError(e);
      uploadStore.errorDialogOpen = true;
    });
};

defineComponent({
  name: 'uploadWindow'
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
}

.q-dialog-upload-list-scroller {
  height: 100%;
}
</style>
