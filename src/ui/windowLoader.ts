import {Ref, ref} from "vue";

const windowVisibleState: Ref<boolean> = ref(false);

const adjustVisible = (state: boolean) => {
    const nekoImageWindow = document.getElementById('search-window');
    const nekoImageMarkWindow = document.getElementById('search-mark-window');
    const nekoImageDialog = document.getElementById('search-dialog');
    if (state) {
        // windowVisibleState.value = true;
        nekoImageWindow.style.visibility = 'visible';
        nekoImageMarkWindow.style.transitionDelay = '0ms';
        nekoImageDialog.style.transitionDelay = '150ms';
        nekoImageWindow.style.opacity = '1';
        nekoImageDialog.style.transform = 'translate(0px, 0px)';
    } else {
        // windowVisibleState.value = false;
        nekoImageWindow.style.visibility = 'hidden';
        nekoImageMarkWindow.style.transitionDelay = '150ms';
        nekoImageDialog.style.transitionDelay = '0ms';
        nekoImageWindow.style.opacity = '0';
        nekoImageDialog.style.transform = 'translate(0px, -20px)';
    }
}

export {windowVisibleState, adjustVisible};