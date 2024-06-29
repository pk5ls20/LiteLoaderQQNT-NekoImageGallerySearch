<template>
  <ui-dialog v-model="store.isFilterOptionsDialogOpen">
    <ui-dialog-title>Filter Options</ui-dialog-title>
    <ui-dialog-content class="q-filter-content">
      <div class="filter-option">
        <ui-checkbox v-model="store.filterAspectRatioEnabled"></ui-checkbox>
        <label>Aspect Ratio</label>
      </div>
      <div class="q-filter-content-aspect-val">
        <ui-textfield v-if="store.filterAspectRatioEnabled" v-model="store.filterOptions.preferred_ratio" required>
          Preferred Aspect Ratio
        </ui-textfield>
        <ui-textfield v-if="store.filterAspectRatioEnabled" v-model="store.filterOptions.ratio_tolerance" required>
          Ratio tolerance
        </ui-textfield>
      </div>
      <div class="filter-option">
        <ui-checkbox v-model="store.minSizeEnabled"></ui-checkbox>
        <label>Min Size</label>
      </div>
      <div class="q-filter-content-min-size-val">
        <ui-textfield v-if="store.minSizeEnabled" v-model="store.filterOptions.min_width" required
          >Min Width
        </ui-textfield>
        <ui-textfield v-if="store.minSizeEnabled" v-model="store.filterOptions.min_height" required>
          Min Height
        </ui-textfield>
      </div>
      <div class="filter-option">
        <ui-checkbox v-model="store.filterOptions.starred"></ui-checkbox>
        <label>Starred Only</label>
      </div>
      <div class="filter-option">
        <ui-checkbox v-model="store.categoriesEnabled"></ui-checkbox>
        <label>Categories</label>
      </div>
      <div class="q-filter-content-categories-val">
        <ui-textfield
          v-if="store.categoriesEnabled"
          v-model="store.filterOptions.categories"
          class="q-filter-content-categories-text"
        >
          Separate by comma
        </ui-textfield>
      </div>
      <div class="filter-option">
        <ui-checkbox v-model="store.negativeCategoriesEnabled"></ui-checkbox>
        <label>Negative Categories</label>
      </div>
      <div class="q-filter-content-negative-categories-val">
        <ui-textfield
          v-if="store.negativeCategoriesEnabled"
          v-model="store.filterOptions.categories_negative"
          class="q-filter-content-negative-categories-text"
        >
          Separate by comma
        </ui-textfield>
      </div>
    </ui-dialog-content>
    <ui-dialog-actions></ui-dialog-actions>
  </ui-dialog>
</template>

<script lang="ts" setup>
import { useSearchStore } from '../../states/searchWindowState';

const store = useSearchStore();
</script>

<style scoped>
.q-filter-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 500px;
}

.filter-option {
  display: flex;
  align-items: center;
  margin: 2px 0;
}

.q-filter-content-categories-text,
.q-filter-content-negative-categories-text {
  width: 100%;
}

label {
  margin-left: 3px;
}
</style>
