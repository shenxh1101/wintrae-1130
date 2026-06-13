import { Station, EnvironmentalData, Warning, Operation, EventMarker } from '../store/useStore'

const stationNames = [
  'A1-码头东',
  'A2-码头西',
  'B1-防波堤',
  'B2-航道入口',
  'C1-锚地',
  'C2-养殖区',
]

export const generateStations = (): Station[] => {
  return stationNames.map((name, index) => ({
    id: `station-${index + 1}`,
    name,
    location: {
      lat: 31.2 + (Math.random() - 0.5) * 0.1,
      lng: 121.5 + (Math.random() - 0.5) * 0.1,
    },
    type: ['buoy', 'fixed', 'mobile'][Math.floor(Math.random() * 3)] as Station['type'],
    status: ['online', 'online', 'online', 'maintenance'][Math.floor(Math.random() * 4)] as Station['status'],
    sensors: ['风速', '浪高', '潮位', '水温', '盐度', '能见度'],
    installedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

export const generateCurrentData = (stations: Station[]): EnvironmentalData[] => {
  const now = new Date()
  return stations.map((station) => {
    const baseTime = new Date(now.getTime() - Math.random() * 60 * 1000)
    return {
      stationId: station.id,
      timestamp: baseTime.toISOString(),
      windSpeed: Math.round((Math.random() * 15 + 2) * 10) / 10,
      windDirection: Math.floor(Math.random() * 360),
      waveHeight: Math.round((Math.random() * 2 + 0.3) * 10) / 10,
      tideLevel: Math.round((Math.random() * 3 + 1) * 100) / 100,
      waterTemp: Math.round((Math.random() * 8 + 18) * 10) / 10,
      salinity: Math.round((Math.random() * 5 + 30) * 10) / 10,
      visibility: Math.round((Math.random() * 15 + 2) * 10) / 10,
    }
  })
}

export const generateHistoricalData = (
  stationId: string,
  startTime: Date,
  endTime: Date,
  interval: number = 60 * 1000
): EnvironmentalData[] => {
  const data: EnvironmentalData[] = []
  let currentTime = new Date(startTime)

  while (currentTime <= endTime) {
    const hour = currentTime.getHours()
    const isDay = hour >= 6 && hour <= 18

    data.push({
      stationId,
      timestamp: currentTime.toISOString(),
      windSpeed: Math.round((Math.random() * 15 + 2 + (isDay ? 2 : 0)) * 10) / 10,
      windDirection: Math.floor(Math.random() * 360),
      waveHeight: Math.round((Math.random() * 2 + 0.3) * 10) / 10,
      tideLevel: Math.round((Math.sin(currentTime.getTime() / 1000000) * 2 + 2) * 100) / 100,
      waterTemp: Math.round((Math.random() * 6 + 20 + (isDay ? 2 : -1)) * 10) / 10,
      salinity: Math.round((Math.random() * 5 + 30) * 10) / 10,
      visibility: Math.round((Math.random() * 10 + 5) * 10) / 10,
    })

    currentTime = new Date(currentTime.getTime() + interval)
  }

  return data
}

export const generateWarnings = (stations: Station[], data: EnvironmentalData[]): Warning[] => {
  const warnings: Warning[] = []
  const now = new Date()

  data.forEach((stationData, index) => {
    if (stationData.windSpeed > 10) {
      warnings.push({
        id: `warning-${warnings.length + 1}`,
        stationId: stationData.stationId,
        type: 'wind',
        level: stationData.windSpeed > 15 ? 'danger' : 'warning',
        message: `风速超过安全阈值：${stationData.windSpeed} m/s`,
        value: stationData.windSpeed,
        threshold: 10,
        timestamp: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      })
    }

    if (stationData.visibility < 5) {
      warnings.push({
        id: `warning-${warnings.length + 1}`,
        stationId: stationData.stationId,
        type: 'visibility',
        level: stationData.visibility < 1 ? 'danger' : 'warning',
        message: `能见度较低：${stationData.visibility} km`,
        value: stationData.visibility,
        threshold: 5,
        timestamp: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.5 ? 'confirmed' : 'pending',
        handler: Math.random() > 0.5 ? '张伟' : undefined,
      })
    }

    if (stationData.waterTemp > 30 || stationData.waterTemp < 5) {
      warnings.push({
        id: `warning-${warnings.length + 1}`,
        stationId: stationData.stationId,
        type: 'water',
        level: stationData.waterTemp > 32 || stationData.waterTemp < 3 ? 'danger' : 'warning',
        message: `水温异常：${stationData.waterTemp} ℃`,
        value: stationData.waterTemp,
        threshold: 28,
        timestamp: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      })
    }
  })

  return warnings
}

export const generateOperations = (): Operation[] => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return [
    {
      id: 'op-1',
      shipName: '东方海号',
      berth: 'A1',
      type: 'loading',
      startTime: new Date(today.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress',
      environmentAssessment: {
        windRisk: 'low',
        visibilityRisk: 'low',
        waterRisk: 'low',
      },
    },
    {
      id: 'op-2',
      shipName: '太平洋号',
      berth: 'A2',
      type: 'unloading',
      startTime: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      environmentAssessment: {
        windRisk: 'low',
        visibilityRisk: 'medium',
        waterRisk: 'low',
      },
    },
    {
      id: 'op-3',
      shipName: '海运明珠号',
      berth: 'B1',
      type: 'bunkering',
      startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 12 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      environmentAssessment: {
        windRisk: 'medium',
        visibilityRisk: 'low',
        waterRisk: 'low',
      },
    },
    {
      id: 'op-4',
      shipName: '国际货轮',
      berth: 'C1',
      type: 'loading',
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 22 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      environmentAssessment: {
        windRisk: 'high',
        visibilityRisk: 'low',
        waterRisk: 'low',
      },
    },
    {
      id: 'op-5',
      shipName: '近海渔船',
      berth: 'A3',
      type: 'maintenance',
      startTime: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      status: 'cancelled',
      environmentAssessment: {
        windRisk: 'high',
        visibilityRisk: 'high',
        waterRisk: 'low',
      },
    },
  ]
}

export const generateEventMarkers = (): EventMarker[] => {
  const now = new Date()
  return [
    {
      id: 'event-1',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'environment_anomaly',
      description: 'A1码头附近风速突增，达到 12 m/s',
      severity: 'medium',
      stationId: 'station-1',
    },
    {
      id: 'event-2',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      type: 'device_fault',
      description: 'B1监测站水温传感器短暂离线',
      severity: 'low',
      stationId: 'station-3',
    },
    {
      id: 'event-3',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      type: 'operation_impact',
      description: '因大风天气，装卸作业暂停 1 小时',
      severity: 'high',
    },
    {
      id: 'event-4',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'manual',
      description: '日常巡查：A2监测站数据正常',
      severity: 'low',
      stationId: 'station-2',
    },
  ]
}
