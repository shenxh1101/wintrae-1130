import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Save,
  X,
  Wind,
  Eye,
  Droplets,
  Cpu,
  RefreshCw,
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
    currentData,
    setWarnings,
    setStations,
    setCurrentData,
    updateWarning,
    updateThresholds,
    addWarning,
  } = useOceanStore()

  const [filter, setFilter] = useState({
    level: 'all',
    type: 'all',
    status: 'all',
  })
  const [showConfig, setShowConfig] = useState(false)
  const [editingThresholds, setEditingThresholds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (stations.length === 0) {
      const newStations = generateStations()
      const newData = generateCurrentData(newStations)
      const newWarnings = generateWarnings(newStations, newData)
      setStations(newStations)
      setCurrentData(newData)
      setWarnings(newWarnings)
    }
    setLoading(false)
  }, [stations.length, setStations, setCurrentData, setWarnings])

  useEffect(() => {
    setEditingThresholds([...thresholds])
  }, [thresholds])

  const generateWarningsFromCurrentData = (
    stations: any[],
    data: any[],
    currentThresholds: any[]
  ) => {
    const newWarnings: any[] = []
    const now = new Date()

    stations.forEach((station) => {
      const stationData = data.find((d: any) => d.stationId === station.id)
      if (!stationData) return

      const windThreshold = currentThresholds.find((t: any) => t.parameter === 'windSpeed')
      if (windThreshold) {
        if (stationData.windSpeed > windThreshold.danger) {
          newWarnings.push({
            id: `new-warning-${Date.now()}-${station.id}-wind`,
            stationId: station.id,
            type: 'wind',
            level: 'danger',
            message: `风速超过安全阈值：${stationData.windSpeed} m/s`,
            value: stationData.windSpeed,
            threshold: windThreshold.danger,
            timestamp: now.toISOString(),
            status: 'pending',
          })
        } else if (stationData.windSpeed > windThreshold.warning) {
          newWarnings.push({
            id: `new-warning-${Date.now()}-${station.id}-wind`,
            stationId: station.id,
            type: 'wind',
            level: 'warning',
            message: `风速超过安全阈值：${stationData.windSpeed} m/s`,
            value: stationData.windSpeed,
            threshold: windThreshold.warning,
            timestamp: now.toISOString(),
            status: 'pending',
          })
        }
      }

      const visibilityThreshold = currentThresholds.find((t: any) => t.parameter === 'visibility')
      if (visibilityThreshold) {
        if (stationData.visibility < visibilityThreshold.danger) {
          newWarnings.push({
            id: `new-warning-${Date.now()}-${station.id}-visibility`,
            stationId: station.id,
            type: 'visibility',
            level: 'danger',
            message: `能见度较低：${stationData.visibility} km`,
            value: stationData.visibility,
            threshold: visibilityThreshold.danger,
            timestamp: now.toISOString(),
            status: 'pending',
          })
        } else if (stationData.visibility < visibilityThreshold.warning) {
          newWarnings.push({
            id: `new-warning-${Date.now()}-${station.id}-visibility`,
            stationId: station.id,
            type: 'visibility',
            level: 'warning',
            message: `能见度较低：${stationData.visibility} km`,
            value: stationData.visibility,
            threshold: visibilityThreshold.warning,
            timestamp: now.toISOString(),
            status: 'pending',
          })
        }
      }

      const waterTempThreshold = currentThresholds.find((t: any) => t.parameter === 'waterTemp')
      if (waterTempThreshold) {
        if (stationData.waterTemp > waterTempThreshold.danger) {
          newWarnings.push({
            id: `new-warning-${Date.now()}-${station.id}-water`,
            stationId: station.id,
            type: 'water',
            level: 'danger',
            message: `水温异常：${stationData.waterTemp} ℃`,
            value: stationData.waterTemp,
            threshold: waterTempThreshold.danger,
            timestamp: now.toISOString(),
            status: 'pending',
          })
        } else if (stationData.waterTemp > waterTempThreshold.warning) {
          newWarnings.push({
            id: `new-warning-${Date.now()}-${station.id}-water`,
            stationId: station.id,
            type: 'water',
            level: 'warning',
            message: `水温异常：${stationData.waterTemp} ℃`,
            value: stationData.waterTemp,
            threshold: waterTempThreshold.warning,
            timestamp: now.toISOString(),
            status: 'pending',
          })
        }
      }
    })

    return newWarnings
  }

  const reevaluateAllWarnings = (
    existingWarnings: any[],
    currentThresholds: any[]
  ) => {
    return existingWarnings
      .map((w) => {
        const threshold = currentThresholds.find((t: any) => {
          if (w.type === 'wind') return t.parameter === 'windSpeed'
          if (w.type === 'visibility') return t.parameter === 'visibility'
          if (w.type === 'water') return t.parameter === 'waterTemp' || t.parameter === 'salinity'
          return false
        })

        if (!threshold) return w

        let newLevel = 'info'
        let shouldKeep = false
        let newThreshold = threshold.warning

        if (w.type === 'visibility') {
          if (w.value < threshold.danger) {
            newLevel = 'danger'
            shouldKeep = true
            newThreshold = threshold.danger
          } else if (w.value < threshold.warning) {
            newLevel = 'warning'
            shouldKeep = true
            newThreshold = threshold.warning
          } else {
            shouldKeep = false
          }
        } else {
          if (w.value > threshold.danger) {
            newLevel = 'danger'
            shouldKeep = true
            newThreshold = threshold.danger
          } else if (w.value > threshold.warning) {
            newLevel = 'warning'
            shouldKeep = true
            newThreshold = threshold.warning
          } else {
            shouldKeep = false
          }
        }

        if (!shouldKeep) {
          return null
        }

        return {
          ...w,
          level: newLevel,
          threshold: newThreshold,
        }
      })
      .filter(Boolean)
  }

  const handleSaveThresholds = () => {
    updateThresholds(editingThresholds)

    const existingWarnings = warnings.filter((w) => w.status !== 'resolved')
    const reevaluatedWarnings = reevaluateAllWarnings(existingWarnings, editingThresholds)

    const newWarningsFromCurrentData = generateWarningsFromCurrentData(
      stations,
      currentData,
      editingThresholds
    )

    const existingIds = new Set(reevaluatedWarnings.map((w: any) => w.id))
    const uniqueNewWarnings = newWarningsFromCurrentData.filter(
      (nw: any) => !existingIds.has(nw.id)
    )

    const allWarnings = [...uniqueNewWarnings, ...warnings.filter((w) => w.status === 'resolved')]

    setWarnings([...reevaluatedWarnings, ...allWarnings.filter((w: any) => w.status === 'resolved')])

    setShowConfig(false)
  }

  const handleResetThresholds = () => {
    setEditingThresholds([...thresholds])
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wind':
        return <Wind size={16} />
      case 'visibility':
        return <Eye size={16} />
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
            <AlertTriangle size={32} className="text-ocean-400/50" />
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
            onClick={() => {
              setEditingThresholds([...thresholds])
              setShowConfig(!showConfig)
            }}
            className={`btn-secondary flex items-center gap-2 ${
              showConfig ? 'bg-ocean-500/20 text-ocean-400' : ''
            }`}
          >
            <Settings size={16} />
            {showConfig ? '关闭配置' : '阈值配置'}
          </button>
        </div>

        {showConfig && (
          <div className="mb-6 p-4 rounded-lg bg-primary-deep/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300">预警阈值设置</h4>
                <p className="text-xs text-gray-500 mt-1">保存后将根据新阈值重新评估所有预警，并检查当前监测数据是否产生新预警</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetThresholds}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  重置
                </button>
                <button
                  onClick={handleSaveThresholds}
                  className="px-3 py-1 text-sm rounded-lg bg-ocean-500/20 text-ocean-400 hover:bg-ocean-500/30 transition-colors flex items-center gap-1"
                >
                  <Save size={14} />
                  保存并重新评估
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editingThresholds.map((threshold) => (
                <div key={threshold.parameter} className="p-4 rounded-lg bg-primary-main/50 border border-ocean-500/20">
                  <div className="text-sm font-medium text-gray-200 mb-3">
                    {threshold.name} ({threshold.unit})
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-status-warning mb-1 block">警告阈值</label>
                      <input
                        type="number"
                        value={threshold.warning}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          setEditingThresholds(
                            editingThresholds.map((t) =>
                              t.parameter === threshold.parameter
                                ? { ...t, warning: value }
                                : t
                            )
                          )
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-status-warning/30 text-gray-200 text-sm focus:outline-none focus:border-status-warning"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-status-danger mb-1 block">危险阈值</label>
                      <input
                        type="number"
                        value={threshold.danger}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          setEditingThresholds(
                            editingThresholds.map((t) =>
                              t.parameter === threshold.parameter
                                ? { ...t, danger: value }
                                : t
                            )
                          )
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-status-danger/30 text-gray-200 text-sm focus:outline-none focus:border-status-danger"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-ocean-500/10 border border-ocean-500/20">
              <div className="text-xs text-ocean-400">
                💡 提示：保存阈值配置后，系统将自动移除不再符合条件的预警，并根据当前监测数据生成新的预警
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-gray-400" />
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
                      当前值: {warning.value} / 阈值: {warning.threshold}
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
