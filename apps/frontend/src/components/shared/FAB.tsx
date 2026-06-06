import React from 'react';
import { IonFab, IonFabButton, IonIcon } from '@ionic/react';

interface FABProps {
  icon?: string;
  label?: string;
  onClick: () => void;
  color?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon = 'add',
  label = 'Action',
  onClick,
  color = 'primary',
}) => {
  return (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <IonFabButton
        color={color}
        onClick={onClick}
        aria-label={label}
        style={{
          boxShadow: 'var(--mp-elevation-2)',
          '--box-shadow': 'var(--mp-elevation-2)',
        } as React.CSSProperties}
      >
        <IonIcon icon={icon} />
      </IonFabButton>
    </IonFab>
  );
};
