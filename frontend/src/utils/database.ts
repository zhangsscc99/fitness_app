import Dexie, { type Table } from 'dexie'
import type { Exercise, WorkoutSession, WorkoutSet, OneRepMax } from '../types/workout'

export class FitnessDatabase extends Dexie {
  exercises!: Table<Exercise>
  workoutSessions!: Table<WorkoutSession>
  workoutSets!: Table<WorkoutSet>
  oneRepMaxes!: Table<OneRepMax>

  constructor() {
    super('FitnessDatabase')
    
    this.version(1).stores({
      exercises: 'id, name, muscle_group, equipment, created_at',
      workoutSessions: 'id, date, duration, created_at',
      workoutSets: 'id, exercise_id, reps, weight, completed, created_at',
      oneRepMaxes: 'id, exercise_id, weight, calculated, date, created_at'
    })
  }
}

export const db = new FitnessDatabase()

// 初始化预设动作
export async function initializeDefaultExercises() {
  const count = await db.exercises.count()
  if (count === 0) {
    const defaultExercises: Exercise[] = [
      // 胸部
      { id: 'bench-press', name: '卧推', muscle_group: '胸部', equipment: '杠铃', created_at: new Date() },
      { id: 'push-ups', name: '俯卧撑', muscle_group: '胸部', created_at: new Date() },
      { id: 'dumbbell-press', name: '哑铃推胸', muscle_group: '胸部', equipment: '哑铃', created_at: new Date() },
      
      // 背部
      { id: 'pull-ups', name: '引体向上', muscle_group: '背部', created_at: new Date() },
      { id: 'deadlift', name: '硬拉', muscle_group: '背部', equipment: '杠铃', created_at: new Date() },
      { id: 'bent-over-row', name: '俯身划船', muscle_group: '背部', equipment: '杠铃', created_at: new Date() },
      
      // 腿部
      { id: 'squat', name: '深蹲', muscle_group: '腿部', equipment: '杠铃', created_at: new Date() },
      { id: 'leg-press', name: '腿推', muscle_group: '腿部', equipment: '器械', created_at: new Date() },
      { id: 'lunges', name: '弓步蹲', muscle_group: '腿部', created_at: new Date() },
      
      // 肩部
      { id: 'overhead-press', name: '推举', muscle_group: '肩部', equipment: '杠铃', created_at: new Date() },
      { id: 'lateral-raise', name: '侧平举', muscle_group: '肩部', equipment: '哑铃', created_at: new Date() },
      
      // 手臂
      { id: 'bicep-curls', name: '二头弯举', muscle_group: '手臂', equipment: '哑铃', created_at: new Date() },
      { id: 'tricep-dips', name: '三头屈伸', muscle_group: '手臂', created_at: new Date() },
      
      // 核心
      { id: 'plank', name: '平板支撑', muscle_group: '核心', created_at: new Date() },
      { id: 'crunches', name: '卷腹', muscle_group: '核心', created_at: new Date() }
    ]
    
    await db.exercises.bulkAdd(defaultExercises)
  }
} 