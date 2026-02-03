import { Card, Row, Col } from 'antd'
import { UserOutlined, CalendarOutlined, ManOutlined, WomanOutlined, ArrowsAltOutlined } from '@ant-design/icons'
import type { BasicInfo } from '../types/health'

interface BasicInfoCardProps {
  basic: BasicInfo
}

/**
 * 基础信息卡片组件
 */
export default function BasicInfoCard({ basic }: BasicInfoCardProps) {
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
  )
}
