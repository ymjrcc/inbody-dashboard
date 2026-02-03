import { useMemo } from 'react'
import { Tabs, Card, Row, Col, Statistic, Rate } from 'antd'
import type { TabsProps } from 'antd'
// @ts-ignore
import records from '../assets/records.json5'
// @ts-ignore
import basic from '../assets/basic.json5'

type Record = typeof records[0]
type BasicInfo = typeof basic

// 判断数值是否在正常范围内
const isInRange = (value: number, range: number[]) => {
  return range.length >= 2 && value >= range[0] && value <= range[1]
}

// 范围可视化组件
function RangeVisualization({ 
  value, 
  range, 
  min, 
  max 
}: { 
  value: number
  range: number[]
  min?: number
  max?: number
}) {
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
    // 在范围内：不留白，直接使用正常范围
    rangeMin = range[0]
    rangeMax = range[1]
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

export default function Home() {
  // 按日期倒序排序（最新的在前）
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [])

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 生成 Tabs 配置
  const tabItems: TabsProps['items'] = sortedRecords.map((record) => ({
    key: record.date,
    label: formatDate(record.date),
    children: <RecordDetail record={record} basic={basic} />
  }))

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* 基础信息卡片 */}
      <Card title="基础信息" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="text-gray-600">姓名</div>
            <div className="text-lg font-semibold">{basic.name}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-gray-600">生日</div>
            <div className="text-lg font-semibold">{basic.birthday}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-gray-600">性别</div>
            <div className="text-lg font-semibold">{basic.gender}</div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-gray-600">身高</div>
            <div className="text-lg font-semibold">{basic.height} cm</div>
          </Col>
        </Row>
      </Card>

      {/* 记录 Tabs */}
      <Card title="测量记录">
        <Tabs defaultActiveKey={sortedRecords[0]?.date} items={tabItems} />
      </Card>
    </div>
  )
}

