import { useState, useEffect, useRef } from 'react'
import {
  History,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  X,
  Filter,
  RotateCcw,
} from 'lucide-react'
import LineChart from '../../components/Charts/LineChart'
import { useOceanStore } from '../../store/useStore'
import { generateHistoricalData, generateStations, generateCurrentData } from '../../services/mockData'

export default function HistoryPlayback() {
  const { stations, eventMarkers, setStations, setCurrentData, addEventMarker } = useOceanStore()
  const [selectedStation, setSelectedStation] = useState('station-1')
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16))
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showMarkerModal, setShowMarkerModal] = useState(false)
  const [newMarker, setNewMarker] = useState({
    type: 'manual',
    description: '',
    severity: 'low',
  })
  const [selectedParams, setSelectedParams] = useState(['windSpeed', 'waterTemp'])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (stations.length === 0) {
      const newStations = generateStations()
      const newData = generateCurrentData(newStations)
      setStations(newStations)
      setCurrentData(newData)
    }
    setLoading(false)
  }, [stations.length, setStations, setCurrentData])

  useEffect(() => {
    const data = generateHistoricalData(
      selectedStation,
      new Date(startDate),
      new Date(endDate),
      60 * 60 * 1000
    )
    setHistoricalData(data)
    setCurrentIndex(data.length - 1)
  }, [selectedStation, startDate, endDate])

  useEffect(() => {
    if (isPlaying && historicalData.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= historicalData.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / playbackSpeed)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, historicalData.length])

  const handlePlayPause = () => {
    if (!isPlaying && currentIndex >= historicalData.length - 1) {
      setCurrentIndex(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSkipBack = () => {
    setIsPlaying(false)
    setCurrentIndex(Math.max(0, currentIndex - 1))
  }

  const handleSkipForward = () => {
    setIsPlaying(false)
    setCurrentIndex(Math.min(historicalData.length - 1, currentIndex + 1))
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(historicalData.length - 1)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false)
    setCurrentIndex(parseInt(e.target.value))
  }

  const allChartData = historicalData.map((d) => ({
    time: new Date(d.timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
    }),
    windSpeed: d.windSpeed,
    waveHeight: d.waveHeight,
    waterTemp: d.waterTemp,
    salinity: d.salinity,
    visibility: d.visibility,
  }))

  const currentData = historicalData[currentIndex]
  const currentChartData = allChartData.slice(0, currentIndex + 1)

  const paramOptions = [
    { key: 'windSpeed', name: '风速 (m/s)', color: '#3b82f6' },
    { key: 'waveHeight', name: '浪高 (m)', color: '#06b6d4' },
    { key: 'waterTemp', name: '水温 (℃)', color: '#f59e0b' },
    { key: 'salinity', name: '盐度 (PSU)', color: '#8b5cf6' },
    { key: 'visibility', name: '能见度 (km)', color: '#ec4899' },
  ]

  const selectedSeries = paramOptions.filter((p) => selectedParams.includes(p.key))

  const handleAddMarker = () => {
    const marker = {
      id: `event-${Date.now()}`,
      timestamp: historicalData[currentIndex]?.timestamp || new Date().toISOString(),
      type: newMarker.type as any,
      description: newMarker.description,
      severity: newMarker.severity as any,
      stationId: selectedStation,
    }
    addEventMarker(marker)
    setShowMarkerModal(false)
    setNewMarker({ type: 'manual', description: '', severity: 'low' })
  }

  const progress = historicalData.length > 0 
    ? ((currentIndex + 1) / historicalData.length) * 100 
    : 0

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
        <h1 className="text-3xl font-bold text-gradient mb-2">历史回放</h1>
        <p className="text-gray-400">回溯历史数据，标记重要事件</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-200">数据查询</h3>
          <button
            onClick={() => setShowMarkerModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            添加标记
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">监测站</label>
            <select
              value={selectedStation}
              onChange={(e) => {
                setSelectedStation(e.target.value)
                setIsPlaying(false)
              }}
              className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
            >
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">开始时间</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setIsPlaying(false)
              }}
              className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">结束时间</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setIsPlaying(false)
              }}
              className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">播放速度</label>
            <div className="flex items-center gap-2">
              {[1, 2, 4, 8].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    playbackSpeed === speed
                      ? 'bg-ocean-500/20 text-ocean-400 border border-ocean-400'
                      : 'bg-primary-deep text-gray-400 hover:bg-ocean-500/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">选择参数：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {paramOptions.map((param) => (
              <button
                key={param.key}
                onClick={() => {
                  if (selectedParams.includes(param.key)) {
                    if (selectedParams.length > 1) {
                      setSelectedParams(selectedParams.filter((p) => p !== param.key))
                    }
                  } else {
                    setSelectedParams([...selectedParams, param.key])
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedParams.includes(param.key)
                    ? 'border border-ocean-400'
                    : 'bg-primary-deep text-gray-400 hover:bg-ocean-500/10'
                }`}
                style={{
                  borderColor: selectedParams.includes(param.key) ? param.color : undefined,
                  color: selectedParams.includes(param.key) ? param.color : undefined,
                }}
              >
                {param.name}
              </button>
            ))}
          </div>
        </div>

        {currentData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 rounded-lg bg-primary-deep/50">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-blue-400">
                {currentData.windSpeed.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">风速 (m/s)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {currentData.waveHeight.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">浪高 (m)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-yellow-400">
                {currentData.waterTemp.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">水温 (℃)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-purple-400">
                {currentData.salinity.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">盐度 (PSU)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-pink-400">
                {currentData.visibility.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">能见度 (km)</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-primary-deep/50 mb-6">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-gray-400 hover:text-ocean-400"
            title="重置到结束"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handleSkipBack}
            className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-gray-400 hover:text-ocean-400"
            title="后退"
          >
            <SkipBack size={24} />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-4 rounded-full bg-ocean-500/20 hover:bg-ocean-500/30 transition-colors text-ocean-400 pulse-glow"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button
            onClick={handleSkipForward}
            className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-gray-400 hover:text-ocean-400"
            title="前进"
          >
            <SkipForward size={24} />
          </button>
          <div className="ml-4 flex items-center gap-3 flex-1 max-w-2xl">
            <span className="text-xs text-gray-400 w-20">
              {currentData ? new Date(currentData.timestamp).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }) : '--'}
            </span>
            <input
              type="range"
              min="0"
              max={historicalData.length - 1}
              value={currentIndex}
              onChange={handleSeek}
              className="flex-1 h-2 bg-primary-main rounded-lg appearance-none cursor-pointer accent-ocean-400"
            />
            <span className="text-xs text-gray-400 w-20 text-right">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <LineChart
          data={currentChartData}
          xAxisKey="time"
          series={selectedSeries.map((s) => ({
            name: s.name,
            dataKey: s.key,
            color: s.color,
          }))}
          height={400}
          title={`历史数据回放 (${currentIndex + 1}/${historicalData.length})`}
        />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">事件标记</h3>
        <div className="space-y-3">
          {eventMarkers.filter(m => m.stationId === selectedStation).length > 0 ? (
            eventMarkers
              .filter(m => m.stationId === selectedStation)
              .map((marker) => (
                <div
                  key={marker.id}
                  className={`p-4 rounded-lg border ${
                    marker.severity === 'high'
                      ? 'bg-status-danger/5 border-status-danger/30'
                      : marker.severity === 'medium'
                      ? 'bg-status-warning/5 border-status-warning/30'
                      : 'bg-status-info/5 border-status-info/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          marker.severity === 'high'
                            ? 'text-status-danger'
                            : marker.severity === 'medium'
                            ? 'text-status-warning'
                            : 'text-status-info'
                        }`}
                      >
                        {marker.type === 'device_fault'
                          ? '设备故障'
                          : marker.type === 'environment_anomaly'
                          ? '环境异常'
                          : marker.type === 'operation_impact'
                          ? '作业影响'
                          : '人工标记'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(marker.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{marker.description}</div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              暂无事件标记
            </div>
          )}
        </div>
      </div>

      {showMarkerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-primary-main rounded-xl p-6 w-full max-w-md border border-ocean-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">添加事件标记</h3>
              <button
                onClick={() => setShowMarkerModal(false)}
                className="p-2 rounded-lg hover:bg-ocean-500/20 transition-colors text-gray-400 hover:text-ocean-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">当前时间点</label>
                <div className="px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-ocean-400">
                  {currentData ? new Date(currentData.timestamp).toLocaleString('zh-CN') : '--'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">标记类型</label>
                <select
                  value={newMarker.type}
                  onChange={(e) => setNewMarker({ ...newMarker, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
                >
                  <option value="manual">人工标记</option>
                  <option value="device_fault">设备故障</option>
                  <option value="environment_anomaly">环境异常</option>
                  <option value="operation_impact">作业影响</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">严重程度</label>
                <select
                  value={newMarker.severity}
                  onChange={(e) => setNewMarker({ ...newMarker, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">描述</label>
                <textarea
                  value={newMarker.description}
                  onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-primary-deep border border-ocean-500/30 text-gray-200 text-sm focus:outline-none focus:border-ocean-400"
                  placeholder="请输入事件描述..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowMarkerModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleAddMarker}
                  disabled={!newMarker.description}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
