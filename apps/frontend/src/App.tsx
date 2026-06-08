import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import {
  compassOutline,
  logInOutline,
  mapOutline,
  personAddOutline,
  personOutline,
  searchOutline,
  settingsOutline,
} from 'ionicons/icons'
import { Redirect, Route } from 'react-router-dom'

import { AuthProvider } from './components/auth/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage'
import { LoginPage } from './pages/Auth/LoginPage'
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage'
import { SignupPage } from './pages/Auth/SignupPage'
import { ExplorePage } from './pages/ExplorePage'
import { MapPage } from './pages/MapPage'
import { MyProfilePage } from './pages/Profile/MyProfilePage'
import { PublicProfilePage } from './pages/Profile/PublicProfilePage'
import { SettingsPage } from './pages/Profile/SettingsPage'

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

const menuItems = [
  { path: '/explore', icon: compassOutline, label: 'Explorar', auth: true },
  { path: '/map', icon: mapOutline, label: 'Mapa', auth: true },
  { path: '/profile', icon: personOutline, label: 'Perfil', auth: true },
  { path: '/settings', icon: settingsOutline, label: 'Ajustes', auth: true },
  { path: '/login', icon: logInOutline, label: 'Login', auth: false },
  { path: '/signup', icon: personAddOutline, label: 'Registro', auth: false },
  { path: '/forgot-password', icon: searchOutline, label: 'Reset Password', auth: false },
]

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonSplitPane contentId="main-content">
          <IonMenu contentId="main-content" type="overlay">
            <IonHeader>
              <IonToolbar>
                <IonTitle>Mesa Cerca</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonList>
                {menuItems.map(item => (
                  <IonMenuToggle key={item.path} autoHide>
                    <IonItem routerLink={item.path} routerDirection="none" lines="none" detail={false}>
                      <IonIcon slot="start" icon={item.icon} />
                      <IonLabel>{item.label}</IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                ))}
              </IonList>
            </IonContent>
          </IonMenu>

          <IonRouterOutlet id="main-content">
            {/* Public — auth pages */}
            <Route exact path="/login"><LoginPage /></Route>
            <Route exact path="/signup"><SignupPage /></Route>
            <Route exact path="/forgot-password"><ForgotPasswordPage /></Route>
            <Route exact path="/reset-password"><ResetPasswordPage /></Route>

            {/* Protected — requires session */}
            <Route exact path="/profile"><ProtectedRoute><MyProfilePage /></ProtectedRoute></Route>
            <Route exact path="/users/:id"><PublicProfilePage /></Route>
            <Route exact path="/settings"><ProtectedRoute><SettingsPage /></ProtectedRoute></Route>
            <Route exact path="/map"><ProtectedRoute><MapPage /></ProtectedRoute></Route>
            <Route exact path="/explore"><ProtectedRoute><ExplorePage /></ProtectedRoute></Route>

            <Route exact path="/"><Redirect to="/explore" /></Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
)

export default App
