import { isInRange } from '../utils/healthCalculations'

interface RangeVisualizationProps {
  value: number
  range: number[]
  min?: number
  max?: number
}

/**
 * 范围可视化组件
 */
export default function RangeVisualization({
  value,
  range,
  min,
  max
}: RangeVisualizationProps) {
  const inRange = isInRange(value, range)
  const rangeSpan = range[1] - range[0]

  // 根据值是否在范围内决定可视化的范围
  let rangeMin: number
  let rangeMax: number

  if (min !== undefined && max !== undefined) {
    // 如果提供了自定义范围，使用自定义范围
    rangeMin = min
    rangeMax = max
  } else if (inRange) {
    // 在范围内：适当留白
    const padding = rangeSpan * 0.1 // 留白为范围跨度的10%
    rangeMin = range[0] - padding
    rangeMax = range[1] + padding
  } else {
    // 在范围外：适当留白
    const padding = rangeSpan * 0.1 // 留白为范围跨度的10%
    if (value < range[0]) {
      // 值小于最小值
      rangeMin = value - padding
      rangeMax = range[1] + padding
    } else {
      // 值大于最大值
      rangeMin = range[0] - padding
      rangeMax = value + padding
    }
  }

  // 计算当前值在可视化范围内的位置（百分比）
  let valuePosition: number
  let rangeStartPosition: number
  let rangeEndPosition: number

  if (rangeMax === rangeMin) {
    // 避免除以 0 的情况：当范围跨度为 0 时，将位置固定在中间
    valuePosition = 50
    rangeStartPosition = 50
    rangeEndPosition = 50
  } else {
    valuePosition = ((value - rangeMin) / (rangeMax - rangeMin)) * 100
    rangeStartPosition = ((range[0] - rangeMin) / (rangeMax - rangeMin)) * 100
    rangeEndPosition = ((range[1] - rangeMin) / (rangeMax - rangeMin)) * 100
  }

  // 确保位置在 0-100% 之间
  const clampedValuePosition = Math.max(0, Math.min(100, valuePosition))

  return (
    <div className="mt-2">
      <div
        className="relative h-6 rounded"
        style={{
          backgroundColor: inRange ? '#f6ffed' : '#fff1f0',
          border: `1px solid ${inRange ? '#b7eb8f' : '#ffccc7'}`
        }}
      >
        {/* 正常范围背景 */}
        <div
          className="absolute h-full rounded"
          style={{
            left: `${rangeStartPosition}%`,
            width: `${rangeEndPosition - rangeStartPosition}%`,
            backgroundColor: inRange ? '#b7eb8f' : '#ffccc7',
            opacity: 0.3
          }}
        />
        {/* 当前值竖线 */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{
            left: `${clampedValuePosition}%`,
            backgroundColor: inRange ? '#52c41a' : '#ff4d4f',
            transform: 'translateX(-50%)'
          }}
        />
      </div>
    </div>
  )
}
