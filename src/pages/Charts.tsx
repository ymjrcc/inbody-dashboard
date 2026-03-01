import { useMemo, Fragment } from 'react'
import { Card, Row, Col } from 'antd'
// @ts-ignore
import records from '../assets/records.json5'
// @ts-ignore
import basic from '../assets/basic.json5'
import Chart from '../components/Chart'
import { generateMainMetrics, generateMuscleBalanceMetrics } from '../utils/chartData'

export default function Charts() {
  // 按日期排序
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [])

  // 主要指标数据
  const mainMetrics = useMemo(() => {
    return generateMainMetrics(sortedRecords, basic)
  }, [sortedRecords])

  // 肌肉均衡数据
  const muscleBalanceMetrics = useMemo(() => {
    return generateMuscleBalanceMetrics(sortedRecords)
  }, [sortedRecords])

  // 评分趋势数据
  const scoreTrendData = useMemo(() => {
    return sortedRecords.map(r => [r.date, r.score] as [string, number])
  }, [sortedRecords])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">图表分析</h1>
        <p className="text-gray-600">查看各项健康指标的趋势变化</p>
      </div>

      {/* 评分趋势 */}
      <Card 
        title={
          <span className="text-lg font-semibold">评分趋势</span>
        }
        className="mb-6 shadow-sm"
      >
        <div className="w-full">
          <Chart
            title="综合评分"
            data={scoreTrendData}
            unit="分"
            decimalPlaces={0}
            baseline={80}
          />
        </div>
      </Card>

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
