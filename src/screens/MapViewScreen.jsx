import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { getCurrentPlan, savePastPlan, clearCurrentPlan } from '../utils/storage';
import { calculateDistance } from '../data/mockData';
import './MapViewScreen.css';

function MapViewScreen() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan || !currentPlan.cafes || currentPlan.cafes.length === 0) {
      alert('No plan found! Create a plan first.');
      navigate('/plan');
      return;
    }

    // Filter out cafes without coordinates
    const cafesWithCoordinates = currentPlan.cafes.filter(cafe => 
      cafe.coordinates && cafe.coordinates.lat && cafe.coordinates.lng
    );
    
    if (cafesWithCoordinates.length === 0) {
      alert('Plan has no valid cafe locations. Please add cafes with valid addresses.');
      navigate('/plan');
      return;
    }

    const validPlan = { ...currentPlan, cafes: cafesWithCoordinates };
    setPlan(validPlan);
    
    // Create polyline coordinates - ensure they're valid numbers
    const coordinates = cafesWithCoordinates
      .map(cafe => {
        if (cafe.coordinates && typeof cafe.coordinates.lat === 'number' && typeof cafe.coordinates.lng === 'number') {
          return [cafe.coordinates.lat, cafe.coordinates.lng];
        }
        return null;
      })
      .filter(coord => coord !== null);
    
    setRoutePolyline(coordinates);

    // Calculate total distance
    let distance = 0;
    for (let i = 0; i < cafesWithCoordinates.length - 1; i++) {
      const cafe1 = cafesWithCoordinates[i];
      const cafe2 = cafesWithCoordinates[i + 1];
      if (cafe1.coordinates && cafe2.coordinates) {
        distance += calculateDistance(
          cafe1.coordinates.lat,
          cafe1.coordinates.lng,
          cafe2.coordinates.lat,
          cafe2.coordinates.lng
        );
      }
    }
    setTotalDistance(distance.toFixed(2));
  }, [navigate]);

  const handleSavePlan = () => {
    if (plan) {
      savePastPlan(plan);
      clearCurrentPlan();
      alert('Plan saved!');
      navigate('/past-plans');
    }
  };

  const handleShare = () => {
    const planData = JSON.stringify(plan);
    const encoded = btoa(planData);
    const link = `${window.location.origin}/share/${encoded}`;
    setShareLink(link);
    
    if (navigator.share) {
      navigator.share({
        title: 'My Cafe Hopping Plan',
        text: 'Check out my cafe hopping route!',
        url: link
      });
    } else {
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };

  if (!plan || !plan.cafes || plan.cafes.length === 0) {
    return (
      <div className="map-view-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Ensure center is in [lat, lng] format for Leaflet
  const getCenter = () => {
    if (plan.cafes && plan.cafes.length > 0 && plan.cafes[0].coordinates) {
      const coords = plan.cafes[0].coordinates;
      if (typeof coords === 'object' && coords.lat && coords.lng) {
        return [coords.lat, coords.lng];
      }
    }
    return [1.2839, 103.8608]; // Default to Marina Bay
  };
  
  const center = getCenter();

  return (
    <div className="map-view-screen">
      <header className="map-header">
        <button className="btn btn-secondary" onClick={() => navigate('/plan')}>
          ← Back to Plan
        </button>
        <h1 className="map-title">
          <span className="ribbon">Route Map</span>
        </h1>
      </header>

      <div className="map-container">
        {plan.cafes && plan.cafes.length > 0 ? (
          <Map
            cafes={plan.cafes}
            routePolyline={routePolyline || []}
            center={center}
          />
        ) : (
          <div style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '16px' }}>
            <p>No cafes to display on map</p>
          </div>
        )}
      </div>

      <div className="route-info card">
        <h2>Route Information</h2>
        <div className="route-stats">
          <div className="stat">
            <span className="stat-label">Total Cafes:</span>
            <span className="stat-value">{plan.cafes.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Distance:</span>
            <span className="stat-value">{totalDistance} km</span>
          </div>
          <div className="stat">
            <span className="stat-label">Transport:</span>
            <span className="stat-value">Walking</span>
          </div>
          <div className="stat">
            <span className="stat-label">Start Time:</span>
            <span className="stat-value">{plan.startTime || '09:00'}</span>
          </div>
        </div>
      </div>

      <div className="route-cafes card">
        <h2>Your Route</h2>
        <ol className="route-list">
          {plan.cafes.map((cafe, index) => (
            <li key={cafe.id} className="route-item">
              <div className="route-item-number">{index + 1}</div>
              <div className="route-item-content">
                <h3>{cafe.name}</h3>
                <p>{cafe.address}</p>
                {cafe.timeSlot && <p className="route-time">{cafe.timeSlot}</p>}
                {cafe.notes && <p className="route-notes">{cafe.notes}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="map-actions">
        <button className="btn btn-primary" onClick={handleSavePlan}>
          Save Plan
        </button>
        <button className="btn btn-primary" onClick={handleShare}>
          Share Plan
        </button>
        {shareLink && (
          <div className="share-link">
            <p>Share this link:</p>
            <input type="text" className="input" value={shareLink} readOnly />
          </div>
        )}
      </div>
    </div>
  );
}

export default MapViewScreen;

