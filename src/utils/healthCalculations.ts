/**
 * 计算骨骼肌正常范围
 */
export const skeletalMuscleRange = (weight: number) => {
  const formatNumber = (numb: number) => Number(numb.toFixed(2))
  return [formatNumber(weight * 0.4), formatNumber(weight * 0.5)]
}

/**
 * 判断数值是否在正常范围内
 */
export const isInRange = (value: number, range: number[]) => {
  return range.length >= 2 && range[0] <= range[1] && value >= range[0] && value <= range[1]
}

/**
 * 计算体脂率
 */
export const calculateBodyFatPercentage = (bodyFat: number, weight: number) => {
  return (bodyFat / weight) * 100
}

/**
 * 计算 BMI
 */
export const calculateBMI = (weight: number, height: number) => {
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

/**
 * 格式化日期显示
 */
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
