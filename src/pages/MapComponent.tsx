import {
  MapContainer,
  TileLayer,
  Marker,
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
          icon={customIcon}
        />
      ))}

      <LocationMarker
        onLocationSelect={onLocationSelect}
        selectedPosition={selectedPosition}
      />
    </MapContainer>
  )
}
