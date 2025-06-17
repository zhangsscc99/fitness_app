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

// 动作类型枚举
export enum ExerciseType {
  COMPOUND = 'compound',     // 复合动作（多关节，多肌群）
  ISOLATION = 'isolation',   // 孤立动作（单关节，单肌群）
  BODYWEIGHT = 'bodyweight', // 自重动作
  CARDIO = 'cardio'         // 有氧动作
}

// 动作强度等级
export enum IntensityLevel {
  LOW = 'low',       // 低强度
  MODERATE = 'moderate', // 中等强度
  HIGH = 'high',     // 高强度
  VERY_HIGH = 'very_high' // 极高强度
}

// 精准的动作卡路里数据表
export interface ExerciseCalorieData {
  name: string
  type: ExerciseType
  intensity: IntensityLevel
  met_value: number           // 代谢当量值
  base_calories_per_rep: number  // 基础卡路里/次
  weight_multiplier: number   // 重量系数
  muscle_mass_factor: number  // 肌肉参与系数
  time_per_rep: number       // 每次动作平均时间（秒）
}

// 科学的健身动作卡路里数据库
export const EXERCISE_CALORIE_DATABASE: { [key: string]: ExerciseCalorieData } = {
  // === 腿部动作 ===
  '深蹲': {
    name: '深蹲',
    type: ExerciseType.COMPOUND,
    intensity: IntensityLevel.HIGH,
    met_value: 4.0,  // 降低MET值
    base_calories_per_rep: 0.35,  // 降低基础消耗
    weight_multiplier: 0.06,  // 降低重量系数
    muscle_mass_factor: 0.75,  // 降低肌肉系数
    time_per_rep: 3.0
  },
  '腿举': {
    name: '腿举',
    type: ExerciseType.COMPOUND,
    intensity: IntensityLevel.MODERATE,
    met_value: 3.2,
    base_calories_per_rep: 0.25,
    weight_multiplier: 0.04,
    muscle_mass_factor: 0.60,
    time_per_rep: 2.5
  },
  '腿弯举': {
    name: '腿弯举',
    type: ExerciseType.ISOLATION,
    intensity: IntensityLevel.MODERATE,
    met_value: 2.8,
    base_calories_per_rep: 0.18,
    weight_multiplier: 0.03,
    muscle_mass_factor: 0.35,
    time_per_rep: 2.0
  },

  // === 胸部动作 ===
  '平板卧推': {
    name: '平板卧推',
    type: ExerciseType.COMPOUND,
    intensity: IntensityLevel.HIGH,
    met_value: 3.8,
    base_calories_per_rep: 0.32,
    weight_multiplier: 0.05,
    muscle_mass_factor: 0.55,
    time_per_rep: 2.8
  },
  '上斜卧推': {
    name: '上斜卧推',
    type: ExerciseType.COMPOUND,
    intensity: IntensityLevel.HIGH,
    met_value: 4.0,
    base_calories_per_rep: 0.35,
    weight_multiplier: 0.05,
    muscle_mass_factor: 0.58,
    time_per_rep: 3.0
  },
  '双杠臂屈伸': {
    name: '双杠臂屈伸',
    type: ExerciseType.BODYWEIGHT,
    intensity: IntensityLevel.HIGH,
    met_value: 4.2,
    base_calories_per_rep: 0.45,
    weight_multiplier: 0.08,  // 自重动作对额外重量更敏感
    muscle_mass_factor: 0.50,
    time_per_rep: 2.5
  },

  // === 背部动作 ===
  '硬拉': {
    name: '硬拉',
    type: ExerciseType.COMPOUND,
    intensity: IntensityLevel.VERY_HIGH,
    met_value: 5.5,  // 降低但保持最高
    base_calories_per_rep: 0.55,
    weight_multiplier: 0.08,
    muscle_mass_factor: 0.80,  // 全身性动作
    time_per_rep: 3.5
  },
  '引体向上': {
    name: '引体向上',
    type: ExerciseType.BODYWEIGHT,
    intensity: IntensityLevel.VERY_HIGH,
    met_value: 5.0,
    base_calories_per_rep: 0.50,
    weight_multiplier: 0.10,
    muscle_mass_factor: 0.60,
    time_per_rep: 3.0
  },
  '划船': {
    name: '划船',
    type: ExerciseType.COMPOUND,
    intensity: IntensityLevel.HIGH,
    met_value: 3.5,
    base_calories_per_rep: 0.30,
    weight_multiplier: 0.04,
    muscle_mass_factor: 0.50,
    time_per_rep: 2.5
  },

  // === 肩部动作 ===
  '推举': {
    name: '推举',
    type: ExerciseType.COMPOUND,
    intensity: IntensityLevel.HIGH,
    met_value: 3.6,
    base_calories_per_rep: 0.28,
    weight_multiplier: 0.04,
    muscle_mass_factor: 0.40,
    time_per_rep: 2.2
  },
  '侧平举': {
    name: '侧平举',
    type: ExerciseType.ISOLATION,
    intensity: IntensityLevel.MODERATE,
    met_value: 2.5,
    base_calories_per_rep: 0.12,
    weight_multiplier: 0.02,
    muscle_mass_factor: 0.20,
    time_per_rep: 1.8
  },

  // === 手臂动作 ===
  '二头弯举': {
    name: '二头弯举',
    type: ExerciseType.ISOLATION,
    intensity: IntensityLevel.MODERATE,
    met_value: 2.8,
    base_calories_per_rep: 0.15,
    weight_multiplier: 0.02,
    muscle_mass_factor: 0.18,
    time_per_rep: 2.0
  },
  '三头屈伸': {
    name: '三头屈伸',
    type: ExerciseType.ISOLATION,
    intensity: IntensityLevel.MODERATE,
    met_value: 3.0,
    base_calories_per_rep: 0.18,
    weight_multiplier: 0.03,
    muscle_mass_factor: 0.22,
    time_per_rep: 2.2
  },

  // === 核心动作 ===
  '卷腹': {
    name: '卷腹',
    type: ExerciseType.BODYWEIGHT,
    intensity: IntensityLevel.MODERATE,
    met_value: 3.2,
    base_calories_per_rep: 0.10,
    weight_multiplier: 0.04,
    muscle_mass_factor: 0.25,
    time_per_rep: 1.2
  },
  '平板支撑': {
    name: '平板支撑',
    type: ExerciseType.BODYWEIGHT,
    intensity: IntensityLevel.MODERATE,
    met_value: 3.5,
    base_calories_per_rep: 0.08,  // 按秒计算
    weight_multiplier: 0.02,
    muscle_mass_factor: 0.30,
    time_per_rep: 1.0  // 每秒
  }
}

