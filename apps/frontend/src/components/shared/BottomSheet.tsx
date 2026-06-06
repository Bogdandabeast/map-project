import React, { useState, useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      data-testid="bs-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
      }}
    >
      <div
        data-testid="bs-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          backgroundColor: 'var(--mp-surface-container-lowest)',
          borderRadius: isDesktop ? '0' : '16px 16px 0 0',
          boxShadow: 'var(--mp-elevation-3)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '480px',
          width: '100%',
          height: isDesktop ? '100vh' : 'auto',
          maxHeight: isDesktop ? '100vh' : '90vh',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Grabber */}
        {!isDesktop && (
          <div
            data-testid="bs-grabber"
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: 'var(--mp-outline)',
              borderRadius: '2px',
              margin: '12px auto',
              cursor: 'grab',
            }}
          />
        )}

        {title && (
          <div
            className="mp-title-md"
            style={{
              padding: 'var(--mp-spacing-md)',
              marginBottom: isDesktop ? 'var(--mp-spacing-md)' : 0,
              color: 'var(--mp-on-surface)',
              textAlign: 'center',
            }}
          >
            {title}
          </div>
        )}

        <div style={{ padding: '0 var(--mp-spacing-md) var(--mp-spacing-md)', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
