import { useEffect } from 'react'
import {
  Ship,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wind,
  Eye,
  Droplets,
} from 'lucide-react'
import { useOceanStore } from '../../store/useStore'
import { generateOperations, generateCurrentData, generateStations } from '../../services/mockData'

export default function ShipOperation() {
  const { operations, warnings, stations, setOperations, setStations, setCurrentData } =
    useOceanStore()

  useEffect(() => {
    if (stations.length === 0) {
      const newStations = generateStations()
      const newData = generateCurrentData(newStations)
      setStations(newStations)
      setCurrentData(newData)
    }
    if (operations.length === 0) {
      setOperations(generateOperations())
    }
  }, [stations.length, operations.length, setStations, setCurrentData, setOperations])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-status-normal" />
      case 'in_progress':
        return <Clock size={16} className="text-status-info animate-pulse" />
      case 'cancelled':
        return <XCircle size={16} className="text-status-danger" />
      default:
        return <Clock size={16} className="text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'in_progress':
        return '进行中'
      case 'cancelled':
        return '已取消'
      default:
        return '待执行'
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-normal'
      case 'in_progress':
        return 'status-info'
      case 'cancelled':
        return 'status-danger'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  const getOperationTypeName = (type: string) => {
    switch (type) {
      case 'loading':
        return '装货'
      case 'unloading':
        return '卸货'
      case 'bunkering':
        return '加油'
      case 'maintenance':
        return '维护'
      default:
        return '其他'
    }
  }

  const getRiskLevel = (risk: string) => {
    switch (risk) {
      case 'low':
        return { text: '低风险', color: 'text-status-normal', bg: 'bg-status-normal/20' }
      case 'medium':
        return { text: '中风险', color: 'text-status-warning', bg: 'bg-status-warning/20' }
      case 'high':
        return { text: '高风险', color: 'text-status-danger', bg: 'bg-status-danger/20' }
      default:
        return { text: '未知', color: 'text-gray-400', bg: 'bg-gray-500/20' }
    }
  }

  const avgWindRisk = warnings.filter((w) => w.type === 'wind').length > 0 ? 'high' : 'low'
  const avgVisibilityRisk =
    warnings.filter((w) => w.type === 'visibility').length > 0 ? 'medium' : 'low'
  const avgWaterRisk = warnings.filter((w) => w.type === 'water').length > 0 ? 'medium' : 'low'

  const activeOperations = operations.filter((op) => op.status === 'in_progress')
  const scheduledOperations = operations.filter((op) => op.status === 'scheduled')

  return (
    <div className="space-y-6 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">船舶作业</h1>
        <p className="text-gray-400">管理码头作业计划，评估环境对作业的影响</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">进行中</div>
              <div className="text-3xl font-bold text-status-info">{activeOperations.length}</div>
            </div>
            <Clock size={32} className="text-status-info/50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">待执行</div>
              <div className="text-3xl font-bold text-gradient">
                {scheduledOperations.length}
              </div>
            </div>
            <Ship size={32} className="text-ocean-400/50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">已完成</div>
              <div className="text-3xl font-bold text-status-normal">
                {operations.filter((op) => op.status === 'completed').length}
              </div>
            </div>
            <CheckCircle size={32} className="text-status-normal/50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">已取消</div>
              <div className="text-3xl font-bold text-status-danger">
                {operations.filter((op) => op.status === 'cancelled').length}
              </div>
            </div>
            <XCircle size={32} className="text-status-danger/50" />
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">环境风险评估</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary-deep/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Wind size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-400">大风风险</div>
                <div className={`font-medium ${getRiskLevel(avgWindRisk).color}`}>
                  {getRiskLevel(avgWindRisk).text}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              当前风速条件下，装卸作业和起重设备操作需谨慎
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary-deep/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Eye size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-400">能见度风险</div>
                <div className={`font-medium ${getRiskLevel(avgVisibilityRisk).color}`}>
                  {getRiskLevel(avgVisibilityRisk).text}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              当前能见度条件下，靠泊和离泊操作需特别注意
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary-deep/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                <Droplets size={20} />
              </div>
              <div>
                <div className="text-sm text-gray-400">水质风险</div>
                <div className={`font-medium ${getRiskLevel(avgWaterRisk).color}`}>
                  {getRiskLevel(avgWaterRisk).text}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              水质监测作业和环境敏感作业暂不受影响
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">作业计划</h3>
        <div className="space-y-4">
          {operations.length > 0 ? (
            operations.map((operation) => (
              <div
                key={operation.id}
                className={`p-4 rounded-lg border transition-all hover:border-ocean-400/50 ${
                  operation.status === 'in_progress'
                    ? 'bg-status-info/5 border-status-info/30'
                    : operation.status === 'completed'
                    ? 'bg-status-normal/5 border-status-normal/30'
                    : operation.status === 'cancelled'
                    ? 'bg-status-danger/5 border-status-danger/30 opacity-60'
                    : 'bg-primary-deep/50 border-ocean-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-ocean-500/20 text-ocean-400">
                      <Ship size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-200">
                          {operation.shipName}
                        </span>
                        <span
                          className={`status-badge ${getStatusClass(operation.status)}`}
                        >
                          {getStatusIcon(operation.status)}
                          <span className="ml-1">{getStatusText(operation.status)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          泊位 {operation.berth}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(operation.startTime).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(operation.endTime).toLocaleString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        operation.type === 'loading'
                          ? 'bg-blue-500/20 text-blue-400'
                          : operation.type === 'unloading'
                          ? 'bg-green-500/20 text-green-400'
                          : operation.type === 'bunkering'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {getOperationTypeName(operation.type)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">环境评估：</span>
                    <div className="flex items-center gap-4">
                      <div
                        className={`px-2 py-1 rounded ${getRiskLevel(
                          operation.environmentAssessment.windRisk
                        ).bg} ${getRiskLevel(operation.environmentAssessment.windRisk).color}`}
                      >
                        风 {getRiskLevel(operation.environmentAssessment.windRisk).text}
                      </div>
                      <div
                        className={`px-2 py-1 rounded ${getRiskLevel(
                          operation.environmentAssessment.visibilityRisk
                        ).bg} ${getRiskLevel(operation.environmentAssessment.visibilityRisk).color}`}
                      >
                        能见度{' '}
                        {getRiskLevel(operation.environmentAssessment.visibilityRisk).text}
                      </div>
                      <div
                        className={`px-2 py-1 rounded ${getRiskLevel(
                          operation.environmentAssessment.waterRisk
                        ).bg} ${getRiskLevel(operation.environmentAssessment.waterRisk).color}`}
                      >
                        水质 {getRiskLevel(operation.environmentAssessment.waterRisk).text}
                      </div>
                    </div>
                  </div>

                  {operation.status === 'in_progress' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>作业进度</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-primary-deep rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-ocean-400 to-ocean-500 h-2 rounded-full transition-all"
                          style={{ width: '65%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {operation.environmentAssessment.windRisk === 'high' && (
                  <div className="mt-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-status-warning mt-0.5" />
                      <div className="text-sm text-status-warning">
                        <strong>作业建议：</strong>当前风速较高，建议暂停起重作业和甲板高空作业
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Ship size={48} className="mx-auto text-gray-600 mb-4" />
              <div className="text-gray-400">暂无作业计划</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
