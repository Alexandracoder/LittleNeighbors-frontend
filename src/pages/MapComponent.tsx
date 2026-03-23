import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Arreglo para los iconos de Leaflet que fallan en entornos SPA
const customIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// --- SUB-COMPONENTE 1: Animación de cámara fluida ---
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    // flyTo es más elegante que setView (hace un deslizamiento suave)
    map.flyTo(center, 15, {
      duration: 1.5,
    })
  }, [center, map])

  return null
}

// --- SUB-COMPONENTE 2: Gestor de clics ---
function LocationMarker({ onLocationSelect, selectedPosition }: any) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng)
      }
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
  // Centro de Valencia por defecto
  const defaultPos: [number, number] = [39.4699, -0.3763]

  const currentPos: [number, number] = selectedPosition
    ? [selectedPosition.lat, selectedPosition.lng]
    : defaultPos

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={defaultPos}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        {/* Capa de mapa: He cambiado a un estilo más limpio si prefieres, 
            pero OpenStreetMap es el estándar robusto */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Efecto de movimiento de cámara al cambiar el barrio */}
        <ChangeView center={currentPos} />

        {/* Renderizado de eventos existentes en el mapa */}
        {events.map((event: any) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={customIcon}
          />
        ))}

        {/* Marcador interactivo para selección del usuario */}
        <LocationMarker
          onLocationSelect={onLocationSelect}
          selectedPosition={selectedPosition}
        />
      </MapContainer>

      {/* Pequeño gradiente decorativo para suavizar los bordes si está dentro de un contenedor rounded */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] rounded-2xl" />
    </div>
  )
}
