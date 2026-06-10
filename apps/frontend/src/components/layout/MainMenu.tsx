import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import * as React from 'react'
import { menuItems } from '../../constants/navigation'
import { useAuth } from '../auth/AuthProvider'

interface MainMenuProps {}

export const MainMenu: React.FC<MainMenuProps> = () => {
  const { isAuthenticated } = useAuth()

  const visibleItems = menuItems.filter(
    item => !item.auth || isAuthenticated,
  )

  return (
    <IonMenu contentId="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mesa Cerca</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {visibleItems.map(item => (
            <IonItem
              key={item.path}
              routerLink={item.path}
              routerDirection="none"
              lines="none"
              detail={false}
              style={{ color: 'white' }}
            >
              <IonIcon slot="start" icon={item.icon} />
              <IonLabel>{item.label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  )
}
