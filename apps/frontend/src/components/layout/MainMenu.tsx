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

interface MainMenuProps {}

export const MainMenu: React.FC<MainMenuProps> = () => {
  return (
    <IonMenu contentId="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mesa Cerca</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {menuItems.map(item => (
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