// 默认动作数据（用于未收录的动作）
export const DEFAULT_EXERCISE_DATA: ExerciseCalorieData = {
  name: '默认动作',
  type: ExerciseType.ISOLATION,
  intensity: IntensityLevel.MODERATE,
  met_value: 2.8,  // 降低默认MET值
  base_calories_per_rep: 0.20,  // 降低基础消耗
  weight_multiplier: 0.03,  // 降低重量系数
  muscle_mass_factor: 0.30,  // 降低肌肉系数
  time_per_rep: 2.0
}

// 1RM计算公式 (Epley公式)
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

// 精准的卡路里计算公式
export function calculateCalories(
  exerciseName: string, 
  weight: number, 
  reps: number, 
  bodyWeight: number = 70
): number {
  const exerciseData = EXERCISE_CALORIE_DATABASE[exerciseName] || DEFAULT_EXERCISE_DATA
  
  // 1. 基础代谢消耗（基于MET值，降低系数）
  const baseMET = (exerciseData.met_value * bodyWeight * exerciseData.time_per_rep * reps) / 7200  // 除以7200而不是3600
  
  // 2. 动作基础消耗
  const baseCalories = exerciseData.base_calories_per_rep * reps * (bodyWeight / 70)
  
  // 3. 重量相关消耗
  const weightCalories = weight * exerciseData.weight_multiplier * reps
  
  // 4. 肌肉参与度调整
  const muscleAdjustment = exerciseData.muscle_mass_factor
  
  // 5. 强度系数（降低）
  const intensityMultiplier = getIntensityMultiplier(exerciseData.intensity)
  
  // 6. 动作类型系数（降低）
  const typeMultiplier = getTypeMultiplier(exerciseData.type)
  
  // 综合计算（降低总体系数）
  const totalCalories = (baseMET + baseCalories + weightCalories) * 
                       muscleAdjustment * 
                       intensityMultiplier * 
                       typeMultiplier * 
                       0.7  // 添加整体降低系数
  
  return Math.round(Math.max(totalCalories, reps * 0.05)) // 最低每次0.05卡
}

// 强度系数（降低）
function getIntensityMultiplier(intensity: IntensityLevel): number {
  switch (intensity) {
    case IntensityLevel.LOW: return 0.7
    case IntensityLevel.MODERATE: return 0.85
    case IntensityLevel.HIGH: return 1.0
    case IntensityLevel.VERY_HIGH: return 1.15
    default: return 0.85
  }
}

// 动作类型系数（降低）
function getTypeMultiplier(type: ExerciseType): number {
  switch (type) {
    case ExerciseType.COMPOUND: return 1.1    // 复合动作稍微多一点
    case ExerciseType.ISOLATION: return 0.85   // 孤立动作较少
    case ExerciseType.BODYWEIGHT: return 0.95  // 自重动作中等偏低
    case ExerciseType.CARDIO: return 1.2      // 有氧动作最高
    default: return 0.85
  }
}

// 根据肌肉群计算卡路里系数（保持向后兼容）
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
  
  return muscleGroupFactors[muscleGroup] || 0.05
} 