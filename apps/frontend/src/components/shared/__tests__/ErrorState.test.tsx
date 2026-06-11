import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { ErrorState } from '../ErrorState'

describe('ErrorState', () => {
  afterEach(cleanup)
  it('renders "Search is temporarily limited" message by default', () => {
    render(<ErrorState />)
    expect(screen.getByTestId('error-state-message')).toHaveTextContent(
      'Search is temporarily limited',
    )
  })

  it('renders custom message when provided', () => {
    render(<ErrorState message="BGG API is unavailable" />)
    expect(screen.getByTestId('error-state-message')).toHaveTextContent(
      'BGG API is unavailable',
    )
  })

  it('renders an icon or visual indicator', () => {
    render(<ErrorState />)
    expect(screen.getByTestId('error-state-icon')).toBeInTheDocument()
  })
})
