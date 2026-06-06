import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, mock } from 'bun:test'
import PlanCard from './PlanCard'

describe('PlanCard', () => {
  const defaultProps = {
    title: 'Visit the Eiffel Tower',
    description: 'A wonderful visit to the most famous tower in Paris, France. Experience the breathtaking views of the city.',
    distance: '2.5 km',
    time: '1h 30m',
    imageUrl: 'https://example.com/eiffel.jpg',
    onClick: mock(),
  }

  it('renders the title', () => {
    render(<PlanCard {...defaultProps} />)
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
  })

  it('renders the description if provided', () => {
    render(<PlanCard {...defaultProps} />)
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
  })

  it('does not render the description if not provided', () => {
    const { description, ...propsWithoutDesc } = defaultProps
    render(<PlanCard {...propsWithoutDesc} />)
    expect(screen.queryByText(defaultProps.description)).not.toBeInTheDocument()
  })

  it('renders distance and time if provided', () => {
    render(<PlanCard {...defaultProps} />)
    expect(screen.getByText(defaultProps.distance)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.time)).toBeInTheDocument()
  })

  it('renders the image if provided', () => {
    render(<PlanCard {...defaultProps} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', defaultProps.imageUrl)
    expect(img).toHaveAttribute('alt', defaultProps.title)
  })

  it('calls onClick when clicked', () => {
    render(<PlanCard {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('truncates description at 120 characters', () => {
    const longDescription = 'A'.repeat(150)
    render(<PlanCard {...defaultProps} description={longDescription} />)

    const descriptionElement = screen.getByText(/A{120}/)
    expect(descriptionElement.textContent?.length).toBe(123)
    expect(descriptionElement.textContent).toContain('...')
  })

  it('does not truncate description of exactly 120 characters', () => {
    const exactDescription = 'A'.repeat(120)
    render(<PlanCard {...defaultProps} description={exactDescription} />)

    const descriptionElement = screen.getByText(exactDescription)
    expect(descriptionElement.textContent?.length).toBe(120)
    expect(descriptionElement.textContent).not.toContain('...')
  })

  it('truncates description of 121 characters', () => {
    const justOverDescription = 'A'.repeat(121)
    render(<PlanCard {...defaultProps} description={justOverDescription} />)

    const descriptionElement = screen.getByText(/A{120}/)
    expect(descriptionElement.textContent?.length).toBe(123)
    expect(descriptionElement.textContent).toContain('...')
  })
})
