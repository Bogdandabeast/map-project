import { createAuthClient } from 'better-auth/react'
import { API_URL } from '../env'

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} = createAuthClient({
  baseURL: API_URL,
  credentials: 'include',
})
