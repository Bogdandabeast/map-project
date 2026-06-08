import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import {
  calendarOutline,
  createOutline,
  locationOutline,
  peopleOutline,
  trashOutline,
  closeCircleOutline,
} from 'ionicons/icons'
import { useEffect, useState } from 'react'
import { useParams, useHistory, Redirect } from 'react-router-dom'
import { useAuth } from '../../components/auth/AuthProvider'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { AttendeeList } from '../../components/events/AttendeeList'
import { RsvpButton } from '../../components/events/RsvpButton'
import { useEventsStore } from '../../stores/eventsStore'
import type { EventData } from '../../services/events'

// ── Status badge config ───────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string, label: string }> = {
  upcoming: { color: 'primary', label: 'Upcoming' },
  full: { color: 'warning', label: 'Full' },
  cancelled: { color: 'danger', label: 'Cancelled' },
  past: { color: 'medium', label: 'Past' },
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Component ─────────────────────────────────────────────────────

export function EventDetailPage() {
  return (
    <ProtectedRoute>
      <EventDetailContent />
    </ProtectedRoute>
  )
}

function EventDetailContent() {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { user } = useAuth()

  const {
    currentEvent,
    attendees,
    loading,
    error,
    rsvpState,
    fetchEvent,
    fetchAttendees,
    rsvp,
    leave,
    deleteEvent,
    cancelEvent,
    resetRsvpState,
  } = useEventsStore()

  const [deleted, setDeleted] = useState(false)
  const [canceled, setCanceled] = useState(false)

  useEffect(() => {
    // Guard: 'create' is a route path, not an event ID
    if (id && id !== 'create') {
      fetchEvent(id)
      fetchAttendees(id)
    }
  }, [id, fetchEvent, fetchAttendees])

  if (deleted) {
    return <Redirect to="/my/events" />
  }

  if (loading && !currentEvent) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (error && !currentEvent) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <IonText color="danger">
              <h2>Event not found</h2>
              <p>{error}</p>
            </IonText>
            <IonButton routerLink="/my/events" fill="outline" style={{ marginTop: '1rem' }}>
              Back to my events
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (!currentEvent) {
    return null
  }

  const event = currentEvent
  const isCreator = user?.id === event.creatorId
  const isAttending = attendees.some(a => a.userId === user?.id)
  const isFull = event.status === 'full'
  const statusConfig = STATUS_CONFIG[event.status] ?? { color: 'medium', label: event.status }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this event?')
    if (!confirmed) return
    const ok = await deleteEvent(event.id)
    if (ok) setDeleted(true)
  }

  const handleCancel = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel this event?')
    if (!confirmed) return
    await cancelEvent(event.id)
  }

  const handleRsvp = async () => {
    await rsvp(event.id)
    await fetchAttendees(event.id)
    setTimeout(() => resetRsvpState(), 2000)
  }

  const handleLeave = async () => {
    await leave(event.id)
    await fetchAttendees(event.id)
    setTimeout(() => resetRsvpState(), 2000)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{event.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
          {/* Image */}
          {event.imageKey && (
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '1rem',
                maxHeight: '300px',
              }}
            >
              <img
                src={`/cdn/${event.imageKey}`}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                data-testid="event-detail-image"
              />
            </div>
          )}

          {/* Status badge */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IonBadge color={statusConfig.color} data-testid="event-detail-status">
              {statusConfig.label}
            </IonBadge>

            {/* Creator actions */}
            {isCreator && event.status === 'upcoming' && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <IonButton
                  fill="clear"
                  size="small"
                  color="danger"
                  onClick={handleCancel}
                  data-testid="event-detail-cancel-btn"
                >
                  <IonIcon icon={closeCircleOutline} slot="icon-only" />
                </IonButton>
                <IonButton
                  fill="clear"
                  size="small"
                  color="danger"
                  onClick={handleDelete}
                  data-testid="event-detail-delete-btn"
                >
                  <IonIcon icon={trashOutline} slot="icon-only" />
                </IonButton>
              </div>
            )}
            {isCreator && event.status !== 'upcoming' && (
              <IonButton
                fill="clear"
                size="small"
                color="danger"
                onClick={handleDelete}
                data-testid="event-detail-delete-btn"
              >
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            )}
          </div>

          {/* Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <IonIcon icon={calendarOutline} color="medium" />
              <IonLabel data-testid="event-detail-date">{formatDate(event.date)}</IonLabel>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <IonIcon icon={locationOutline} color="medium" />
              <IonLabel data-testid="event-detail-address">{event.address}</IonLabel>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <IonIcon icon={peopleOutline} color="medium" />
              <IonLabel data-testid="event-detail-capacity">
                {attendees.length}
                {' '}
                /
                {' '}
                {event.capacity}
                {' '}
                attendees
              </IonLabel>
            </div>
          </div>

          {/* Games */}
          {event.plannedGames && event.plannedGames.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <IonLabel><strong>Games:</strong></IonLabel>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {event.plannedGames.map(game => (
                  <IonBadge key={game} color="light" data-testid="event-detail-game">
                    {game}
                  </IonBadge>
                ))}
              </div>
            </div>
          )}

          {/* Skill Level */}
          {event.skillLevel && (
            <div style={{ marginBottom: '0.5rem' }}>
              <IonLabel data-testid="event-detail-skill">
                <strong>Skill level:</strong>
                {' '}
                {event.skillLevel}
              </IonLabel>
            </div>
          )}

          {/* Atmosphere */}
          {event.atmosphere && (
            <div style={{ marginBottom: '1.5rem' }}>
              <IonNote data-testid="event-detail-atmosphere">{event.atmosphere}</IonNote>
            </div>
          )}

          {/* RSVP Button */}
          {event.status !== 'cancelled' && event.status !== 'past' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <RsvpButton
                eventStatus={event.status}
                isAttending={isAttending}
                isFull={isFull && !isAttending}
                loading={rsvpState === 'loading'}
                rsvpState={rsvpState}
                onRsvp={handleRsvp}
                onLeave={handleLeave}
              />
            </div>
          )}

          {/* Attendee List */}
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Attendees</h2>
            <AttendeeList
              attendees={attendees}
              totalCapacity={event.capacity}
              loading={loading && attendees.length === 0}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
