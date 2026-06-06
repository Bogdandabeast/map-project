import { render, screen, fireEvent } from '@testing-library/react'
import { Chip } from './Chip'
import { describe, it, expect, mock } from 'bun:test'

describe('Chip', () => {

  it('renders the label', () => {
    render(<Chip label="Coffee" />)
    expect(screen.getByText('Coffee')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = mock()
    render(<Chip label="Coffee" onClick={onClick} />)
    fireEvent.click(screen.getByText('Coffee'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is marked as selected when selected prop is true', () => {
    render(<Chip label="Coffee" selected={true} />)
    expect(screen.getByText('Coffee')).toHaveAttribute('data-selected', 'true')
  })

  it('is not marked as selected when selected prop is false', () => {
    render(<Chip label="Coffee" selected={false} />)
    expect(screen.getByText('Coffee')).toHaveAttribute('data-selected', 'false')
  })

  it('is not marked as selected by default', () => {
    render(<Chip label="Coffee" />)
    expect(screen.getByText('Coffee')).toHaveAttribute('data-selected', 'false')
  })
})
