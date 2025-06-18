<template>
  <Layout>
    <!-- 欢迎信息 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-2">欢迎使用健身记录</h2>
      <p class="text-gray-600">记录你的每一次训练，追踪你的进步</p>
    </div>

    <!-- 今日训练状态 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">今日训练</h3>
      
      <!-- 当前正在进行的训练 -->
      <div v-if="currentSession" class="text-center">
        <div class="text-green-600 mb-4">
          <Play class="w-12 h-12 mx-auto mb-2" />
          <p class="font-medium">
            {{ workoutStore.isContinuingSession ? '继续训练中' : '训练进行中' }}
          </p>
          <p class="text-sm text-gray-500">已进行 {{ formatDuration(trainingDuration) }}</p>
          <div v-if="workoutStore.isContinuingSession" class="text-xs text-green-600 mt-1">
            🔄 正在继续之前的训练
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 mb-4">
          <p class="text-sm text-gray-600">
            已完成组数: {{ currentSession.sets.length }}
            <span v-if="workoutStore.isContinuingSession" class="text-green-600">
              (包含之前组数)
            </span>
          </p>
          <p class="text-sm text-gray-600">预计消耗: {{ getCurrentSessionCalories() }}千卡</p>
        </div>
        <router-link
          to="/workout"
          class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors inline-block text-center"
        >
          {{ workoutStore.isContinuingSession ? '继续训练' : '继续训练' }}
        </router-link>
      </div>

      <!-- 当日已完成训练统计 -->
      <div v-else-if="todayStats.sessions > 0">
        <div class="text-center mb-4">
          <div class="text-green-600 mb-2">
            <Dumbbell class="w-12 h-12 mx-auto mb-2" />
            <p class="font-medium">今日已训练</p>
          </div>
        </div>
        
        <!-- 当日统计数据 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center">
            <div class="text-xl font-bold text-blue-600">{{ todayStats.sessions }}</div>
            <div class="text-xs text-gray-600">训练次数</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-green-600">{{ todayStats.sets }}</div>
            <div class="text-xs text-gray-600">组数</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center">
            <div class="text-xl font-bold text-purple-600">{{ todayStats.volume }}</div>
            <div class="text-xs text-gray-600">训练量(kg)</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-orange-600">{{ todayStats.calories }}</div>
            <div class="text-xs text-gray-600">消耗(千卡)</div>
          </div>
        </div>
        
        <button
          @click="startWorkout"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          再次训练
        </button>
      </div>

      <!-- 当日无训练 -->
      <div v-else class="text-center">
        <div class="text-gray-500 mb-4">
          <Dumbbell class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>还没有开始今天的训练</p>
        </div>
        <button
          @click="startWorkout"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          开始训练
        </button>
      </div>
    </div>

    <!-- 最近训练记录 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">最近训练</h3>
        <router-link
          to="/history"
          class="text-blue-600 text-sm hover:text-blue-700"
        >
          查看全部
        </router-link>
      </div>

      <div v-if="recentSessions.length === 0" class="text-center text-gray-500 py-8">
        <History class="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>还没有训练记录</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="session in recentSessions"
          :key="session.id"
          class="border border-gray-200 rounded-lg p-3"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="text-sm font-medium text-gray-900">
              {{ formatDate(session.date) }}
            </div>
            <div class="text-xs text-gray-500">
              {{ session.duration }}分钟
            </div>
          </div>
          <div class="text-sm text-gray-600">
            完成 {{ session.sets.length }} 组训练
          </div>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ totalWorkouts }}</div>
        <div class="text-sm text-gray-600">总训练次数</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-green-600 mb-1">{{ totalSets }}</div>
        <div class="text-sm text-gray-600">总训练组数</div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '../stores/workout'
import Layout from '../components/Layout.vue'
import { Dumbbell, Play, History } from 'lucide-vue-next'
import { format } from 'date-fns'

const router = useRouter()
const workoutStore = useWorkoutStore()

// 响应式数据
const trainingDuration = ref(0)
let durationInterval: number | null = null

// 计算属性
const currentSession = computed(() => workoutStore.currentSession)
const recentSessions = computed(() => workoutStore.workoutSessions.slice(0, 3))
const totalWorkouts = computed(() => workoutStore.workoutSessions.length)
const totalSets = computed(() => {
  return workoutStore.workoutSessions.reduce((total, session) => {
    return total + session.sets.length
  }, 0)
})
const todayStats = computed(() => workoutStore.todayStats)

// 方法
function startWorkout() {
  workoutStore.startWorkout()
  router.push('/workout')
}

function formatDate(date: Date) {
  return format(date, 'MM月dd日 HH:mm')
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}时${mins}分`
  }
  return `${mins}分钟`
}

function getCurrentSessionCalories() {
  if (currentSession.value) {
    return currentSession.value.sets.reduce((total, set) => {
      return total + (set.calories || 0)
    }, 0)
  }
  return 0
}

function updateTrainingDuration() {
  if (currentSession.value) {
    trainingDuration.value = Math.floor((Date.now() - currentSession.value.created_at.getTime()) / 60000)
  }
}

onMounted(() => {
  if (currentSession.value) {
    updateTrainingDuration()
    durationInterval = setInterval(updateTrainingDuration, 60000) // 每分钟更新
  }
})

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
})
</script> 