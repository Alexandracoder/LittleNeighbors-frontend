import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { EventMarker } from './EventMaker'

// Esto es para arreglar un bug conocido de Leaflet con los iconos en React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

export const MapComponent = () => {
  // Estos datos vendrán de tu hook que conecta con el backend
  const events = [
    { id: 1, lat: 39.4699, lon: -0.3763, count: 12 },
    { id: 2, lat: 39.475, lon: -0.38, count: 5 },
  ]

  return (
    <MapContainer
      center={[39.4699, -0.3763]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {events.map(event => (
        <EventMarker
          key={event.id}
          position={[event.lat, event.lon]}
          count={event.count}
        />
      ))}
    </MapContainer>
  )
}
