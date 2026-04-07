import { IonContent, IonPage } from '@ionic/react'
import MapView from '../components/map/view/MapView'
import './MapPage.css'

/**
 * Displays the main map page.
 * Renders a fullscreen layout with the MapView component.
 * @returns {JSX.Element}
 */
export function MapPage() {
  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className="map-container">
          <MapView />
        </div>
      </IonContent>
    </IonPage>
  )
}
