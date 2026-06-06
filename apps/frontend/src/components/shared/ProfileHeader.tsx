import React from 'react';
import { IonAvatar } from '@ionic/react';

export interface ProfileStat {
  label: string;
  value: number;
}

interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string;
  stats?: ProfileStat[];
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, avatarUrl, stats }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 text-center md:text-left">
      <IonAvatar className="w-20 h-20 overflow-hidden rounded-full flex items-center justify-center bg-var(--mp-background-secondary) text-var(--mp-text-primary)">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold">{getInitials(name)}</span>
        )}
      </IonAvatar>
      
      <div className="flex flex-col items-center md:items-start gap-2">
        <h1 className="mp-headline-md font-bold">{name}</h1>
        
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="mp-label-sm text-var(--mp-outline)">{stat.label}</span>
                <span className="font-bold text-var(--mp-text-primary)">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
