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
  workout_session_id?: string // 训练会话ID
  reps: number // 次数
  weight: number // 重量(kg)
  calories?: number // 消耗的卡路里
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
  total_calories?: number // 总消耗卡路里
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

// 用户设置
export interface UserSettings {
  id: string
  body_weight: number // 体重(kg)
  created_at: Date
  updated_at: Date
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

// 动作卡路里系数表 (卡路里/公斤体重/次)
export const EXERCISE_CALORIE_FACTORS: { [key: string]: number } = {
  // 胸部
  '平板卧推': 0.08,
  '上斜卧推': 0.075,
  '双杠臂屈伸': 0.07,
  
  // 背部
  '引体向上': 0.1,
  '划船': 0.085,
  '硬拉': 0.12,
  
  // 肩部
  '推举': 0.06,
  '侧平举': 0.04,
  
  // 手臂
  '二头弯举': 0.035,
  '三头屈伸': 0.04,
  
  // 腿部
  '深蹲': 0.15,
  '腿举': 0.1,
  '腿弯举': 0.06,
  
  // 核心
  '卷腹': 0.025,
  '平板支撑': 0.03
}

// 默认卡路里系数（如果动作不在表中）
export const DEFAULT_CALORIE_FACTOR = 0.05

// 1RM计算公式 (Epley公式)
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

// 卡路里计算公式
export function calculateCalories(
  exerciseName: string, 
  weight: number, 
  reps: number, 
  bodyWeight: number = 70
): number {
  const factor = EXERCISE_CALORIE_FACTORS[exerciseName] || DEFAULT_CALORIE_FACTOR
  
  // 基础卡路里 = 系数 × 体重 × 次数
  const baseCalories = factor * bodyWeight * reps
  
  // 重量调整系数 (重量越大，额外消耗越多)
  const weightFactor = 1 + (weight / bodyWeight) * 0.3
  
  return Math.round(baseCalories * weightFactor)
}

// 根据肌肉群计算卡路里系数
export function getCalorieFactorByMuscleGroup(muscleGroup: string): number {
  const muscleGroupFactors: { [key: string]: number } = {
    '胸部': 0.075,
    '背部': 0.09,
    '肩部': 0.05,
    '手臂': 0.037,
    '腿部': 0.11,
    '核心': 0.027,
    '全身': 0.08
  }
  
  return muscleGroupFactors[muscleGroup] || DEFAULT_CALORIE_FACTOR
} 