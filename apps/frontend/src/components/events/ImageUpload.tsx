import { IonButton, IonIcon, IonSpinner, IonText } from '@ionic/react'
import { cloudUploadOutline, trashOutline } from 'ionicons/icons'
import { useRef, useState } from 'react'

// ── Props ─────────────────────────────────────────────────────────

export interface ImageUploadProps {
  /** Function to obtain a pre-signed upload URL. Called with (eventId, contentType). */
  getUploadUrl: (contentType: string) => Promise<{ uploadUrl: string, key: string } | null>
  /** Called with the uploaded image key on success */
  onImageKey: (key: string) => void
  /** Called when an error occurs */
  onError?: (error: string) => void
  /** Current image URL (for existing image preview) */
  currentImageUrl?: string | null
}

// ── Component ─────────────────────────────────────────────────────

/**
 * Image upload component with preview.
 *
 * Flow:
 * 1. User selects a file → preview shown
 * 2. On upload click → get pre-signed URL from backend
 * 3. Upload file to R2 using the pre-signed URL
 * 4. Report the image key back to parent
 */
export function ImageUpload({ getUploadUrl, onImageKey, onError, currentImageUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      const msg = 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF'
      setError(msg)
      onError?.(msg)
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const msg = 'File too large. Maximum size: 10MB'
      setError(msg)
      onError?.(msg)
      return
    }

    setError(null)
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      // Get pre-signed URL
      const result = await getUploadUrl(selectedFile.type)
      if (!result) {
        throw new Error('Failed to get upload URL')
      }

      // Upload to R2 using the pre-signed URL
      const uploadResponse = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      // Report the key back to parent
      onImageKey(result.key)
      setSelectedFile(null)
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      onError?.(message)
    }
    finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div data-testid="image-upload" style={{ marginTop: '12px' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileSelect}
        data-testid="image-upload-input"
        style={{ display: 'none' }}
      />

      {/* Preview */}
      {previewUrl && (
        <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', maxWidth: '300px' }}>
          <img
            src={previewUrl}
            alt="Event preview"
            data-testid="image-upload-preview"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <IonButton
          fill="outline"
          size="small"
          onClick={() => fileInputRef.current?.click()}
          data-testid="image-upload-select-btn"
        >
          <IonIcon icon={cloudUploadOutline} slot="start" />
          {previewUrl ? 'Change image' : 'Select image'}
        </IonButton>

        {selectedFile && (
          <IonButton
            color="primary"
            size="small"
            onClick={handleUpload}
            disabled={uploading}
            data-testid="image-upload-upload-btn"
          >
            {uploading
              ? <IonSpinner name="dots" />
              : (
                  <>
                    <IonIcon icon={cloudUploadOutline} slot="start" />
                    Upload
                  </>
                )}
          </IonButton>
        )}

        {previewUrl && (
          <IonButton
            fill="clear"
            color="danger"
            size="small"
            onClick={handleRemove}
            data-testid="image-upload-remove-btn"
          >
            <IonIcon icon={trashOutline} />
          </IonButton>
        )}
      </div>

      {/* Error */}
      {error && (
        <IonText color="danger" data-testid="image-upload-error">
          <p style={{ fontSize: '13px', marginTop: '8px' }}>{error}</p>
        </IonText>
      )}

      {/* Helper text */}
      {!error && !selectedFile && (
        <IonText color="medium" data-testid="image-upload-hint">
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            JPEG, PNG, WebP, GIF, or AVIF. Max 10MB.
          </p>
        </IonText>
      )}
    </div>
  )
}
