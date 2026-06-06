import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PlanDetailPage from './PlanDetailPage'
import { describe, it, expect } from 'bun:test'

describe('PlanDetailPage', () => {
  it('renders the plan title and description', () => {
    render(
      <MemoryRouter>
        <PlanDetailPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Weekend Hiking Trip')).toBeInTheDocument()
    expect(screen.getByText('A beautiful trip to the mountains with friends.')).toBeInTheDocument()
  })

  it('renders the back button', () => {
    render(
      <MemoryRouter>
        <PlanDetailPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('renders the participant list', () => {
    render(
      <MemoryRouter>
        <PlanDetailPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })
})