<!-- reference: https://github.com/Simon-He95/vue3-progressive-images/tree/main/src -->
<template>
  <img :alt="alt" :class="`progressive-image ${isLoaded ? 'loaded' : 'loading'}`" :src="src" @load="isLoaded = true" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const isLoaded = ref(false);

defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.progressive-image {
  width: 100%;
  height: auto;
  transition:
    filter 0.6s ease,
    opacity 0.6s ease;
  object-fit: cover;
  transform: translateZ(0);
}

.progressive-image.loading {
  filter: blur(3px);
  opacity: 0.5;
}

.progressive-image.loaded {
  filter: none;
  opacity: 1;
}
</style>
