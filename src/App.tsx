import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import StationDetail from './pages/StationDetail/StationDetail'
import WarningCenter from './pages/WarningCenter/WarningCenter'
import ShipOperation from './pages/ShipOperation/ShipOperation'
import HistoryPlayback from './pages/HistoryPlayback/HistoryPlayback'
import ReportExport from './pages/ReportExport/ReportExport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="station/:id" element={<StationDetail />} />
          <Route path="warnings" element={<WarningCenter />} />
          <Route path="operations" element={<ShipOperation />} />
          <Route path="playback" element={<HistoryPlayback />} />
          <Route path="reports" element={<ReportExport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
