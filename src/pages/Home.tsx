import { useMemo } from 'react'
import { Tabs, Card, Empty } from 'antd'
import type { TabsProps } from 'antd'
// @ts-ignore
import records from '../assets/records.json5'
// @ts-ignore
import basic from '../assets/basic.json5'
import { formatDate } from '../utils/healthCalculations'
import BasicInfoCard from '../components/BasicInfoCard'
import RecordDetail from '../components/RecordDetail'

export default function Home() {
  // 按日期倒序排序（最新的在前）
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [])

  // 生成 Tabs 配置
  const tabItems: TabsProps['items'] = sortedRecords.map((record) => ({
    key: record.date,
    label: `${formatDate(record.date)} (${record.score}分)`,
    children: <RecordDetail record={record} basic={basic} sortedRecords={sortedRecords} />
  }))

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数据总览</h1>
        <p className="text-gray-600">查看您的健康测量记录和详细数据</p>
      </div>

      {/* 基础信息卡片 */}
      <BasicInfoCard basic={basic} />

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

