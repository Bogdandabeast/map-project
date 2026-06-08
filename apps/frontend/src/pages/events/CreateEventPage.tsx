import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonDatetime,
  IonRange,
  IonSpinner,
} from '@ionic/react'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useAuth } from '../../components/auth/AuthProvider'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { AppLayout } from '../../components/layout/AppLayout'
import { ImageUpload } from '../../components/events/ImageUpload'
import { useEventsStore } from '../../stores/eventsStore'

// ── Validation helpers ────────────────────────────────────────────

export interface FormErrors {
  title?: string
  address?: string
  date?: string
  capacity?: string
  plannedGames?: string
}

export function validateCreateEventForm(data: {
  title: string
  address: string
  date: string
  capacity: number
}): FormErrors {
  const errors: FormErrors = {}

  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters'
  }
  else if (data.title.trim().length > 200) {
    errors.title = 'Title must be at most 200 characters'
  }

  if (!data.address || data.address.trim().length < 1) {
    errors.address = 'Address is required'
  }

  if (!data.date) {
    errors.date = 'Date is required'
  }
  else {
    const parsed = new Date(data.date).getTime()
    if (parsed <= Date.now()) {
      errors.date = 'Date must be in the future'
    }
  }

  if (!data.capacity || data.capacity < 1) {
    errors.capacity = 'Capacity must be at least 1'
  }
  else if (data.capacity > 10000) {
    errors.capacity = 'Capacity must be at most 10,000'
  }

  return errors
}

// ── Component ─────────────────────────────────────────────────────

export function CreateEventPage() {
  return (
    <ProtectedRoute>
      <AppLayout title="Create Event">
        <CreateEventForm />
      </AppLayout>
    </ProtectedRoute>
  )
}

