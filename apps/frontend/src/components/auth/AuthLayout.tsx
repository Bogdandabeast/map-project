import { IonContent, IonPage } from '@ionic/react'
import { AuthHeader } from './AuthHeader'

interface AuthLayoutProps {
  children: React.ReactNode
  fullscreen?: boolean
  scrollY?: boolean
}

/**
 * Shared page layout with auth-aware navigation header.
 * Wraps content in IonPage → AuthHeader → IonContent.
 */
export function AuthLayout({ children, fullscreen = false, scrollY = true }: AuthLayoutProps) {
  return (
    <IonPage>
      <AuthHeader />
      <IonContent fullscreen={fullscreen} scrollY={scrollY}>
        {children}
      </IonContent>
    </IonPage>
  )
}
