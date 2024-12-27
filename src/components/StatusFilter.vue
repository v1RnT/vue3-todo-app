<script setup lang="ts">
import { Filter } from '@/types/Filter'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['changeStatus'])
</script>

<template>
  <nav class="filter">
    <a
      href="#/"
      class="filter__link"
      :class="{ selected: modelValue === Filter.All }"
      @click="emit('changeStatus', Filter.All)"
    >
      All
    </a>

    <a
      href="#/active"
      class="filter__link"
      :class="{ selected: modelValue === Filter.Active }"
      @click="emit('changeStatus', Filter.Active)"
    >
      Active
    </a>

    <a
      href="#/completed"
      class="filter__link"
      :class="{ selected: modelValue === Filter.Completed }"
      @click="emit('changeStatus', Filter.Completed)"
    >
      Completed
    </a>
  </nav>
</template>
