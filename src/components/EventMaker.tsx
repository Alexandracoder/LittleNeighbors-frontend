import L from 'leaflet'
import { Marker } from 'react-leaflet'

// Esto crea el estilo circular con tu color de marca
const createCustomIcon = (count: number) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #FF6B6B; 
      color: white; 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: bold; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

export const EventMarker = ({
  position,
  count,
}: {
  position: [number, number]
  count: number
}) => {
  return <Marker position={position} icon={createCustomIcon(count)} />
}
