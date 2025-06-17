<template>
  <Layout>
    <!-- 添加动作按钮 -->
    <div class="mb-6">
      <button
        @click="showAddExerciseForm"
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

    <!-- 编辑动作表单 -->
    <div v-if="showEditForm && editingExercise" class="bg-white rounded-lg shadow-sm p-4 mb-6 border border-orange-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">编辑动作</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">动作名称</label>
          <input
            v-model="editExerciseForm.name"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="请输入动作名称"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">肌肉群</label>
          <select
            v-model="editExerciseForm.muscle_group"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            v-model="editExerciseForm.equipment"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="如：杠铃、哑铃、器械等"
          />
        </div>
      </div>

      <div class="flex space-x-3 mt-4">
        <button
          @click="cancelEdit"
          class="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="saveEdit"
          :disabled="!editExerciseForm.name || !editExerciseForm.muscle_group"
          class="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          保存
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
                
                <!-- 显示最新1RM -->
                <div v-if="getOneRM(exercise.id)" class="mt-2">
                  <div class="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
                    <Trophy class="w-3 h-3 mr-1 text-blue-600" />
                    <span class="text-blue-700 font-medium">
                      当前1RM: {{ getOneRM(exercise.id)?.weight }}kg
                    </span>
                  </div>
                  <!-- 1RM历史按钮 -->
                  <button
                    @click="showHistory(exercise.id, exercise.name)"
                    class="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    查看历史
                  </button>
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

    <!-- 1RM历史记录弹窗 -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[70vh] overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedExerciseName }} - 1RM历史</h3>
            <button
              @click="closeHistory"
              class="text-gray-500 hover:text-gray-700"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-4 overflow-y-auto">
          <div v-if="historyRecords.length === 0" class="text-center text-gray-500 py-8">
            <Trophy class="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>还没有1RM记录</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(record, index) in historyRecords"
              :key="record.id"
              class="border border-gray-200 rounded-lg p-3"
              :class="index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-bold text-lg" :class="index === 0 ? 'text-blue-700' : 'text-gray-900'">
                    {{ record.weight }}kg
                    <span v-if="index === 0" class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded ml-2">
                      当前最佳
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ formatDate(record.date) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ record.calculated ? '计算得出' : '实际测试' }}
                  </div>
                </div>
                <div v-if="index > 0" class="text-sm text-gray-500">
                  {{ getProgress(record.weight, historyRecords[0].weight) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200">
          <button
            @click="closeHistory"
            class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
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
import { Plus, Edit, Trash2, List, Trophy, Dumbbell, Heart, Zap, X } from 'lucide-vue-next'
import { MUSCLE_GROUPS } from '../types/workout'
import { format } from 'date-fns'
import type { Exercise, OneRepMax } from '../types/workout'
import { db } from '../utils/database'

const workoutStore = useWorkoutStore()

// 响应式数据
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingExercise = ref<Exercise | null>(null)
const newExercise = ref({
  name: '',
  muscle_group: '',
  equipment: ''
})
const editExerciseForm = ref({
  name: '',
  muscle_group: '',
  equipment: ''
})
const oneRepMaxes = ref<OneRepMax[]>([])
const showHistoryModal = ref(false)
const selectedExerciseId = ref('')
const selectedExerciseName = ref('')
const historyRecords = ref<OneRepMax[]>([])

// 计算属性
const exercisesByMuscleGroup = computed(() => workoutStore.exercisesByMuscleGroup)

// 方法
function showAddExerciseForm() {
  // 关闭编辑表单（如果打开的话）
  showEditForm.value = false
  editingExercise.value = null
  
  showAddForm.value = true
}

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

function editExercise(exercise: Exercise) {
  // 关闭添加表单（如果打开的话）
  showAddForm.value = false
  
  editingExercise.value = exercise
  // 预填充表单数据
  editExerciseForm.value = {
    name: exercise.name,
    muscle_group: exercise.muscle_group,
    equipment: exercise.equipment || ''
  }
  showEditForm.value = true
}

function cancelAdd() {
  showAddForm.value = false
  newExercise.value = {
    name: '',
    muscle_group: '',
    equipment: ''
  }
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

async function showHistory(exerciseId: string, exerciseName: string) {
  selectedExerciseId.value = exerciseId
  selectedExerciseName.value = exerciseName
  
  try {
    // 首先尝试直接查询
    let history = await db.oneRepMaxes
      .where('exercise_id')
      .equals(exerciseId)
      .orderBy('date')
      .reverse()
      .toArray()
    
    // 如果没找到记录，尝试通过动作名称匹配
    if (history.length === 0) {
      const allRecords = await db.oneRepMaxes.toArray()
      
      // 通过动作名称匹配其他可能的ID
      history = allRecords.filter(record => {
        const recordExercise = workoutStore.exercises.find(e => e.id === record.exercise_id)
        return recordExercise && recordExercise.name === exerciseName
      }).sort((a, b) => b.date.getTime() - a.date.getTime())
    }
    
    historyRecords.value = history
    showHistoryModal.value = true
  } catch (error) {
    console.error('查询1RM历史失败:', error)
    historyRecords.value = []
    showHistoryModal.value = true
  }
}

function closeHistory() {
  showHistoryModal.value = false
  selectedExerciseId.value = ''
  selectedExerciseName.value = ''
  historyRecords.value = []
}

function formatDate(date: Date): string {
  return format(date, 'yyyy年MM月dd日 HH:mm')
}

function getProgress(oldWeight: number, newWeight: number): string {
  const diff = newWeight - oldWeight
  if (diff > 0) {
    return `+${diff}kg`
  } else if (diff < 0) {
    return `${diff}kg`
  }
  return '无变化'
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

function cancelEdit() {
  showEditForm.value = false
  editingExercise.value = null
  editExerciseForm.value = {
    name: '',
    muscle_group: '',
    equipment: ''
  }
}

async function saveEdit() {
  if (!editingExercise.value) return

  try {
    await workoutStore.updateExercise(editingExercise.value.id, {
      name: editExerciseForm.value.name,
      muscle_group: editExerciseForm.value.muscle_group,
      equipment: editExerciseForm.value.equipment || undefined
    })
    
    cancelEdit()
  } catch (error) {
    console.error('编辑动作失败:', error)
    alert('编辑失败，请重试')
  }
}

onMounted(() => {
  loadOneRepMaxes()
})
</script> 