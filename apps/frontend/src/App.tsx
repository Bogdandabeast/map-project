import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'

import { AuthProvider } from './components/auth/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
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
          {/* Public — auth pages */}
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

          {/* Protected — requires session */}
          <Route exact path="/profile">
            <ProtectedRoute><MyProfilePage /></ProtectedRoute>
          </Route>
          <Route exact path="/users/:id">
            <ProtectedRoute><PublicProfilePage /></ProtectedRoute>
          </Route>
          <Route exact path="/settings">
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          </Route>
          <Route exact path="/map">
            <ProtectedRoute><MapPage /></ProtectedRoute>
          </Route>
          <Route exact path="/explore">
            <ProtectedRoute><ExplorePage /></ProtectedRoute>
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
