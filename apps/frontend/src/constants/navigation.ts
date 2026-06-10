import {
  addCircleOutline,
  calendarOutline,
  compassOutline,
  logInOutline,
  mapOutline,
  personAddOutline,
  personOutline,
  searchOutline,
  settingsOutline,
} from 'ionicons/icons'

export interface MenuItem {
  path: string
  icon: any
  label: string
  auth: boolean
}

export const menuItems: MenuItem[] = [
  { path: '/explore', icon: compassOutline, label: 'Explorar', auth: true },
  { path: '/map', icon: mapOutline, label: 'Mapa', auth: true },
  { path: '/my/events', icon: calendarOutline, label: 'Mis eventos', auth: true },
  { path: '/events/create', icon: addCircleOutline, label: 'Crear evento', auth: true },
  { path: '/profile', icon: personOutline, label: 'Perfil', auth: true },
  { path: '/settings', icon: settingsOutline, label: 'Ajustes', auth: true },
  { path: '/login', icon: logInOutline, label: 'Login', auth: false },
  { path: '/signup', icon: personAddOutline, label: 'Registro', auth: false },
  { path: '/forgot-password', icon: searchOutline, label: 'Reset Password', auth: false },
]
