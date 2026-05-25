import { describe, expect, it } from 'bun:test'
import * as schema from '../maps/schema'

describe('Maps Schema', () => {
  it('should export maps table', () => {
    expect(schema.maps).toBeDefined()
  })

  it('should export markers table', () => {
    expect(schema.markers).toBeDefined()
  })
})
