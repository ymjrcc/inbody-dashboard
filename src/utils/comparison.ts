import { createElement } from 'react'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { ReactElement } from 'react'

export interface ComparisonResult {
  diff: number
  isIncrease: boolean
  isDecrease: boolean
  displayText: string
  icon: ReactElement
  color: string
}

/**
 * 计算与上一条记录的差值
 */
export const getComparison = (
  currentValue: number,
  previousValue: number | null,
  unit?: string
): ComparisonResult | null => {
  if (previousValue === null || previousValue === undefined) {
    return null
  }
  const diff = currentValue - previousValue
  // 处理浮点数精度问题，小于 0.001 的差值视为无变化
  if (Math.abs(diff) < 0.001) {
    return null
  }
  const isIncrease = diff > 0
  const isDecrease = diff < 0

  // 格式化差值
  const formatDiff = (val: number) => {
    if (Math.abs(val) < 0.01) {
      return val.toFixed(3)
    }
    return val.toFixed(2)
  }

  return {
    diff,
    isIncrease,
    isDecrease,
    displayText: `${isIncrease ? '+' : ''}${formatDiff(diff)}${unit || ''}`,
    icon: isIncrease
      ? createElement(ArrowUpOutlined, { className: 'text-sm' })
      : createElement(ArrowDownOutlined, { className: 'text-sm' }),
    color: isIncrease ? '#cf1322' : '#3f8600'
  }
}
