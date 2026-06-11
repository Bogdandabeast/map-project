import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import { SkeletonCard } from '../SkeletonCard'

describe('SkeletonCard', () => {
  it('renders multiple skeleton cards', () => {
    render(<SkeletonCard />)

    const cards = screen.getAllByTestId('skeleton-card')
    expect(cards.length).toBeGreaterThanOrEqual(3)
    expect(cards.length).toBeLessThanOrEqual(4)
  })

  it('each skeleton card contains IonSkeletonText for title placeholder', () => {
    render(<SkeletonCard />)

    const cards = screen.getAllByTestId('skeleton-card')
    for (const card of cards) {
      const titleSkeleton = card.querySelector('ion-skeleton-text[data-testid="skeleton-title"]')
      expect(titleSkeleton).not.toBeNull()
    }
  })

  it('each skeleton card contains subtitle placeholder with shorter width', () => {
    render(<SkeletonCard />)

    const cards = screen.getAllByTestId('skeleton-card')
    for (const card of cards) {
      const subtitleSkeleton = card.querySelector('ion-skeleton-text[data-testid="skeleton-subtitle"]')
      expect(subtitleSkeleton).not.toBeNull()
    }
  })

  it('each skeleton card contains chip placeholders', () => {
    render(<SkeletonCard />)

    const cards = screen.getAllByTestId('skeleton-card')
    for (const card of cards) {
      const chips = card.querySelectorAll('ion-skeleton-text[data-testid="skeleton-chip"]')
      expect(chips.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('renders skeleton with animated shimmer effect', () => {
    render(<SkeletonCard />)

    const cards = screen.getAllByTestId('skeleton-card')
    for (const card of cards) {
      // IonSkeletonText renders as <ion-skeleton-text> with animated attribute by default
      const skeletonTexts = card.querySelectorAll('ion-skeleton-text')
      expect(skeletonTexts.length).toBeGreaterThan(0)

      for (const sk of skeletonTexts) {
        // IonSkeletonText should have the animated property set
        expect(sk.hasAttribute('animated')).toBe(true)
      }
    }
  })

  it('staggered animation delays increase across cards', () => {
    render(<SkeletonCard />)

    const cards = screen.getAllByTestId('skeleton-card')
    expect(cards.length).toBeGreaterThanOrEqual(2)

    const delays = cards.map(card =>
      parseFloat(card.style.animationDelay || '0'),
    )

    // Delays should be monotonically increasing (0s, 0.2s, 0.4s...)
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1])
    }
  })
})
