import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  afterEach(cleanup)
  it('renders "No games found" message by default', () => {
    render(<EmptyState />)
    expect(screen.getByTestId('empty-state-message')).toHaveTextContent('No games found')
  })

  it('renders custom message when provided', () => {
    render(<EmptyState message="No results match your search" />)
    expect(screen.getByTestId('empty-state-message')).toHaveTextContent('No results match your search')
  })

  it('provides search refinement suggestions', () => {
    render(<EmptyState />)
    expect(screen.getByTestId('empty-state-suggestions')).toBeInTheDocument()
    expect(screen.getByText(/Try different keywords/)).toBeInTheDocument()
  })
})
