import React from 'react';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onClick }) => {
  return (
    <div 
      onClick={onClick} 
      data-selected={selected}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 12px',
        backgroundColor: selected ? '#0061A4' : 'transparent',
        color: selected ? '#ffffff' : '#907067',
        border: `1px solid ${selected ? '#0061A4' : '#907067'}`,
        fontSize: '12px',
        fontWeight: '500',
        borderRadius: '9999px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};
