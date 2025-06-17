<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useWorkoutStore } from './stores/workout'

const workoutStore = useWorkoutStore()

onMounted(() => {
  // 初始化数据库
  workoutStore.initDatabase()
})
</script> 