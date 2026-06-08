import { render } from '@testing-library/react'
import { expect, it, mock } from 'bun:test'

import App from './App'

mock.module('./components/map/view/MapView', () => ({
  default: () => <div data-testid="map-mock" />,
}))

it('renders the app shell', () => {
  const { getByTestId } = render(<App />)

  // App redirects / → /explore, ExplorePage renders MapView mock
  expect(getByTestId('map-mock')).toBeTruthy()
})