function CreateEventForm() {
  const { user } = useAuth()
  const { createEvent, getUploadUrl, formState, resetFormState } = useEventsStore()

  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState(4)
  const [plannedGames, setPlannedGames] = useState('')
  const [skillLevel, setSkillLevel] = useState<string | undefined>(undefined)
  const [atmosphere, setAtmosphere] = useState('')
  const [imageKey, setImageKey] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  // Redirect on success
  if (formState.isSuccess) {
    const timer = setTimeout(() => resetFormState(), 0)
    return <Redirect to="/my/events" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const validationErrors = validateCreateEventForm({ title, address, date, capacity })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    // Parse date to Unix ms
    const dateMs = new Date(date).getTime()

    await createEvent({
      title: title.trim(),
      address: address.trim(),
      lat: 0, // Placeholder — geocoding would be added later
      lng: 0, // Placeholder
      date: dateMs,
      capacity,
      plannedGames: plannedGames.trim()
        ? plannedGames.split(',').map(g => g.trim()).filter(Boolean)
        : undefined,
      skillLevel: skillLevel || undefined,
      atmosphere: atmosphere.trim() || undefined,
    })
  }

  const handleUploadUrl = async (contentType: string) => {
    // We need the event ID, but on create we don't have one yet.
    // In a real app, we'd create the event first, then upload the image.
    // For now, store the image key and submit it with the form.
    // Since createEvent doesn't accept imageKey, we store it for later use.
    // This is a known limitation — image upload is deferred to after creation.
    return null
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 data-testid="create-event-title">Create event</h1>

      <form onSubmit={handleSubmit} data-testid="create-event-form">
        {/* Title */}
        <IonItem>
          <IonLabel position="stacked">Title *</IonLabel>
          <IonInput
            data-testid="create-event-title-input"
            value={title}
            required
            maxlength={200}
            onIonChange={e => setTitle(e.detail.value!)}
          />
        </IonItem>
        {errors.title && (
          <IonText color="danger" data-testid="create-event-title-error">
            <p style={{ fontSize: '13px', margin: '4px 0 0 16px' }}>{errors.title}</p>
          </IonText>
        )}

        {/* Address */}
        <IonItem>
          <IonLabel position="stacked">Address *</IonLabel>
          <IonInput
            data-testid="create-event-address-input"
            value={address}
            required
            onIonChange={e => setAddress(e.detail.value!)}
          />
        </IonItem>
        {errors.address && (
          <IonText color="danger" data-testid="create-event-address-error">
            <p style={{ fontSize: '13px', margin: '4px 0 0 16px' }}>{errors.address}</p>
          </IonText>
        )}

        {/* Date */}
        <IonItem>
          <IonLabel position="stacked">Date *</IonLabel>
          <IonDatetime
            data-testid="create-event-date-input"
            presentation="date-time"
            value={date}
            onIonChange={e => setDate(e.detail.value as string)}
            min={new Date(Date.now() + 3600000).toISOString()}
            style={{ width: '100%' }}
          />
        </IonItem>
        {errors.date && (
          <IonText color="danger" data-testid="create-event-date-error">
            <p style={{ fontSize: '13px', margin: '4px 0 0 16px' }}>{errors.date}</p>
          </IonText>
        )}

        {/* Capacity */}
        <IonItem>
          <IonLabel position="stacked">
            Capacity:
            {' '}
            {capacity}
          </IonLabel>
          <IonRange
            data-testid="create-event-capacity-input"
            min={1}
            max={100}
            value={capacity}
            onIonChange={e => setCapacity(e.detail.value as number)}
            snaps
            step={1}
            ticks
            style={{ paddingTop: '8px' }}
          />
        </IonItem>
        {errors.capacity && (
          <IonText color="danger" data-testid="create-event-capacity-error">
            <p style={{ fontSize: '13px', margin: '4px 0 0 16px' }}>{errors.capacity}</p>
          </IonText>
        )}

        {/* Planned Games */}
        <IonItem>
          <IonLabel position="stacked">Games (comma-separated)</IonLabel>
          <IonInput
            data-testid="create-event-games-input"
            value={plannedGames}
            placeholder="e.g. Catan, Wingspan"
            onIonChange={e => setPlannedGames(e.detail.value!)}
          />
        </IonItem>

        {/* Skill Level */}
        <IonItem>
          <IonLabel position="stacked">Skill Level</IonLabel>
          <IonSelect
            data-testid="create-event-skill-select"
            value={skillLevel}
            placeholder="Any level"
            onIonChange={e => setSkillLevel(e.detail.value)}
          >
            <IonSelectOption value="">Any level</IonSelectOption>
            <IonSelectOption value="beginner">Beginner</IonSelectOption>
            <IonSelectOption value="intermediate">Intermediate</IonSelectOption>
            <IonSelectOption value="advanced">Advanced</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* Atmosphere */}
        <IonItem>
          <IonLabel position="stacked">Atmosphere / Notes</IonLabel>
          <IonTextarea
            data-testid="create-event-atmosphere-input"
            value={atmosphere}
            placeholder="Describe the vibe…"
            maxlength={1000}
            onIonChange={e => setAtmosphere(e.detail.value!)}
            rows={3}
          />
        </IonItem>

        {/* Image Upload */}
        <div style={{ padding: '8px 16px' }}>
          <ImageUpload
            getUploadUrl={handleUploadUrl}
            onImageKey={setImageKey}
          />
        </div>

        {/* Form Error */}
        {formState.error && (
          <IonText color="danger" data-testid="create-event-form-error">
            <p style={{ textAlign: 'center', margin: '12px 0' }}>{formState.error}</p>
          </IonText>
        )}

        {/* Submit */}
        <div style={{ marginTop: '1.5rem', padding: '0 16px' }}>
          <IonButton
            type="submit"
            expand="block"
            disabled={formState.isSubmitting}
            data-testid="create-event-submit"
          >
            {formState.isSubmitting
              ? <IonSpinner name="dots" />
              : 'Create event'}
          </IonButton>
        </div>
      </form>
    </div>
  )
}
