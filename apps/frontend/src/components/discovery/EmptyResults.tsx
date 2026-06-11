import { IonIcon, IonText } from '@ionic/react'
import { locationOutline } from 'ionicons/icons'

/**
 * Shown when a radar search completes but returns zero events
 * (or when all results are filtered out by active criteria).
 * Provides guidance on how to broaden the search.
 */
export function EmptyResults() {
  return (
    <div
      data-testid="empty-results"
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
        icon={locationOutline}
        style={{ fontSize: '48px' }}
        color="medium"
      />

      <IonText style={{ fontSize: '16px', fontWeight: 500 }}>
        No events found nearby
      </IonText>

      <IonText
        data-testid="empty-results-guidance"
        color="medium"
        style={{ fontSize: '13px', maxWidth: '280px' }}
      >
        Try increasing the search radius, moving the map to a different area, or
        clearing your filters to broaden your search.
      </IonText>
    </div>
  )
}
