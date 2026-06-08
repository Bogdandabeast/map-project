import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
import * as React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

const mockGetPublicProfile = mock(async (userId: string) => ({
  id: userId,
  name: 'Public User',
  image: null,
  role: 'user',
  gameCount: 3,
}))

mock.module('../../../src/services/users', () => ({
  getPublicProfile: (...args: any[]) => mockGetPublicProfile(...args),
  getAvatarUploadUrl: mock(() => {}),
  confirmAvatar: mock(() => {}),
  addGame: mock(() => {}),
  removeGame: mock(() => {}),
}))

mock.module('../../../src/env', () => ({
  API_URL: 'http://localhost:8787',
  APP_URL: 'http://localhost:5173',
}))

import { PublicProfilePage } from '../../../src/pages/Profile/PublicProfilePage'

describe('PublicProfilePage', () => {
  afterEach(() => {
    mockGetPublicProfile.mockClear()
  })

  function renderPage(userId: string) {
    return render(
      <MemoryRouter initialEntries={[`/users/${userId}`]}>
        <Route path="/users/:id">
          <PublicProfilePage />
        </Route>
      </MemoryRouter>,
    )
  }

  it('shows user name from public profile', async () => {
    mockGetPublicProfile.mockImplementation(async (id: string) => ({
      id,
      name: 'Visible User',
      image: null,
      role: 'premium',
      gameCount: 5,
    }))

    renderPage('user-42')

    await waitFor(() => {
      expect(screen.getByTestId('public-name')).toBeInTheDocument()
    })
    expect(screen.getByTestId('public-name')).toHaveTextContent('Visible User')
  })

  it('shows role badge', async () => {
    mockGetPublicProfile.mockImplementation(async (id: string) => ({
      id,
      name: 'Premium User',
      image: null,
      role: 'premium',
      gameCount: 5,
    }))

    renderPage('user-1')

    await waitFor(() => {
      expect(screen.getByTestId('public-role')).toBeInTheDocument()
    })
    expect(screen.getByTestId('public-role')).toHaveTextContent('premium')
  })

  it('does NOT show email', async () => {
    mockGetPublicProfile.mockImplementation(async (id: string) => ({
      id,
      name: 'Safe User',
      image: null,
      role: 'user',
      gameCount: 3,
    }))

    renderPage('user-1')

    await waitFor(() => {
      expect(screen.getByTestId('public-name')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('public-email')).not.toBeInTheDocument()
  })

  it('shows avatar image when image is available', async () => {
    mockGetPublicProfile.mockImplementation(async (id: string) => ({
      id,
      name: 'Avatar User',
      image: 'https://example.com/avatar.jpg',
      role: 'user',
      gameCount: 3,
    }))

    renderPage('user-1')

    await waitFor(() => {
      expect(screen.getByTestId('public-avatar')).toBeInTheDocument()
    })
  })

  it('shows placeholder when no avatar image', async () => {
    mockGetPublicProfile.mockImplementation(async (id: string) => ({
      id,
      name: 'No Avatar',
      image: null,
      role: 'user',
      gameCount: 3,
    }))

    renderPage('user-1')

    await waitFor(() => {
      expect(screen.getByTestId('public-avatar-placeholder')).toBeInTheDocument()
    })
  })

  it('calls getPublicProfile with userId from route params', async () => {
    mockGetPublicProfile.mockImplementation(async (id: string) => ({
      id,
      name: 'Test',
      image: null,
      role: 'user',
      gameCount: 0,
    }))

    renderPage('user-99')

    await waitFor(() => {
      expect(mockGetPublicProfile).toHaveBeenCalledWith('user-99')
    })
  })
})
