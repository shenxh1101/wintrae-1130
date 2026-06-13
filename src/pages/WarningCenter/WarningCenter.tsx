import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Settings,
  Eye,
  Wind,
  Eye as VisibilityIcon,
  Droplets,
  Cpu,
} from 'lucide-react'
import { useOceanStore } from '../../store/useStore'
import {
  generateStations,
  generateCurrentData,
  generateWarnings,
} from '../../services/mockData'

export default function WarningCenter() {
  const {
    warnings,
    thresholds,
    stations,
    setWarnings,
    setStations,
    setCurrentData,
    updateWarning,
    updateThresholds,
  } = useOceanStore()

  const [filter, setFilter] = useState({
    level: 'all',
    type: 'all',
    status: 'all',
  })
  const [showConfig, setShowConfig] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (stations.length === 0) {
      const newStations = generateStations()
      const newData = generateCurrentData(newStations)
      const newWarnings = generateWarnings(newStations, newData)
      setStations(newStations)
      setCurrentData(newData)
      setWarnings(newWarnings)
    } else {
      setWarnings(generateWarnings(stations, []))
    }
    setLoading(false)
  }, [stations.length, setStations, setCurrentData, setWarnings])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wind':
        return <Wind size={16} />
      case 'visibility':
        return <VisibilityIcon size={16} />
      case 'water':
        return <Droplets size={16} />
      case 'device':
        return <Cpu size={16} />
      default:
        return <AlertTriangle size={16} />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'wind':
        return '大风预警'
      case 'visibility':
        return '低能见度'
      case 'water':
        return '水质异常'
      case 'device':
        return '设备故障'
      default:
        return '未知'
    }
  }

  const filteredWarnings = warnings.filter((w) => {
    if (filter.level !== 'all' && w.level !== filter.level) return false
    if (filter.type !== 'all' && w.type !== filter.type) return false
    if (filter.status !== 'all' && w.status !== filter.status) return false
    return true
  })

  const handleConfirm = (id: string) => {
    updateWarning(id, {
      status: 'confirmed',
      handler: '管理员',
      handleTime: new Date().toISOString(),
    })
  }

  const handleResolve = (id: string, remark: string) => {
    updateWarning(id, {
      status: 'resolved',
      remark,
    })
  }

  const pendingCount = warnings.filter((w) => w.status === 'pending').length
  const confirmedCount = warnings.filter((w) => w.status === 'confirmed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-ocean-400 text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">预警中心</h1>
        <p className="text-gray-400">实时监控预警信息，保障港口安全运行</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">待处理预警</div>
              <div className="text-3xl font-bold text-status-danger">{pendingCount}</div>
            </div>
            <AlertTriangle size={32} className="text-status-danger/50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">处理中预警</div>
              <div className="text-3xl font-bold text-status-warning">{confirmedCount}</div>
            </div>
            <Clock size={32} className="text-status-warning/50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">今日预警</div>
              <div className="text-3xl font-bold text-gradient">{warnings.length}</div>
            </div>
            <Eye size={32} className="text-ocean-400/50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">监测站</div>
              <div className="text-3xl font-bold text-gradient">{stations.length}</div>
            </div>
            <Settings size={32} className="text-ocean-400/50" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-200">预警列表</h3>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings size={16} />
            阈值配置
          </button>
        </div>

        {showConfig && (
          <div className="mb-6 p-4 rounded-lg bg-primary-deep/50">
            <h4 className="text-sm font-medium text-gray-300 mb-4">预警阈值设置</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {thresholds.map((threshold) => (
                <div key={threshold.parameter} className="p-3 rounded-lg bg-primary-main/50">
                  <div className="text-sm font-medium text-gray-200 mb-2">
                    {threshold.parameter === 'windSpeed'
                      ? '风速'
                      : threshold.parameter === 'waveHeight'
                      ? '浪高'
                      : threshold.parameter === 'visibility'
                      ? '能见度'
                      : threshold.parameter === 'waterTemp'
                      ? '水温'
                      : '盐度'}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-status-warning">警告：{threshold.warning}{threshold.unit}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-status-danger">危险：{threshold.danger}{threshold.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">筛选：</span>
          </div>

          <select
            value={filter.level}
            onChange={(e) => setFilter({ ...filter, level: e.target.value })}
            className="px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
          >
            <option value="all">全部等级</option>
            <option value="info">提示</option>
            <option value="warning">警告</option>
            <option value="danger">危险</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
          >
            <option value="all">全部类型</option>
            <option value="wind">大风预警</option>
            <option value="visibility">低能见度</option>
            <option value="water">水质异常</option>
            <option value="device">设备故障</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="confirmed">处理中</option>
            <option value="resolved">已解决</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredWarnings.length > 0 ? (
            filteredWarnings.map((warning) => (
              <div
                key={warning.id}
                className={`p-4 rounded-lg border transition-all ${
                  warning.level === 'danger'
                    ? 'bg-status-danger/5 border-status-danger/30 hover:bg-status-danger/10'
                    : warning.level === 'warning'
                    ? 'bg-status-warning/5 border-status-warning/30 hover:bg-status-warning/10'
                    : 'bg-status-info/5 border-status-info/30 hover:bg-status-info/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        warning.level === 'danger'
                          ? 'bg-status-danger/20 text-status-danger'
                          : warning.level === 'warning'
                          ? 'bg-status-warning/20 text-status-warning'
                          : 'bg-status-info/20 text-status-info'
                      }`}
                    >
                      {getTypeIcon(warning.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`status-badge ${
                            warning.level === 'danger'
                              ? 'status-danger'
                              : warning.level === 'warning'
                              ? 'status-warning'
                              : 'status-info'
                          }`}
                        >
                          {getTypeName(warning.type)}
                        </span>
                        <span
                          className={`status-badge ${
                            warning.status === 'pending'
                              ? 'status-warning'
                              : warning.status === 'confirmed'
                              ? 'status-info'
                              : 'status-normal'
                          }`}
                        >
                          {warning.status === 'pending'
                            ? '待处理'
                            : warning.status === 'confirmed'
                            ? '处理中'
                            : '已解决'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">{warning.message}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {new Date(warning.timestamp).toLocaleString('zh-CN')}
                    </div>
                    <div className="text-sm font-mono text-gray-400 mt-1">
                      {warning.value} / {warning.threshold}
                    </div>
                  </div>
                </div>

                {warning.status !== 'resolved' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-700/50">
                    {warning.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(warning.id)}
                        className="btn-primary text-sm"
                      >
                        确认预警
                      </button>
                    )}
                    {(warning.status === 'pending' || warning.status === 'confirmed') && (
                      <button
                        onClick={() => handleResolve(warning.id, '已处理')}
                        className="btn-secondary text-sm"
                      >
                        标记已解决
                      </button>
                    )}
                    {warning.handler && (
                      <span className="text-xs text-gray-400 ml-auto">
                        处理人：{warning.handler}
                      </span>
                    )}
                  </div>
                )}

                {warning.remark && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="text-xs text-gray-400 mb-1">处理备注：</div>
                    <div className="text-sm text-gray-300">{warning.remark}</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-status-normal mb-4" />
              <div className="text-gray-400">暂无预警信息</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
