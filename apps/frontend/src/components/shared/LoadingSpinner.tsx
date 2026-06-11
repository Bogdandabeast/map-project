import { IonSpinner, IonText } from '@ionic/react'

export interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div
      data-testid="loading-spinner"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        gap: '16px',
      }}
    >
      <IonSpinner name="crescent" />
      {message && (
        <IonText color="medium" style={{ fontSize: '14px' }}>
          {message}
        </IonText>
      )}
    </div>
  )
}
