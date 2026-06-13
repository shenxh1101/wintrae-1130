import { create } from 'zustand'

interface Station {
  id: string
  name: string
  location: { lat: number; lng: number }
  type: 'buoy' | 'fixed' | 'mobile'
  status: 'online' | 'offline' | 'maintenance'
  sensors: string[]
}

interface EnvironmentalData {
  stationId: string
  timestamp: string
  windSpeed: number
  windDirection: number
  waveHeight: number
  tideLevel: number
  waterTemp: number
  salinity: number
  visibility: number
}

interface Warning {
  id: string
  stationId: string
  type: 'wind' | 'visibility' | 'water' | 'device'
  level: 'info' | 'warning' | 'danger' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'resolved'
  handler?: string
  handleTime?: string
  remark?: string
}

interface Operation {
  id: string
  shipName: string
  berth: string
  type: 'loading' | 'unloading' | 'bunkering' | 'maintenance'
  startTime: string
  endTime: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  environmentAssessment: {
    windRisk: 'low' | 'medium' | 'high'
    visibilityRisk: 'low' | 'medium' | 'high'
    waterRisk: 'low' | 'medium' | 'high'
  }
}

interface EventMarker {
  id: string
  timestamp: string
  type: 'device_fault' | 'environment_anomaly' | 'operation_impact' | 'manual'
  description: string
  severity: 'low' | 'medium' | 'high'
  stationId?: string
}

interface Threshold {
  parameter: string
  warning: number
  danger: number
  unit: string
}

interface AppState {
  sidebarCollapsed: boolean
  currentStation: string | null
  timeRange: { start: string; end: string }
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentStation: (stationId: string | null) => void
  setTimeRange: (range: { start: string; end: string }) => void
}

interface OceanState {
  stations: Station[]
  currentData: EnvironmentalData[]
  warnings: Warning[]
  operations: Operation[]
  eventMarkers: EventMarker[]
  thresholds: Threshold[]
  setStations: (stations: Station[]) => void
  setCurrentData: (data: EnvironmentalData[]) => void
  setWarnings: (warnings: Warning[]) => void
  setOperations: (operations: Operation[]) => void
  addWarning: (warning: Warning) => void
  updateWarning: (id: string, updates: Partial<Warning>) => void
  updateThresholds: (thresholds: Threshold[]) => void
  addEventMarker: (marker: EventMarker) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentStation: null,
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentStation: (stationId) => set({ currentStation: stationId }),
  setTimeRange: (range) => set({ timeRange: range }),
}))

export const useOceanStore = create<OceanState>((set) => ({
  stations: [],
  currentData: [],
  warnings: [],
  operations: [],
  eventMarkers: [],
  thresholds: [
    { parameter: 'windSpeed', warning: 10, danger: 15, unit: 'm/s' },
    { parameter: 'waveHeight', warning: 1.0, danger: 2.0, unit: 'm' },
    { parameter: 'visibility', warning: 5, danger: 1, unit: 'km' },
    { parameter: 'waterTemp', warning: 32, danger: 35, unit: '℃' },
    { parameter: 'salinity', warning: 38, danger: 40, unit: 'PSU' },
  ],
  setStations: (stations) => set({ stations }),
  setCurrentData: (data) => set({ currentData: data }),
  setWarnings: (warnings) => set({ warnings }),
  setOperations: (operations) => set({ operations }),
  addWarning: (warning) =>
    set((state) => ({ warnings: [warning, ...state.warnings] })),
  updateWarning: (id, updates) =>
    set((state) => ({
      warnings: state.warnings.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),
  updateThresholds: (thresholds) => set({ thresholds }),
  addEventMarker: (marker) =>
    set((state) => ({ eventMarkers: [...state.eventMarkers, marker] })),
}))

export type { Station, EnvironmentalData, Warning, Operation, EventMarker, Threshold }
