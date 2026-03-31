import { render } from '@testing-library/react'
import React from 'react'
import App from './App'

it('renders the app shell', () => {
  const { container } = render(<App />)
  expect(container.querySelector('ion-app')).toBeTruthy()
})
