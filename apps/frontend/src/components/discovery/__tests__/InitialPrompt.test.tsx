import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import { InitialPrompt } from '../InitialPrompt'

describe('InitialPrompt', () => {
  it('renders the prompt message encouraging search', () => {
    render(<InitialPrompt />)

    expect(
      screen.getByText(/Search an area to discover events/i),
    ).toBeInTheDocument()
  })

  it('renders an icon element', () => {
    render(<InitialPrompt />)

    // IonIcon renders as <ion-icon> in the DOM
    const svg = document.querySelector('ion-icon')
    expect(svg).not.toBeNull()
  })

  it('renders with centered layout and adequate spacing', () => {
    render(<InitialPrompt />)

    const container = screen.getByTestId('initial-prompt')
    expect(container).toBeInTheDocument()

    const style = window.getComputedStyle(container)
    expect(style.display).toBe('flex')
    expect(style.justifyContent).toBe('center')
    expect(style.alignItems).toBe('center')
  })

  it('includes a subtitle with additional guidance', () => {
    render(<InitialPrompt />)

    // Should have a secondary text below the main prompt
    expect(
      screen.getByText(/Move the map/i),
    ).toBeInTheDocument()
  })

  it('has appropriate vertical spacing between icon, title, and subtitle', () => {
    render(<InitialPrompt />)

    const container = screen.getByTestId('initial-prompt')
    const style = window.getComputedStyle(container)
    // Should use flex column layout with a defined gap
    expect(style.flexDirection).toBe('column')
    expect(style.gap).not.toBe('normal')
    expect(style.gap).not.toBe('0px')
  })
})
