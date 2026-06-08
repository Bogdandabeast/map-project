import { IonBadge, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonIcon, IonLabel } from '@ionic/react'
import { calendarOutline, peopleOutline } from 'ionicons/icons'
import type { EventData } from '../../services/events'

// ── Status helpers ────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string, label: string }> = {
  upcoming: { color: 'primary', label: 'Upcoming' },
  full: { color: 'warning', label: 'Full' },
  cancelled: { color: 'danger', label: 'Cancelled' },
  past: { color: 'medium', label: 'Past' },
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Component ─────────────────────────────────────────────────────

export interface EventCardProps {
  event: EventData
  attendeeCount?: number
  onClick?: (event: EventData) => void
}

export function EventCard({ event, attendeeCount = 0, onClick }: EventCardProps) {
  const statusConfig = STATUS_CONFIG[event.status] ?? { color: 'medium', label: event.status }

  return (
    <IonCard
      button={!!onClick}
      onClick={() => onClick?.(event)}
      data-testid="event-card"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <IonCardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <IonCardTitle data-testid="event-card-title">
              {event.title}
            </IonCardTitle>

            <IonCardSubtitle data-testid="event-card-game" style={{ marginTop: '4px' }}>
              {event.plannedGames?.[0] ?? 'No game specified'}
            </IonCardSubtitle>
          </div>

          <IonBadge
            color={statusConfig.color}
            data-testid="event-card-status"
          >
            {statusConfig.label}
          </IonBadge>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IonIcon icon={calendarOutline} color="medium" />
            <IonLabel data-testid="event-card-date" style={{ fontSize: '14px' }}>
              {formatDate(event.date)}
            </IonLabel>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IonIcon icon={peopleOutline} color="medium" />
            <IonLabel data-testid="event-card-attendees" style={{ fontSize: '14px' }}>
              {attendeeCount}
              {' '}
              /
              {' '}
              {event.capacity}
            </IonLabel>
          </div>
        </div>

        {event.address && (
          <IonLabel
            data-testid="event-card-address"
            color="medium"
            style={{ display: 'block', marginTop: '8px', fontSize: '13px' }}
          >
            {event.address}
          </IonLabel>
        )}
      </IonCardContent>
    </IonCard>
  )
}
