import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, initializeDefaultExercises } from '../utils/database'
import type { Exercise, WorkoutSession, WorkoutSet, OneRepMax } from '../types/workout'
import { calculateOneRepMax } from '../types/workout'

export const useWorkoutStore = defineStore('workout', () => {
  // 状态
  const exercises = ref<Exercise[]>([])
  const workoutSessions = ref<WorkoutSession[]>([])
  const currentSession = ref<WorkoutSession | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const exercisesByMuscleGroup = computed(() => {
    const grouped: Record<string, Exercise[]> = {}
    exercises.value.forEach(exercise => {
      if (!grouped[exercise.muscle_group]) {
        grouped[exercise.muscle_group] = []
      }
      grouped[exercise.muscle_group].push(exercise)
    })
    return grouped
  })

  // 初始化数据库
  async function initDatabase() {
    try {
      await initializeDefaultExercises()
      await loadExercises()
      await loadWorkoutSessions()
    } catch (error) {
      console.error('初始化数据库失败:', error)
    }
  }

  // 加载动作
  async function loadExercises() {
    try {
      exercises.value = await db.exercises.orderBy('muscle_group').toArray()
    } catch (error) {
      console.error('加载动作失败:', error)
    }
  }

  // 加载训练记录
  async function loadWorkoutSessions() {
    try {
      const sessions = await db.workoutSessions.orderBy('date').reverse().toArray()
      // 为每个session加载对应的sets
      for (const session of sessions) {
        const sets = await db.workoutSets.where('workout_session_id').equals(session.id).toArray()
        session.sets = sets
      }
      workoutSessions.value = sessions
    } catch (error) {
      console.error('加载训练记录失败:', error)
    }
  }

  // 添加动作
  async function addExercise(exercise: Omit<Exercise, 'id' | 'created_at'>) {
    try {
      const newExercise: Exercise = {
        ...exercise,
        id: `exercise-${Date.now()}`,
        created_at: new Date()
      }
      await db.exercises.add(newExercise)
      exercises.value.push(newExercise)
      return newExercise
    } catch (error) {
      console.error('添加动作失败:', error)
      throw error
    }
  }

  // 开始训练
  function startWorkout() {
    currentSession.value = {
      id: `session-${Date.now()}`,
      date: new Date(),
      sets: [],
      created_at: new Date()
    }
  }

  // 添加训练组
  async function addWorkoutSet(exerciseId: string, reps: number, weight: number) {
    if (!currentSession.value) return

    try {
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}`,
        exercise_id: exerciseId,
        reps,
        weight,
        completed: true,
        created_at: new Date()
      }

      currentSession.value.sets.push(newSet)
      
      // 计算并更新1RM
      await updateOneRepMax(exerciseId, weight, reps)
      
      return newSet
    } catch (error) {
      console.error('添加训练组失败:', error)
      throw error
    }
  }

  // 完成训练
  async function finishWorkout(notes?: string) {
    if (!currentSession.value) return

    try {
      isLoading.value = true
      
      // 计算训练时长
      const duration = Math.round((Date.now() - currentSession.value.created_at.getTime()) / 60000)
      currentSession.value.duration = duration
      currentSession.value.notes = notes

      // 保存session
      await db.workoutSessions.add(currentSession.value)
      
      // 保存所有sets
      const setsWithSessionId = currentSession.value.sets.map(set => ({
        ...set,
        workout_session_id: currentSession.value!.id
      }))
      await db.workoutSets.bulkAdd(setsWithSessionId)

      workoutSessions.value.unshift(currentSession.value)
      currentSession.value = null
    } catch (error) {
      console.error('完成训练失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新1RM
  async function updateOneRepMax(exerciseId: string, weight: number, reps: number) {
    try {
      const calculatedMax = calculateOneRepMax(weight, reps)
      
      // 检查是否已存在该动作的1RM记录
      const existingMax = await db.oneRepMaxes
        .where('exercise_id')
        .equals(exerciseId)
        .first()

      if (!existingMax || calculatedMax > existingMax.weight) {
        const oneRepMax: OneRepMax = {
          id: `1rm-${Date.now()}`,
          exercise_id: exerciseId,
          weight: calculatedMax,
          calculated: reps > 1,
          date: new Date(),
          created_at: new Date()
        }

        if (existingMax) {
          await db.oneRepMaxes.update(existingMax.id, oneRepMax)
        } else {
          await db.oneRepMaxes.add(oneRepMax)
        }
      }
    } catch (error) {
      console.error('更新1RM失败:', error)
    }
  }

  // 获取动作的1RM
  async function getOneRepMax(exerciseId: string): Promise<OneRepMax | undefined> {
    try {
      return await db.oneRepMaxes.where('exercise_id').equals(exerciseId).first()
    } catch (error) {
      console.error('获取1RM失败:', error)
      return undefined
    }
  }

  // 删除训练记录
  async function deleteWorkoutSession(sessionId: string) {
    try {
      await db.workoutSessions.delete(sessionId)
      await db.workoutSets.where('workout_session_id').equals(sessionId).delete()
      
      const index = workoutSessions.value.findIndex(s => s.id === sessionId)
      if (index > -1) {
        workoutSessions.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除训练记录失败:', error)
      throw error
    }
  }

  return {
    // 状态
    exercises,
    workoutSessions,
    currentSession,
    isLoading,
    exercisesByMuscleGroup,
    
    // 方法
    initDatabase,
    loadExercises,
    loadWorkoutSessions,
    addExercise,
    startWorkout,
    addWorkoutSet,
    finishWorkout,
    updateOneRepMax,
    getOneRepMax,
    deleteWorkoutSession
  }
}) 