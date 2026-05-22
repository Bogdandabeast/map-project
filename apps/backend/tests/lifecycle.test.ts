import { describe, expect, it, vi } from 'bun:test'
import { gracefulShutdown, server } from '../src/app'
import { pool } from '../src/db'

describe('Lifecycle', () => {
  it('should close server and pool during graceful shutdown', async () => {
    const stopSpy = vi.spyOn(server, 'stop')
    const endSpy = vi.spyOn(pool, 'end')
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

    await gracefulShutdown('SIGTERM')

    expect(stopSpy).toHaveBeenCalled()
    expect(endSpy).toHaveBeenCalled()
    expect(exitSpy).toHaveBeenCalledWith(0)
  })
})
