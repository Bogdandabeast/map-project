import { IonCard, IonCardSubtitle, IonCardTitle, IonImg, IonText } from '@ionic/react'
import { Link } from 'react-router-dom'
import type { GameSearchResult } from '@repo/types'

// ── Display helpers ────────────────────────────────────────────────

function formatPlayers(min: number | null, max: number | null): string | null {
  if (min === null || max === null) return null
  if (min === max) return `${min} players`
  return `${min}-${max} players`
}

function formatDuration(minutes: number | null): string | null {
  if (minutes === null) return null
  return `${minutes} min`
}

// ── Component ─────────────────────────────────────────────────────

export interface GameCardProps {
  game: GameSearchResult
}

export function GameCard({ game }: GameCardProps) {
  const players = formatPlayers(game.minPlayers, game.maxPlayers)
  const duration = formatDuration(game.duration)

  return (
    <Link
      to={`/games/${game.id}`}
      data-testid="game-card-link"
      style={{ textDecoration: 'none' }}
    >
      <IonCard button data-testid="game-card">
        {game.coverImage ? (
          <IonImg
            src={game.coverImage}
            alt={game.title}
            data-testid="game-card-cover"
          />
        ) : (
          <div
            data-testid="game-card-cover-placeholder"
            style={{
              height: '180px',
              background: 'var(--ion-color-light-shade)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            🎲
          </div>
        )}

        <div style={{ padding: '12px' }}>
          <IonCardTitle data-testid="game-card-title" style={{ fontSize: '16px' }}>
            {game.title}
          </IonCardTitle>

          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            {players && (
              <IonCardSubtitle data-testid="game-card-players" style={{ fontSize: '13px' }}>
                {players}
              </IonCardSubtitle>
            )}
            {duration && (
              <IonCardSubtitle data-testid="game-card-duration" style={{ fontSize: '13px' }}>
                {duration}
              </IonCardSubtitle>
            )}
          </div>
        </div>
      </IonCard>
    </Link>
  )
}
