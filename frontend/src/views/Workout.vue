<template>
  <Layout>
    <!-- 如果没有正在进行的训练 -->
    <div v-if="!currentSession" class="text-center py-12">
      <Dumbbell class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">没有进行中的训练</h2>
      <p class="text-gray-600 mb-6">开始新的训练来记录你的锻炼</p>
      <button
        @click="startWorkout"
        class="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        开始训练
      </button>
    </div>

    <!-- 正在进行的训练 -->
    <div v-else>
      <!-- 训练状态 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ workoutStore.isContinuingSession ? '继续训练' : '训练进行中' }}
            </h2>
            <div v-if="workoutStore.isContinuingSession" class="text-xs text-green-600 mt-1">
              🔄 正在继续之前的训练
            </div>
          </div>
          <div class="text-sm text-gray-500">
            {{ formatTime(trainingDuration) }}
          </div>
        </div>
        <div class="text-sm text-gray-600">
          已完成 {{ currentSession.sets.length }} 组
          <span v-if="workoutStore.isContinuingSession" class="text-green-600">
            (包含之前的训练组)
          </span>
        </div>
      </div>

      <!-- 选择动作 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">选择动作</h3>
        
        <!-- 按肌肉群分组 -->
        <div class="space-y-4">
          <div v-for="(exercises, muscleGroup) in exercisesByMuscleGroup" :key="muscleGroup">
            <h4 class="font-medium text-gray-700 mb-2">{{ muscleGroup }}</h4>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="exercise in exercises"
                :key="exercise.id"
                @click="selectExercise(exercise)"
                class="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                :class="selectedExercise?.id === exercise.id ? 'bg-blue-50 border-blue-300' : ''"
              >
                <div class="font-medium text-gray-900">{{ exercise.name }}</div>
                <div v-if="exercise.equipment" class="text-sm text-gray-500">{{ exercise.equipment }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加训练组 -->
      <div v-if="selectedExercise" ref="editArea" class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ selectedExercise.name }}
        </h3>

        <!-- 显示1RM -->
        <div v-if="currentOneRM" class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div class="text-sm font-medium text-blue-900">当前1RM</div>
          <div class="text-lg font-bold text-blue-700">{{ currentOneRM.weight }}kg</div>
          <div class="text-xs text-blue-600">
            {{ currentOneRM.calculated ? '计算得出' : '实际测试' }}
          </div>
        </div>

        <!-- 输入表单 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">重量 (kg)</label>
            <input
              v-model.number="setWeight"
              type="number"
              step="0.5"
              min="0"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">次数</label>
            <input
              v-model.number="setReps"
              type="number"
              min="1"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <button
          @click="addSet"
          :disabled="!setWeight || !setReps"
          class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          添加组数
        </button>
      </div>

      <!-- 当前训练组 -->
      <div v-if="currentSession.sets.length > 0" class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">当前训练组</h3>
        
        <div class="space-y-2">
          <div
            v-for="(set, index) in currentSession.sets"
            :key="set.id"
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-900">
                {{ getExerciseName(set.exercise_id) }}
              </div>
              <div class="text-sm text-gray-600">
                {{ set.weight }}kg × {{ set.reps }}次
                <span v-if="set.calories" class="text-orange-600 ml-2">🔥{{ set.calories }}千卡</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="copySet(set)"
                class="text-blue-600 hover:text-blue-700 p-1"
                title="再来一组"
              >
                <PlusCircle class="w-4 h-4" />
              </button>
              <button
                @click="removeSet(index)"
                class="text-red-600 hover:text-red-700 p-1"
                title="删除这组"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 完成训练 -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">完成训练</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">训练备注 (可选)</label>
          <textarea
            v-model="notes"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="记录训练感受、注意事项等..."
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button
            @click="cancelWorkout"
            class="py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            取消训练
          </button>
          <button
            @click="finishWorkout"
            :disabled="currentSession.sets.length === 0"
            class="py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            完成训练
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '../stores/workout'
import Layout from '../components/Layout.vue'
import { Dumbbell, X, PlusCircle } from 'lucide-vue-next'
import type { Exercise, OneRepMax, WorkoutSet } from '../types/workout'

const router = useRouter()
const workoutStore = useWorkoutStore()

// 响应式数据
const selectedExercise = ref<Exercise | null>(null)
const setWeight = ref<number>(0)
const setReps = ref<number>(0)
const notes = ref('')
const trainingDuration = ref(0)
const currentOneRM = ref<OneRepMax | null>(null)
const editArea = ref<HTMLElement | null>(null)

let durationInterval: number | null = null

// 计算属性
const currentSession = computed(() => workoutStore.currentSession)
const exercisesByMuscleGroup = computed(() => workoutStore.exercisesByMuscleGroup)

// 方法
function startWorkout() {
  workoutStore.startWorkout()
}

async function selectExercise(exercise: Exercise) {
  selectedExercise.value = exercise
  setWeight.value = 0
  setReps.value = 0
  
  // 获取该动作的1RM
  currentOneRM.value = await workoutStore.getOneRepMax(exercise.id) || null
  
  // 等待 DOM 更新后滚动到编辑区域
  await nextTick()
  if (editArea.value) {
    editArea.value.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
}

async function addSet() {
  if (!selectedExercise.value || !setWeight.value || !setReps.value) return

  try {
    await workoutStore.addWorkoutSet(selectedExercise.value.id, setReps.value, setWeight.value)
    
    // 重置输入
    setWeight.value = 0
    setReps.value = 0
    
    // 更新1RM显示
    currentOneRM.value = await workoutStore.getOneRepMax(selectedExercise.value.id) || null
  } catch (error) {
    console.error('添加训练组失败:', error)
  }
}

function removeSet(index: number) {
  if (currentSession.value) {
    currentSession.value.sets.splice(index, 1)
  }
}

// 复制训练组 - 直接添加一组相同的
async function copySet(set: WorkoutSet) {
  try {
    // 根据 exercise_id 找到对应的动作
    const exercise = workoutStore.exercises.find(e => e.id === set.exercise_id)
    if (!exercise) {
      console.error('未找到对应的动作')
      return
    }

    // 直接添加一组相同重量和次数的训练组
    await workoutStore.addWorkoutSet(set.exercise_id, set.reps, set.weight)
    
    console.log(`✅ 已添加一组: ${exercise.name} ${set.weight}kg × ${set.reps}次`)
  } catch (error) {
    console.error('复制训练组失败:', error)
  }
}

function getExerciseName(exerciseId: string): string {
  const exercise = workoutStore.exercises.find(e => e.id === exerciseId)
  return exercise ? exercise.name : '未知动作'
}

async function finishWorkout() {
  try {
    await workoutStore.finishWorkout(notes.value)
    router.push('/')
  } catch (error) {
    console.error('完成训练失败:', error)
  }
}

function cancelWorkout() {
  if (confirm('确定要取消当前训练吗？所有数据将丢失。')) {
    workoutStore.currentSession = null
    router.push('/')
  }
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }
  return `${mins}分钟`
}

function updateTrainingDuration() {
  if (currentSession.value) {
    trainingDuration.value = Math.floor((Date.now() - currentSession.value.created_at.getTime()) / 60000)
  }
}

onMounted(() => {
  if (currentSession.value) {
    updateTrainingDuration()
    durationInterval = setInterval(updateTrainingDuration, 60000)
  }
})

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
})
</script> 