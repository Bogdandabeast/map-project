import { IonIcon, IonText } from '@ionic/react'
import { searchOutline } from 'ionicons/icons'

export interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
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
      <IonIcon
        icon={searchOutline}
        style={{ fontSize: '48px' }}
        color="medium"
      />

      <IonText data-testid="empty-state-message" style={{ fontSize: '16px' }}>
        {message ?? 'No games found'}
      </IonText>

      <div data-testid="empty-state-suggestions">
        <IonText color="medium" style={{ fontSize: '13px' }}>
          Try different keywords or check the spelling of the game name.
        </IonText>
      </div>
    </div>
  )
}
