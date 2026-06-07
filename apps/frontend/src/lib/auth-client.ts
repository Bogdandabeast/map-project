import { createAuthClient } from 'better-auth/react'

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
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})
