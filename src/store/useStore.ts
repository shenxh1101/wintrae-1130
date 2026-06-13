import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  name: string
  warning: number
  danger: number
  unit: string
  min?: number
  max?: number
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
  initialized: boolean
  setStations: (stations: Station[]) => void
  setCurrentData: (data: EnvironmentalData[]) => void
  setWarnings: (warnings: Warning[]) => void
  setOperations: (operations: Operation[]) => void
  updateWarning: (id: string, updates: Partial<Warning>) => void
  updateThresholds: (thresholds: Threshold[]) => void
  addEventMarker: (marker: EventMarker) => void
  initializeData: (data: { stations: Station[]; currentData: EnvironmentalData[]; warnings: Warning[]; operations: Operation[] }) => void
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

export const useOceanStore = create<OceanState>()(
  persist(
    (set, get) => ({
      stations: [],
      currentData: [],
      warnings: [],
      operations: [],
      eventMarkers: [],
      initialized: false,
      thresholds: [
        { parameter: 'windSpeed', name: '风速', warning: 10, danger: 15, unit: 'm/s', min: 0, max: 30 },
        { parameter: 'waveHeight', name: '浪高', warning: 1.0, danger: 2.0, unit: 'm', min: 0, max: 10 },
        { parameter: 'visibility', name: '能见度', warning: 5, danger: 1, unit: 'km', min: 0, max: 50 },
        { parameter: 'waterTemp', name: '水温', warning: 32, danger: 35, unit: '℃', min: -5, max: 40 },
        { parameter: 'salinity', name: '盐度', warning: 38, danger: 40, unit: 'PSU', min: 0, max: 50 },
      ],
      
      setStations: (stations) => set({ stations }),
      setCurrentData: (data) => set({ currentData: data }),
      setWarnings: (warnings) => set({ warnings }),
      setOperations: (operations) => set({ operations }),
      
      updateWarning: (id, updates) =>
        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),
      
      updateThresholds: (thresholds) => set({ thresholds }),
      
      addEventMarker: (marker) =>
        set((state) => ({ eventMarkers: [...state.eventMarkers, marker] })),
      
      initializeData: (data) => {
        const state = get()
        if (!state.initialized || state.stations.length === 0) {
          set({
            stations: data.stations,
            currentData: data.currentData,
            warnings: data.warnings,
            operations: data.operations,
            initialized: true,
          })
        }
      },
    }),
    {
      name: 'ocean-storage',
      partialize: (state) => ({
        warnings: state.warnings,
        thresholds: state.thresholds,
        eventMarkers: state.eventMarkers,
        initialized: state.initialized,
        stations: state.stations,
        currentData: state.currentData,
        operations: state.operations,
      }),
    }
  )
)

export type { Station, EnvironmentalData, Warning, Operation, EventMarker, Threshold }
