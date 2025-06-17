<template>
  <Layout>
    <!-- 总体统计 -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 mb-1">{{ totalWorkouts }}</div>
        <div class="text-sm text-gray-600">总训练次数</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-green-600 mb-1">{{ totalSets }}</div>
        <div class="text-sm text-gray-600">总组数</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-purple-600 mb-1">{{ totalVolume }}</div>
        <div class="text-sm text-gray-600">总训练量(kg)</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-orange-600 mb-1">{{ averageDuration }}</div>
        <div class="text-sm text-gray-600">平均时长(分钟)</div>
      </div>
    </div>

    <!-- 本周统计 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar class="w-5 h-5 mr-2 text-blue-600" />
        本周统计
      </h3>
      
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-xl font-bold text-blue-600">{{ weekStats.workouts }}</div>
          <div class="text-xs text-gray-600">训练次数</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-green-600">{{ weekStats.sets }}</div>
          <div class="text-xs text-gray-600">组数</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-purple-600">{{ weekStats.volume }}</div>
          <div class="text-xs text-gray-600">训练量(kg)</div>
        </div>
      </div>
    </div>

    <!-- 肌肉群训练分布 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <PieChart class="w-5 h-5 mr-2 text-blue-600" />
        肌肉群训练分布
      </h3>
      
      <div class="space-y-3">
        <div
          v-for="stat in muscleGroupStats"
          :key="stat.muscleGroup"
          class="flex items-center justify-between"
        >
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: stat.color }"></div>
            <span class="text-sm font-medium text-gray-900">{{ stat.muscleGroup }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="text-sm text-gray-600">{{ stat.sets }}组</div>
            <div class="text-xs text-gray-500">{{ stat.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 1RM记录 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Trophy class="w-5 h-5 mr-2 text-blue-600" />
        1RM记录
      </h3>
      
      <div v-if="oneRepMaxRecords.length === 0" class="text-center text-gray-500 py-8">
        <Trophy class="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>还没有1RM记录</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="record in oneRepMaxRecords"
          :key="record.exercise_id"
          class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <div class="font-medium text-gray-900">{{ getExerciseName(record.exercise_id) }}</div>
            <div class="text-xs text-gray-500">
              {{ formatDate(record.date) }}
              {{ record.calculated ? '(计算)' : '(实测)' }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-blue-600">{{ record.weight }}kg</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练频率 -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity class="w-5 h-5 mr-2 text-blue-600" />
        最近训练频率
      </h3>
      
      <div class="space-y-2">
        <div
          v-for="day in recentDays"
          :key="day.date"
          class="flex items-center justify-between p-2 rounded"
          :class="day.hasWorkout ? 'bg-green-50' : 'bg-gray-50'"
        >
          <div class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :class="day.hasWorkout ? 'bg-green-500' : 'bg-gray-300'"
            ></div>
            <span class="text-sm font-medium text-gray-900">{{ day.label }}</span>
          </div>
          <div class="text-sm text-gray-600">
            {{ day.hasWorkout ? `${day.sets}组` : '休息' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 动作排行 -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 class="w-5 h-5 mr-2 text-blue-600" />
        最常练动作
      </h3>
      
      <div class="space-y-3">
        <div
          v-for="(stat, index) in topExercises"
          :key="stat.exerciseId"
          class="flex items-center justify-between"
        >
          <div class="flex items-center">
            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mr-3">
              {{ index + 1 }}
            </div>
            <span class="text-sm font-medium text-gray-900">{{ getExerciseName(stat.exerciseId) }}</span>
          </div>
          <div class="text-sm text-gray-600">{{ stat.sets }}组</div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useWorkoutStore } from '../stores/workout'
import Layout from '../components/Layout.vue'
import { Calendar, PieChart, Trophy, Activity, BarChart3 } from 'lucide-vue-next'
import { format, startOfWeek, endOfWeek, isWithinInterval, subDays, isSameDay } from 'date-fns'
import type { OneRepMax } from '../types/workout'

const workoutStore = useWorkoutStore()
const oneRepMaxRecords = ref<OneRepMax[]>([])

// 计算属性
const totalWorkouts = computed(() => workoutStore.workoutSessions.length)

const totalSets = computed(() => {
  return workoutStore.workoutSessions.reduce((total, session) => {
    return total + session.sets.length
  }, 0)
})

const totalVolume = computed(() => {
  return workoutStore.workoutSessions.reduce((total, session) => {
    return total + session.sets.reduce((sessionTotal, set) => {
      return sessionTotal + (set.weight * set.reps)
    }, 0)
  }, 0)
})

const averageDuration = computed(() => {
  if (workoutStore.workoutSessions.length === 0) return 0
  const totalDuration = workoutStore.workoutSessions.reduce((total, session) => {
    return total + (session.duration || 0)
  }, 0)
  return Math.round(totalDuration / workoutStore.workoutSessions.length)
})

const weekStats = computed(() => {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // 周一开始
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  
  const weekSessions = workoutStore.workoutSessions.filter(session => 
    isWithinInterval(session.date, { start: weekStart, end: weekEnd })
  )
  
  const sets = weekSessions.reduce((total, session) => total + session.sets.length, 0)
  const volume = weekSessions.reduce((total, session) => {
    return total + session.sets.reduce((sessionTotal, set) => {
      return sessionTotal + (set.weight * set.reps)
    }, 0)
  }, 0)
  
  return {
    workouts: weekSessions.length,
    sets,
    volume
  }
})

const muscleGroupStats = computed(() => {
  const stats: { [key: string]: number } = {}
  
  workoutStore.workoutSessions.forEach(session => {
    session.sets.forEach(set => {
      const exercise = workoutStore.exercises.find(e => e.id === set.exercise_id)
      if (exercise) {
        stats[exercise.muscle_group] = (stats[exercise.muscle_group] || 0) + 1
      }
    })
  })
  
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0)
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
  
  return Object.entries(stats)
    .map(([muscleGroup, sets], index) => ({
      muscleGroup,
      sets,
      percentage: Math.round((sets / total) * 100),
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.sets - a.sets)
})

const recentDays = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i)
    const daySession = workoutStore.workoutSessions.find(session => 
      isSameDay(session.date, date)
    )
    
    days.push({
      date: date.toISOString(),
      label: i === 0 ? '今天' : i === 1 ? '昨天' : format(date, 'MM/dd'),
      hasWorkout: !!daySession,
      sets: daySession ? daySession.sets.length : 0
    })
  }
  
  return days
})

const topExercises = computed(() => {
  const stats: { [key: string]: number } = {}
  
  workoutStore.workoutSessions.forEach(session => {
    session.sets.forEach(set => {
      stats[set.exercise_id] = (stats[set.exercise_id] || 0) + 1
    })
  })
  
  return Object.entries(stats)
    .map(([exerciseId, sets]) => ({ exerciseId, sets }))
    .sort((a, b) => b.sets - a.sets)
    .slice(0, 5)
})

// 方法
function getExerciseName(exerciseId: string): string {
  const exercise = workoutStore.exercises.find(e => e.id === exerciseId)
  return exercise ? exercise.name : '未知动作'
}

function formatDate(date: Date): string {
  return format(date, 'MM/dd')
}

async function loadOneRepMaxes() {
  try {
    const allOneRMs = await Promise.all(
      workoutStore.exercises.map(exercise => workoutStore.getOneRepMax(exercise.id))
    )
    oneRepMaxRecords.value = allOneRMs
      .filter(orm => orm !== undefined)
      .sort((a, b) => b!.weight - a!.weight) as OneRepMax[]
  } catch (error) {
    console.error('加载1RM记录失败:', error)
  }
}

onMounted(() => {
  loadOneRepMaxes()
})
</script> 