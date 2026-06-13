import { useEffect, useState } from 'react'
import {
  Wind,
  Waves,
  Droplets,
  Thermometer,
  Eye,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import StatCard from '../../components/Cards/StatCard'
import LineChart from '../../components/Charts/LineChart'
import GaugeChart from '../../components/Charts/GaugeChart'
import {
  generateStations,
  generateCurrentData,
  generateWarnings,
  generateHistoricalData,
} from '../../services/mockData'
import { useOceanStore } from '../../store/useStore'

export default function Dashboard() {
  const { setStations, setCurrentData, setWarnings } = useOceanStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stations = generateStations()
    const currentData = generateCurrentData(stations)
    const warnings = generateWarnings(stations, currentData)

    setStations(stations)
    setCurrentData(currentData)
    setWarnings(warnings)
    setLoading(false)
  }, [setStations, setCurrentData, setWarnings])

  const { currentData, warnings, stations } = useOceanStore()

  const avgWindSpeed =
    currentData.length > 0
      ? (currentData.reduce((sum, d) => sum + d.windSpeed, 0) / currentData.length).toFixed(1)
      : '0.0'

  const avgWaveHeight =
    currentData.length > 0
      ? (currentData.reduce((sum, d) => sum + d.waveHeight, 0) / currentData.length).toFixed(1)
      : '0.0'

  const avgWaterTemp =
    currentData.length > 0
      ? (currentData.reduce((sum, d) => sum + d.waterTemp, 0) / currentData.length).toFixed(1)
      : '0.0'

  const avgVisibility =
    currentData.length > 0
      ? (currentData.reduce((sum, d) => sum + d.visibility, 0) / currentData.length).toFixed(1)
      : '0.0'

  const avgSalinity =
    currentData.length > 0
      ? (currentData.reduce((sum, d) => sum + d.salinity, 0) / currentData.length).toFixed(1)
      : '0.0'

  const avgTideLevel =
    currentData.length > 0
      ? (currentData.reduce((sum, d) => sum + d.tideLevel, 0) / currentData.length).toFixed(2)
      : '0.00'

  const historicalData = generateHistoricalData(
    'station-1',
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    new Date(),
    60 * 60 * 1000
  )

  const chartData = historicalData.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    windSpeed: d.windSpeed,
    waveHeight: d.waveHeight,
    waterTemp: d.waterTemp,
    visibility: d.visibility,
  }))

  const recentWarnings = warnings.slice(0, 3)

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
        <h1 className="text-3xl font-bold text-gradient mb-2">海况总览</h1>
        <p className="text-gray-400">实时监测港口环境参数，保障船舶作业安全</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="平均风速"
          value={avgWindSpeed}
          unit="m/s"
          icon={<Wind size={24} />}
          trend="up"
          trendValue="+2.3"
          color="blue"
        />
        <StatCard
          title="平均浪高"
          value={avgWaveHeight}
          unit="m"
          icon={<Waves size={24} />}
          color="ocean"
        />
        <StatCard
          title="平均潮位"
          value={avgTideLevel}
          unit="m"
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <StatCard
          title="平均水温"
          value={avgWaterTemp}
          unit="℃"
          icon={<Thermometer size={24} />}
          color="yellow"
        />
        <StatCard
          title="平均盐度"
          value={avgSalinity}
          unit="PSU"
          icon={<Droplets size={24} />}
          color="ocean"
        />
        <StatCard
          title="平均能见度"
          value={avgVisibility}
          unit="km"
          icon={<Eye size={24} />}
          status={parseFloat(avgVisibility) < 5 ? 'warning' : 'normal'}
          color={parseFloat(avgVisibility) < 5 ? 'yellow' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChart
            data={chartData}
            xAxisKey="time"
            series={[
              { name: '风速 (m/s)', dataKey: 'windSpeed', color: '#3b82f6' },
              { name: '浪高 (m)', dataKey: 'waveHeight', color: '#06b6d4' },
            ]}
            height={350}
            title="24小时趋势"
          />
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">监测站状态</h3>
            <div className="space-y-3">
              {stations.map((station) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary-deep/50"
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      size={16}
                      className={
                        station.status === 'online'
                          ? 'text-status-normal'
                          : station.status === 'maintenance'
                          ? 'text-status-warning'
                          : 'text-status-danger'
                      }
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        {station.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {station.type === 'buoy'
                          ? '浮标'
                          : station.type === 'fixed'
                          ? '固定站'
                          : '移动站'}
                      </div>
                    </div>
                  </div>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">实时环境指标</h3>
          <div className="grid grid-cols-2 gap-4">
            <GaugeChart
              value={parseFloat(avgWindSpeed)}
              max={20}
              title="风速"
              unit=" m/s"
              color="#3b82f6"
              size={180}
            />
            <GaugeChart
              value={parseFloat(avgWaterTemp)}
              max={40}
              title="水温"
              unit=" ℃"
              color="#f59e0b"
              size={180}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">最新预警</h3>
          <div className="space-y-3">
            {recentWarnings.length > 0 ? (
              recentWarnings.map((warning) => (
                <div
                  key={warning.id}
                  className={`p-4 rounded-lg border ${
                    warning.level === 'danger'
                      ? 'bg-status-danger/10 border-status-danger/30'
                      : warning.level === 'warning'
                      ? 'bg-status-warning/10 border-status-warning/30'
                      : 'bg-status-info/10 border-status-info/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`status-badge ${
                        warning.level === 'danger'
                          ? 'status-danger'
                          : warning.level === 'warning'
                          ? 'status-warning'
                          : 'status-info'
                      }`}
                    >
                      {warning.type === 'wind'
                        ? '大风预警'
                        : warning.type === 'visibility'
                        ? '低能见度'
                        : warning.type === 'water'
                        ? '水质异常'
                        : '设备故障'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(warning.timestamp).toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{warning.message}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">暂无预警信息</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
