import { render } from '@testing-library/react'
import { expect, it, mock } from 'bun:test'

import App from './App'

mock.module('./components/map/view/MapView', () => ({
  default: () => <div data-testid="map-mock" />,
}))

it('renders the app shell', () => {
  const { getByTestId } = render(<App />)

  expect(getByTestId('map-mock')).toBeTruthy()
})
