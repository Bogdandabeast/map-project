import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./components/map/view/MapView', () => ({
  default: () => <div data-testid="map-mock" />,
}))

vi.mock('./lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        session: { id: 's1' },
      },
    }),
    useSession: vi.fn().mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        session: { id: 's1' },
      },
      isPending: false,
    }),
  },
}))

it('renders the app shell', async () => {
  render(<App />)

  // Wait for AuthProvider to resolve and ProtectedRoute to render map
  const mapMock = await screen.findByTestId('map-mock')
  expect(mapMock).toBeTruthy()
})
