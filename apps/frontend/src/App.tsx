import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { type FC, type ReactNode } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { AuthProvider } from './components/auth/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { SignupPage } from './pages/SignupPage'

import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'

import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import '@ionic/react/css/palettes/dark.system.css'
import './theme/variables.css'

setupIonicReact()

interface AppProps {
  /**
   * Override the map page content (for testing).
   * Defaults to `<MapPage />`.
   */
  mapContent?: ReactNode
}

const App: FC<AppProps> = ({ mapContent }) => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <IonRouterOutlet>
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/signup" component={SignupPage} />
            <Route exact path="/map">
              <ProtectedRoute>
                {mapContent ?? <MapPage />}
              </ProtectedRoute>
            </Route>
            <Route exact path="/">
              <Redirect to="/map" />
            </Route>
          </Switch>
        </IonRouterOutlet>
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
)

export default App
