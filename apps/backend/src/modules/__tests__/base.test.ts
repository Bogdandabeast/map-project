import type { CommandHandler, QueryHandler } from '../base'
import { describe, expect, it } from 'bun:test'

describe('Base CQRS Types', () => {
  it('should allow implementing a CommandHandler', async () => {
    const mockHandler: CommandHandler<{ name: string }, { id: string }> = async (cmd) => {
      return { id: `id-${cmd.name}` }
    }

    const result = await mockHandler({ name: 'test-map' })
    expect(result).toEqual({ id: 'id-test-map' })
  })

  it('should allow implementing a QueryHandler', async () => {
    const mockHandler: QueryHandler<{ id: string }, { name: string }> = async (query) => {
      return { name: `map-${query.id}` }
    }

    const result = await mockHandler({ id: '123' })
    expect(result).toEqual({ name: 'map-123' })
  })
})
