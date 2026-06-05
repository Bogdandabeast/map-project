import { GlobalWindow } from 'happy-dom'
import '@testing-library/jest-dom'

// Create and register GlobalWindow as global DOM
const wnd = new GlobalWindow({
  console: globalThis.console,
  url: 'http://localhost:3000',
})

const IGNORE = ['constructor', 'undefined', 'NaN', 'global', 'globalThis']
for (const key of Object.keys(Object.getOwnPropertyDescriptors(wnd))) {
  if (IGNORE.includes(key))
    continue
  try {
    Object.defineProperty(globalThis, key, {
      ...Object.getOwnPropertyDescriptor(wnd, key),
      configurable: true,
    })
  }
  catch {
    // Silently skip properties that can't be defined
  }
}

// Set owner window on document to globalThis
try {
  (globalThis.document as any).defaultView = globalThis
}
catch {
  // Ignore
}

// Patch missing DOM properties that Ionic components require
if (globalThis.document && !('dir' in globalThis.document)) {
  Object.defineProperty(globalThis.document, 'dir', {
    value: 'ltr',
    writable: true,
    configurable: true,
  })
}

// Ensure CSSStyleSheet etc. are polyfilled
try {
  if (!globalThis.CSSStyleSheet) {
    (globalThis as any).CSSStyleSheet = class CSSStyleSheet {}
  }
}
catch {
  // Ignore
}

// Mock matchMedia (required by Ionic components)
globalThis.matchMedia
  = globalThis.matchMedia
    || function () {
      return {
        matches: false,
        addListener() {},
        removeListener() {},
      }
    }

// Mock ResizeObserver (required by OpenLayers / map components)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock
