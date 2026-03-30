import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corregir iconos de Leaflet (a veces no cargan en React)
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// --- SUB-COMPONENTE 1: Mueve la cámara cuando cambian las coordenadas ---
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center, 15) // El 15 es el nivel de zoom (más cerca)
  return null
}

// --- SUB-COMPONENTE 2: Detecta clics para precisión quirúrgica ---
function LocationMarker({ onLocationSelect, selectedPosition }: any) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng)
    },
  })

  return selectedPosition ? (
    <Marker
      position={[selectedPosition.lat, selectedPosition.lng]}
      icon={customIcon}
    />
  ) : null
}

export const MapComponent = ({
  events = [],
  onLocationSelect,
  selectedPosition,
}: any) => {
  // Posición por defecto (Valencia) o la seleccionada
  const currentPos: [number, number] = selectedPosition
    ? [selectedPosition.lat, selectedPosition.lng]
    : [39.4699, -0.3763]

  return (
    <MapContainer
      center={currentPos}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Esto hace que el mapa se mueva solo al cambiar el barrio */}
      <ChangeView center={currentPos} />

      {/* Marcadores de otros eventos (si los hay) */}
      {events.map((event: any) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={customIcon}
        />
      ))}

      {/* El marcador que el usuario está moviendo */}
      <LocationMarker
        onLocationSelect={onLocationSelect}
        selectedPosition={selectedPosition}
      />
    </MapContainer>
  )
}
