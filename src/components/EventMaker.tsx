import L from 'leaflet'
import { Marker } from 'react-leaflet'

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
      font-family: sans-serif;
      font-weight: 900; 
      font-size: 14px;
      box-shadow: 0 10px 15px -3px rgba(255, 107, 107, 0.4);
      border: 3px solid white;
      transition: all 0.3s ease;
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
