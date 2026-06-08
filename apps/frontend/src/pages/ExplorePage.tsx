import { AppLayout } from '../components/layout/AppLayout'
import MapView from '../components/map/view/MapView'
import './ExplorePage.css'

export function ExplorePage() {
  return (
    <AppLayout title="Explorar">
      <div className="explore-page">
        <div className="map-wrapper">
          <MapView />

        </div>
      </div>
    </AppLayout>
  )
}
