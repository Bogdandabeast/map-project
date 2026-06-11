import { IonCard, IonCardContent, IonSkeletonText } from '@ionic/react'

/**
 * Skeleton card animation keyframe injected once per document.
 * Creates a shimmer effect moving left-to-right across the card.
 */
const SHIMMER_STYLE_ID = 'skeleton-shimmer-keyframes'
if (typeof document !== 'undefined' && !document.getElementById(SHIMMER_STYLE_ID)) {
  const style = document.createElement('style')
  style.id = SHIMMER_STYLE_ID
  style.textContent = `
    @keyframes skeleton-shimmer {
      0% { opacity: 0.4; }
      50% { opacity: 0.8; }
      100% { opacity: 0.4; }
    }
  `
  document.head.appendChild(style)
}

/**
 * Renders 3-4 animated skeleton placeholder cards that match
 * the approximate dimensions of an event/plan card in the list.
 * Uses Ionic's IonSkeletonText component for the skeleton effect.
 */
export function SkeletonCard() {
  return (
    <div data-testid="skeleton-card-container">
      {[1, 2, 3].map(i => (
        <IonCard
          key={i}
          data-testid="skeleton-card"
          style={{
            animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
            animationDelay: `${(i - 1) * 0.2}s`,
          }}
        >
          <IonCardContent>
            {/* Title placeholder — full width */}
            <IonSkeletonText
              data-testid="skeleton-title"
              animated
              style={{ width: '80%', height: '20px', marginBottom: '10px' }}
            />

            {/* Subtitle placeholder — shorter width */}
            <IonSkeletonText
              data-testid="skeleton-subtitle"
              animated
              style={{ width: '50%', height: '14px', marginBottom: '14px' }}
            />

            {/* Chip placeholders — small rounded blocks */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <IonSkeletonText
                data-testid="skeleton-chip"
                animated
                style={{ width: '60px', height: '22px', borderRadius: '16px' }}
              />
              <IonSkeletonText
                data-testid="skeleton-chip"
                animated
                style={{ width: '80px', height: '22px', borderRadius: '16px' }}
              />
              <IonSkeletonText
                data-testid="skeleton-chip"
                animated
                style={{ width: '70px', height: '22px', borderRadius: '16px' }}
              />
            </div>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  )
}
