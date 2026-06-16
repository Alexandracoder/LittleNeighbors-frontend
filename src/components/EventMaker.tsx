import L from 'leaflet'
import { Marker } from 'react-leaflet'

const createCustomIcon = (count: number) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="position: relative;">
        <div style="
          background-color: #F28749; 
          width: 35px; 
          height: 35px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(242, 135, 73, 0.4);
        ">
          <span style="
            transform: rotate(45deg); 
            color: white; 
            font-weight: 900; 
            font-size: 12px;
          ">${count}</span>
        </div>
      </div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
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
