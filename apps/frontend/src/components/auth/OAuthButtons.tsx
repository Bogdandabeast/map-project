import { IonButton } from '@ionic/react'
import { signIn } from '../../lib/auth-client'
import { APP_URL } from '../../env'

interface OAuthButtonsProps {
  callbackURL?: string
}

export function OAuthButtons({ callbackURL = `${APP_URL}/explore` }: OAuthButtonsProps) {
  return (
    <div>
      <IonButton
        expand="block"
        onClick={() => signIn.social({ provider: 'google', callbackURL })}
      >
        Google
      </IonButton>
      <IonButton
        expand="block"
        onClick={() => signIn.social({ provider: 'github', callbackURL })}
      >
        GitHub
      </IonButton>
    </div>
  )
}
