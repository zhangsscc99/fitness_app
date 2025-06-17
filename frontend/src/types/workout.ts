// 健身动作类型
export interface Exercise {
  id: string
  name: string
  muscle_group: string // 肌肉群
  equipment?: string // 器械
  created_at: Date
}

// 训练组数据
export interface WorkoutSet {
  id: string
  exercise_id: string
  reps: number // 次数
  weight: number // 重量(kg)
  completed: boolean
  rest_time?: number // 休息时间(秒)
  created_at: Date
}

// 训练记录
export interface WorkoutSession {
  id: string
  date: Date
  duration?: number // 训练时长(分钟)
  notes?: string
  sets: WorkoutSet[]
  created_at: Date
}

// 1RM记录
export interface OneRepMax {
  id: string
  exercise_id: string
  weight: number // 1RM重量
  calculated: boolean // 是否计算得出
  date: Date
  created_at: Date
}

// 肌肉群分类
export const MUSCLE_GROUPS = [
  '胸部',
  '背部',
  '肩部',
  '手臂',
  '腿部',
  '核心',
  '全身'
] as const

// 1RM计算公式 (Epley公式)
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
} 