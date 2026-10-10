import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { RISK_COLOR } from '../utils/risk'

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const CENTER = [22.7196, 75.8577]
const radius = (l, selected) => (selected ? 10 : l.risk_level === 'LOW' ? 5 : 7)

function loadGoogle() {
  if (window.google?.maps) return Promise.resolve()
  if (window.__gmaps) return window.__gmaps
  window.__gmaps = new Promise((resolve, reject) => {
    window.gm_authFailure = () => window.dispatchEvent(new Event('gmaps-auth-failed'))
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}`
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.appendChild(s)
  })
  return window.__gmaps
}

function LeafletMap({ lights, selectedId, onSelect }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null), fitted = useRef(false)
  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: false }).setView(CENTER, 12)
    L.control.zoom({ position: 'bottomleft' }).addTo(map.current)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => map.current.remove()
  }, [])
  useEffect(() => {
    layer.current.clearLayers()
    lights.forEach((l) => {
      const sel = l.id === selectedId
      L.circleMarker([l.latitude, l.longitude], {
        radius: radius(l, sel), color: '#fff', weight: sel ? 3 : 1.5,
        fillColor: RISK_COLOR[l.risk_level], fillOpacity: 0.95,
      }).on('click', () => onSelect?.(l)).bindTooltip(`${l.id} - ${l.location}`).addTo(layer.current)
    })
    if (!fitted.current && lights.length) {
      map.current.fitBounds(lights.map((l) => [l.latitude, l.longitude]), { padding: [40, 40] })
      fitted.current = true
    }
  }, [lights, selectedId, onSelect])
  return <div ref={el} className="h-full w-full" />
}

function GoogleMap({ lights, selectedId, onSelect, onFail }) {
  const el = useRef(null), map = useRef(null), markers = useRef([]), fitted = useRef(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let dead = false
    loadGoogle().then(() => {
      if (dead) return
      map.current = new window.google.maps.Map(el.current, {
        center: { lat: CENTER[0], lng: CENTER[1] }, zoom: 12, disableDefaultUI: true, zoomControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ saturation: -80 }, { lightness: 8 }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', stylers: [{ color: '#cfd9e6' }] },
        ],
      })
      setReady(true)
    }).catch(onFail)
    const bad = () => onFail()
    window.addEventListener('gmaps-auth-failed', bad)
    return () => { dead = true; window.removeEventListener('gmaps-auth-failed', bad) }
  }, [onFail])
  useEffect(() => {
    if (!ready) return
    const g = window.google.maps
    markers.current.forEach((m) => m.setMap(null))
    markers.current = lights.map((l) => {
      const sel = l.id === selectedId
      const m = new g.Marker({
        map: map.current, position: { lat: l.latitude, lng: l.longitude }, title: `${l.id} - ${l.location}`,
        icon: { path: g.SymbolPath.CIRCLE, scale: radius(l, sel), fillColor: RISK_COLOR[l.risk_level], fillOpacity: 0.95, strokeColor: '#fff', strokeWeight: sel ? 3 : 1.5 },
      })
      m.addListener('click', () => onSelect?.(l))
      return m
    })
    if (!fitted.current && lights.length) {
      const b = new g.LatLngBounds()
      lights.forEach((l) => b.extend({ lat: l.latitude, lng: l.longitude }))
      map.current.fitBounds(b, 40)
      fitted.current = true
    }
  }, [lights, selectedId, onSelect, ready])
  return <div ref={el} className="h-full w-full" />
}

export default function MapView(props) {
  const [useGoogle, setUseGoogle] = useState(Boolean(KEY))
  return useGoogle
    ? <GoogleMap {...props} onFail={() => setUseGoogle(false)} />
    : <LeafletMap {...props} />
}
