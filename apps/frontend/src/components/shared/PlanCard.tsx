import React from 'react';

interface PlanCardProps {
  title: string;
  description?: string;
  distance?: string;
  time?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  distance,
  time,
  imageUrl,
  onClick,
}) => {
  const truncatedDescription = description && description.length > 120 
    ? `${description.substring(0, 120)}...` 
    : description;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 'var(--mp-spacing-md)',
        padding: 'var(--mp-spacing-md)',
        backgroundColor: 'var(--mp-surface-container-lowest)',
        borderRadius: 'var(--mp-radius-md)',
        boxShadow: 'var(--mp-elevation-1)',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        width: '100%',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--mp-elevation-2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--mp-elevation-1)';
      }}
    >
      {imageUrl && (
        <div
          style={{
            width: '100px',
            height: '100px',
            flexShrink: 0,
            borderRadius: 'var(--mp-radius-sm)',
            overflow: 'hidden',
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mp-spacing-xs)', flex: 1, minWidth: 0 }}>
        <div className="mp-title-sm" style={{ color: 'var(--mp-on-surface)', margin: 0 }}>
          {title}
        </div>
        
        {truncatedDescription && (
          <div className="mp-body-md" style={{ color: 'var(--mp-on-surface-variant)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>
            {truncatedDescription}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--mp-spacing-base)', marginTop: 'auto' }}>
          {distance && (
            <div className="mp-label-sm" style={{ color: 'var(--mp-outline)', display: 'flex', alignItems: 'center' }}>
              {distance}
            </div>
          )}
          {time && (
            <div className="mp-label-sm" style={{ color: 'var(--mp-outline)', display: 'flex', alignItems: 'center' }}>
              {time}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default PlanCard;
