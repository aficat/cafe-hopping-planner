import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCafeById, getCafesNearCafe } from '../data/mockData';
import { getCurrentPlan, saveCurrentPlan } from '../utils/storage';
import Toast from '../components/Toast';
import './CafeDetailsScreen.css';

function CafeDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState(null);
  const [isInPlan, setIsInPlan] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [radius, setRadius] = useState(2); // Default 2km radius

  useEffect(() => {
    const cafeData = getCafeById(id);
    if (cafeData) {
      setCafe(cafeData);
      const plan = getCurrentPlan();
      setIsInPlan(plan.cafes?.some(c => c.id === id) || false);
      // Get nearby cafes
      const nearby = getCafesNearCafe(id, radius);
      setNearbyCafes(nearby);
    }
  }, [id, radius]);

  const handleAddToPlan = (cafeToAdd = null) => {
    const targetCafe = cafeToAdd || cafe;
    const targetId = targetCafe.id;
    
    const plan = getCurrentPlan();
    if (!plan.cafes) {
      plan.cafes = [];
    }
    
    // Check if already in plan
    if (plan.cafes.some(c => c.id === targetId)) {
      alert('This cafe is already in your plan!');
      return;
    }
    
    plan.cafes.push({
      ...targetCafe,
      notes: '',
      timeSlot: '',
      order: plan.cafes.length + 1
    });
    
    saveCurrentPlan(plan);
    
    // Update state if it's the main cafe
    if (targetId === cafe.id) {
      setIsInPlan(true);
    }
    
    setShowToast(true);
  };

  if (!cafe) {
    return (
      <div className="cafe-details-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="cafe-details-screen">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="cafe-details-header">
        <div className="cafe-details-image">
          <img src={cafe.photos[0]} alt={cafe.name} />
        </div>
        <div className="cafe-details-info">
          <h1 className="cafe-details-name">{cafe.name}</h1>
          <p className="cafe-details-address">{cafe.address}</p>
          <div className="cafe-details-meta">
            <span className="cafe-rating">{cafe.rating}</span>
            <span className="cafe-price">{cafe.priceRange}</span>
            {cafe.halal && <span className="cafe-halal">Halal</span>}
          </div>
          <p className="cafe-details-cuisine">{cafe.cuisine}</p>
          <p className="cafe-details-hours">
            Open: {cafe.openingHours.open} - {cafe.openingHours.close}
          </p>
        </div>
      </div>

      <Toast
        message="Added to your plan!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="cafe-details-content">
        <div className="cafe-details-section card">
          <h2>Menu Highlights</h2>
          <ul className="menu-list">
            {cafe.menu.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="cafe-details-actions">
          {isInPlan ? (
            <span className="already-in-plan-text">Already in Plan</span>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => handleAddToPlan()}
            >
              Add to Plan
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/plan')}
          >
            View My Plan
          </button>
        </div>

        {nearbyCafes.length > 0 && (
          <div className="nearby-cafes-section card">
            <div className="nearby-cafes-header">
              <h2>Cafes Nearby</h2>
              <div className="radius-selector">
                <label>Within:</label>
                <select
                  className="input radius-select"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={3}>3 km</option>
                  <option value={5}>5 km</option>
                </select>
              </div>
            </div>
            <p className="nearby-cafes-subtitle">
              Add cafes in the same area to build your route!
            </p>
            <div className="nearby-cafes-grid">
              {nearbyCafes.map((nearbyCafe) => {
                const plan = getCurrentPlan();
                const isNearbyInPlan = plan.cafes?.some(c => c.id === nearbyCafe.id) || false;
                
                return (
                  <div key={nearbyCafe.id} className="nearby-cafe-card">
                    <div className="nearby-cafe-image">
                      <img src={nearbyCafe.photos[0]} alt={nearbyCafe.name} />
                      <div className="distance-badge">
                        {nearbyCafe.distance.toFixed(1)} km
                      </div>
                    </div>
                    <div className="nearby-cafe-info">
                      <h3>{nearbyCafe.name}</h3>
                      <p className="nearby-cafe-address">{nearbyCafe.address}</p>
                      <div className="nearby-cafe-meta">
                        <span className="cafe-rating">{nearbyCafe.rating}</span>
                        <span className="cafe-price">{nearbyCafe.priceRange}</span>
                      </div>
                      {isNearbyInPlan ? (
                        <span className="already-in-plan-text small">In Plan</span>
                      ) : (
                        <button
                          className="btn btn-primary small"
                          onClick={() => handleAddToPlan(nearbyCafe)}
                        >
                          Add to Plan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CafeDetailsScreen;

