import { IonIcon, IonText } from '@ionic/react'
import { compassOutline } from 'ionicons/icons'

/**
 * Shows a friendly prompt encouraging the user to search for events.
 * Displayed on the Explore page before any search has been performed.
 */
export function InitialPrompt() {
  return (
    <div
      data-testid="initial-prompt"
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
        icon={compassOutline}
        style={{ fontSize: '56px' }}
        color="primary"
      />

      <IonText style={{ fontSize: '16px', fontWeight: 500 }}>
        Search an area to discover events
      </IonText>

      <IonText color="medium" style={{ fontSize: '13px' }}>
        Move the map and tap "Search here" to find events nearby
      </IonText>
    </div>
  )
}
