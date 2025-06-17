import Dexie, { type Table } from 'dexie'
import type { Exercise, WorkoutSession, WorkoutSet, OneRepMax, UserSettings } from '../types/workout'

export class FitnessDatabase extends Dexie {
  exercises!: Table<Exercise>
  workoutSessions!: Table<WorkoutSession>
  workoutSets!: Table<WorkoutSet>
  oneRepMaxes!: Table<OneRepMax>
  userSettings!: Table<UserSettings>

  constructor() {
    super('FitnessDatabase')
    
    // 版本1：原始结构
    this.version(1).stores({
      exercises: 'id, name, muscle_group, equipment, created_at',
      workoutSessions: 'id, date, duration, created_at',
      workoutSets: 'id, exercise_id, workout_session_id, reps, weight, completed, created_at',
      oneRepMaxes: 'id, exercise_id, weight, calculated, date, created_at'
    })

    // 版本2：添加 workout_session_id 字段
    this.version(2).stores({
      exercises: 'id, name, muscle_group, equipment, created_at',
      workoutSessions: 'id, date, duration, created_at',
      workoutSets: 'id, exercise_id, workout_session_id, reps, weight, completed, created_at',
      oneRepMaxes: 'id, exercise_id, weight, calculated, date, created_at'
    })

    // 版本3：添加卡路里支持和用户设置
    this.version(3).stores({
      exercises: 'id, name, muscle_group, equipment, created_at',
      workoutSessions: 'id, date, duration, total_calories, created_at',
      workoutSets: 'id, exercise_id, workout_session_id, reps, weight, calories, completed, created_at',
      oneRepMaxes: 'id, exercise_id, weight, calculated, date, created_at',
      userSettings: 'id, body_weight, created_at, updated_at'
    })

    // 版本3的升级逻辑
    this.version(3).upgrade(async tx => {
      // 初始化默认用户设置
      await tx.table('userSettings').add({
        id: 'default',
        body_weight: 70, // 默认体重70kg
        created_at: new Date(),
        updated_at: new Date()
      })
    })
  }
}

export const db = new FitnessDatabase()

// 获取用户设置
export async function getUserSettings(): Promise<UserSettings> {
  let settings = await db.userSettings.get('default')
  
  if (!settings) {
    // 如果没有设置，创建默认设置
    settings = {
      id: 'default',
      body_weight: 70,
      created_at: new Date(),
      updated_at: new Date()
    }
    await db.userSettings.add(settings)
  }
  
  return settings
}

// 更新用户设置
export async function updateUserSettings(bodyWeight: number): Promise<void> {
  await db.userSettings.update('default', {
    body_weight: bodyWeight,
    updated_at: new Date()
  })
}

// 重置数据库
export async function resetDatabase() {
  try {
    await db.delete()
    await db.open()
    await initializeDefaultExercises()
    console.log('数据库重置成功')
  } catch (error) {
    console.error('数据库重置失败:', error)
  }
}

// 初始化预设动作
export async function initializeDefaultExercises() {
  const count = await db.exercises.count()
  if (count === 0) {
    const defaultExercises: Exercise[] = [
      // 胸部
      { id: 'bench-press', name: '平板卧推', muscle_group: '胸部', equipment: '杠铃', created_at: new Date() },
      { id: 'incline-press', name: '上斜卧推', muscle_group: '胸部', equipment: '杠铃', created_at: new Date() },
      { id: 'dips', name: '双杠臂屈伸', muscle_group: '胸部', equipment: '双杠', created_at: new Date() },
      
      // 背部
      { id: 'pull-ups', name: '引体向上', muscle_group: '背部', created_at: new Date() },
      { id: 'rowing', name: '划船', muscle_group: '背部', equipment: '器械', created_at: new Date() },
      { id: 'deadlift', name: '硬拉', muscle_group: '背部', equipment: '杠铃', created_at: new Date() },
      
      // 腿部
      { id: 'squat', name: '深蹲', muscle_group: '腿部', equipment: '杠铃', created_at: new Date() },
      { id: 'leg-press', name: '腿举', muscle_group: '腿部', equipment: '器械', created_at: new Date() },
      { id: 'leg-curl', name: '腿弯举', muscle_group: '腿部', equipment: '器械', created_at: new Date() },
      
      // 肩部
      { id: 'shoulder-press', name: '推举', muscle_group: '肩部', equipment: '杠铃', created_at: new Date() },
      { id: 'lateral-raise', name: '侧平举', muscle_group: '肩部', equipment: '哑铃', created_at: new Date() },
      
      // 手臂
      { id: 'bicep-curls', name: '二头弯举', muscle_group: '手臂', equipment: '哑铃', created_at: new Date() },
      { id: 'tricep-extension', name: '三头屈伸', muscle_group: '手臂', equipment: '器械', created_at: new Date() },
      
      // 核心
      { id: 'crunches', name: '卷腹', muscle_group: '核心', created_at: new Date() },
      { id: 'plank', name: '平板支撑', muscle_group: '核心', created_at: new Date() }
    ]
    
    await db.exercises.bulkAdd(defaultExercises)
  }
} 