import { IonBackButton, IonButtons, IonHeader, IonImg, IonText, IonTitle, IonToolbar } from '@ionic/react'
import type { Game } from '@repo/types'

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

export interface GameDetailProps {
  game: Game
}

export function GameDetail({ game }: GameDetailProps) {
  const players = formatPlayers(game.minPlayers, game.maxPlayers)
  const duration = formatDuration(game.duration)

  return (
    <div data-testid="game-detail">
      {/* Header with back navigation */}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              data-testid="game-detail-back"
              defaultHref="/games/browse"
            />
          </IonButtons>
          <IonTitle data-testid="game-detail-title">{game.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
        {/* Cover image */}
        {game.coverImage ? (
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '1rem',
              maxHeight: '400px',
            }}
          >
            <IonImg
              src={game.coverImage}
              alt={game.title}
              data-testid="game-detail-cover"
              style={{ width: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            data-testid="game-detail-cover-placeholder"
            style={{
              height: '250px',
              borderRadius: '12px',
              background: 'var(--ion-color-light-shade)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              marginBottom: '1rem',
            }}
          >
            🎲
          </div>
        )}

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {players && (
            <IonText data-testid="game-detail-players" color="medium" style={{ fontSize: '14px' }}>
              {players}
            </IonText>
          )}
          {duration && (
            <IonText data-testid="game-detail-duration" color="medium" style={{ fontSize: '14px' }}>
              {duration}
            </IonText>
          )}
        </div>

        {/* Description */}
        <div>
          <IonText data-testid="game-detail-description" style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {game.description ?? 'No description available'}
          </IonText>
        </div>
      </div>
    </div>
  )
}
