import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import { EmptyResults } from '../EmptyResults'

describe('EmptyResults', () => {
  it('renders "No events found nearby" message', () => {
    render(<EmptyResults />)

    expect(
      screen.getByText(/No events found nearby/i),
    ).toBeInTheDocument()
  })

  it('renders an icon element', () => {
    render(<EmptyResults />)

    const icon = document.querySelector('ion-icon')
    expect(icon).not.toBeNull()
  })

  it('suggests broadening search criteria', () => {
    render(<EmptyResults />)

    expect(
      screen.getByText(/broaden/i),
    ).toBeInTheDocument()
  })

  it('provides specific actionable guidance', () => {
    render(<EmptyResults />)

    // Should mention increasing radius or adjusting filters
    const guidance = screen.getByTestId('empty-results-guidance')
    expect(guidance).toBeInTheDocument()
    expect(guidance.textContent).not.toBe('')
  })

  it('renders with centered layout structure', () => {
    render(<EmptyResults />)

    const container = screen.getByTestId('empty-results')
    expect(container).toBeInTheDocument()

    const style = window.getComputedStyle(container)
    expect(style.display).toBe('flex')
    expect(style.justifyContent).toBe('center')
  })

  it('guidance mentions increasing radius as an option', () => {
    render(<EmptyResults />)

    const guidance = screen.getByTestId('empty-results-guidance')
    expect(guidance.textContent).toMatch(/radius/i)
  })

  it('guidance mentions clearing filters as an option', () => {
    render(<EmptyResults />)

    const guidance = screen.getByTestId('empty-results-guidance')
    expect(guidance.textContent).toMatch(/filter/i)
  })
})
