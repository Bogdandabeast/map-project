import { useState, useEffect } from 'react';
import { IonSpinner } from '@ionic/react';
import MapView from '../components/map/view/MapView';
import { OAuthButtons } from '../components/auth/OAuthButtons';
import { useAuth } from '../components/auth/AuthProvider';
import './ExplorePage.css';

export function ExplorePage() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const { isAuthenticated, user, isPending } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`explore-page ${isDesktop ? 'desktop' : ''}`}>
      <div className="map-wrapper">
        <MapView />
        
        <div className="ui-overlay">
          <div className="auth-corner">
            {isPending ? (
              <IonSpinner className="auth-loading" />
            ) : isAuthenticated ? (
              <span className="auth-user">👤 {user?.name || user?.email}</span>
            ) : (
              <OAuthButtons />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
