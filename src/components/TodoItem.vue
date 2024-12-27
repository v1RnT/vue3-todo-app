<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { Todo } from '@/types/Todo'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  (event: 'delete'): void
  (event: 'update', updatedTodo: Todo): void
}>()

const editing: Ref<boolean> = ref(false)
const titleField: Ref<HTMLInputElement | null> = ref(null)
const newTitle: Ref<string> = ref(props.todo.title)

const startEditing = async () => {
  newTitle.value = props.todo.title
  editing.value = true

  await nextTick()

  if (titleField.value) {
    titleField.value.focus()
  }
}

const rename = () => {
  if (!editing.value) return

  editing.value = false

  if (newTitle.value === props.todo.title) {
    return
  }

  if (!newTitle.value) {
    emit('delete')
    return
  }

  emit('update', { ...props.todo, title: newTitle.value })
}
</script>

<template>
  <div class="todo" :class="{ completed: todo.completed }">
    <label class="todo__status-label">
      <input
        type="checkbox"
        class="todo__status"
        :checked="todo.completed"
        @change="emit('update', { ...todo, completed: !todo.completed })"
      />
    </label>

    <form v-if="editing" @submit.prevent="rename">
      <input
        ref="titleField"
        @keyup.escape="editing = false"
        class="todo__title-field"
        placeholder="Empty todo will be deleted"
        v-model.trim="newTitle"
        @blur="rename"
      />
    </form>

    <template v-else>
      <span class="todo__title" @dblclick="startEditing">{{ todo.title }}</span>
      <button type="button" class="todo__remove" @click="emit('delete')">×</button>
    </template>

    <div class="modal overlay" :class="{ 'is-active': false }">
      <div class="modal-background has-background-white-ter"></div>
      <div class="loader"></div>
    </div>
  </div>
</template>
