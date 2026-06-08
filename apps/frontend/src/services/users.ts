import { API_URL } from '../env'
import type { AvatarUploadUrlResponse, PublicProfile } from '@repo/types/users'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: optHeaders, ...rest } = options
  const headers: Record<string, string> = {
    ...(optHeaders instanceof Headers
      ? Object.fromEntries(optHeaders.entries())
      : (optHeaders as Record<string, string> | undefined)),
    'Content-Type': 'application/json',
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function getAvatarUploadUrl(): Promise<AvatarUploadUrlResponse> {
  return request<AvatarUploadUrlResponse>('/api/users/me/avatar/upload-url', {
    method: 'POST',
  })
}

export async function confirmAvatar(key: string): Promise<void> {
  return request<void>('/api/users/me/avatar', {
    method: 'PATCH',
    body: JSON.stringify({ key }),
  })
}

export async function addGame(gameId: string, skillLevel?: string): Promise<void> {
  const body: Record<string, string> = { gameId }
  if (skillLevel) {
    body.skillLevel = skillLevel
  }
  return request<void>('/api/users/me/games', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function removeGame(gameId: string): Promise<void> {
  return request<void>(`/api/users/me/games/${gameId}`, {
    method: 'DELETE',
  })
}

export async function getPublicProfile(userId: string): Promise<PublicProfile> {
  return request<PublicProfile>(`/api/users/${userId}`)
}
