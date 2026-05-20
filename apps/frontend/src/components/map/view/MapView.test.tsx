import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MapView from './MapView'

describe('mapView', () => {
  describe('rendering', () => {
    it('should render the map container', () => {
      const { container } = render(<MapView />)

      expect(container.querySelector('.map-view')).toBeTruthy()
    })
  })
})
