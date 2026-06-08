import { IonAvatar, IonContent, IonPage, IonSpinner, IonText } from '@ionic/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicProfile } from '../../services/users'
import type { PublicProfile } from '@repo/types'

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function fetchProfile() {
      try {
        const data = await getPublicProfile(id!)
        if (!cancelled) {
          setProfile(data)
        }
      }
      catch {
        if (!cancelled) {
          setProfile(null)
        }
      }
      finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div
            data-testid="public-loading"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (!profile) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <IonText color="medium">
              <p>Usuario no encontrado</p>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonContent>
        <div style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          {profile.image ? (
            <IonAvatar
              data-testid="public-avatar"
              style={{ margin: '0 auto', width: '96px', height: '96px' }}
            >
              <img src={profile.image} alt={profile.name} />
            </IonAvatar>
          ) : (
            <div
              data-testid="public-avatar-placeholder"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: 'var(--ion-color-medium)',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white',
              }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 data-testid="public-name">{profile.name}</h1>

          <IonText>
            <p>
              <span data-testid="public-role">{profile.role}</span>
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  )
}
