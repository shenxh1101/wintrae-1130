import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAppStore } from '../../store/useStore'

export default function Layout() {
  const { sidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen bg-primary-deep">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
