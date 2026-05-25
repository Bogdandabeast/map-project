import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MapView from './MapView'

describe('mapView Integration', () => {
  it('should show loading state initially', () => {
    render(<MapView />)
    expect(screen.getByText(/loading map.../i)).toBeInTheDocument()
  })

  it('should render the map container when READY', async () => {
    const mockController = {
      createMap: vi.fn(),
      destroy: vi.fn(),
      syncFromModel: vi.fn(),
    }
    const mockModel = {} as any

    render(
      <MapView
        createModel={() => mockModel}
        createController={() => mockController}
      />,
    )

    await waitFor(() => {
      expect(mockController.createMap).toHaveBeenCalled()
    }, { timeout: 2000 })

    expect(mockController.createMap).toHaveBeenCalled()
  })

  it('should show error state when initialization fails', async () => {
    // We need to make sure the first effect (loading assets) fails
    // Since we provide createModel, it skips the import.
    // To trigger error, we can provide a createModel that throws.
    const createModel = vi.fn().mockImplementation(() => {
      throw new Error('Load failed')
    })

    render(<MapView createModel={createModel} />)

    await waitFor(() => {
      const errorEl = screen.getByText(/failed to load map/i)
      expect(errorEl.textContent).toContain('Load failed')
    }, { timeout: 2000 })
  })
})
