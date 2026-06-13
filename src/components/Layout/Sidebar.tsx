import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Ship,
  History,
  FileText,
  ChevronLeft,
  ChevronRight,
  Waves,
} from 'lucide-react'
import { useAppStore } from '../../store/useStore'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '海况总览' },
  { path: '/station/station-1', icon: MapPin, label: '监测站详情' },
  { path: '/warnings', icon: AlertTriangle, label: '预警中心' },
  { path: '/operations', icon: Ship, label: '船舶作业' },
  { path: '/playback', icon: History, label: '历史回放' },
  { path: '/reports', icon: FileText, label: '报表导出' },
]

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary-deep/95 backdrop-blur-md border-r border-ocean-500/20 transition-all duration-300 z-50 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-ocean-500/20">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Waves className="w-8 h-8 text-ocean-400" />
            <span className="text-lg font-bold text-gradient">智慧海洋</span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-ocean-400"
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-ocean-500/20 text-ocean-400 border-l-4 border-ocean-400'
                  : 'text-gray-400 hover:bg-ocean-500/10 hover:text-ocean-300'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon size={20} />
            {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="card p-4">
            <div className="text-xs text-gray-400 mb-1">系统状态</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-status-normal rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">运行正常</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
