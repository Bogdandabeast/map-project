import { IonButton } from '@ionic/react'
import { signIn } from '../../lib/auth-client'
import { APP_URL } from '../../env'

export function OAuthButtons() {
  const callback = `${APP_URL}/explore`

  return (
    <div>
      <IonButton
        expand="block"
        onClick={() => signIn.social({ provider: 'google', callbackURL: callback })}
      >
        Google
      </IonButton>
      <IonButton
        expand="block"
        onClick={() => signIn.social({ provider: 'github', callbackURL: callback })}
      >
        GitHub
      </IonButton>
    </div>
  )
}
