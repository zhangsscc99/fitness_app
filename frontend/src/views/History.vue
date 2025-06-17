<template>
  <Layout>
    <!-- 空状态 -->
    <div v-if="workoutSessions.length === 0" class="text-center py-12">
      <History class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">还没有训练记录</h2>
      <p class="text-gray-600 mb-6">开始你的第一次训练吧</p>
      <router-link
        to="/workout"
        class="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
      >
        开始训练
      </router-link>
    </div>

    <!-- 训练记录列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="session in workoutSessions"
        :key="session.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <!-- 会话头部 -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="text-lg font-semibold text-gray-900">
                {{ formatDate(session.date) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ formatTime(session.date) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ session.duration }}分钟
              </div>
              <div class="text-xs text-gray-500">
                {{ session.sets.length }}组
              </div>
            </div>
          </div>
          
          <!-- 备注 -->
          <div v-if="session.notes" class="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">
            {{ session.notes }}
          </div>
        </div>

        <!-- 训练详情 -->
        <div class="p-4">
          <div class="space-y-3">
            <div
              v-for="exerciseGroup in groupSetsByExercise(session.sets)"
              :key="exerciseGroup.exerciseId"
              class="border-l-4 border-blue-400 pl-3"
            >
              <div class="font-medium text-gray-900 mb-1">
                {{ getExerciseName(exerciseGroup.exerciseId) }}
              </div>
              <div class="space-y-1">
                <div
                  v-for="(set, index) in exerciseGroup.sets"
                  :key="set.id"
                  class="text-sm text-gray-600"
                >
                  第{{ index + 1 }}组: {{ set.weight }}kg × {{ set.reps }}次
                </div>
              </div>
              
              <!-- 显示该动作的最大重量 -->
              <div class="text-xs text-blue-600 mt-1">
                最大: {{ getMaxWeightForExercise(exerciseGroup.sets) }}kg
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="px-4 pb-4">
          <div class="flex justify-end space-x-2">
            <button
              @click="duplicateWorkout(session)"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              复制训练
            </button>
            <button
              @click="deleteSession(session.id)"
              class="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多按钮 -->
    <div v-if="hasMoreSessions" class="text-center py-4">
      <button
        @click="loadMoreSessions"
        class="text-blue-600 hover:text-blue-700 font-medium"
      >
        加载更多
      </button>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '../stores/workout'
import Layout from '../components/Layout.vue'
import { History } from 'lucide-vue-next'
import { format } from 'date-fns'
import type { WorkoutSet, WorkoutSession } from '../types/workout'

const router = useRouter()
const workoutStore = useWorkoutStore()

// 计算属性
const workoutSessions = computed(() => workoutStore.workoutSessions)
const hasMoreSessions = computed(() => false) // 暂时不实现分页

// 方法
function formatDate(date: Date): string {
  return format(date, 'yyyy年MM月dd日')
}

function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}

function getExerciseName(exerciseId: string): string {
  const exercise = workoutStore.exercises.find(e => e.id === exerciseId)
  return exercise ? exercise.name : '未知动作'
}

function groupSetsByExercise(sets: WorkoutSet[]) {
  const grouped: { [key: string]: WorkoutSet[] } = {}
  
  sets.forEach(set => {
    if (!grouped[set.exercise_id]) {
      grouped[set.exercise_id] = []
    }
    grouped[set.exercise_id].push(set)
  })

  return Object.entries(grouped).map(([exerciseId, sets]) => ({
    exerciseId,
    sets
  }))
}

function getMaxWeightForExercise(sets: WorkoutSet[]): number {
  return Math.max(...sets.map(set => set.weight))
}

async function duplicateWorkout(session: WorkoutSession) {
  if (workoutStore.currentSession) {
    if (!confirm('已有进行中的训练，是否要取消当前训练并复制此次训练？')) {
      return
    }
  }

  // 开始新训练
  workoutStore.startWorkout()
  
  // 复制所有训练组
  for (const set of session.sets) {
    await workoutStore.addWorkoutSet(set.exercise_id, set.reps, set.weight)
  }

  router.push('/workout')
}

async function deleteSession(sessionId: string) {
  if (confirm('确定要删除这次训练记录吗？此操作不可恢复。')) {
    try {
      await workoutStore.deleteWorkoutSession(sessionId)
    } catch (error) {
      console.error('删除训练记录失败:', error)
      alert('删除失败，请重试')
    }
  }
}

function loadMoreSessions() {
  // TODO: 实现分页加载
}
</script> 