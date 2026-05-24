import { render } from '@testing-library/react'
import App from './App'

it('renders the app shell', () => {
  render(<App mapContent={<div data-testid="map-mock" />} />)

  // Verify Ionic app container renders
  const app = document.querySelector('ion-app')
  expect(app).toBeTruthy()

  // Verify routing shell renders
  const routerOutlet = document.querySelector('ion-router-outlet')
  expect(routerOutlet).toBeTruthy()
})
