import { mock } from 'bun:test'
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
// Mock matchmedia
globalThis.matchMedia = globalThis.matchMedia || function () {
  return {
    matches: false,
    addListener() {},
    removeListener() {},
  }
}

class ResizeObserverMock {
  observe = mock()
  unobserve = mock()
  disconnect = mock()
}
globalThis.ResizeObserver = ResizeObserverMock
