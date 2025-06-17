<template>
  <Layout>
    <!-- 添加动作按钮 -->
    <div class="mb-6">
      <button
        @click="showAddForm = true"
        class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <Plus class="w-5 h-5 mr-2" />
        添加新动作
      </button>
    </div>

    <!-- 添加动作表单 -->
    <div v-if="showAddForm" class="bg-white rounded-lg shadow-sm p-4 mb-6 border border-blue-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">添加新动作</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">动作名称</label>
          <input
            v-model="newExercise.name"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入动作名称"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">肌肉群</label>
          <select
            v-model="newExercise.muscle_group"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择肌肉群</option>
            <option v-for="group in MUSCLE_GROUPS" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">器械 (可选)</label>
          <input
            v-model="newExercise.equipment"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="如：杠铃、哑铃、器械等"
          />
        </div>
      </div>

      <div class="flex space-x-3 mt-4">
        <button
          @click="cancelAdd"
          class="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="addExercise"
          :disabled="!newExercise.name || !newExercise.muscle_group"
          class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </div>
    </div>

    <!-- 动作列表 -->
    <div class="space-y-4">
      <div v-for="(exercises, muscleGroup) in exercisesByMuscleGroup" :key="muscleGroup">
        <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <component :is="getMuscleGroupIcon(muscleGroup)" class="w-5 h-5 mr-2 text-blue-600" />
          {{ muscleGroup }}
          <span class="ml-2 text-sm font-normal text-gray-500">({{ exercises.length }})</span>
        </h3>

        <div class="space-y-2">
          <div
            v-for="exercise in exercises"
            :key="exercise.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ exercise.name }}</div>
                <div v-if="exercise.equipment" class="text-sm text-gray-500 mt-1">
                  {{ exercise.equipment }}
                </div>
                
                <!-- 显示1RM -->
                <div v-if="getOneRM(exercise.id)" class="mt-2">
                  <div class="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
                    <Trophy class="w-3 h-3 mr-1 text-blue-600" />
                    <span class="text-blue-700 font-medium">
                      1RM: {{ getOneRM(exercise.id)?.weight }}kg
                    </span>
                  </div>
                </div>

                <!-- 显示训练统计 -->
                <div v-if="getExerciseStats(exercise.id)" class="mt-2 text-xs text-gray-500">
                  训练{{ getExerciseStats(exercise.id)?.totalSessions }}次 · 
                  总{{ getExerciseStats(exercise.id)?.totalSets }}组
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-2 ml-4">
                <button
                  @click="editExercise(exercise)"
                  class="text-blue-600 hover:text-blue-700 p-1"
                  title="编辑"
                >
                  <Edit class="w-4 h-4" />
                </button>
                <button
                  @click="deleteExercise(exercise.id)"
                  class="text-red-600 hover:text-red-700 p-1"
                  title="删除"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="Object.keys(exercisesByMuscleGroup).length === 0" class="text-center py-12">
      <List class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">还没有动作</h2>
      <p class="text-gray-600">添加你的第一个健身动作</p>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkoutStore } from '../stores/workout'
import Layout from '../components/Layout.vue'
import { Plus, Edit, Trash2, List, Trophy, Dumbbell, Heart, Zap } from 'lucide-vue-next'
import { MUSCLE_GROUPS } from '../types/workout'
import type { Exercise, OneRepMax } from '../types/workout'

const workoutStore = useWorkoutStore()

// 响应式数据
const showAddForm = ref(false)
const newExercise = ref({
  name: '',
  muscle_group: '',
  equipment: ''
})
const oneRepMaxes = ref<OneRepMax[]>([])

// 计算属性
const exercisesByMuscleGroup = computed(() => workoutStore.exercisesByMuscleGroup)

// 方法
async function addExercise() {
  if (!newExercise.value.name || !newExercise.value.muscle_group) return

  try {
    await workoutStore.addExercise({
      name: newExercise.value.name,
      muscle_group: newExercise.value.muscle_group,
      equipment: newExercise.value.equipment || undefined
    })
    
    cancelAdd()
  } catch (error) {
    console.error('添加动作失败:', error)
    alert('添加失败，请重试')
  }
}

function cancelAdd() {
  showAddForm.value = false
  newExercise.value = {
    name: '',
    muscle_group: '',
    equipment: ''
  }
}

function editExercise(exercise: Exercise) {
  // TODO: 实现编辑功能
  console.log('编辑动作:', exercise)
}

async function deleteExercise(exerciseId: string) {
  if (confirm('确定要删除这个动作吗？相关的训练记录也会受到影响。')) {
    try {
      // TODO: 实现删除功能
      console.log('删除动作:', exerciseId)
    } catch (error) {
      console.error('删除动作失败:', error)
      alert('删除失败，请重试')
    }
  }
}

function getMuscleGroupIcon(muscleGroup: string) {
  const iconMap: { [key: string]: any } = {
    '胸部': Heart,
    '背部': Dumbbell,
    '肩部': Zap,
    '手臂': Dumbbell,
    '腿部': Dumbbell,
    '核心': Heart,
    '全身': Dumbbell
  }
  return iconMap[muscleGroup] || Dumbbell
}

function getOneRM(exerciseId: string): OneRepMax | undefined {
  return oneRepMaxes.value.find(orm => orm.exercise_id === exerciseId)
}

function getExerciseStats(exerciseId: string) {
  const sessions = workoutStore.workoutSessions.filter(session => 
    session.sets.some(set => set.exercise_id === exerciseId)
  )
  
  if (sessions.length === 0) return null

  const totalSets = sessions.reduce((total, session) => {
    return total + session.sets.filter(set => set.exercise_id === exerciseId).length
  }, 0)

  return {
    totalSessions: sessions.length,
    totalSets
  }
}

async function loadOneRepMaxes() {
  try {
    // 获取所有1RM记录
    const allOneRMs = await Promise.all(
      workoutStore.exercises.map(exercise => workoutStore.getOneRepMax(exercise.id))
    )
    oneRepMaxes.value = allOneRMs.filter(orm => orm !== undefined) as OneRepMax[]
  } catch (error) {
    console.error('加载1RM记录失败:', error)
  }
}

onMounted(() => {
  loadOneRepMaxes()
})
</script> 