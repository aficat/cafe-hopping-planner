import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPastPlans } from '../utils/storage';
import './PastPlansScreen.css';

function PastPlansScreen() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    setPlans(getPastPlans());
  }, []);

  const handleViewPlan = (plan) => {
    // Could navigate to a view-only version of the plan
    alert(`Plan from ${new Date(plan.date).toLocaleDateString()}\n${plan.cafes.length} cafes`);
  };

  const handleReusePlan = (plan) => {
    if (window.confirm('Replace your current plan with this one?')) {
      // Save as current plan
      localStorage.setItem('currentPlan', JSON.stringify(plan));
      navigate('/plan');
    }
  };

  return (
    <div className="past-plans-screen">
      <header className="plans-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1 className="plans-title">
          <span className="ribbon">Past Plans</span>
        </h1>
      </header>

      {plans.length === 0 ? (
        <div className="no-plans card">
          <p>You haven't saved any plans yet!</p>
          <p>Create a plan and save it to see it here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Start Planning
          </button>
        </div>
      ) : (
        <div className="plans-list">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card card">
              <div className="plan-card-header">
                <h3>Plan from {new Date(plan.date).toLocaleDateString()}</h3>
                {plan.completed && <span className="completed-badge">Completed</span>}
              </div>
              <div className="plan-card-info">
                <p><strong>{plan.cafes.length}</strong> cafes</p>
                <p>Start: <strong>{plan.startTime || '09:00'}</strong></p>
                <p>Transport: <strong>
                  Walking
                </strong></p>
              </div>
              <div className="plan-card-cafes">
                <strong>Cafes:</strong>
                <ul>
                  {plan.cafes.slice(0, 3).map((cafe, index) => (
                    <li key={cafe.id}>#{index + 1} {cafe.name}</li>
                  ))}
                  {plan.cafes.length > 3 && <li>... and {plan.cafes.length - 3} more</li>}
                </ul>
              </div>
              <div className="plan-card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleViewPlan(plan)}
                >
                  View
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleReusePlan(plan)}
                >
                  Reuse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PastPlansScreen;

