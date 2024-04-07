import {Ref, ref} from "vue";

export const windowVisibleState: Ref<boolean> = ref(false);

export const adjustVisible = (state: boolean) => {
    const nekoImageWindow = document.getElementById('search-window');
    const nekoImageMarkWindow = document.getElementById('search-mark-window');
    const nekoImageDialog = document.getElementById('search-dialog');
    if (state) {
        nekoImageWindow.style.visibility = 'visible';
        nekoImageMarkWindow.style.transitionDelay = '0ms';
        nekoImageDialog.style.transitionDelay = '150ms';
        nekoImageWindow.style.opacity = '1';
        nekoImageDialog.style.transform = 'translate(0px, 0px)';
    } else {
        nekoImageWindow.style.visibility = 'hidden';
        nekoImageMarkWindow.style.transitionDelay = '150ms';
        nekoImageDialog.style.transitionDelay = '0ms';
        nekoImageWindow.style.opacity = '0';
        nekoImageDialog.style.transform = 'translate(0px, -20px)';
    }
}
