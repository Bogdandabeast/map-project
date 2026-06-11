import { IonItem, IonLabel, IonList, IonSearchbar, IonText } from '@ionic/react'
import { useCallback, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────

export interface NominatimResult {
  displayName: string
  lat: number
  lng: number
}

export interface AddressSearchProps {
  onSelect: (result: NominatimResult) => void
}

// ── Component ─────────────────────────────────────────────────────

/**
 * Address search using the Nominatim (OpenStreetMap) geocoding API.
 *
 * Debounces input, queries Nominatim, and displays a dropdown list.
 * On selection, fires `onSelect` with the display name and coordinates.
 */
export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = value.trim()
    if (q.length < 2) {
      setResults([])
      setError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`
        const response = await fetch(url, {
          headers: { 'User-Agent': 'MesaCerca/1.0' },
        })

        if (!response.ok) throw new Error('Search failed')

        const data = await response.json() as Array<{ display_name: string; lat: string; lon: string }>

        setResults(
          data.map((item) => ({
            displayName: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
          })),
        )
      }
      catch (err) {
        setError('Address search unavailable')
        setResults([])
      }
      finally {
        setLoading(false)
      }
    }, 400)
  }, [])

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      setQuery(result.displayName)
      setResults([])
      onSelect(result)
    },
    [onSelect],
  )

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <IonSearchbar
        data-testid="address-search-input"
        value={query}
        debounce={0}
        placeholder="Search for an address..."
        onIonInput={(e) => {
          const val = (e.target as HTMLIonSearchbarElement).value ?? ''
          handleSearch(val)
        }}
        onIonClear={() => {
          setQuery('')
          setResults([])
          setError(null)
        }}
      />

      {loading && (
        <IonText color="medium" style={{ padding: '0 16px', fontSize: '13px' }}>
          Searching...
        </IonText>
      )}

      {error && (
        <IonText color="danger" style={{ padding: '0 16px', fontSize: '13px' }}>
          {error}
        </IonText>
      )}

      {results.length > 0 && (
        <IonList data-testid="address-search-results" style={{ maxHeight: '200px', overflow: 'auto' }}>
          {results.map((result, i) => (
            <IonItem
              key={i}
              button
              detail={false}
              data-testid={`address-result-${i}`}
              onClick={() => handleSelect(result)}
            >
              <IonLabel class="ion-text-wrap">
                <p style={{ fontSize: '13px' }}>{result.displayName}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}
    </div>
  )
}
