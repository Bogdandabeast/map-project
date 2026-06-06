import { render, screen } from '@testing-library/react'
import { ProfileHeader } from './ProfileHeader'
import { describe, it, expect } from 'bun:test'

describe('ProfileHeader', () => {
  it('renders the user name', () => {
    render(<ProfileHeader name="John Doe" />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders the avatar image when avatarUrl is provided', () => {
    const avatarUrl = 'https://example.com/avatar.jpg'
    render(<ProfileHeader name="John Doe" avatarUrl={avatarUrl} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', avatarUrl)
  })

  it('renders initials when avatarUrl is missing', () => {
    render(<ProfileHeader name="John Doe" />)
    // Expected initials: JD
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders a single initial when name has only one word', () => {
    render(<ProfileHeader name="John" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders only two initials when name has many words', () => {
    render(<ProfileHeader name="John Fitzgerald Kennedy" />)
    expect(screen.getByText('JK')).toBeInTheDocument()
  })

  it('renders stats when provided', () => {
    const stats = [
      { label: 'Projects', value: 12 },
      { label: 'Followers', value: 150 },
    ]
    render(<ProfileHeader name="John Doe" stats={stats} />)
    
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Followers')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders no stats when stats prop is missing', () => {
    render(<ProfileHeader name="John Doe" />)
    // Check that no stat labels are rendered. 
    // We can use a query that should return null.
    expect(screen.queryByText('Projects')).not.toBeInTheDocument()
  })

  it('renders no stats when stats array is empty', () => {
    render(<ProfileHeader name="John Doe" stats={[]} />)
    expect(screen.queryByText('Projects')).not.toBeInTheDocument()
  })
})
