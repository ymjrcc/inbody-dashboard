import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'
import Home from './pages/Home'
import Charts from './pages/Charts'
// import Contact from './pages/Contact'

// 判断路径是否匹配菜单项（支持子路由匹配）
function isActive(pathname: string, menuPath: string): boolean {
  // 首页只匹配精确的 '/'
  if (menuPath === '/') {
    return pathname === '/'
  }
  // 其他路径匹配当前路径或其子路径
  return pathname === menuPath || pathname.startsWith(menuPath + '/')
}

const menuItems = [
  { path: '/', label: '数据总览' },
  { path: '/charts', label: '图表分析' },
  // { path: '/contact', label: '联系我们' },
]

// 根据路径设置页面标题
function usePageTitle() {
  const location = useLocation()
  
  useEffect(() => {
    const menuItem = menuItems.find(item => isActive(location.pathname, item.path))
    const title = menuItem ? `${menuItem.label} - YM健康管理` : 'YM健康管理'
    document.title = title
  }, [location.pathname])
}

function App() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  usePageTitle()

  // 关闭移动端菜单当路由改变时
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 max-w-7xl mx-auto">
          <div className="flex justify-between h-16">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">YM健康管理</h1>
              </div>
              {/* 桌面端导航 */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {menuItems.map((item) => {
                  const active = isActive(location.pathname, item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                aria-label="切换菜单"
              >
                {mobileMenuOpen ? (
                  <CloseOutlined className="text-xl" />
                ) : (
                  <MenuOutlined className="text-xl" />
                )}
              </button>
            </div>
          </div>
          
          {/* 移动端下拉菜单 */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-2">
              {menuItems.map((item) => {
                const active = isActive(location.pathname, item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-3 text-base font-medium rounded-md transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <main className="transition-opacity duration-200">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/charts" element={<Charts />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </main>
    </div>
  )
}

export default App
