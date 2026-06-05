import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, mock } from 'bun:test'
import BottomSheet from './BottomSheet'

describe('BottomSheet', () => {
  const defaultProps = {
    isOpen: true,
    onClose: mock(),
    children: <div data-testid="bs-content">Content</div>,
    title: 'Test Title',
  }

  it('renders children when isOpen is true', () => {
    render(<BottomSheet {...defaultProps} />)
    expect(screen.getByTestId('bs-content')).toBeInTheDocument()
  })

  it('does not render children when isOpen is false', () => {
    render(<BottomSheet {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('bs-content')).not.toBeInTheDocument()
  })

  it('renders the title if provided', () => {
    render(<BottomSheet {...defaultProps} />)
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
  })

  it('does not render the title if not provided', () => {
    const { title, ...propsWithoutTitle } = defaultProps
    render(<BottomSheet {...propsWithoutTitle} />)
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
  })

  it('renders the grabber handle on mobile', () => {
    globalThis.innerWidth = 500
    globalThis.dispatchEvent(new Event('resize'))
    render(<BottomSheet {...defaultProps} />)
    expect(screen.getByTestId('bs-grabber')).toBeInTheDocument()
  })

  it('does not render the grabber handle on desktop', () => {
    globalThis.innerWidth = 1200
    globalThis.dispatchEvent(new Event('resize'))
    render(<BottomSheet {...defaultProps} />)
    expect(screen.queryByTestId('bs-grabber')).not.toBeInTheDocument()
  })

  it('calls onClose when the backdrop is clicked', () => {
    render(<BottomSheet {...defaultProps} />)
    const backdrop = screen.getByTestId('bs-backdrop')
    fireEvent.click(backdrop)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('applies mobile styles when window width is less than 1024px', () => {
    globalThis.innerWidth = 500
    globalThis.dispatchEvent(new Event('resize'))
    render(<BottomSheet {...defaultProps} />)
    const panel = screen.getByTestId('bs-panel')
    expect(panel.style.bottom).toBe('0px')
    expect(panel.style.right).toBe('0px')
  })

  it('applies desktop styles when window width is 1024px or more', () => {
    globalThis.innerWidth = 1200
    globalThis.dispatchEvent(new Event('resize'))
    render(<BottomSheet {...defaultProps} />)
    const panel = screen.getByTestId('bs-panel')
    expect(panel.style.height).toBe('100vh')
    expect(panel.style.bottom).toBe('0px')
    expect(panel.style.right).toBe('0px')
  })
})
