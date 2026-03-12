import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corregir iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

export const EventMap = ({ events }: { events: any[] }) => {
  return (
    // Contenedor que limita el ancho y añade espacio para que el diseño respire
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <MapContainer
        center={[39.4699, -0.3763]}
        zoom={13}
        style={{
          height: '250px',
          width: '100%',
          borderRadius: '1rem',
          zIndex: 1, // Mantenemos el mapa en la capa base
        }}
      >
        {/* Estilo Voyager: limpio, claro y profesional */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        {events.map(event => (
          <Marker key={event.id} position={[event.latitude, event.longitude]}>
            {/* Tooltip para una experiencia más ligera al hacer hover */}
            <Tooltip direction="top" offset={[0, -20]}>
              <div className="font-sans text-brand-dark p-1">
                <h4 className="font-bold text-sm">{event.title}</h4>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
