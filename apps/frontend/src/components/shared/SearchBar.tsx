import React from 'react';
import { IonSearchbar } from '@ionic/react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%', 
        padding: '0 16px',
        boxSizing: 'border-box' 
      }}
    >
      <IonSearchbar
        value={value}
        onIonInput={(e) => onChange(e.detail.value || '')}
        placeholder={placeholder}
        style={{ 
          maxWidth: '400px', 
          width: '100%', 
          '--border-radius': '16px',
          '--box-shadow': 'var(--mp-elevation-2)',
        } as React.CSSProperties}
      />
    </div>
  );
};

export default SearchBar;
