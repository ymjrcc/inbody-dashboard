import { useMemo } from 'react'
import { Tabs, Card, Row, Col, Statistic, Rate, Empty, Tag } from 'antd'
import type { TabsProps } from 'antd'
import { UserOutlined, CalendarOutlined, ManOutlined, WomanOutlined, ArrowsAltOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
// @ts-ignore
import records from '../assets/records.json5'
// @ts-ignore
import basic from '../assets/basic.json5'

type HealthRecord = typeof records[0]
type BasicInfo = typeof basic

// 判断数值是否在正常范围内
const isInRange = (value: number, range: number[]) => {
  return range.length >= 2 && range[0] <= range[1] && value >= range[0] && value <= range[1]
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
    children: <RecordDetail record={record} basic={basic} sortedRecords={sortedRecords} />
  }))

  const basicInfoList = [
    {
      key: 'name',
      title: '姓名',
      value: basic.name,
      icon: <UserOutlined className="text-blue-500" />,
    },
    {
      key: 'birthday',
      title: '生日',
      value: basic.birthday,
      icon: <CalendarOutlined className="text-green-500" />,
    },
    {
      key: 'gender',
      title: '性别',
      value: basic.gender,
      icon: basic.gender === '男' ? <ManOutlined className="text-blue-600" /> : <WomanOutlined className="text-pink-500" />,
    },
    {
      key: 'height',
      title: '身高',
      value: `${basic.height} cm`,
      icon: <ArrowsAltOutlined className="text-purple-500" />,
    }
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数据总览</h1>
        <p className="text-gray-600">查看您的健康测量记录和详细数据</p>
      </div>

      {/* 基础信息卡片 */}
      <Card 
        title={<span className="text-lg font-semibold">基础信息</span>}
        className="mb-6 shadow-sm"
      >
        <Row gutter={[16, 16]}>
          {basicInfoList.map(item => (
            <Col xs={24} sm={12} md={6} key={item.key}>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">{item.title}</div>
                  <div className="text-lg font-semibold text-gray-900">{item.value}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 记录 Tabs */}
      <Card 
        title={<span className="text-lg font-semibold">测量记录</span>}
        className="shadow-sm"
      >
        {sortedRecords.length === 0 ? (
          <Empty description="暂无测量记录" />
        ) : (
          <Tabs 
            defaultActiveKey={sortedRecords[0]?.date} 
            items={tabItems}
            type="card"
            size="large"
          />
        )}
      </Card>
    </div>
  )
}

// 记录详情组件
function RecordDetail({ record, basic, sortedRecords }: { record: HealthRecord; basic: BasicInfo; sortedRecords: HealthRecord[] }) {
  // 计算体脂率 = 体脂肪 / 体重 * 100
  const bodyFatPercentage = (record.bodyFat / record.weight) * 100
  
  // 计算 BMI = 体重(kg) / 身高(m)²
  const heightInMeters = basic.height / 100
  const bmi = record.weight / (heightInMeters * heightInMeters)

  // 获取上一条记录（按日期排序的下一条，因为sortedRecords是按日期倒序的）
  const currentIndex = sortedRecords.findIndex(r => r.date === record.date)
  const previousRecord = currentIndex >= 0 && currentIndex < sortedRecords.length - 1 
    ? sortedRecords[currentIndex + 1] 
    : null

  // 计算与上一条记录的差值
  const getComparison = (currentValue: number, previousValue: number | null, unit?: string) => {
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
      icon: isIncrease ? <ArrowUpOutlined className='text-sm' /> : <ArrowDownOutlined className='text-sm' />,
      color: isIncrease ? '#cf1322' : '#3f8600'
    }
  }

  const mainList = [
    {
      key: 'weight',
      title: '体重',
      value: record.weight,
      unit: record.weightUnit,
      range: basic.weightRange,
      previousValue: previousRecord?.weight ?? null,
    },
    {
      key: 'bodyFat',
      title: '体脂肪',
      value: record.bodyFat,
      unit: record.bodyFatUnit,
      range: basic.bodyFatRange,
      previousValue: previousRecord?.bodyFat ?? null,
    },
    {
      key: 'bodyFatPercentage',
      title: '体脂率',
      value: bodyFatPercentage,
      unit: '%',
      range: basic.bodyFatPercentageRange,
      formatValue: true,
      previousValue: previousRecord ? (previousRecord.bodyFat / previousRecord.weight) * 100 : null,
    },
    {
      key: 'bmi',
      title: 'BMI',
      value: bmi,
      unit: undefined,
      range: basic.bmiRange,
      formatValue: true,
      previousValue: previousRecord ? previousRecord.weight / (heightInMeters * heightInMeters) : null,
    },
    {
      key: 'muscleMass',
      title: '肌肉量',
      value: record.muscleMass,
      unit: record.muscleMassUnit,
      range: basic.muscleMassRange,
      previousValue: previousRecord?.muscleMass ?? null,
    },
    {
      key: 'leanBodyMass',
      title: '去脂体重',
      value: record.leanBodyMass,
      unit: record.leanBodyMassUnit,
      range: basic.leanBodyMassRange,
      previousValue: previousRecord?.leanBodyMass ?? null,
    },
    {
      key: 'totalWater',
      title: '身体总水分',
      value: record.totalWater,
      unit: record.totalWaterUnit,
      range: basic.totalWaterRange,
      previousValue: previousRecord?.totalWater ?? null,
    },
    {
      key: 'protein',
      title: '蛋白质',
      value: record.protein,
      unit: record.proteinUnit,
      range: basic.proteinRange,
      previousValue: previousRecord?.protein ?? null,
    },
    {
      key: 'inorganicSalt',
      title: '无机盐',
      value: record.inorganicSalt,
      unit: record.inorganicSaltUnit,
      range: basic.inorganicSaltRange,
      previousValue: previousRecord?.inorganicSalt ?? null,
    },
    {
      key: 'skeletalMuscle',
      title: '骨骼肌',
      value: record.skeletalMuscle,
      unit: record.skeletalMuscleUnit,
      previousValue: previousRecord?.skeletalMuscle ?? null,
    },
    {
      key: 'extracellularWaterPercentage',
      title: '细胞外水分比率',
      value: record.extracellularWaterPercentage,
      previousValue: previousRecord?.extracellularWaterPercentage ?? null,
    },
  ]

  const muscleBalanceList = [
    {
      key: 'leftUpperArm',
      title: '左上肢',
      data: record.muscleBalance.leftUpperArm,
      previousData: previousRecord?.muscleBalance?.leftUpperArm ?? null,
    },
    {
      key: 'blank1',
      blank: true,
    },
    {
      key: 'rightUpperArm',
      title: '右上肢',
      data: record.muscleBalance.rightUpperArm,
      previousData: previousRecord?.muscleBalance?.rightUpperArm ?? null,
    },
    {
      key: 'blank2',
      blank: true,
    },
    {
      key: 'trunk',
      title: '躯干',
      data: record.muscleBalance.trunk,
      previousData: previousRecord?.muscleBalance?.trunk ?? null,
    },
    {
      key: 'blank3',
      blank: true,
    },
    {
      key: 'leftLowerLimb',
      title: '左下肢',
      data: record.muscleBalance.leftLowerLimb,
      previousData: previousRecord?.muscleBalance?.leftLowerLimb ?? null,
    },
    {
      key: 'blank4',
      blank: true,
    },
    {
      key: 'rightLowerLimb',
      title: '右下肢',
      data: record.muscleBalance.rightLowerLimb,
      previousData: previousRecord?.muscleBalance?.rightLowerLimb ?? null,
    },
  ]
  
  // 根据评分获取颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a'
    if (score >= 60) return '#faad14'
    return '#ff4d4f'
  }

  // 根据评分获取标签
  const getScoreTag = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    return '需改善'
  }

  return (
    <div className="space-y-6">
      {/* 综合评分卡片 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
          <div>
            <div className="text-sm text-gray-600 mb-2">综合评分</div>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold" style={{ color: getScoreColor(record.score) }}>
                {record.score}
              </div>
              <Tag color={getScoreColor(record.score)} className="text-base px-3 py-1">
                {getScoreTag(record.score)}
              </Tag>
              <div className="flex items-center space-x-2 ml-6">
                <Rate 
                  disabled 
                  count={5} 
                  value={record.score / 20} 
                  style={{ fontSize: '20px' }}
                  aria-label="综合评分" 
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 主要指标 */}
      <Card 
        title={<span className="text-lg font-semibold">主要指标</span>}
        className="shadow-sm"
      >
        <Row gutter={[16, 24]}>
          {mainList.map(metric => {
            const inRange = metric.range ? isInRange(metric.value, metric.range) : null
            const comparison = getComparison(metric.value, metric.previousValue ?? null, metric.unit)
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={metric.key}>
                <div className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <Statistic
                    title={metric.title}
                    value={metric.formatValue ? metric.value.toFixed(2) : metric.value}
                    suffix={
                      <span className="flex items-center gap-1">
                        {metric.unit && <span>{metric.unit}</span>}
                        {comparison && (
                          <span className="flex items-center gap-1 ml-2" style={{ color: comparison.color }}>
                            {comparison.icon}
                            <span className="text-sm font-medium">{comparison.displayText}</span>
                          </span>
                        )}
                      </span>
                    }
                    styles={{
                      content: metric.range ? { 
                        color: inRange ? '#3f8600' : '#cf1322',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      } : {
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                  {metric.range && (
                    <>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">
                          正常范围: {metric.range[0]} - {metric.range[1]} {metric.unit || ''}
                        </div>
                        <Tag 
                          color={inRange ? 'success' : 'error'}
                        >
                          {inRange ? '正常' : '异常'}
                        </Tag>
                      </div>
                      <RangeVisualization value={metric.value} range={metric.range} />
                    </>
                  )}
                </div>
              </Col>
            )
          })}
        </Row>
      </Card>

      {/* 肌肉均衡 */}
      <Card 
        title={<span className="text-lg font-semibold">肌肉均衡</span>}
        className="shadow-sm"
      >
        <Row gutter={[16, 16]}>
          {muscleBalanceList.map(item => {
            if (item.blank) {
              return (
                <Col xs={24} sm={12} md={8} lg={8} xl={8} key={item.key}>
                </Col>
              )
            }
            const weightComparison = getComparison(
              item.data.weight, 
              item.previousData?.weight ?? null, 
              item.data.weightUnit
            )
            const percentageComparison = getComparison(
              item.data.weightPercentage, 
              item.previousData?.weightPercentage ?? null, 
              '%'
            )
            return (
              <Col xs={24} sm={12} md={8} lg={8} xl={8} key={item.key}>
                <div className="p-4 rounded-lg border border-solid border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50">
                  <div className="text-sm text-gray-600 mb-2">{item.title}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span>{item.data.weight} {item.data.weightUnit}</span>
                    {weightComparison && (
                      <span className="flex items-center gap-1 text-base" style={{ color: weightComparison.color }}>
                        {weightComparison.icon}
                        <span className="text-sm font-medium">{weightComparison.displayText}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">相对于标准值</div>
                    <Tag color="blue" className="text-xs">
                      {item.data.weightPercentage}%
                    </Tag>
                    {percentageComparison && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: percentageComparison.color }}>
                        {percentageComparison.icon}
                        <span className="font-medium">{percentageComparison.displayText}</span>
                      </span>
                    )}
                  </div>
                </div>
              </Col>
            )
          })}
        </Row>
      </Card>
    </div>
  )
}
