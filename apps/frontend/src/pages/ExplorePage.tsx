import { useCallback, useState } from 'react'
import { IonButton, IonIcon, IonSegment, IonSegmentButton } from '@ionic/react'
import { globeOutline, searchOutline } from 'ionicons/icons'
import { AppLayout } from '../components/layout/AppLayout'
import { EmptyResults } from '../components/discovery/EmptyResults'
import { FilterChips } from '../components/discovery/FilterChips'
import { DistanceSortedList } from '../components/discovery/DistanceSortedList'
import { InitialPrompt } from '../components/discovery/InitialPrompt'
import { SkeletonCard } from '../components/discovery/SkeletonCard'
import { ErrorState } from '../components/shared/ErrorState'
import MapView from '../components/map/view/MapView'
import { useMapStore } from '../components/map/model/stores/mapStore'
import { useRadarSearch } from '../hooks/useRadarSearch'
import { useEventFilters, getAvailableGames } from '../hooks/useEventFilters'
import './ExplorePage.css'

export function ExplorePage() {
  // Tracks whether the user has ever triggered a search.
  // Used to distinguish "initial" (prompt to search) from "empty" (no results).
  const [hasSearched, setHasSearched] = useState(false)

  // Reactive store slices
  const center = useMapStore(s => s.center)
  const searchRadius = useMapStore(s => s.searchRadius)
  const searchMode = useMapStore(s => s.searchMode)
  const filters = useMapStore(s => s.filters)
  const setSearchMode = useMapStore(s => s.setSearchMode)

  // Radar search hook: provides search(), isLoading, error, results
  const { search, isLoading, error, results } = useRadarSearch()

  // Apply filters to results (AND logic)
  const filteredResults = useEventFilters(results, filters)
  const availableGames = getAvailableGames(results)

  // Extract event markers from results for map rendering
  const eventMarkers = results.map(r => r.event)

  // Trigger a radar search at the current map center
  const handleSearch = useCallback(() => {
    setHasSearched(true)
    search({ center, radiusKm: searchRadius })
  }, [search, center, searchRadius])

  // ── State determination ──────────────────────────────────────────
  // Priority: Error > Loading > Initial > Empty > Results

  let content: React.ReactNode

  if (error) {
    content = <ErrorState message={error} />
  }
  else if (isLoading) {
    content = <SkeletonCard />
  }
  else if (!hasSearched) {
    content = <InitialPrompt />
  }
  else if (filteredResults.length === 0) {
    content = <EmptyResults />
  }
  else {
    content = (
      <>
        <FilterChips availableGames={availableGames} />
        <DistanceSortedList results={filteredResults} />
      </>
    )
  }

  return (
    <AppLayout title="Explorar">
      <div className="explore-page">
        {/* Map container — always visible and interactive */}
        <div className="map-wrapper">
          <MapView events={eventMarkers} />

          {/* Floating search button — only in Nearby mode */}
          {searchMode === 'nearby' && (
            <div className="ui-overlay">
              <div className="search-trigger">
                <IonButton
                  data-testid="search-here-button"
                  color="primary"
                  size="default"
                  onClick={handleSearch}
                  disabled={isLoading || undefined}
                >
                  <IonIcon slot="start" icon={searchOutline} />
                  Search here
                </IonButton>
              </div>
            </div>
          )}
        </div>

        {/* Discovery panel: bottom sheet on mobile, sidebar on desktop */}
        <div className="discovery-panel" data-testid="discovery-panel">
          {/* Search mode toggle */}
          <div style={{ padding: '8px 16px' }}>
            <IonSegment
              data-testid="search-mode-toggle"
              value={searchMode}
              onIonChange={(e) => {
                const mode = (e.target as HTMLIonSegmentElement).value as 'nearby' | 'global'
                if (mode && mode !== searchMode) {
                  setSearchMode(mode)
                  if (mode === 'global') {
                    setHasSearched(true)
                    search({ center, radiusKm: searchRadius })
                  }
                }
              }}
            >
              <IonSegmentButton value="nearby" data-testid="mode-nearby">
                Nearby
              </IonSegmentButton>
              <IonSegmentButton value="global" data-testid="mode-global">
                <IonIcon icon={globeOutline} slot="start" />
                Global
              </IonSegmentButton>
            </IonSegment>
          </div>
          {content}
        </div>
      </div>
    </AppLayout>
  )
}
