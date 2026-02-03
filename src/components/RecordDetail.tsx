import { Card, Row, Col, Statistic, Rate, Tag } from 'antd'
import type { HealthRecord, BasicInfo } from '../types/health'
import { isInRange, calculateBodyFatPercentage, calculateBMI, skeletalMuscleRange } from '../utils/healthCalculations'
import { getComparison } from '../utils/comparison'
import RangeVisualization from './RangeVisualization'

interface RecordDetailProps {
  record: HealthRecord
  basic: BasicInfo
  sortedRecords: HealthRecord[]
}

/**
 * 记录详情组件
 */
export default function RecordDetail({ record, basic, sortedRecords }: RecordDetailProps) {
  // 计算体脂率 = 体脂肪 / 体重 * 100
  const bodyFatPercentage = calculateBodyFatPercentage(record.bodyFat, record.weight)

  // 计算 BMI = 体重(kg) / 身高(m)²
  const bmi = calculateBMI(record.weight, basic.height)

  // 获取上一条记录（按日期排序的下一条，因为sortedRecords是按日期倒序的）
  const currentIndex = sortedRecords.findIndex(r => r.date === record.date)
  const previousRecord = currentIndex >= 0 && currentIndex < sortedRecords.length - 1
    ? sortedRecords[currentIndex + 1]
    : null

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
      previousValue: previousRecord ? calculateBodyFatPercentage(previousRecord.bodyFat, previousRecord.weight) : null,
    },
    {
      key: 'bmi',
      title: 'BMI',
      value: bmi,
      unit: undefined,
      range: basic.bmiRange,
      formatValue: true,
      previousValue: previousRecord ? calculateBMI(previousRecord.weight, basic.height) : null,
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
      key: 'extracellularWaterPercentage',
      title: '细胞外水分比率',
      value: record.extracellularWaterPercentage * 100,
      unit: '%',
      range: basic.extracellularWaterPercentageRange.map((item: number) => item * 100),
      previousValue: previousRecord?.extracellularWaterPercentage ? previousRecord.extracellularWaterPercentage * 100 : null,
    },
    {
      key: 'skeletalMuscle',
      title: '骨骼肌',
      value: record.skeletalMuscle,
      unit: record.skeletalMuscleUnit,
      range: skeletalMuscleRange(record.weight),
      previousValue: previousRecord?.skeletalMuscle ?? null,
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
