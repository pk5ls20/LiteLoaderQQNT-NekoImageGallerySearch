import { defineStore } from 'pinia';
import { type UploadTask } from '../models/search/UploadTaskModel';
import { UploadService } from '../services/search/UploadService';

export const useUploadStore = defineStore('upload', {
  state: () => ({
    queue: [] as UploadTask[],
    uploadService: new UploadService([]) as UploadService,
    isUploading: false as boolean,
    totalTasksCount: 0 as number,
    finishedTasksCount: 0 as number,
    errorTasksCount: 0 as number,
    duplicateTasksCount: 0 as number,
    categoriesDialogOpen: false as boolean,
    categoriesDialogContent: '' as string,
    globalLikeSwitch: true as boolean,
    globalSkipOcrSwitch: true as boolean,
    errorDialogOpen: false as boolean,
    errorDialogContent: '' as string,
    uploadEndDialogOpen: false as boolean
  }),
  getters: {
    progressColor: (state) => {
      if (state.errorTasksCount > 0) {
        return 'red';
      } else if (state.duplicateTasksCount > 0) {
        return 'yellow';
      } else {
        return 'green';
      }
    },
    uploadProgress: (state) => {
      // from 0 to 1
      if (state.isUploading) {
        return state.totalTasksCount ? parseFloat((state.finishedTasksCount / state.totalTasksCount).toFixed(2)) : 0;
      }
      return 0;
    }
  }
});
