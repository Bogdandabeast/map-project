import MapView from '../components/map/view/MapView'
import { AppLayout } from '../components/layout/AppLayout'
import './MapPage.css'

export function MapPage() {
  return (
    <AppLayout title="Mapa">
      <div className="map-container">
        <MapView />
      </div>
    </AppLayout>
  )
}