// 记录详情组件
function RecordDetail({ record, basic }: { record: Record; basic: BasicInfo }) {
  // 计算体脂率 = 体脂肪 / 体重 * 100
  const bodyFatPercentage = (record.bodyFat / record.weight) * 100
  
  // 计算 BMI = 体重(kg) / 身高(m)²
  const heightInMeters = basic.height / 100
  const bmi = record.weight / (heightInMeters * heightInMeters)
  
  return (
    <div className="space-y-6">
      {/* 主要指标 */}
      <Card title={
        <div className='flex justify-between items-center'>
          <div>主要指标</div>
          <div className='flex space-x-2'>
            <div>综合评分：</div>
            <Rate disabled count={5} value={record.score / 20} />
            <div>{record.score}</div>
          </div>
        </div>
      }>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Statistic
              title="体重"
              value={record.weight}
              suffix={record.weightUnit}
              valueStyle={{
                color: isInRange(record.weight, basic.weightRange) ? '#3f8600' : '#cf1322'
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              正常范围: {basic.weightRange[0]} - {basic.weightRange[1]} {record.weightUnit}
            </div>
            <RangeVisualization 
              value={record.weight} 
              range={basic.weightRange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Statistic
              title="体脂肪"
              value={record.bodyFat}
              suffix={record.bodyFatUnit}
              valueStyle={{
                color: isInRange(record.bodyFat, basic.bodyFatRange) ? '#3f8600' : '#cf1322'
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              正常范围: {basic.bodyFatRange[0]} - {basic.bodyFatRange[1]} {record.bodyFatUnit}
            </div>
            <RangeVisualization 
              value={record.bodyFat} 
              range={basic.bodyFatRange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Statistic
              title="体脂率"
              value={bodyFatPercentage.toFixed(2)}
              suffix="%"
              valueStyle={{
                color: isInRange(bodyFatPercentage, basic.bodyFatPercentageRange) ? '#3f8600' : '#cf1322'
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              正常范围: {basic.bodyFatPercentageRange[0]} - {basic.bodyFatPercentageRange[1]}%
            </div>
            <RangeVisualization 
              value={bodyFatPercentage} 
              range={basic.bodyFatPercentageRange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Statistic
              title="BMI"
              value={bmi.toFixed(2)}
              valueStyle={{
                color: isInRange(bmi, basic.bmiRange) ? '#3f8600' : '#cf1322'
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              正常范围: {basic.bmiRange[0]} - {basic.bmiRange[1]}
            </div>
            <RangeVisualization 
              value={bmi} 
              range={basic.bmiRange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Statistic
              title="肌肉量"
              value={record.muscleMass}
              suffix={record.muscleMassUnit}
              valueStyle={{
                color: isInRange(record.muscleMass, basic.muscleMassRange) ? '#3f8600' : '#cf1322'
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              正常范围: {basic.muscleMassRange[0]} - {basic.muscleMassRange[1]} {record.muscleMassUnit}
            </div>
            <RangeVisualization 
              value={record.muscleMass} 
              range={basic.muscleMassRange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Statistic
              title="去脂体重"
              value={record.leanBodyMass}
              suffix={record.leanBodyMassUnit}
              valueStyle={{
                color: isInRange(record.leanBodyMass, basic.leanBodyMassRange) ? '#3f8600' : '#cf1322'
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              正常范围: {basic.leanBodyMassRange[0]} - {basic.leanBodyMassRange[1]} {record.leanBodyMassUnit}
            </div>
            <RangeVisualization 
              value={record.leanBodyMass} 
              range={basic.leanBodyMassRange}
            />
          </Col>
          {[
            {
              key: 'totalWater',
              title: '身体总水分',
              value: record.totalWater,
              unit: record.totalWaterUnit,
              range: basic.totalWaterRange,
            },
            {
              key: 'protein',
              title: '蛋白质',
              value: record.protein,
              unit: record.proteinUnit,
              range: basic.proteinRange,
            },
            {
              key: 'inorganicSalt',
              title: '无机盐',
              value: record.inorganicSalt,
              unit: record.inorganicSaltUnit,
              range: basic.inorganicSaltRange,
            },
            {
              key: 'skeletalMuscle',
              title: '骨骼肌',
              value: record.skeletalMuscle,
              unit: record.skeletalMuscleUnit,
            },
            {
              key: 'extracellularWaterPercentage',
              title: '细胞外水分比率',
              value: record.extracellularWaterPercentage,
            },
          ].map(metric => (
            <Col xs={24} sm={12} md={8} lg={6} key={metric.key}>
              <Statistic
                title={metric.title}
                value={metric.value}
                suffix={metric.unit}
                valueStyle={
                  metric.range
                    ? {
                        color: isInRange(metric.value, metric.range) ? '#3f8600' : '#cf1322',
                      }
                    : undefined
                }
              />
              {metric.range && (
                <>
                  <div className="text-xs text-gray-500 mt-1">
                    正常范围: {metric.range[0]} - {metric.range[1]} {metric.unit}
                  </div>
                  <RangeVisualization value={metric.value} range={metric.range} />
                </>
              )}
            </Col>
          ))}
        </Row>
      </Card>

      {/* 肌肉均衡 */}
      <Card title="肌肉均衡">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div className="text-gray-600 mb-1">右上肢</div>
            <div className="text-lg font-semibold">
              {record.muscleBalance.rightUpperArm.weight} {record.muscleBalance.rightUpperArm.weightUnit}
            </div>
            <div className="text-sm text-gray-500">
              ({record.muscleBalance.rightUpperArm.weightPercentage}%)
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="text-gray-600 mb-1">左上肢</div>
            <div className="text-lg font-semibold">
              {record.muscleBalance.leftUpperArm.weight} {record.muscleBalance.leftUpperArm.weightUnit}
            </div>
            <div className="text-sm text-gray-500">
              ({record.muscleBalance.leftUpperArm.weightPercentage}%)
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="text-gray-600 mb-1">躯干</div>
            <div className="text-lg font-semibold">
              {record.muscleBalance.trunk.weight} {record.muscleBalance.trunk.weightUnit}
            </div>
            <div className="text-sm text-gray-500">
              ({record.muscleBalance.trunk.weightPercentage}%)
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="text-gray-600 mb-1">右下肢</div>
            <div className="text-lg font-semibold">
              {record.muscleBalance.rightLowerLimb.weight} {record.muscleBalance.rightLowerLimb.weightUnit}
            </div>
            <div className="text-sm text-gray-500">
              ({record.muscleBalance.rightLowerLimb.weightPercentage}%)
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="text-gray-600 mb-1">左下肢</div>
            <div className="text-lg font-semibold">
              {record.muscleBalance.leftLowerLimb.weight} {record.muscleBalance.leftLowerLimb.weightUnit}
            </div>
            <div className="text-sm text-gray-500">
              ({record.muscleBalance.leftLowerLimb.weightPercentage}%)
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
