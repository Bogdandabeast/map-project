import process from 'node:process'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

GlobalRegistrator.register()

// Set up minimal DOM state that Ionic web components expect
document.dir = 'ltr'

// Set base URL for better-auth to prevent "Invalid base URL: null" in tests
process.env.BETTER_AUTH_URL = 'http://localhost:3000'

// Mock matchmedia
globalThis.matchMedia = globalThis.matchMedia || function () {
  return {
    matches: false,
    addListener() {},
    removeListener() {},
  }
}

class ResizeObserverMock {
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

// Clean up DOM between tests (happy-dom doesn't auto-clean like jsdom)
afterEach(() => {
  document.body.innerHTML = ''
})
