import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyCafes } from '../data/mockData';
import CafeCard from '../components/CafeCard';
import './NearbyCafesScreen.css';

function NearbyCafesScreen() {
  const navigate = useNavigate();
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user's actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          const cafes = getNearbyCafes(position.coords.latitude, position.coords.longitude);
          setNearbyCafes(cafes);
          setLoading(false);
        },
        () => {
          // Fallback to default location (Marina Bay)
          const cafes = getNearbyCafes();
          setNearbyCafes(cafes);
          setLoading(false);
        }
      );
    } else {
      // Fallback to default location
      const cafes = getNearbyCafes();
      setNearbyCafes(cafes);
      setLoading(false);
    }
  }, []);

  return (
    <div className="nearby-cafes-screen">
      <header className="nearby-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1 className="nearby-title">
          <span className="ribbon">Nearby Cafes</span>
        </h1>
      </header>

      {loading ? (
        <div className="loading">Finding nearby cafes...</div>
      ) : (
        <>
          <div className="nearby-info card">
            <p>
              {userLocation
                ? 'Showing cafes near your location'
                : 'Showing cafes near Marina Bay (default location)'}
            </p>
            <p className="info-note">
              Enable location access for more accurate results!
            </p>
          </div>

          <div className="nearby-cafes-list">
            {nearbyCafes.length > 0 ? (
              <div className="cafes-grid">
                {nearbyCafes.map((cafe) => (
                  <div key={cafe.id} className="nearby-cafe-wrapper">
                    <CafeCard cafe={cafe} />
                    <div className="distance-badge">
                      {cafe.distance.toFixed(1)} km away
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results card">
                <p>No nearby cafes found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NearbyCafesScreen;

