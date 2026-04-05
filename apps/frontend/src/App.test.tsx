import { render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./components/map/view/MapView', () => ({
  default: () => <div data-testid="map-mock" />,
}))

it('renders the app shell', () => {
  const { getByTestId } = render(<App />)

  expect(getByTestId('map-mock')).toBeTruthy()
})
