import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useState } from 'react'
import { SearchResults } from '../components/games/SearchResults'
import { EmptyState } from '../components/shared/EmptyState'
import { ErrorState } from '../components/shared/ErrorState'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { searchGames } from '../services/games'
import type { SearchResponse } from '../services/games'

export function GameSearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim()
    if (!q) {
      setResponse(null)
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const result = await searchGames(q)
      setResponse(result)
    } catch (err) {
      setResponse({
        source: 'd1',
        results: [],
        note: err instanceof Error ? err.message : 'Search is temporarily unavailable',
      })
    } finally {
      setLoading(false)
    }
  }

  const hasResults = response && response.results.length > 0
  const hasNote = response && response.note
  const isEmpty = searched && !loading && response && response.results.length === 0

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Search Games</IonTitle>
        </IonToolbar>

        <IonToolbar>
          <IonSearchbar
            data-testid="game-search-input"
            value={query}
            debounce={500}
            placeholder="Search for a board game..."
            onIonInput={(e) => {
              const val = (e.target as HTMLIonSearchbarElement).value ?? ''
              setQuery(val)
            }}
            onIonChange={(e) => {
              const val = (e.target as HTMLIonSearchbarElement).value ?? ''
              handleSearch(val)
            }}
            onIonClear={() => {
              setQuery('')
              setResponse(null)
              setSearched(false)
            }}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {loading && <LoadingSpinner message="Searching games..." />}

          {!loading && hasResults && response && (
            <SearchResults results={response.results} />
          )}

          {!loading && isEmpty && hasNote && (
            <ErrorState message={response!.note} />
          )}

          {!loading && isEmpty && !hasNote && (
            <EmptyState message="No games found" />
          )}

          {!searched && !loading && (
            <EmptyState message="Search for a board game to get started" />
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
