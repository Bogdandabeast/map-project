import { IonChip, IonItem, IonLabel, IonList, IonNote } from '@ionic/react'
import type { SearchResult } from './types'

/**
 * Formats a distance in kilometers for display.
 * - `< 1 km` for distances less than 1
 * - `X.X km` for distances ≥ 1 (one decimal place)
 */
function formatDistance(km: number): string {
  if (km < 1) return '< 1 km'
  return `${km.toFixed(1)} km`
}

/**
 * Formats a Unix timestamp (seconds) into a human-readable date string.
 */
function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface DistanceSortedListProps {
  /** Pre-sorted search results (caller must sort by distance ascending) */
  results: SearchResult[]
}

/**
 * Renders events as a distance-sorted list using Ionic components.
 * Each item shows event title, distance, date, and game chips.
 * Items link to the event detail page via Ionic's routerLink prop.
 */
export function DistanceSortedList({ results }: DistanceSortedListProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <IonList data-testid="distance-sorted-list">
      {results.map(result => (
        <IonItem
          key={result.event.id}
          button
          detail
          routerLink={`/events/${result.event.id}`}
        >
          <IonLabel>
            <h2>{result.event.title}</h2>
            <p>
              <IonNote>{formatDate(result.event.date)}</IonNote>
            </p>
            <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {result.distanceKm != null ? (
                <IonChip color="primary" outline>
                  {formatDistance(result.distanceKm)}
                </IonChip>
              ) : (
                <IonChip color="medium" outline>
                  {formatDate(result.event.date)}
                </IonChip>
              )}
              {result.event.games.map(game => (
                <IonChip key={game} outline>
                  {game}
                </IonChip>
              ))}
            </div>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  )
}
