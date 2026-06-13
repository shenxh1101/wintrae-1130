import { useState, useEffect } from 'react'
import { Bell, User, Settings } from 'lucide-react'
import { useOceanStore } from '../../store/useStore'

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { warnings } = useOceanStore()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pendingWarnings = warnings.filter((w) => w.status === 'pending').length

  return (
    <header className="sticky top-0 z-40 bg-primary-deep/80 backdrop-blur-md border-b border-ocean-500/20">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-100">港口环境监测系统</h1>
          <span className="text-sm text-gray-400">
            {currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-gradient">
              {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
            </div>
            <div className="text-xs text-gray-400">实时数据</div>
          </div>

          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-gray-400 hover:text-ocean-400">
              <Bell size={20} />
            </button>
            {pendingWarnings > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-danger text-white text-xs rounded-full flex items-center justify-center">
                {pendingWarnings}
              </span>
            )}
          </div>

          <button className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-gray-400 hover:text-ocean-400">
            <Settings size={20} />
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-ocean-500/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-sm">
              <div className="text-gray-200 font-medium">管理员</div>
              <div className="text-xs text-gray-400">港口管理</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
