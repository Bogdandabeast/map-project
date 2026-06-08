import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, mock } from 'bun:test'

import { ImageUpload } from '../ImageUpload'

// ── Tests ─────────────────────────────────────────────────────────

describe('ImageUpload', () => {
  it('renders select button', () => {
    const getUploadUrl = mock(async () => ({ uploadUrl: 'https://r2.dev/upload', key: 'events/evt1/123.jpg' }))
    const onImageKey = mock(() => {})
    const onError = mock(() => {})

    render(
      <ImageUpload
        getUploadUrl={getUploadUrl}
        onImageKey={onImageKey}
        onError={onError}
      />,
    )

    expect(screen.getByTestId('image-upload-select-btn')).toBeTruthy()
    expect(screen.getByTestId('image-upload-select-btn')).toHaveTextContent('Select image')
  })

  it('shows hint text', () => {
    const getUploadUrl = mock(async () => ({ uploadUrl: 'https://r2.dev/upload', key: 'key' }))
    const onImageKey = mock(() => {})

    render(
      <ImageUpload
        getUploadUrl={getUploadUrl}
        onImageKey={onImageKey}
      />,
    )

    expect(screen.getByTestId('image-upload-hint')).toBeTruthy()
  })

  it('shows "Change image" when there is a current image', () => {
    const getUploadUrl = mock(async () => ({ uploadUrl: 'https://r2.dev/upload', key: 'key' }))
    const onImageKey = mock(() => {})

    render(
      <ImageUpload
        getUploadUrl={getUploadUrl}
        onImageKey={onImageKey}
        currentImageUrl="https://cdn.dev/events/evt1/img.jpg"
      />,
    )

    expect(screen.getByTestId('image-upload-select-btn')).toHaveTextContent('Change image')
    expect(screen.getByTestId('image-upload-preview')).toBeTruthy()
  })

  it('shows error for invalid file type', async () => {
    const getUploadUrl = mock(async () => ({ uploadUrl: 'https://r2.dev/upload', key: 'key' }))
    const onImageKey = mock(() => {})
    const onError = mock(() => {})

    render(
      <ImageUpload
        getUploadUrl={getUploadUrl}
        onImageKey={onImageKey}
        onError={onError}
      />,
    )

    // Simulate selecting a non-image file
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByTestId('image-upload-error')).toBeTruthy()
    })
    expect(onError).toHaveBeenCalled()
  })

  it('shows error for file larger than 10MB', async () => {
    const getUploadUrl = mock(async () => ({ uploadUrl: 'https://r2.dev/upload', key: 'key' }))
    const onImageKey = mock(() => {})
    const onError = mock(() => {})

    render(
      <ImageUpload
        getUploadUrl={getUploadUrl}
        onImageKey={onImageKey}
        onError={onError}
      />,
    )

    // Simulate selecting a too-large file
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement

    fireEvent.change(input, { target: { files: [largeFile] } })

    await waitFor(() => {
      expect(screen.getByTestId('image-upload-error')).toBeTruthy()
    })
    expect(onError).toHaveBeenCalled()
  })

  it('shows preview and upload button when valid file selected', async () => {
    const getUploadUrl = mock(async () => ({ uploadUrl: 'https://r2.dev/upload', key: 'key' }))
    const onImageKey = mock(() => {})
    const onError = mock(() => {})

    render(
      <ImageUpload
        getUploadUrl={getUploadUrl}
        onImageKey={onImageKey}
        onError={onError}
      />,
    )

    // Create a valid image File
    const imageFile = new File(['fake-image-data'], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement

    fireEvent.change(input, { target: { files: [imageFile] } })

    // Upload button should appear
    await waitFor(() => {
      expect(screen.getByTestId('image-upload-upload-btn')).toBeTruthy()
    })
  })
})
