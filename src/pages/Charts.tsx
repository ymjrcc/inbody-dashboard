import { useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts'
import { Card, Row, Col } from 'antd'
// @ts-ignore
import records from '../assets/records.json5'
// @ts-ignore
import basic from '../assets/basic.json5'

// 图表组件
function Chart({ 
  title, 
  data, 
  unit, 
  range 
}: { 
  title: string
  data: Array<[string, number]>
  unit?: string
  range?: number[]
}) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // 初始化图表
    const chart = echarts.init(chartRef.current)
    chartInstanceRef.current = chart

    // 准备数据：按时间排序
    const sortedData = [...data].sort((a, b) => 
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    )

    // 计算纵轴最小值：取数据最小值和范围下限的较小值，然后减去适当的余量，并向下取整为5的倍数
    const dataMin = Math.min(...sortedData.map(([, value]) => value))
    const rangeMin = range ? range[0] : dataMin
    const minValue = Math.min(dataMin, rangeMin)
    // 计算余量：取最小值的5%作为余量，确保有足够的显示空间
    const padding = Math.abs(minValue) * 0.05
    const yAxisMin = Math.floor((minValue - padding) / 5) * 5

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params
          const date = new Date(param.value[0])
          const dateStr = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          return `${dateStr}<br/>${param.seriesName}: ${param.value[1]}${unit || ''}`
        }
      },
      grid: {
        left: '5%',
        right: '10%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: number) => {
            const date = new Date(value)
            return date.toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric'
            })
          }
        }
      },
      yAxis: {
        type: 'value',
        name: unit || '',
        nameLocation: 'end',
        nameGap: 10,
        min: yAxisMin
      },
      series: [
        {
          name: title,
          type: 'line',
          data: sortedData.map(([date, value]) => [date, value]),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2
          },
          markLine: range ? {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              width: 1.5,
              color: '#999'
            },
            label: {
              show: true,
              position: 'end',
              formatter: (params: any) => {
                return `${params.value}${unit || ''}`
              }
            },
            data: [
              {
                yAxis: range[0],
                name: '正常范围下限'
              },
              {
                yAxis: range[1],
                name: '正常范围上限'
              }
            ]
          } : undefined
        }
      ]
    }

    chart.setOption(option)

    // 响应式调整
    const handleResize = () => {
      chart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [title, data, unit, range])

  return (
    <div 
      ref={chartRef} 
      style={{ width: '100%', height: '300px' }}
    />
  )
}

export default function Charts() {
  // 按日期排序
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [])

  // 计算体脂率和BMI
  const heightInMeters = basic.height / 100

  // 主要指标数据
  const mainMetrics = useMemo(() => {
    return [
      {
        key: 'weight',
        title: '体重',
        data: sortedRecords.map(r => [r.date, r.weight] as [string, number]),
        unit: sortedRecords[0]?.weightUnit,
        range: basic.weightRange
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
        data: sortedRecords.map(r => [r.date, (r.bodyFat / r.weight) * 100] as [string, number]),
        unit: '%',
        range: basic.bodyFatPercentageRange
      },
      {
        key: 'bmi',
        title: 'BMI',
        data: sortedRecords.map(r => [r.date, r.weight / (heightInMeters * heightInMeters)] as [string, number]),
        unit: undefined,
        range: basic.bmiRange
      },
      {
        key: 'muscleMass',
        title: '肌肉量',
        data: sortedRecords.map(r => [r.date, r.muscleMass] as [string, number]),
        unit: sortedRecords[0]?.muscleMassUnit,
        range: basic.muscleMassRange
      },
      {
        key: 'leanBodyMass',
        title: '去脂体重',
        data: sortedRecords.map(r => [r.date, r.leanBodyMass] as [string, number]),
        unit: sortedRecords[0]?.leanBodyMassUnit,
        range: basic.leanBodyMassRange
      },
      {
        key: 'totalWater',
        title: '身体总水分',
        data: sortedRecords.map(r => [r.date, r.totalWater] as [string, number]),
        unit: sortedRecords[0]?.totalWaterUnit,
        range: basic.totalWaterRange
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
        key: 'skeletalMuscle',
        title: '骨骼肌',
        data: sortedRecords.map(r => [r.date, r.skeletalMuscle] as [string, number]),
        unit: sortedRecords[0]?.skeletalMuscleUnit,
        range: undefined
      },
      {
        key: 'extracellularWaterPercentage',
        title: '细胞外水分比率',
        data: sortedRecords.map(r => [r.date, r.extracellularWaterPercentage] as [string, number]),
        unit: undefined,
        range: undefined
      }
    ]
  }, [sortedRecords, heightInMeters])

  // 肌肉均衡数据
  const muscleBalanceMetrics = useMemo(() => {
    return [
      {
        key: 'rightUpperArm',
        title: '右上肢',
        data: sortedRecords.map(r => [r.date, r.muscleBalance.rightUpperArm.weight] as [string, number]),
        unit: sortedRecords[0]?.muscleBalance.rightUpperArm.weightUnit,
        range: undefined
      },
      {
        key: 'leftUpperArm',
        title: '左上肢',
        data: sortedRecords.map(r => [r.date, r.muscleBalance.leftUpperArm.weight] as [string, number]),
        unit: sortedRecords[0]?.muscleBalance.leftUpperArm.weightUnit,
        range: undefined
      },
      {
        key: 'trunk',
        title: '躯干',
        data: sortedRecords.map(r => [r.date, r.muscleBalance.trunk.weight] as [string, number]),
        unit: sortedRecords[0]?.muscleBalance.trunk.weightUnit,
        range: undefined
      },
      {
        key: 'rightLowerLimb',
        title: '右下肢',
        data: sortedRecords.map(r => [r.date, r.muscleBalance.rightLowerLimb.weight] as [string, number]),
        unit: sortedRecords[0]?.muscleBalance.rightLowerLimb.weightUnit,
        range: undefined
      },
      {
        key: 'leftLowerLimb',
        title: '左下肢',
        data: sortedRecords.map(r => [r.date, r.muscleBalance.leftLowerLimb.weight] as [string, number]),
        unit: sortedRecords[0]?.muscleBalance.leftLowerLimb.weightUnit,
        range: undefined
      }
    ]
  }, [sortedRecords])

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">图表分析</h1>

      {/* 主要指标 */}
      <Card title="主要指标" className="mb-6">
        <Row gutter={[16, 24]}>
          {mainMetrics.map(metric => (
            <Col xs={24} sm={12} lg={12} key={metric.key}>
              <Chart
                title={metric.title}
                data={metric.data}
                unit={metric.unit}
                range={metric.range}
              />
            </Col>
          ))}
        </Row>
      </Card>

      {/* 肌肉均衡 */}
      <Card title="肌肉均衡">
        <Row gutter={[16, 24]}>
          {muscleBalanceMetrics.map(metric => (
            <Col xs={24} sm={12} lg={12} key={metric.key}>
              <Chart
                title={metric.title}
                data={metric.data}
                unit={metric.unit}
                range={metric.range}
              />
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}
