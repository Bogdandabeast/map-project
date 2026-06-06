import { render, screen, fireEvent } from '@testing-library/react'
import { FAB } from './FAB'
import { describe, it, expect, mock } from 'bun:test'

describe('FAB', () => {
  it('calls onClick when clicked', () => {
    const onClick = mock()
    render(<FAB icon="add" onClick={onClick} label="Create Plan" />)
    
    const button = screen.getByLabelText(/create plan/i)
    fireEvent.click(button)
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the icon', () => {
    render(<FAB icon="add" onClick={() => {}} label="Create Plan" />)
    expect(screen.getByLabelText(/create plan/i)).toBeInTheDocument()
  })

  it('applies the custom color', () => {
    render(<FAB icon="add" onClick={() => {}} label="Create Plan" color="danger" />)
    const button = screen.getByLabelText(/create plan/i)
    expect(button).toHaveAttribute('color', 'danger')
  })

  it('uses default label and icon when not provided', () => {
    render(<FAB onClick={() => {}} />)
    expect(screen.getByLabelText(/action/i)).toBeInTheDocument()
  })

  it('renders with a different icon', () => {
    render(<FAB icon="save" onClick={() => {}} label="Save" />)
    expect(screen.getByLabelText(/save/i)).toBeInTheDocument()
  })
})
