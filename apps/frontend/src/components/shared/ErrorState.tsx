import { IonIcon, IonText } from '@ionic/react'
import { warningOutline } from 'ionicons/icons'

export interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div
      data-testid="error-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        gap: '16px',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div data-testid="error-state-icon">
        <IonIcon
          icon={warningOutline}
          style={{ fontSize: '48px' }}
          color="warning"
        />
      </div>

      <IonText data-testid="error-state-message" style={{ fontSize: '16px' }}>
        {message ?? 'Search is temporarily limited'}
      </IonText>
    </div>
  )
}
