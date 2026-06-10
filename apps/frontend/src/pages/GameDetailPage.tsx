import {
  IonButton,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { GameDetail } from '../components/games/GameDetail'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { getGameById } from '../services/games'
import type { Game } from '@repo/types'

export function GameDetailPage() {
  return (
    <ProtectedRoute>
      <GameDetailContent />
    </ProtectedRoute>
  )
}

function GameDetailContent() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(false)

    getGameById(id)
      .then((data) => {
        setGame(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <LoadingSpinner message="Loading game details..." />
        </IonContent>
      </IonPage>
    )
  }

  if (error || !game) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonMenuButton slot="start" />
            <IonTitle>Game Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div
            data-testid="game-detail-error"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <h2>Game not found</h2>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '1rem' }}>
              The game you are looking for does not exist or has been removed.
            </p>
            <IonButton routerLink="/games/browse" fill="outline">
              Browse Games
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <GameDetail game={game} />
    </IonPage>
  )
}
