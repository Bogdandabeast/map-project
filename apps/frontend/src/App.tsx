import {
  IonApp,
  IonRouterOutlet,
  IonSpinner,
  IonSplitPane,
  setupIonicReact,
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route, Switch } from 'react-router-dom'

import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainMenu } from './components/layout/MainMenu'
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage'
import { LoginPage } from './pages/Auth/LoginPage'
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage'
import { SignupPage } from './pages/Auth/SignupPage'
import { CreateEventPage } from './pages/events/CreateEventPage'
import { EventDetailPage } from './pages/events/EventDetailPage'
import { MyEventsPage } from './pages/events/MyEventsPage'
import { ExplorePage } from './pages/ExplorePage'
import { MapPage } from './pages/MapPage'
import { MyProfilePage } from './pages/Profile/MyProfilePage'
import { PublicProfilePage } from './pages/Profile/PublicProfilePage'
import { SettingsPage } from './pages/Profile/SettingsPage'
import { BrowseGamesPage } from './pages/BrowseGamesPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { GameSearchPage } from './pages/GameSearchPage'

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

/** TODO: implement route-change tracking (analytics, page-view side-effects) */

function _RouteWatcher() {
  return null
}

function AppContent() {
  const { isPending } = useAuth()

  if (isPending) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'black' }}>
        <IonSpinner name="crescent" color="primary" />
      </div>
    )
  }

  return (
    <IonReactRouter>
      <RouteWatcher />
      <IonSplitPane contentId="main-content">
        <MainMenu />
        <IonRouterOutlet id="main-content">
          <Switch>
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

            {/* Events — requires session */}
            <Route exact path="/events/create"><ProtectedRoute><CreateEventPage /></ProtectedRoute></Route>
            <Route exact path="/events/:id"><ProtectedRoute><EventDetailPage /></ProtectedRoute></Route>
            <Route exact path="/my/events"><ProtectedRoute><MyEventsPage /></ProtectedRoute></Route>

            {/* Game Catalog — requires session */}
            <Route exact path="/games/browse"><ProtectedRoute><BrowseGamesPage /></ProtectedRoute></Route>
            <Route exact path="/games/search"><ProtectedRoute><GameSearchPage /></ProtectedRoute></Route>
            <Route exact path="/games/:id"><ProtectedRoute><GameDetailPage /></ProtectedRoute></Route>

            <Route exact path="/"><Redirect to="/explore" /></Route>
          </Switch>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  )
}

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </IonApp>
)

export default App
