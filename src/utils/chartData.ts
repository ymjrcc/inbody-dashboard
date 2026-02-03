import type { HealthRecord, BasicInfo } from '../types/health'
import { calculateBodyFatPercentage, calculateBMI } from './healthCalculations'

/**
 * 生成主要指标数据
 */
export const generateMainMetrics = (sortedRecords: HealthRecord[], basic: BasicInfo) => {
  return [
    {
      key: 'weight',
      title: '体重',
      data: sortedRecords.map(r => [r.date, r.weight] as [string, number]),
      unit: sortedRecords[0]?.weightUnit,
      range: basic.weightRange
    },
    {
      key: 'leanBodyMass',
      title: '去脂体重',
      data: sortedRecords.map(r => [r.date, r.leanBodyMass] as [string, number]),
      unit: sortedRecords[0]?.leanBodyMassUnit,
      range: basic.leanBodyMassRange
    },
    {
      key: 'bodyFat',
      title: '体脂肪',
      data: sortedRecords.map(r => [r.date, r.bodyFat] as [string, number]),
      unit: sortedRecords[0]?.bodyFatUnit,
      range: basic.bodyFatRange
    },
    {
      key: 'bodyFatPercentage',
      title: '体脂率',
      data: sortedRecords.map(r => [r.date, calculateBodyFatPercentage(r.bodyFat, r.weight)] as [string, number]),
      unit: '%',
      range: basic.bodyFatPercentageRange,
      decimalPlaces: 2
    },
    {
      key: 'muscleMass',
      title: '肌肉量',
      data: sortedRecords.map(r => [r.date, r.muscleMass] as [string, number]),
      unit: sortedRecords[0]?.muscleMassUnit,
      range: basic.muscleMassRange
    },
    {
      key: 'bmi',
      title: 'BMI',
      data: sortedRecords.map(r => [r.date, calculateBMI(r.weight, basic.height)] as [string, number]),
      unit: undefined,
      range: basic.bmiRange,
      decimalPlaces: 2
    },
    {
      key: 'skeletalMuscle',
      title: '骨骼肌',
      data: sortedRecords.map(r => [r.date, r.skeletalMuscle] as [string, number]),
      unit: sortedRecords[0]?.skeletalMuscleUnit,
      range: undefined
    },
    {
      key: 'protein',
      title: '蛋白质',
      data: sortedRecords.map(r => [r.date, r.protein] as [string, number]),
      unit: sortedRecords[0]?.proteinUnit,
      range: basic.proteinRange
    },
    {
      key: 'inorganicSalt',
      title: '无机盐',
      data: sortedRecords.map(r => [r.date, r.inorganicSalt] as [string, number]),
      unit: sortedRecords[0]?.inorganicSaltUnit,
      range: basic.inorganicSaltRange
    },
    {
      key: 'totalWater',
      title: '身体总水分',
      data: sortedRecords.map(r => [r.date, r.totalWater] as [string, number]),
      unit: sortedRecords[0]?.totalWaterUnit,
      range: basic.totalWaterRange
    },
    {
      key: 'extracellularWaterPercentage',
      title: '细胞外水分比率',
      data: sortedRecords.map(r => [r.date, r.extracellularWaterPercentage * 100] as [string, number]),
      unit: '%',
      range: basic.extracellularWaterPercentageRange.map((item: number) => item * 100)
    }
  ]
}

/**
 * 生成肌肉均衡数据
 */
export const generateMuscleBalanceMetrics = (sortedRecords: HealthRecord[]) => {
  return [
    {
      key: 'leftUpperArm',
      title: '左上肢',
      weightData: sortedRecords.map(r => [r.date, r.muscleBalance.leftUpperArm.weight] as [string, number]),
      percentageData: sortedRecords.map(r => [r.date, r.muscleBalance.leftUpperArm.weightPercentage] as [string, number]),
      unit: sortedRecords[0]?.muscleBalance.leftUpperArm.weightUnit
    },
    {
      key: 'rightUpperArm',
      title: '右上肢',
      weightData: sortedRecords.map(r => [r.date, r.muscleBalance.rightUpperArm.weight] as [string, number]),
      percentageData: sortedRecords.map(r => [r.date, r.muscleBalance.rightUpperArm.weightPercentage] as [string, number]),
      unit: sortedRecords[0]?.muscleBalance.rightUpperArm.weightUnit
    },
    {
      key: 'trunk',
      title: '躯干',
      weightData: sortedRecords.map(r => [r.date, r.muscleBalance.trunk.weight] as [string, number]),
      percentageData: sortedRecords.map(r => [r.date, r.muscleBalance.trunk.weightPercentage] as [string, number]),
      unit: sortedRecords[0]?.muscleBalance.trunk.weightUnit
    },
    {
      key: 'leftLowerLimb',
      title: '左下肢',
      weightData: sortedRecords.map(r => [r.date, r.muscleBalance.leftLowerLimb.weight] as [string, number]),
      percentageData: sortedRecords.map(r => [r.date, r.muscleBalance.leftLowerLimb.weightPercentage] as [string, number]),
      unit: sortedRecords[0]?.muscleBalance.leftLowerLimb.weightUnit
    },
    {
      key: 'rightLowerLimb',
      title: '右下肢',
      weightData: sortedRecords.map(r => [r.date, r.muscleBalance.rightLowerLimb.weight] as [string, number]),
      percentageData: sortedRecords.map(r => [r.date, r.muscleBalance.rightLowerLimb.weightPercentage] as [string, number]),
      unit: sortedRecords[0]?.muscleBalance.rightLowerLimb.weightUnit
    }
  ]
}
