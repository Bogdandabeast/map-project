import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  afterEach(cleanup)
  it('renders a spinner element', () => {
    render(<LoadingSpinner />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders centered in its container', () => {
    render(<LoadingSpinner />)
    const container = screen.getByTestId('loading-spinner')
    expect(container).toBeInTheDocument()
  })

  it('renders with a loading message when provided', () => {
    render(<LoadingSpinner message="Searching games..." />)
    expect(screen.getByText('Searching games...')).toBeInTheDocument()
  })

  it('renders without a message when not provided', () => {
    render(<LoadingSpinner />)
    expect(screen.queryByText('Searching games...')).not.toBeInTheDocument()
  })
})
