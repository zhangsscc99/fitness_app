<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- 头部 -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-md mx-auto px-4 py-3">
        <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-md mx-auto px-4 py-4">
      <slot />
    </main>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div class="max-w-md mx-auto">
        <div class="flex justify-around py-2">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            class="flex flex-col items-center py-2 px-3 text-xs"
            :class="$route.path === item.path ? 'text-blue-600' : 'text-gray-500'"
          >
            <component :is="item.icon" class="w-6 h-6 mb-1" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Dumbbell, History, List, BarChart3 } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { name: 'home', path: '/', label: '首页', icon: Home },
  { name: 'workout', path: '/workout', label: '训练', icon: Dumbbell },
  { name: 'history', path: '/history', label: '历史', icon: History },
  { name: 'exercises', path: '/exercises', label: '动作', icon: List },
  { name: 'stats', path: '/stats', label: '统计', icon: BarChart3 }
]

const title = computed(() => {
  const currentItem = navItems.find(item => item.path === route.path)
  return currentItem ? currentItem.label : '健身记录'
})
</script> 