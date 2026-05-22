import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authClient } from '../../lib/auth-client'
import { AuthLayout } from './AuthLayout'

vi.mock('../../lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

const mockUseSession = vi.mocked(authClient.useSession)

beforeEach(() => {
  vi.clearAllMocks()
  mockUseSession.mockReturnValue({ data: null, isPending: false })
})

function renderLayout(content = 'Child Content') {
  return render(
    <MemoryRouter>
      <AuthLayout>{content}</AuthLayout>
    </MemoryRouter>,
  )
}

describe('authLayout', () => {
  it('renders the AuthHeader', () => {
    renderLayout()
    expect(screen.getByText('Map Project')).toBeInTheDocument()
  })

  it('renders children', () => {
    renderLayout('Custom Child')
    expect(screen.getByText('Custom Child')).toBeInTheDocument()
  })
})
