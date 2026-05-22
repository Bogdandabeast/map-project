import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthLayout } from './AuthLayout'

vi.mock('../../lib/auth-client', () => {
  const mockUseSession = vi.fn()
  ;(globalThis as unknown as Record<string, unknown>).__mockLayoutUseSession = mockUseSession
  return {
    authClient: {
      useSession: mockUseSession,
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  const mock = (globalThis as unknown as Record<string, unknown>).__mockLayoutUseSession as ReturnType<typeof vi.fn>
  mock.mockReturnValue({ data: null, isPending: false })
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
