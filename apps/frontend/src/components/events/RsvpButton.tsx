import { IonButton, IonSpinner } from '@ionic/react'

// ── Types ─────────────────────────────────────────────────────────

export interface RsvpButtonProps {
  /** The computed event status */
  eventStatus: string
  /** Whether the current user is already attending */
  isAttending: boolean
  /** Whether the event is at full capacity */
  isFull: boolean
  /** Whether an RSVP action is in progress */
  loading?: boolean
  /** RSVP state from the store */
  rsvpState?: 'idle' | 'loading' | 'success' | 'error'
  /** Called when user wants to RSVP */
  onRsvp: () => void
  /** Called when user wants to leave */
  onLeave: () => void
}

// ── Component ─────────────────────────────────────────────────────

/**
 * RSVP button with four visual states:
 * - "Join" — User is not attending, event has space
 * - "Leave" — User is attending
 * - "Full" — Event is full and user is not attending
 * - "You're in" — User just RSVP'd (success state, brief)
 */
export function RsvpButton({
  eventStatus,
  isAttending,
  isFull,
  loading = false,
  rsvpState = 'idle',
  onRsvp,
  onLeave,
}: RsvpButtonProps) {
  const isCancelled = eventStatus === 'cancelled'
  const isPast = eventStatus === 'past'
  const disabled = loading || isCancelled || isPast

  // Past or cancelled: show disabled state
  if (isCancelled || isPast) {
    return (
      <IonButton
        expand="block"
        color="medium"
        disabled
        data-testid="rsvp-button-disabled"
      >
        {isCancelled ? 'Event cancelled' : 'Event ended'}
      </IonButton>
    )
  }

  // Loading state
  if (loading) {
    return (
      <IonButton expand="block" disabled data-testid="rsvp-button-loading">
        <IonSpinner name="dots" />
        {' '}
        {isAttending ? 'Leaving…' : 'Joining…'}
      </IonButton>
    )
  }

  // Success state (brief toast-like)
  if (rsvpState === 'success') {
    return (
      <IonButton
        expand="block"
        color={isAttending ? 'medium' : 'success'}
        disabled
        data-testid="rsvp-button-success"
      >
        {isAttending ? "You're in!" : 'Left event'}
      </IonButton>
    )
  }

  // Already attending: show Leave button
  if (isAttending) {
    return (
      <IonButton
        expand="block"
        color="danger"
        onClick={onLeave}
        data-testid="rsvp-button-leave"
      >
        Leave event
      </IonButton>
    )
  }

  // Event is full
  if (isFull) {
    return (
      <IonButton
        expand="block"
        color="warning"
        disabled
        data-testid="rsvp-button-full"
      >
        Event is full
      </IonButton>
    )
  }

  // Default: Join
  return (
    <IonButton
      expand="block"
      color="primary"
      onClick={onRsvp}
      disabled={disabled}
      data-testid="rsvp-button-join"
    >
      Join event
    </IonButton>
  )
}
