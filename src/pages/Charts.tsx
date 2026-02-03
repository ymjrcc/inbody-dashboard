import { useEffect, useRef, useMemo, Fragment } from 'react'
import * as echarts from 'echarts'
import { Card, Row, Col, Empty } from 'antd'
// @ts-ignore
import records from '../assets/records.json5'
// @ts-ignore
import basic from '../assets/basic.json5'

// 图表组件
function Chart({ 
  title, 
  data, 
  unit, 
  range,
  decimalPlaces = 0,
  showPercentageLine = false
}: { 
  title: string
  data: Array<[string, number]>
  unit?: string
  range?: number[]
  decimalPlaces?: number
  showPercentageLine?: boolean
}) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // 初始化图表
    const chart = echarts.init(chartRef.current)
    chartInstanceRef.current = chart

    // 数据已在父组件中按时间排序，这里直接使用
    const sortedData = data

    // 如果没有数据，显示空状态
    if (sortedData.length === 0) {
      return
    }

    // 计算纵轴最小值：取数据最小值和范围下限的较小值，然后减去适当的余量，并向下取整为5的倍数
    const dataMin = Math.min(...sortedData.map(([, value]) => value))
    const dataMax = Math.max(...sortedData.map(([, value]) => value))
    const rangeMin = range ? range[0] : dataMin
    const rangeMax = range ? range[1] : dataMax
    const minValue = Math.min(dataMin, rangeMin)
    const maxValue = Math.max(dataMax, rangeMax)
    // 计算余量：取最小值的5%作为余量，确保有足够的显示空间
    const padding = Math.abs(minValue) * 0.05
    const yAxisMin = Math.floor((minValue - padding) / 5) * 5
    const yAxisMax = Math.ceil((maxValue + padding) / 5) * 5

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
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params
          // 处理对象格式的数据（有 itemStyle）和数组格式的数据
          const dataValue = param.data?.value ? param.data.value : param.value
          const date = new Date(dataValue[0])
          const dateStr = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          const value = decimalPlaces > 0 
            ? dataValue[1].toFixed(decimalPlaces) 
            : dataValue[1]
          return `${dateStr}<br/>${param.seriesName}: ${value}${unit || ''}`
        }
      },
      legend: {
        show: true,
        top: 30,
        data: [title]
      },
      grid: {
        left: '8%',
        right: '8%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 10,
          handleStyle: {
            color: '#1890ff'
          }
        }
      ],
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: number) => {
            const date = new Date(value)
            return date.toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric'
            })
          },
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: unit || '',
        nameLocation: 'end',
        nameGap: 10,
        min: yAxisMin,
        max: yAxisMax,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.3
          }
        }
      },
      series: [
        {
          name: title,
          type: 'line',
          data: sortedData.map(([date, value]) => {
            if (range) {
              // 有范围时，根据值是否在范围内设置颜色
              const isInRange = value >= range[0] && value <= range[1]
              return {
                value: [date, value],
                itemStyle: {
                  color: isInRange ? '#52c41a' : '#ff4d4f' // 绿色-范围内，红色-范围外
                }
              }
            }
            // 没有范围时，使用默认颜色
            return [date, value]
          }),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#1890ff' // 默认颜色（用于没有范围的情况）
          },
          lineStyle: {
            width: 2.5,
            color: '#1890ff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
              ]
            }
          },
          label: {
            show: true,
            formatter: (params: any) => {
              // 处理对象格式的数据（有 itemStyle）和数组格式的数据
              const dataValue = params.data?.value ? params.data.value[1] : params.value[1]
              const value = decimalPlaces > 0 
                ? dataValue.toFixed(decimalPlaces) 
                : dataValue
              return `${value}${unit || ''}`
            },
            fontSize: 11,
            color: '#333'
          },
          markLine: showPercentageLine ? {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              width: 2,
              color: '#999999'
            },
            label: {
              show: true,
              position: 'end',
              formatter: '100%',
              color: '#999999',
              fontWeight: 'bold'
            },
            data: [
              {
                yAxis: 100,
                name: '100%',
                lineStyle: {
                  color: '#999999'
                },
                label: {
                  color: '#999999'
                }
              }
            ]
          } : range ? {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              width: 2,
              color: '#999999'
            },
            label: {
              show: true,
              position: 'end',
              formatter: (params: any) => {
                const value = decimalPlaces > 0 
                  ? params.value.toFixed(decimalPlaces) 
                  : params.value
                return `${value}${unit || ''}`
              },
              color: '#999999',
              fontWeight: 'bold'
            },
            data: [
              {
                yAxis: range[0],
                name: '正常范围下限',
                lineStyle: {
                  color: '#999999'
                },
                label: {
                  color: '#999999'
                }
              },
              {
                yAxis: range[1],
                name: '正常范围上限',
                lineStyle: {
                  color: '#999999'
                },
                label: {
                  color: '#999999'
                }
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
  }, [title, data, unit, range, decimalPlaces, showPercentageLine])

  // 如果没有数据，显示空状态
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: '350px' }}>
        <Empty description="暂无数据" />
      </div>
    )
  }

  return (
    <div 
      ref={chartRef} 
      className="w-full"
      style={{ height: '350px', minHeight: '300px' }}
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
        data: sortedRecords.map(r => [r.date, (r.bodyFat / r.weight) * 100] as [string, number]),
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
        data: sortedRecords.map(r => [r.date, r.weight / (heightInMeters * heightInMeters)] as [string, number]),
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
  }, [sortedRecords, heightInMeters])

  // 肌肉均衡数据
  const muscleBalanceMetrics = useMemo(() => {
    const metrics = [
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
    return metrics
  }, [sortedRecords])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">图表分析</h1>
        <p className="text-gray-600">查看各项健康指标的趋势变化</p>
      </div>

      {/* 主要指标 */}
      <Card 
        title={
          <span className="text-lg font-semibold">主要指标</span>
        }
        className="mb-6 shadow-sm"
      >
        <Row gutter={[16, 24]}>
          {mainMetrics.map(metric => (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={metric.key}>
              <div className="bg-white rounded-lg p-2">
                <Chart
                  title={metric.title}
                  data={metric.data}
                  unit={metric.unit}
                  range={metric.range}
                  decimalPlaces={metric.decimalPlaces || 0}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 肌肉均衡 */}
      <Card 
        title={
          <span className="text-lg font-semibold">肌肉均衡</span>
        }
        className="shadow-sm"
      >
        <Row gutter={[16, 24]}>
          {muscleBalanceMetrics.map(metric => (
            <Fragment key={metric.key}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <div className="bg-white rounded-lg p-2">
                  <Chart
                    title={metric.title}
                    data={metric.weightData}
                    unit={metric.unit}
                    range={undefined}
                    decimalPlaces={0}
                  />
                </div>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <div className="bg-white rounded-lg p-2">
                  <Chart
                    title={`${metric.title}（相对于标准值）`}
                    data={metric.percentageData}
                    unit="%"
                    range={undefined}
                    decimalPlaces={1}
                    showPercentageLine={true}
                  />
                </div>
              </Col>
            </Fragment>
          ))}
        </Row>
      </Card>
    </div>
  )
}
