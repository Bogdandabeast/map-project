import { IonAvatar, IonItem, IonLabel, IonList, IonNote } from '@ionic/react'
import type { Attendee } from '../../services/events'

// ── Props ─────────────────────────────────────────────────────────

export interface AttendeeListProps {
  attendees: Attendee[]
  totalCapacity?: number
  loading?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────

function formatRsvpDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ── Component ─────────────────────────────────────────────────────

export function AttendeeList({ attendees, totalCapacity, loading = false }: AttendeeListProps) {
  if (loading) {
    return (
      <div data-testid="attendee-list-loading" style={{ padding: '16px', textAlign: 'center' }}>
        <IonNote>Loading attendees…</IonNote>
      </div>
    )
  }

  if (attendees.length === 0) {
    return (
      <div data-testid="attendee-list-empty" style={{ padding: '16px', textAlign: 'center' }}>
        <IonNote>No attendees yet</IonNote>
      </div>
    )
  }

  return (
    <div data-testid="attendee-list">
      {totalCapacity !== undefined && (
        <IonNote style={{ display: 'block', padding: '8px 16px' }}>
          {attendees.length}
          {' '}
          / 
          {' '}
          {totalCapacity}
          {' '}
          attendees
        </IonNote>
      )}

      <IonList>
        {attendees.map(attendee => (
          <IonItem key={attendee.userId} data-testid="attendee-item">
            <IonAvatar slot="start">
              {attendee.avatarUrl
                ? (
                    <img src={attendee.avatarUrl} alt={attendee.displayName ?? 'Attendee'} />
                  )
                : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--ion-color-medium)',
                        color: 'var(--ion-color-medium-contrast)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                      }}
                    >
                      {getInitials(attendee.displayName)}
                    </div>
                  )}
            </IonAvatar>
            <IonLabel>
              <h3>{attendee.displayName ?? 'Anonymous'}</h3>
            </IonLabel>
            <IonNote slot="end">
              {formatRsvpDate(attendee.rsvpAt)}
            </IonNote>
          </IonItem>
        ))}
      </IonList>
    </div>
  )
}
