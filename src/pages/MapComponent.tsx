import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Pin de evento con el número de asistentes como insignia visible encima,
// en vez de un pin genérico sin información — antes había que adivinar
// cuánta gente iba a un evento solo con verlo en el mapa.
function createEventIcon(attendeeCount: number) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position: relative; width: 25px; height: 41px;">
        <img
          src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
          style="width: 25px; height: 41px;"
        />
        ${
          attendeeCount > 0
            ? `<div style="
                 position: absolute; top: -6px; right: -8px;
                 background: #F28749; color: white;
                 font-size: 10px; font-weight: 900;
                 min-width: 18px; height: 18px;
                 border-radius: 9px; border: 2px solid white;
                 display: flex; align-items: center; justify-content: center;
                 padding: 0 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.4);
               ">${attendeeCount}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  })
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center, 15)
  return null
}

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
  const { i18n } = useTranslation()

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

      <ChangeView center={currentPos} />

      {events.map((event: any) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={createEventIcon(event.attendeeCount ?? 0)}
        >
          <Popup>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {event.title}
            </div>
            {event.eventDate && (
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                {new Date(event.eventDate).toLocaleString(i18n.language, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F28749' }}>
              {event.attendeeCount ?? 0}{' '}
              {(event.attendeeCount ?? 0) === 1
                ? 'asistente'
                : 'asistentes'}
            </div>
          </Popup>
        </Marker>
      ))}

      <LocationMarker
        onLocationSelect={onLocationSelect}
        selectedPosition={selectedPosition}
      />
    </MapContainer>
  )
}
