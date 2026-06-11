import {
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useCallback, useEffect, useState } from 'react'
import { GameCard } from '../components/games/GameCard'
import { EmptyState } from '../components/shared/EmptyState'
import { ErrorState } from '../components/shared/ErrorState'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { getPopularGames, getRecentGames } from '../services/games'
import type { Game } from '@repo/types'

type Tab = 'popular' | 'recent'

export function BrowseGamesPage() {
  const [tab, setTab] = useState<Tab>('popular')
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadGames = useCallback(async (selectedTab: Tab) => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = selectedTab === 'popular'
        ? await getPopularGames()
        : await getRecentGames()
      setGames(data)
    } catch (err) {
      setGames([])
      setLoadError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGames('popular')
  }, [loadGames])

  const handleTabChange = (selectedTab: Tab) => {
    if (selectedTab !== tab) {
      setTab(selectedTab)
      loadGames(selectedTab)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Browse Games</IonTitle>
        </IonToolbar>

        <IonToolbar>
          <IonSegment
            value={tab}
            data-testid="browse-segment"
            onIonChange={(e) => {
              const value = (e.target as HTMLIonSegmentElement).value as Tab
              if (value) handleTabChange(value)
            }}
          >
            <IonSegmentButton value="popular" data-testid="browse-tab-popular">
              Popular
            </IonSegmentButton>
            <IonSegmentButton value="recent" data-testid="browse-tab-recent">
              Recent
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {loading && <LoadingSpinner message="Loading games..." />}

          {!loading && loadError && (
            <ErrorState message={loadError} />
          )}

          {!loading && !loadError && games.length > 0 && (
            <div>
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}

          {!loading && !loadError && games.length === 0 && (
            <EmptyState
              message={
                tab === 'popular'
                  ? 'No popular games yet'
                  : 'No recently added games'
              }
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
