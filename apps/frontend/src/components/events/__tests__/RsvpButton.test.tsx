import { render, screen } from '@testing-library/react'
import { describe, expect, it, mock } from 'bun:test'

import { RsvpButton } from '../RsvpButton'

// ── Tests ─────────────────────────────────────────────────────────

describe('RsvpButton', () => {
  it('renders "Join event" button when user is not attending and event has space', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="upcoming"
        isAttending={false}
        isFull={false}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    expect(screen.getByTestId('rsvp-button-join')).toBeTruthy()
    expect(screen.getByTestId('rsvp-button-join')).toHaveTextContent('Join event')
  })

  it('fires onRsvp when Join is clicked', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="upcoming"
        isAttending={false}
        isFull={false}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    screen.getByTestId('rsvp-button-join').click()
    expect(onRsvp).toHaveBeenCalledTimes(1)
  })

  it('renders "Leave event" button when user is attending', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="upcoming"
        isAttending={true}
        isFull={false}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    expect(screen.getByTestId('rsvp-button-leave')).toBeTruthy()
    expect(screen.getByTestId('rsvp-button-leave')).toHaveTextContent('Leave event')
  })

  it('fires onLeave when Leave is clicked', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="upcoming"
        isAttending={true}
        isFull={false}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    screen.getByTestId('rsvp-button-leave').click()
    expect(onLeave).toHaveBeenCalledTimes(1)
  })

  it('renders "Event is full" button when event is full and user is not attending', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="upcoming"
        isAttending={false}
        isFull={true}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    expect(screen.getByTestId('rsvp-button-full')).toBeTruthy()
  })

  it('renders "You\'re in!" when RSVP success and attending', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="upcoming"
        isAttending={true}
        isFull={false}
        rsvpState="success"
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    expect(screen.getByTestId('rsvp-button-success')).toBeTruthy()
    expect(screen.getByTestId('rsvp-button-success')).toHaveTextContent("You're in!")
  })

  it('renders "Event cancelled" when event is cancelled', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="cancelled"
        isAttending={false}
        isFull={false}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    expect(screen.getByTestId('rsvp-button-disabled')).toBeTruthy()
    expect(screen.getByTestId('rsvp-button-disabled')).toHaveTextContent('Event cancelled')
  })

  it('renders "Event ended" when event is past', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="past"
        isAttending={false}
        isFull={false}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    expect(screen.getByTestId('rsvp-button-disabled')).toBeTruthy()
    expect(screen.getByTestId('rsvp-button-disabled')).toHaveTextContent('Event ended')
  })

  it('renders loading spinner when loading is true', () => {
    const onRsvp = mock(() => {})
    const onLeave = mock(() => {})

    render(
      <RsvpButton
        eventStatus="upcoming"
        isAttending={false}
        isFull={false}
        loading={true}
        onRsvp={onRsvp}
        onLeave={onLeave}
      />,
    )

    expect(screen.getByTestId('rsvp-button-loading')).toBeTruthy()
    expect(screen.getByTestId('rsvp-button-loading')).toHaveTextContent('Joining…')
  })
})
