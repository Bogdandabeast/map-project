import type { ReactNode } from 'react'
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useAuth } from '../auth/AuthProvider'

interface AppLayoutProps {
  title: string
  children: ReactNode
}

export function AppLayout({ title, children }: AppLayoutProps) {
  const { user } = useAuth()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          {user && (
            <IonButtons slot="end">
              <span style={{ fontSize: '14px', paddingRight: '8px' }}>
                {user.name || user.email}
              </span>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {children}
      </IonContent>
    </IonPage>
  )
}
