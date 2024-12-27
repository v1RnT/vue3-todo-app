<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StatusFilter from './components/StatusFilter.vue'
import TodoItem from './components/TodoItem.vue'
import Message from './components/MessageUs.vue'
import * as todoApi from './api/todos'
import type { Todo } from '@/types/Todo'
import { Filter } from './types/Filter'
import { Errors } from './types/Errors'

const todos = ref<Todo[]>([])
const title = ref<string>('')
const errorMessage = ref<string>(Errors.Default)
const status = ref<Filter>(Filter.All)

onMounted(async () => {
  try {
    todos.value = await todoApi.getTodos()
  } catch {
    errorMessage.value = Errors.LoadingTodos
  }
})

const activeTodos = computed(() => todos.value.filter((todo) => !todo.completed))

const visibleTodos = computed(() => {
  if (status.value === Filter.Active) {
    return activeTodos.value
  }
  if (status.value === Filter.Completed) {
    return todos.value.filter((todo) => todo.completed)
  }
  return todos.value
})

const addTodo = async () => {
  if (!title.value.trim()) {
    errorMessage.value = Errors.EmptyTitle
    return
  }

  try {
    const newTodo = await todoApi.postTodo({
      userId: todoApi.USER_ID,
      title: title.value.trim(),
      completed: false,
    })
    todos.value.push(newTodo)
    title.value = ''
  } catch {
    errorMessage.value = Errors.AddTodo
  }
}

const deleteTodo = async (id: number) => {
  try {
    await todoApi.deleteTodo(id)
    todos.value = todos.value.filter((todo) => todo.id !== id)
  } catch {
    errorMessage.value = Errors.DeleteTodo
  }
}

const updateTodo = async (updatedData: Partial<Todo> & { id: number }) => {
  const { id, ...updateProps } = updatedData

  try {
    const updatedTodo = await todoApi.patchTodo(updateProps, id)

    const currentTodo = todos.value.find((todo) => todo.id === id)
    if (currentTodo) {
      Object.assign(currentTodo, updatedTodo)
    }
  } catch {
    errorMessage.value = Errors.UpdateTodo
  }
}

const handleToggleCompleted = (id: number, updateData: { completed: boolean }) => {
  return todoApi.patchTodo({ ...updateData }, id)
}

const handleToggleCompletedAll = () => {
  const allCompleted = todos.value.every((todo) => todo.completed)

  if (!allCompleted) {
    Promise.allSettled(todos.value.map(({ id }) => handleToggleCompleted(id, { completed: true })))
      .then(() => {
        todos.value = todos.value.map((todo) => ({ ...todo, completed: true }))
      })
      .catch(() => {
        errorMessage.value = Errors.UpdateTodo
      })
  } else {
    Promise.allSettled(todos.value.map(({ id }) => handleToggleCompleted(id, { completed: false })))
      .then(() => {
        todos.value = todos.value.map((todo) => ({ ...todo, completed: false }))
      })
      .catch(() => {
        errorMessage.value = Errors.UpdateTodo
      })
  }
}

const clearCompletedTodos = async () => {
  const completedTodos = todos.value.filter((todo) => todo.completed)

  try {
    await Promise.all(completedTodos.map((todo) => todoApi.deleteTodo(todo.id)))

    todos.value = todos.value.filter((todo) => !todo.completed)
  } catch {
    errorMessage.value = Errors.DeleteTodo
  }
}
</script>

<template>
  <div class="todoapp">
    <h1 class="todoapp__title">todos {{ todos.length > 0 ? todos.length : '' }}</h1>

    <div class="todoapp__content">
      <header class="todoapp__header">
        <button
          v-if="todos.length > 0"
          type="button"
          class="todoapp__toggle-all"
          :class="{ active: activeTodos.length === 0 }"
          @click="handleToggleCompletedAll"
        ></button>

        <form @submit.prevent="addTodo">
          <input class="todoapp__new-todo" placeholder="What needs to be done?" v-model="title" />
        </form>
      </header>

      <TransitionGroup class="todoapp__main" tag="section" name="todolist" v-if="todos.length > 0">
        <TodoItem
          v-for="todo in visibleTodos"
          :todo="todo"
          :key="todo.id"
          @delete="deleteTodo(todo.id)"
          @update="updateTodo($event)"
        />
      </TransitionGroup>

      <footer class="todoapp__footer" v-if="todos.length > 0">
        <span class="todo-count">{{ activeTodos.length }} items left</span>
        <StatusFilter v-model="status" />
        <button
          type="button"
          class="todoapp__clear-completed"
          :disabled="activeTodos.length === todos.length"
          @click="clearCompletedTodos"
        >
          Clear completed
        </button>
      </footer>
    </div>

    <Message class="is-danger">
      <template #header>
        <p>Server Error</p>
      </template>

      <template #default>
        <p>{{ errorMessage }}</p>
      </template>
    </Message>
  </div>
</template>

<style>
html {
  background-color: white;
}
</style>
