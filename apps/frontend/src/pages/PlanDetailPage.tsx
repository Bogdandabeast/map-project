import type { FC } from 'react'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonButtons,
} from '@ionic/react'
import { Chip } from '../components/shared/Chip'
import './PlanDetailPage.css'

interface Participant {
  id: string
  name: string
}

interface PlanData {
  id: string
  title: string
  description: string
  author: string
  date: string
  status: string
  location: {
    address: string
    coords: { lat: number; lng: number }
  }
  participants: Participant[]
}

const MOCK_PLAN: PlanData = {
  id: 'plan-123',
  title: 'Weekend Hiking Trip',
  description: 'A beautiful trip to the mountains with friends.',
  author: 'John Doe',
  date: '2026-06-01',
  status: 'Active',
  location: {
    address: '123 Mountain Road, Alpine Peaks',
    coords: { lat: 45.0, lng: 7.0 },
  },
  participants: [
    { id: 'u1', name: 'John Doe' },
    { id: 'u2', name: 'Jane Smith' },
  ],
}

const PlanDetailPage: FC = () => {
  const plan = MOCK_PLAN

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/explore" />
          </IonButtons>
          <IonTitle>{plan.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="plan-detail-page">
        <div className="plan-detail-container">
          <section className="plan-header">
            <span className="plan-status">{plan.status}</span>
            <h1 className="mp-headline-md">{plan.title}</h1>
            <p className="plan-meta mp-label-sm">
              By {plan.author} · {plan.date}
            </p>
          </section>

          <section className="plan-description">
            <p className="mp-body-lg">{plan.description}</p>
          </section>

          <section className="plan-location">
            <h2 className="mp-title-sm">Location</h2>
            <p className="mp-body-md">{plan.location.address}</p>
          </section>

          <section className="plan-tags">
            <Chip label="Nature" selected />
            <Chip label="Hiking" selected />
            <Chip label="Outdoor" />
          </section>

          <section className="plan-actions">
            <IonButton expand="block" className="action-button primary">
              Join Plan
            </IonButton>
            <IonButton expand="block" fill="outline" className="action-button">
              Share
            </IonButton>
          </section>

          <section className="plan-participants">
            <h2 className="mp-title-sm">
              Participants ({plan.participants.length})
            </h2>
            <IonList>
              {plan.participants.map((participant) => (
                <IonItem key={participant.id}>
                  <IonLabel>{participant.name}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </section>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default PlanDetailPage