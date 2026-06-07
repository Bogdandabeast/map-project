import { IonButton } from '@ionic/react'
import { signIn } from '../../lib/auth-client'

export function OAuthButtons() {
  return (
    <div>
      <IonButton
        expand="block"
        onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
      >
        Google
      </IonButton>
      <IonButton
        expand="block"
        onClick={() => signIn.social({ provider: 'github', callbackURL: '/' })}
      >
        GitHub
      </IonButton>
    </div>
  )
}
