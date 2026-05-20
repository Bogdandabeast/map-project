import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import MapView from './MapView'

describe('mapView', () => {
  afterEach(() => {
    cleanup()
  })

  describe('rendering', () => {
    it('should render the map container', () => {
      const { container } = render(<MapView />)

      expect(container.querySelector('.map-view')).toBeTruthy()
    })

    it('should remove the map container on unmount', () => {
      const { container, unmount } = render(<MapView />)
      expect(container.querySelector('.map-view')).toBeTruthy()

      unmount()

      expect(container.querySelector('.map-view')).toBeFalsy()
    })
  })
})
