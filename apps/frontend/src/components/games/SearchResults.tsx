import { IonBadge, IonText } from '@ionic/react'
import type { GameSearchResult } from '@repo/types'
import { GameCard } from './GameCard'

// ── Display helpers ────────────────────────────────────────────────

function sourceLabel(source: string): string {
  return source === 'manual' ? 'D1' : 'BGG'
}

// ── Component ─────────────────────────────────────────────────────

export interface SearchResultsProps {
  results: GameSearchResult[]
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) return null

  return (
    <div data-testid="search-results">
      {results.map((game, index) => (
        <div key={game.id} data-testid="search-result-item" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <IonText data-testid="search-result-rank" color="medium" style={{ fontSize: '13px', fontWeight: 600 }}>
              {`#${index + 1}`}
            </IonText>
            <IonBadge
              data-testid="search-result-badge"
              color={game.source === 'manual' ? 'primary' : 'tertiary'}
              style={{ fontSize: '11px' }}
            >
              {sourceLabel(game.source)}
            </IonBadge>
          </div>
          <GameCard game={game} />
        </div>
      ))}
    </div>
  )
}
