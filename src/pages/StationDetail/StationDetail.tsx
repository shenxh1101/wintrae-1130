import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Wind,
  Waves,
  Droplets,
  Thermometer,
  Eye,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import LineChart from '../../components/Charts/LineChart'
import GaugeChart from '../../components/Charts/GaugeChart'
import { generateHistoricalData, generateStations, generateCurrentData } from '../../services/mockData'
import { useOceanStore } from '../../store/useStore'

export default function StationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { stations, currentData, setStations, setCurrentData } = useOceanStore()
  const [timeRange, setTimeRange] = useState('24h')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (stations.length === 0) {
      const newStations = generateStations()
      const newData = generateCurrentData(newStations)
      setStations(newStations)
      setCurrentData(newData)
    }
    setLoading(false)
  }, [stations.length, setStations, setCurrentData])

  const station = stations.find((s) => s.id === id)
  const stationData = currentData.find((d) => d.stationId === id)

  const intervalMap: Record<string, number> = {
    '1h': 5 * 60 * 1000,
    '6h': 15 * 60 * 1000,
    '24h': 60 * 60 * 1000,
    '7d': 4 * 60 * 60 * 1000,
  }

  const historicalData = generateHistoricalData(
    id || 'station-1',
    new Date(Date.now() - (timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '24h' ? 24 : 168) * 60 * 60 * 1000),
    new Date(),
    intervalMap[timeRange] || 60 * 60 * 1000
  )

  const chartData = historicalData.map((d) => ({
    time: new Date(d.timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    windSpeed: d.windSpeed,
    waveHeight: d.waveHeight,
    waterTemp: d.waterTemp,
    salinity: d.salinity,
    visibility: d.visibility,
  }))

  if (loading || !station) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-ocean-400 text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-gray-400 hover:text-ocean-400"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">{station.name}</h1>
          <div className="flex items-center gap-4">
            <span
              className={`status-badge ${
                station.status === 'online'
                  ? 'status-normal'
                  : station.status === 'maintenance'
                  ? 'status-warning'
                  : 'status-danger'
              }`}
            >
              {station.status === 'online'
                ? '在线'
                : station.status === 'maintenance'
                ? '维护中'
                : '离线'}
            </span>
            <span className="text-sm text-gray-400">
              {station.type === 'buoy'
                ? '浮标监测站'
                : station.type === 'fixed'
                ? '固定监测站'
                : '移动监测站'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
            <Wind size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-gradient">
              {stationData?.windSpeed.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-400">风速 (m/s)</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-ocean-500/20 text-ocean-400">
            <Waves size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-gradient">
              {stationData?.waveHeight.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-400">浪高 (m)</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-gradient">
              {stationData?.tideLevel.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-400">潮位 (m)</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400">
            <Thermometer size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-gradient">
              {stationData?.waterTemp.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-400">水温 (℃)</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
            <Droplets size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-gradient">
              {stationData?.salinity.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-400">盐度 (PSU)</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-pink-500/20 text-pink-400">
            <Eye size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-gradient">
              {stationData?.visibility.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-400">能见度 (km)</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-gray-400">时间范围：</span>
        {['1h', '6h', '24h', '7d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-ocean-500/20 text-ocean-400 border border-ocean-400'
                : 'bg-primary-deep/50 text-gray-400 hover:bg-ocean-500/10'
            }`}
          >
            {range === '1h'
              ? '1小时'
              : range === '6h'
              ? '6小时'
              : range === '24h'
              ? '24小时'
              : '7天'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={chartData}
          xAxisKey="time"
          series={[
            { name: '风速 (m/s)', dataKey: 'windSpeed', color: '#3b82f6' },
            { name: '浪高 (m)', dataKey: 'waveHeight', color: '#06b6d4' },
          ]}
          height={300}
          title="风速与浪高趋势"
        />

        <LineChart
          data={chartData}
          xAxisKey="time"
          series={[
            { name: '水温 (℃)', dataKey: 'waterTemp', color: '#f59e0b' },
            { name: '盐度 (PSU)', dataKey: 'salinity', color: '#8b5cf6' },
            { name: '能见度 (km)', dataKey: 'visibility', color: '#ec4899' },
          ]}
          height={300}
          title="水质与能见度趋势"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GaugeChart
          value={stationData?.windSpeed || 0}
          max={20}
          title="风速"
          unit=" m/s"
          color="#3b82f6"
          size={200}
        />

        <GaugeChart
          value={stationData?.waterTemp || 0}
          max={40}
          title="水温"
          unit=" ℃"
          color="#f59e0b"
          size={200}
        />

        <GaugeChart
          value={stationData?.visibility || 0}
          max={20}
          title="能见度"
          unit=" km"
          color="#10b981"
          size={200}
        />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">设备状态</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary-deep/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-status-normal" />
              <span className="text-sm font-medium text-gray-200">传感器状态</span>
            </div>
            <div className="text-2xl font-bold text-status-normal">正常</div>
            <div className="text-xs text-gray-400 mt-1">所有传感器运行正常</div>
          </div>

          <div className="p-4 rounded-lg bg-primary-deep/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-status-info" />
              <span className="text-sm font-medium text-gray-200">最后校准</span>
            </div>
            <div className="text-2xl font-bold text-gradient">
              {new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}
            </div>
            <div className="text-xs text-gray-400 mt-1">3天前完成校准</div>
          </div>

          <div className="p-4 rounded-lg bg-primary-deep/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-status-warning" />
              <span className="text-sm font-medium text-gray-200">预计维护</span>
            </div>
            <div className="text-2xl font-bold text-gradient">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}
            </div>
            <div className="text-xs text-gray-400 mt-1">7天后例行维护</div>
          </div>
        </div>
      </div>
    </div>
  )
}
