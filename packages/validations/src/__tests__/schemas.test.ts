import {
  emailSchema,
  nameSchema,
  passwordSchema,
  signInSchema,
  signUpSchema,
} from '../index'

describe('emailSchema', () => {
  it('accepts a valid email', () => {
    const result = emailSchema.safeParse('user@example.com')
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = emailSchema.safeParse('not-an-email')
    expect(result.success).toBe(false)
  })

  it('rejects empty string', () => {
    const result = emailSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('passwordSchema', () => {
  it('accepts a password with 8+ characters', () => {
    const result = passwordSchema.safeParse('12345678')
    expect(result.success).toBe(true)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('1234567')
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = passwordSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('nameSchema', () => {
  it('accepts a name with 2-100 characters', () => {
    const result = nameSchema.safeParse('John')
    expect(result.success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = nameSchema.safeParse('J')
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = nameSchema.safeParse('')
    expect(result.success).toBe(false)
  })

  it('accepts a name at exactly 100 characters', () => {
    const result = nameSchema.safeParse('a'.repeat(100))
    expect(result.success).toBe(true)
  })

  it('rejects a name longer than 100 characters', () => {
    const result = nameSchema.safeParse('a'.repeat(101))
    expect(result.success).toBe(false)
  })
})

describe('signInSchema', () => {
  it('accepts valid email and password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email in object', () => {
    const result = signInSchema.safeParse({
      email: 'bad',
      password: '12345678',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password in object', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '123',
    })
    expect(result.success).toBe(false)
  })
})

describe('signUpSchema', () => {
  it('accepts valid name, email, and password', () => {
    const result = signUpSchema.safeParse({
      name: 'John',
      email: 'user@example.com',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short name in object', () => {
    const result = signUpSchema.safeParse({
      name: 'J',
      email: 'user@example.com',
      password: '12345678',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email in object', () => {
    const result = signUpSchema.safeParse({
      name: 'John',
      email: 'bad',
      password: '12345678',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password in object', () => {
    const result = signUpSchema.safeParse({
      name: 'John',
      email: 'user@example.com',
      password: '123',
    })
    expect(result.success).toBe(false)
  })
})
