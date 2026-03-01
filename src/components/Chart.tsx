import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { Empty } from 'antd'

interface ChartProps {
  title: string
  data: Array<[string, number]>
  unit?: string
  range?: number[]
  decimalPlaces?: number
  showPercentageLine?: boolean
}

/**
 * 图表组件
 */
export default function Chart({
  title,
  data,
  unit,
  range,
  decimalPlaces = 0,
  showPercentageLine = false
}: ChartProps) {
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
