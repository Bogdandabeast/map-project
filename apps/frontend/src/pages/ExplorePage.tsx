import { IonSpinner } from '@ionic/react'
import MapView from '../components/map/view/MapView'
import { AppLayout } from '../components/layout/AppLayout'
import { useAuth } from '../components/auth/AuthProvider'
import './ExplorePage.css'

export function ExplorePage() {
  const { isAuthenticated, user, isPending } = useAuth()

  return (
    <AppLayout title="Explorar">
      <div className="explore-page">
        <div className="map-wrapper">
          <MapView />

          <div className="ui-overlay">
            <div className="auth-corner">
              {isPending ? (
                <IonSpinner className="auth-loading" />
              ) : isAuthenticated ? (
                <span className="auth-user">{user?.name || user?.email}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
