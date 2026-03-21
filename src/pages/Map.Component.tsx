import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// 1. Componente interno para forzar el renderizado correcto al abrir el mapa
const ResizeMap = () => {
  const map = useMap()
  useEffect(() => {
    // Pequeño delay para asegurar que el contenedor DOM ya tiene sus dimensiones finales
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

// 2. Icono personalizado de Lucide
const customIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="text-brand-orange drop-shadow-md">
      <MapPin size={32} fill="white" strokeWidth={2.5} />
    </div>,
  ),
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

interface MapProps {
  events: any[]
}

export const MapComponent = ({ events }: MapProps) => {
  const center: [number, number] = [39.4699, -0.3763]

  return (
    <div className="w-full h-full min-h-[450px] relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        {/* Inyectamos el componente de re-dimensionado aquí */}
        <ResizeMap />

        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        {events.map(event => {
          // Verificación de seguridad para evitar errores si las coordenadas fallan
          if (!event.latitude || !event.longitude) return null

          return (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={customIcon}
            >
              <Tooltip direction="top" offset={[0, -32]} opacity={1}>
                <div className="p-2 font-sans min-w-[120px]">
                  <h4 className="font-black text-brand-dark text-sm">
                    {event.title}
                  </h4>
                  <p className="text-[10px] text-brand-orange font-bold uppercase mt-1">
                    Ver detalles →
                  </p>
                </div>
              </Tooltip>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
