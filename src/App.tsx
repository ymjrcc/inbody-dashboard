import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'

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
  { path: '/', label: '首页' },
  { path: '/about', label: '关于我们' },
  { path: '/contact', label: '联系我们' },
]

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">我的应用</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => {
                  const active = isActive(location.pathname, item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-4 border-b-solid ${
                        active
                          ? 'border-b-blue-500 text-blue-500 font-bold hover:text-blue-500'
                          : 'border-b-transparent text-gray-500 !hover:text-blue-500 hover:text-gray-500'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
