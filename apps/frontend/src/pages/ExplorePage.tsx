import React, { useState, useEffect, useMemo } from 'react';
import MapView from '../components/map/view/MapView';
import SearchBar from '../components/shared/SearchBar';
import { Chip } from '../components/shared/Chip';
import { FAB } from '../components/shared/FAB';
import { BottomSheet } from '../components/shared/BottomSheet';
import { PlanCard } from '../components/shared/PlanCard';
import './ExplorePage.css';

interface Plan {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

const MOCK_PLANS: Plan[] = [
  { id: '1', name: 'Plan 1', lat: -34.6037, lng: -58.3816, description: 'Visit Buenos Aires' },
  { id: '2', name: 'Plan 2', lat: -34.6100, lng: -58.4000, description: 'Explore Palermo' },
  { id: '3', name: 'Plan 3', lat: -34.5800, lng: -58.3500, description: 'Walk in Recoleta' },
];

export function ExplorePage() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredPlans = useMemo(() => {
    return MOCK_PLANS.filter(plan => 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handlePlanClick = (plan: Plan) => {
    console.log(`Centering map on plan: ${plan.id}`);
    // In a real app, this would call MapController.centerOn(plan.lat, plan.lng)
  };

  const filters = ['All', 'Nature', 'Urban', 'Food', 'Art'];

  return (
    <div className={`explore-page ${isDesktop ? 'desktop' : ''}`}>
      <div className="map-wrapper">
        <MapView />
        
        <div className="ui-overlay">
          <div className="search-container">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
            />
            <div className="filter-chips">
              {filters.map(filter => (
                <Chip 
                  key={filter} 
                  label={filter} 
                  active={selectedFilter === filter}
                  onClick={() => setSelectedFilter(filter)}
                />
              ))}
            </div>
          </div>

          <div className="fab-container">
            <FAB onClick={() => window.location.href = '/plans/new'} />
          </div>
        </div>
      </div>

      {isDesktop ? (
        <aside className="feed-sidebar" data-testid="feed-sidebar">
          <div className="feed-container">
            <h2 className="feed-title">Activity Feed</h2>
            {filteredPlans.map(plan => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onClick={() => handlePlanClick(plan)} 
              />
            ))}
          </div>
        </aside>
      ) : (
        <BottomSheet snapPoint={0.3} data-testid="bottom-sheet">
          <div className="feed-container">
            <h2 className="feed-title">Activity Feed</h2>
            {filteredPlans.map(plan => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onClick={() => handlePlanClick(plan)} 
              />
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
