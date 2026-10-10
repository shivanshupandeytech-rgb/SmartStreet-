import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Streetlights from './pages/Streetlights'
import MapPage from './pages/MapPage'
import Predictions from './pages/Predictions'
import Maintenance from './pages/Maintenance'
import Analytics from './pages/Analytics'
import About from './pages/About'
import IoTMonitor from './pages/IoTMonitor'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="streetlights" element={<Streetlights />} />
        <Route path="iot" element={<IoTMonitor />} />
        <Route path="map" element={<MapPage />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}
