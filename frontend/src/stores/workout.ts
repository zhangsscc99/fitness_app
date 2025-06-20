import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, initializeDefaultExercises, resetDatabase, getUserSettings, updateUserSettings } from '../utils/database'
import type { Exercise, WorkoutSession, WorkoutSet, OneRepMax, UserSettings } from '../types/workout'
import { calculateOneRepMax, calculateCalories, getCalorieFactorByMuscleGroup } from '../types/workout'

export const useWorkoutStore = defineStore('workout', () => {
  // 状态
  const exercises = ref<Exercise[]>([])
  const workoutSessions = ref<WorkoutSession[]>([])
  const currentSession = ref<WorkoutSession | null>(null)
  const isLoading = ref(false)
  const userSettings = ref<UserSettings | null>(null)
  const isContinuingSession = ref(false)  // 标记是否是继续训练
  const originalSessionId = ref<string | null>(null)  // 原始会话ID

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

  // 当日统计
  const todayStats = computed(() => {
    const today = new Date()
    const todaySessions = workoutSessions.value.filter(session => {
      const sessionDate = new Date(session.date)
      return sessionDate.toDateString() === today.toDateString()
    })

    const sessions = todaySessions.length
    const sets = todaySessions.reduce((total, session) => total + session.sets.length, 0)
    const volume = todaySessions.reduce((total, session) => {
      return total + session.sets.reduce((sessionTotal, set) => {
        return sessionTotal + (set.weight * set.reps)
      }, 0)
    }, 0)

    const calories = todaySessions.reduce((total, session) => {
      if (session.total_calories) {
        return total + session.total_calories
      }
      // 如果没有存储的总卡路里，从sets中计算
      const sessionCalories = session.sets.reduce((sessionTotal, set) => {
        return sessionTotal + (set.calories || 0)
      }, 0)
      return total + sessionCalories
    }, 0)

    return {
      sessions,
      sets,
      volume,
      calories
    }
  })

  // 初始化数据库
  async function initDatabase() {
    try {
      await initializeDefaultExercises()
      await loadExercises()
      await loadWorkoutSessions()
      await loadUserSettings()
    } catch (error) {
      console.error('初始化数据库失败:', error)
      // 如果初始化失败，尝试重置数据库
      try {
        await resetDatabase()
        await loadExercises()
        await loadWorkoutSessions()
        await loadUserSettings()
      } catch (resetError) {
        console.error('重置数据库失败:', resetError)
      }
    }
  }

  // 加载用户设置
  async function loadUserSettings() {
    try {
      userSettings.value = await getUserSettings()
    } catch (error) {
      console.error('加载用户设置失败:', error)
    }
  }

  // 更新用户体重
  async function updateBodyWeight(bodyWeight: number) {
    try {
      await updateUserSettings(bodyWeight)
      await loadUserSettings()
    } catch (error) {
      console.error('更新体重失败:', error)
      throw error
    }
  }

  // 重置数据库
  async function resetDatabaseAndReload() {
    try {
      await resetDatabase()
      exercises.value = []
      workoutSessions.value = []
      currentSession.value = null
      userSettings.value = null
      await loadExercises()
      await loadWorkoutSessions()
      await loadUserSettings()
      console.log('数据库重置完成')
    } catch (error) {
      console.error('重置数据库失败:', error)
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

  // 更新动作
  async function updateExercise(exerciseId: string, updates: Omit<Exercise, 'id' | 'created_at'>) {
    try {
      // 获取原有动作数据以保持创建时间
      const originalExercise = exercises.value.find(e => e.id === exerciseId)
      if (!originalExercise) {
        throw new Error('动作不存在')
      }
      
      const updatedExercise = {
        ...updates,
        id: exerciseId,
        created_at: originalExercise.created_at // 保持原创建时间
      }
      
      await db.exercises.update(exerciseId, updatedExercise)
      
      // 更新本地数组
      const index = exercises.value.findIndex(e => e.id === exerciseId)
      if (index > -1) {
        exercises.value[index] = updatedExercise
      }
      
      console.log('动作更新成功:', updatedExercise)
    } catch (error) {
      console.error('更新动作失败:', error)
      throw error
    }
  }

  // 开始训练
  function startWorkout() {
    currentSession.value = {
      id: `session-${Date.now()}`,
      date: new Date(),
      sets: [],
      total_calories: 0,
      created_at: new Date()
    }
    isContinuingSession.value = false
    originalSessionId.value = null
  }

  // 继续之前的训练
  async function continueWorkout(session: WorkoutSession) {
    try {
      // 创建一个新的会话ID，但保留原始会话的信息
      currentSession.value = {
        id: `session-${Date.now()}`,  // 新的临时ID
        date: session.date,  // 保持原始日期
        sets: [...session.sets],  // 复制原有的训练组
        total_calories: session.total_calories || 0,
        created_at: new Date(),  // 继续训练的开始时间
        notes: session.notes,
        duration: session.duration
      }
      
      isContinuingSession.value = true
      originalSessionId.value = session.id
      
      console.log(`继续训练: ${session.date.toLocaleDateString()}, 原有${session.sets.length}组`)
    } catch (error) {
      console.error('继续训练失败:', error)
      throw error
    }
  }

  // 添加训练组
  async function addWorkoutSet(exerciseId: string, reps: number, weight: number) {
    if (!currentSession.value) return

    try {
      // 获取动作信息
      const exercise = exercises.value.find(e => e.id === exerciseId)
      if (!exercise) {
        throw new Error('动作不存在')
      }

      // 计算卡路里
      const bodyWeight = userSettings.value?.body_weight || 70
      const calories = calculateCalories(exercise.name, weight, reps, bodyWeight)

      const newSet: WorkoutSet = {
        id: `set-${Date.now()}`,
        exercise_id: exerciseId,
        reps,
        weight,
        calories,
        completed: true,
        created_at: new Date()
      }

      currentSession.value.sets.push(newSet)
      
      // 更新当前会话的总卡路里
      currentSession.value.total_calories = (currentSession.value.total_calories || 0) + calories
      
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
      let duration: number
      if (isContinuingSession.value && currentSession.value.duration) {
        // 如果是继续训练，累加时长
        const additionalDuration = Math.round((Date.now() - currentSession.value.created_at.getTime()) / 60000)
        duration = currentSession.value.duration + additionalDuration
      } else {
        // 新训练，计算总时长
        duration = Math.round((Date.now() - currentSession.value.created_at.getTime()) / 60000)
      }
      
      currentSession.value.duration = duration
      currentSession.value.notes = notes || currentSession.value.notes

      // 确保总卡路里计算正确
      const totalCalories = currentSession.value.sets.reduce((total, set) => {
        return total + (set.calories || 0)
      }, 0)
      currentSession.value.total_calories = totalCalories

      if (isContinuingSession.value && originalSessionId.value) {
        // 继续训练：更新原有会话
        await updateExistingSession(originalSessionId.value, currentSession.value)
      } else {
        // 新训练：创建新会话
        await createNewSession(currentSession.value)
      }

      // 重新加载数据
      await loadWorkoutSessions()
      
      // 重置状态
      currentSession.value = null
      isContinuingSession.value = false
      originalSessionId.value = null
      
      console.log(`训练完成并保存成功，总消耗卡路里: ${totalCalories}`)
    } catch (error) {
      console.error('完成训练失败:', error)
      alert('保存训练失败，请重试')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新现有会话
  async function updateExistingSession(sessionId: string, session: WorkoutSession) {
    try {
      // 删除原有的sets
      await db.workoutSets.where('workout_session_id').equals(sessionId).delete()
      
      // 为所有sets设置正确的session ID
      const setsWithSessionId = session.sets.map(set => ({
        ...set,
        workout_session_id: sessionId
      }))

      // 保存更新后的sets
      await db.workoutSets.bulkAdd(setsWithSessionId)

      // 更新session信息
      await db.workoutSessions.update(sessionId, {
        duration: session.duration,
        notes: session.notes,
        total_calories: session.total_calories
      })

      console.log(`更新现有训练会话: ${sessionId}`)
    } catch (error) {
      console.error('更新现有会话失败:', error)
      throw error
    }
  }

  // 创建新会话
  async function createNewSession(session: WorkoutSession) {
    try {
      // 为所有sets设置workout_session_id
      const setsWithSessionId = session.sets.map(set => ({
        ...set,
        workout_session_id: session.id
      }))

      // 保存所有sets
      await db.workoutSets.bulkAdd(setsWithSessionId)
      
      // 确保训练完成时为每个动作保存1RM记录
      const exerciseGroups: { [key: string]: WorkoutSet[] } = {}
      session.sets.forEach(set => {
        if (!exerciseGroups[set.exercise_id]) {
          exerciseGroups[set.exercise_id] = []
        }
        exerciseGroups[set.exercise_id].push(set)
      })

      // 为每个动作保存1RM记录
      for (const exerciseId of Object.keys(exerciseGroups)) {
        const sets = exerciseGroups[exerciseId]
        const maxSet = sets.reduce((max, current) => 
          current.weight > max.weight ? current : max
        )
        
        console.log(`为动作 ${getExerciseName(exerciseId)} (ID: ${exerciseId}) 保存1RM记录`)
        await saveOneRepMaxRecord(exerciseId, maxSet.weight, maxSet.reps)
      }
      
      // 保存session (不包含sets，因为sets已单独保存)
      const sessionToSave = { ...session }
      delete (sessionToSave as any).sets
      await db.workoutSessions.add(sessionToSave)

      console.log(`创建新训练会话: ${session.id}`)
    } catch (error) {
      console.error('创建新会话失败:', error)
      throw error
    }
  }

  // 新增：保存1RM记录（带时间戳）
  async function saveOneRepMaxRecord(exerciseId: string, weight: number, reps: number) {
    try {
      const calculatedMax = calculateOneRepMax(weight, reps)
      const now = new Date()
      
      // 总是保存1RM记录（每次训练都记录时间点）
      const oneRepMax: OneRepMax = {
        id: `1rm-${exerciseId}-${now.getTime()}`,
        exercise_id: exerciseId,
        weight: calculatedMax,
        calculated: reps > 1,
        date: now,
        created_at: now
      }

      await db.oneRepMaxes.add(oneRepMax)
      console.log(`保存1RM记录成功: ${getExerciseName(exerciseId)} ${calculatedMax}kg (${now.toLocaleString()})`)
    } catch (error) {
      console.error('保存1RM记录失败:', error)
    }
  }

  // 调试：获取所有1RM数据
  async function debugGetAllOneRMs(): Promise<OneRepMax[]> {
    try {
      const allRecords = await db.oneRepMaxes.toArray()
      console.log('所有1RM记录:', allRecords)
      return allRecords
    } catch (error) {
      console.error('获取调试数据失败:', error)
      return []
    }
  }

  // 更新1RM
  async function updateOneRepMax(exerciseId: string, weight: number, reps: number) {
    try {
      const calculatedMax = calculateOneRepMax(weight, reps)
      
      // 获取当前最新的1RM记录
      const latestMax = await db.oneRepMaxes
        .where('exercise_id')
        .equals(exerciseId)
        .orderBy('date')
        .reverse()
        .first()

      // 如果没有记录或者新的1RM更高，则添加新记录
      if (!latestMax || calculatedMax > latestMax.weight) {
        const oneRepMax: OneRepMax = {
          id: `1rm-${exerciseId}-${Date.now()}`,
          exercise_id: exerciseId,
          weight: calculatedMax,
          calculated: reps > 1,
          date: new Date(),
          created_at: new Date()
        }

        await db.oneRepMaxes.add(oneRepMax)
        console.log(`新1RM记录: ${getExerciseName(exerciseId)} ${calculatedMax}kg`)
      }
    } catch (error) {
      console.error('更新1RM失败:', error)
    }
  }

  // 获取动作的最新1RM
  async function getOneRepMax(exerciseId: string): Promise<OneRepMax | undefined> {
    try {
      return await db.oneRepMaxes
        .where('exercise_id')
        .equals(exerciseId)
        .orderBy('date')
        .reverse()
        .first()
    } catch (error) {
      console.error('获取1RM失败:', error)
      return undefined
    }
  }

  // 获取动作的1RM历史记录
  async function getOneRepMaxHistory(exerciseId: string): Promise<OneRepMax[]> {
    try {
      return await db.oneRepMaxes
        .where('exercise_id')
        .equals(exerciseId)
        .orderBy('date')
        .reverse()
        .toArray()
    } catch (error) {
      console.error('获取1RM历史失败:', error)
      return []
    }
  }

  // 获取所有1RM记录（用于统计页面）
  async function getAllOneRepMaxRecords(): Promise<OneRepMax[]> {
    try {
      return await db.oneRepMaxes
        .orderBy('date')
        .reverse()
        .toArray()
    } catch (error) {
      console.error('获取所有1RM记录失败:', error)
      return []
    }
  }

  // 获取动作名称
  function getExerciseName(exerciseId: string): string {
    const exercise = exercises.value.find(e => e.id === exerciseId)
    return exercise ? exercise.name : '未知动作'
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
    userSettings,
    todayStats,
    isContinuingSession,
    originalSessionId,
    
    // 方法
    initDatabase,
    resetDatabaseAndReload,
    loadExercises,
    loadWorkoutSessions,
    addExercise,
    updateExercise,
    startWorkout,
    continueWorkout,
    addWorkoutSet,
    finishWorkout,
    updateOneRepMax,
    getOneRepMax,
    getOneRepMaxHistory,
    getAllOneRepMaxRecords,
    getExerciseName,
    deleteWorkoutSession,
    debugGetAllOneRMs,
    loadUserSettings,
    updateBodyWeight
  }
}) 