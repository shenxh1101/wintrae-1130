import { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  FileSpreadsheet,
  File,
  Printer,
} from 'lucide-react'
import { useOceanStore } from '../../store/useStore'
import {
  generateStations,
  generateCurrentData,
  generateWarnings,
  generateOperations,
} from '../../services/mockData'

export default function ReportExport() {
  const { stations, warnings, operations, setStations, setCurrentData, setWarnings, setOperations } =
    useOceanStore()

  const [reportType, setReportType] = useState('patrol')
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [previewData, setPreviewData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (stations.length === 0) {
      const newStations = generateStations()
      const newData = generateCurrentData(newStations)
      const newWarnings = generateWarnings(newStations, newData)
      setStations(newStations)
      setCurrentData(newData)
      setWarnings(newWarnings)
      setOperations(generateOperations())
    }
    setLoading(false)
  }, [stations.length, setStations, setCurrentData, setWarnings, setOperations])

  const generatePreview = () => {
    if (reportType === 'patrol') {
      const patrolData = {
        title: '日常巡查报表',
        dateRange: `${startDate} 至 ${endDate}`,
        summary: {
          totalInspections: Math.floor(Math.random() * 20) + 10,
          stationsInspected: stations.length,
          anomalies: warnings.filter((w) => w.status !== 'resolved').length,
          equipmentStatus: stations.filter((s) => s.status === 'online').length,
        },
        stationData: stations.map((station) => ({
          name: station.name,
          status: station.status === 'online' ? '正常' : '异常',
          lastInspection: new Date(
            Date.now() - Math.random() * 24 * 60 * 60 * 1000
          ).toLocaleDateString('zh-CN'),
        })),
      }
      setPreviewData(patrolData)
    } else if (reportType === 'warning') {
      const warningData = {
        title: '预警处置报表',
        dateRange: `${startDate} 至 ${endDate}`,
        summary: {
          totalWarnings: warnings.length,
          pending: warnings.filter((w) => w.status === 'pending').length,
          confirmed: warnings.filter((w) => w.status === 'confirmed').length,
          resolved: warnings.filter((w) => w.status === 'resolved').length,
        },
        warnings: warnings.slice(0, 5).map((w) => ({
          type:
            w.type === 'wind'
              ? '大风预警'
              : w.type === 'visibility'
              ? '低能见度'
              : w.type === 'water'
              ? '水质异常'
              : '设备故障',
          level: w.level === 'danger' ? '危险' : w.level === 'warning' ? '警告' : '提示',
          status:
            w.status === 'pending'
              ? '待处理'
              : w.status === 'confirmed'
              ? '处理中'
              : '已解决',
          time: new Date(w.timestamp).toLocaleString('zh-CN'),
          message: w.message,
        })),
      }
      setPreviewData(warningData)
    } else {
      const envData = {
        title: '综合环境报表',
        dateRange: `${startDate} 至 ${endDate}`,
        summary: {
          avgWindSpeed: '8.5',
          avgWaveHeight: '0.8',
          avgWaterTemp: '22.3',
          warningsCount: warnings.length,
        },
        trend: {
          windSpeed: '上升 5%',
          waveHeight: '下降 2%',
          waterTemp: '上升 3%',
        },
      }
      setPreviewData(envData)
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'word') => {
    console.log(`Exporting ${reportType} report as ${format}`)
    alert(`报表导出功能：\n类型：${reportType}\n格式：${format.toUpperCase()}\n时间范围：${startDate} 至 ${endDate}\n\n（实际导出需要后端支持）`)
  }

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
        <h1 className="text-3xl font-bold text-gradient mb-2">报表导出</h1>
        <p className="text-gray-400">生成并导出各类巡查和预警报表</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">报表类型</h3>
            <div className="space-y-3">
              {[
                { key: 'patrol', icon: FileText, name: '日常巡查报表', desc: '巡查记录和设备状态' },
                { key: 'warning', icon: AlertTriangle, name: '预警处置报表', desc: '预警记录和处置情况' },
                { key: 'environment', icon: File, name: '综合环境报表', desc: '环境参数统计和趋势' },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => {
                    setReportType(type.key)
                    setPreviewData(null)
                  }}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    reportType === type.key
                      ? 'bg-ocean-500/10 border-ocean-400'
                      : 'bg-primary-deep/50 border-ocean-500/20 hover:border-ocean-400/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <type.icon
                      size={20}
                      className={
                        reportType === type.key ? 'text-ocean-400' : 'text-gray-400'
                      }
                    />
                    <div>
                      <div className="font-medium text-gray-200">{type.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{type.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">筛选条件</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
                />
              </div>

              <button onClick={generatePreview} className="w-full btn-primary">
                <Eye size={16} className="inline mr-2" />
                生成预览
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">导出格式</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full p-3 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors text-red-400 flex items-center gap-3"
              >
                <File size={20} />
                <span>导出 PDF</span>
              </button>

              <button
                onClick={() => handleExport('excel')}
                className="w-full p-3 rounded-lg bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-colors text-green-400 flex items-center gap-3"
              >
                <FileSpreadsheet size={20} />
                <span>导出 Excel</span>
              </button>

              <button
                onClick={() => handleExport('word')}
                className="w-full p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-blue-400 flex items-center gap-3"
              >
                <FileText size={20} />
                <span>导出 Word</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-200">报表预览</h3>
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center gap-2"
              >
                <Printer size={16} />
                打印
              </button>
            </div>

            {previewData ? (
              <div className="space-y-6">
                <div className="text-center border-b border-gray-700 pb-4">
                  <h2 className="text-2xl font-bold text-gradient mb-2">
                    {previewData.title}
                  </h2>
                  <div className="text-sm text-gray-400">
                    <Calendar size={14} className="inline mr-1" />
                    {previewData.dateRange}
                  </div>
                </div>

                {previewData.summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">数据汇总</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(previewData.summary).map(([key, value]) => (
                        <div
                          key={key}
                          className="p-4 rounded-lg bg-primary-deep/50 text-center"
                        >
                          <div className="text-2xl font-bold text-gradient">{value}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {key === 'totalInspections'
                              ? '巡查次数'
                              : key === 'stationsInspected'
                              ? '监测站数'
                              : key === 'anomalies'
                              ? '异常次数'
                              : key === 'equipmentStatus'
                              ? '设备正常'
                              : key === 'totalWarnings'
                              ? '预警总数'
                              : key === 'pending'
                              ? '待处理'
                              : key === 'confirmed'
                              ? '处理中'
                              : key === 'resolved'
                              ? '已解决'
                              : key === 'avgWindSpeed'
                              ? '平均风速'
                              : key === 'avgWaveHeight'
                              ? '平均浪高'
                              : key === 'avgWaterTemp'
                              ? '平均水温'
                              : key === 'warningsCount'
                              ? '预警次数'
                              : key}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewData.stationData && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">监测站详情</h3>
                    <div className="space-y-2">
                      {previewData.stationData.map((station: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-primary-deep/50"
                        >
                          <span className="text-sm text-gray-200">{station.name}</span>
                          <div className="flex items-center gap-4">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                station.status === '正常'
                                  ? 'bg-status-normal/20 text-status-normal'
                                  : 'bg-status-danger/20 text-status-danger'
                              }`}
                            >
                              {station.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {station.lastInspection}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewData.warnings && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">预警列表</h3>
                    <div className="space-y-2">
                      {previewData.warnings.map((warning: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-primary-deep/50 border-l-4 border-ocean-400"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded bg-ocean-500/20 text-ocean-400">
                                {warning.type}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  warning.level === '危险'
                                    ? 'bg-status-danger/20 text-status-danger'
                                    : warning.level === '警告'
                                    ? 'bg-status-warning/20 text-status-warning'
                                    : 'bg-status-info/20 text-status-info'
                                }`}
                              >
                                {warning.level}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">{warning.time}</span>
                          </div>
                          <div className="text-sm text-gray-300">{warning.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewData.trend && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">趋势分析</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(previewData.trend).map(([key, value]) => (
                        <div key={key} className="p-4 rounded-lg bg-primary-deep/50">
                          <div className="text-xs text-gray-400 mb-1">
                            {key === 'windSpeed'
                              ? '风速'
                              : key === 'waveHeight'
                              ? '浪高'
                              : '水温'}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              String(value).includes('上升')
                                ? 'text-status-danger'
                                : 'text-status-normal'
                            }`}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <FileText size={64} className="mb-4 opacity-50" />
                <div className="text-lg mb-2">暂无预览</div>
                <div className="text-sm">请选择报表类型并设置筛选条件后生成预览</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { AlertTriangle } from 'lucide-react'
