import { describe, expect, it } from 'bun:test'

import {
  deleteUser,
  forgotPassword,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updateUser,
  useSession,
} from '../../src/lib/auth-client'

describe('auth-client', () => {
  it('exports signIn function', () => {
    expect(signIn).toBeDefined()
    expect(typeof signIn).toBe('function')
  })

  it('exports signIn.social for OAuth providers', () => {
    expect(signIn.social).toBeDefined()
    expect(typeof signIn.social).toBe('function')
  })

  it('exports signUp function', () => {
    expect(signUp).toBeDefined()
    expect(typeof signUp).toBe('function')
  })

  it('exports signOut function', () => {
    expect(signOut).toBeDefined()
    expect(typeof signOut).toBe('function')
  })

  it('exports useSession hook', () => {
    expect(useSession).toBeDefined()
    expect(typeof useSession).toBe('function')
  })

  it('exports updateUser function', () => {
    expect(updateUser).toBeDefined()
    expect(typeof updateUser).toBe('function')
  })

  it('exports deleteUser function', () => {
    expect(deleteUser).toBeDefined()
    expect(typeof deleteUser).toBe('function')
  })

  it('exports forgotPassword function', () => {
    expect(forgotPassword).toBeDefined()
    expect(typeof forgotPassword).toBe('function')
  })

  it('exports resetPassword function', () => {
    expect(resetPassword).toBeDefined()
    expect(typeof resetPassword).toBe('function')
  })

  it('all exports are distinct references', () => {
    const exports = [signIn, signIn.social, signUp, signOut, useSession, updateUser, deleteUser, forgotPassword, resetPassword]
    const unique = new Set(exports)
    expect(unique.size).toBe(exports.length)
  })
})
