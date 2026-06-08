import {
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonMenuButton,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { EventCard } from '../../components/events/EventCard'
import { useEventsStore } from '../../stores/eventsStore'
import type { MyEventsFilter, EventData } from '../../services/events'

// ── Filter tabs ───────────────────────────────────────────────────

const FILTERS: { value: MyEventsFilter, label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'attending', label: 'Attending' },
  { value: 'all', label: 'All' },
]

// ── Component ─────────────────────────────────────────────────────

export function MyEventsPage() {
  return (
    <ProtectedRoute>
      <MyEventsContent />
    </ProtectedRoute>
  )
}

function MyEventsContent() {
  const history = useHistory()
  const { myEvents, loading, error, fetchMyEvents } = useEventsStore()
  const [activeFilter, setActiveFilter] = useState<MyEventsFilter>('all')

  useEffect(() => {
    fetchMyEvents(activeFilter)
  }, [activeFilter, fetchMyEvents])

  const handleRefresh = async (e: CustomEvent) => {
    await fetchMyEvents(activeFilter)
    ;(e.target as HTMLIonRefresherElement).complete()
  }

  const handleEventClick = (event: EventData) => {
    history.push(`/events/${event.id}`)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>My Events</IonTitle>
        </IonToolbar>

        {/* Segment filter */}
        <IonToolbar>
          <IonSegment
            value={activeFilter}
            onIonChange={e => setActiveFilter(e.detail.value as MyEventsFilter)}
            data-testid="my-events-filter"
          >
            {FILTERS.map(f => (
              <IonSegmentButton key={f.value} value={f.value} data-testid={`filter-${f.value}`}>
                <IonLabel>{f.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Pull to refresh */}
        <IonRefresher
          slot="fixed"
          onIonRefresh={handleRefresh}
          data-testid="my-events-refresher"
        >
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
          {/* Loading */}
          {loading && myEvents.length === 0 && (
            <div
              data-testid="my-events-loading"
              style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
            >
              <IonSpinner name="crescent" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div data-testid="my-events-error" style={{ textAlign: 'center', padding: '2rem' }}>
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && myEvents.length === 0 && (
            <div
              data-testid="my-events-empty"
              style={{ textAlign: 'center', padding: '3rem 1rem' }}
            >
              <IonNote>
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                  {activeFilter === 'created'
                    ? 'You haven\'t created any events yet'
                    : activeFilter === 'attending'
                      ? 'You\'re not attending any events'
                      : 'No events found'}
                </p>
                <p style={{ fontSize: '14px' }}>
                  {activeFilter === 'created' && 'Create your first event to get started!'}
                  {activeFilter === 'attending' && 'Browse events and RSVP to join!'}
                </p>
              </IonNote>
            </div>
          )}

          {/* Event list */}
          {myEvents.length > 0 && (
            <div data-testid="my-events-list">
              {myEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
