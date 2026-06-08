import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'

import { AuthProvider } from './components/auth/AuthProvider'
import { LoginPage } from './pages/Auth/LoginPage'
import { SignupPage } from './pages/Auth/SignupPage'
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage'
import { MyProfilePage } from './pages/Profile/MyProfilePage'
import { PublicProfilePage } from './pages/Profile/PublicProfilePage'
import { SettingsPage } from './pages/Profile/SettingsPage'
import { MapPage } from './pages/MapPage'
import { ExplorePage } from './pages/ExplorePage'

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

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Auth pages */}
          <Route exact path="/login">
            <LoginPage />
          </Route>
          <Route exact path="/signup">
            <SignupPage />
          </Route>
          <Route exact path="/forgot-password">
            <ForgotPasswordPage />
          </Route>
          <Route exact path="/reset-password">
            <ResetPasswordPage />
          </Route>

          {/* Profile pages */}
          <Route exact path="/profile">
            <MyProfilePage />
          </Route>
          <Route exact path="/users/:id">
            <PublicProfilePage />
          </Route>
          <Route exact path="/settings">
            <SettingsPage />
          </Route>

          {/* App pages */}
          <Route exact path="/map">
            <MapPage />
          </Route>
          <Route exact path="/explore">
            <ExplorePage />
          </Route>

          <Route exact path="/">
            <Redirect to="/explore" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
)

export default App
