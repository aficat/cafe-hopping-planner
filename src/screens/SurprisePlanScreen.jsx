import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCafes } from '../data/mockData';
import { saveCurrentPlan } from '../utils/storage';
import CafeCard from '../components/CafeCard';
import './SurprisePlanScreen.css';

function SurprisePlanScreen() {
  const navigate = useNavigate();
  const [surpriseCafes, setSurpriseCafes] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generateSurprisePlan();
  }, []);

  const generateSurprisePlan = () => {
    setGenerating(true);
    
    // Simulate loading
    setTimeout(() => {
      // Randomly select 3-5 cafes
      const shuffled = [...mockCafes].sort(() => 0.5 - Math.random());
      const count = Math.floor(Math.random() * 3) + 3; // 3-5 cafes
      const selected = shuffled.slice(0, count);
      
      setSurpriseCafes(selected);
      setGenerating(false);
    }, 1000);
  };

  const handleAcceptPlan = () => {
    if (surpriseCafes.length === 0) {
      alert('Generate a plan first!');
      return;
    }

    const plan = {
      cafes: surpriseCafes.map((cafe, index) => ({
        ...cafe,
        notes: '',
        timeSlot: '',
        order: index + 1
      })),
      startTime: '09:00',
      transportMode: 'walking'
    };

    saveCurrentPlan(plan);
    navigate('/plan');
  };

  return (
    <div className="surprise-plan-screen">
      <header className="surprise-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1 className="surprise-title">
          <span className="ribbon">Surprise Plan</span>
        </h1>
      </header>

      <div className="surprise-info card">
        <p>Let us surprise you with a random cafe hopping route!</p>
        <p className="info-note">Click "Generate New Plan" to get a different surprise</p>
      </div>

      <div className="surprise-actions">
        <button
          className="btn btn-primary"
          onClick={generateSurprisePlan}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate New Plan'}
        </button>
        {surpriseCafes.length > 0 && (
          <button className="btn btn-primary" onClick={handleAcceptPlan}>
            Accept & Add to Plan
          </button>
        )}
      </div>

      {generating ? (
        <div className="loading">
          <div className="spinner">...</div>
          <p>Creating your surprise plan...</p>
        </div>
      ) : surpriseCafes.length > 0 ? (
        <div className="surprise-cafes">
          <h2 className="section-title">Your Surprise Route ({surpriseCafes.length} cafes)</h2>
          <div className="cafes-grid">
            {surpriseCafes.map((cafe, index) => (
              <div key={cafe.id} className="surprise-cafe-wrapper">
                <div className="surprise-order">#{index + 1}</div>
                <CafeCard cafe={cafe} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-plan card">
          <p>Click "Generate New Plan" to create your surprise route!</p>
        </div>
      )}
    </div>
  );
}

export default SurprisePlanScreen;

