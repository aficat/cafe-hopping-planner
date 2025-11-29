import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getCurrentPlan, saveCurrentPlan, savePastPlan, clearCurrentPlan } from '../utils/storage';
import { optimizeRoute } from '../utils/routeOptimizer';
import { mockCafes, calculateDistance } from '../data/mockData';
import Map from '../components/Map';
import './PlanBuilderScreen.css';

function PlanBuilderScreen() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(getCurrentPlan());
  const [cafes, setCafes] = useState(plan.cafes || []);
  const [startTime, setStartTime] = useState(plan.startTime || '09:00');
  const transportMode = 'walking'; // Always use walking
  const [editingCafe, setEditingCafe] = useState(null);
  const [showNotes, setShowNotes] = useState({});
  const [routePolyline, setRoutePolyline] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [shareLink, setShareLink] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (cafes.length === 0) {
      alert('Your plan is empty! Add some cafes first.');
      navigate('/');
    }
  }, [cafes.length, navigate]);

  // Update time slots when transport mode or start time changes (without reordering)
  useEffect(() => {
    if (cafes.length > 0) {
      const cafesWithCoordinates = cafes.filter(cafe => 
        cafe.coordinates && typeof cafe.coordinates.lat === 'number' && typeof cafe.coordinates.lng === 'number'
      );
      
      if (cafesWithCoordinates.length > 0) {
        // Recalculate time slots with walking speed, keeping current order
        const [hours, minutes] = startTime.split(':').map(Number);
        let currentTime = new Date();
        currentTime.setHours(hours, minutes, 0, 0);
        
        const updatedCafes = cafesWithCoordinates.map((cafe, index) => {
          const timeSlot = new Date(currentTime);
          const timeString = timeSlot.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          
          // Calculate travel time to next cafe
          if (index < cafesWithCoordinates.length - 1) {
            const nextCafe = cafesWithCoordinates[index + 1];
            const distance = calculateDistance(
              cafe.coordinates.lat,
              cafe.coordinates.lng,
              nextCafe.coordinates.lat,
              nextCafe.coordinates.lng
            );
            
            // Always use walking speed (5 km/h)
            const speed = 5;
            const travelTime = Math.round((distance / speed) * 60); // minutes
            currentTime.setMinutes(currentTime.getMinutes() + 60 + travelTime); // 60 min at cafe + travel
          }
          
          return {
            ...cafe,
            timeSlot: timeString
          };
        });
        
        setCafes(updatedCafes);
        updatePlan({ cafes: updatedCafes });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]); // Re-run when start time changes

  // Calculate route polyline and distance when cafes change
  useEffect(() => {
    const cafesWithCoordinates = cafes.filter(cafe => 
      cafe.coordinates && typeof cafe.coordinates.lat === 'number' && typeof cafe.coordinates.lng === 'number'
    );
    
    if (cafesWithCoordinates.length > 0) {
      // Create polyline coordinates
      const coordinates = cafesWithCoordinates
        .map(cafe => [cafe.coordinates.lat, cafe.coordinates.lng])
        .filter(coord => coord[0] && coord[1]);
      setRoutePolyline(coordinates);

      // Calculate total distance (always walking)
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
    } else {
      setRoutePolyline([]);
      setTotalDistance(0);
    }
  }, [cafes]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCafes((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newCafes = arrayMove(items, oldIndex, newIndex);
        updatePlan({ cafes: newCafes });
        return newCafes;
      });
    }
  };

  const updatePlan = (updates) => {
    const newPlan = { ...plan, ...updates };
    setPlan(newPlan);
    saveCurrentPlan(newPlan);
  };

  const handleRemoveCafe = (cafeId) => {
    if (window.confirm('Remove this cafe from your plan?')) {
      const newCafes = cafes.filter(c => c.id !== cafeId);
      setCafes(newCafes);
      updatePlan({ cafes: newCafes });
    }
  };

  const handleSaveNotes = (cafeId, notes) => {
    if (notes.length > 200) {
      alert('Notes are too long! Maximum 200 characters.');
      return;
    }
    const newCafes = cafes.map(c =>
      c.id === cafeId ? { ...c, notes } : c
    );
    setCafes(newCafes);
    updatePlan({ cafes: newCafes });
    setShowNotes({ ...showNotes, [cafeId]: false });
  };

  const handleOptimizeRoute = () => {
    if (cafes.length === 0) {
      alert('Your plan is empty! Add some cafes first.');
      return;
    }
    const cafesWithCoordinates = cafes.filter(cafe => 
      cafe.coordinates && typeof cafe.coordinates.lat === 'number' && typeof cafe.coordinates.lng === 'number'
    );
    if (cafesWithCoordinates.length === 0) {
      alert('No cafes with valid coordinates to optimize.');
      return;
    }
    const optimized = optimizeRoute(cafesWithCoordinates, startTime);
    setCafes(optimized);
    updatePlan({ cafes: optimized });
    alert('Route optimized!');
  };

  const handleSavePlan = () => {
    if (cafes.length === 0) {
      alert('Your plan is empty! Add some cafes first.');
      return;
    }
    
    // Ensure all cafes have coordinates
    const cafesWithCoordinates = cafes.map(cafe => {
      if (!cafe.coordinates) {
        // If coordinates are missing, try to get from original cafe data
        const originalCafe = mockCafes.find(c => c.id === cafe.id);
        if (originalCafe && originalCafe.coordinates) {
          return { ...cafe, coordinates: originalCafe.coordinates };
        }
      }
      return cafe;
    }).filter(cafe => cafe.coordinates); // Remove cafes without coordinates
    
    if (cafesWithCoordinates.length === 0) {
      alert('Unable to save plan: cafes are missing location data.');
      return;
    }
    
    const finalPlan = {
      ...plan,
      cafes: cafesWithCoordinates,
      startTime,
      transportMode,
      date: new Date().toISOString()
    };
    
    // Save to past plans
    savePastPlan(finalPlan);
    clearCurrentPlan();
    alert('Plan saved!');
    navigate('/past-plans');
  };

  const handleShare = () => {
    const finalPlan = {
      ...plan,
      cafes,
      startTime,
      transportMode,
      date: new Date().toISOString()
    };
    const planData = JSON.stringify(finalPlan);
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

  // Get center for map
  const getMapCenter = () => {
    const cafesWithCoordinates = cafes.filter(cafe => 
      cafe.coordinates && typeof cafe.coordinates.lat === 'number' && typeof cafe.coordinates.lng === 'number'
    );
    if (cafesWithCoordinates.length > 0 && cafesWithCoordinates[0].coordinates) {
      return [cafesWithCoordinates[0].coordinates.lat, cafesWithCoordinates[0].coordinates.lng];
    }
    return [1.2839, 103.8608]; // Default to Marina Bay
  };

  return (
    <div className="plan-builder-screen">
      <header className="plan-header">
        <h1 className="plan-title">
          <span className="ribbon">My Plan</span>
        </h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </header>

      <div className="plan-settings card">
        <div className="setting-group">
          <label>Start Time:</label>
          <input
            type="time"
            className="input"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              updatePlan({ startTime: e.target.value });
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleOptimizeRoute}>
          Optimize Route
        </button>
      </div>

      <div className="plan-content-layout">
        <div className="plan-left-section">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cafes.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="plan-cafes">
                {cafes.map((cafe, index) => (
                  <SortableCafeItem
                    key={cafe.id}
                    cafe={cafe}
                    index={index}
                    onRemove={handleRemoveCafe}
                    onSaveNotes={handleSaveNotes}
                    showNotes={showNotes[cafe.id]}
                    setShowNotes={(show) => setShowNotes({ ...showNotes, [cafe.id]: show })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="plan-right-section">
          <div className="map-container">
            {cafes.length > 0 && cafes.some(c => c.coordinates) ? (
              <Map
                cafes={cafes.filter(c => c.coordinates)}
                routePolyline={routePolyline || []}
                center={getMapCenter()}
              />
            ) : (
              <div style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '16px' }}>
                <p>Add cafes to see your route on the map</p>
              </div>
            )}
          </div>

          <div className="route-info card">
            <h2>Route Information</h2>
            <div className="route-stats">
              <div className="stat">
                <span className="stat-label">Total Cafes:</span>
                <span className="stat-value">{cafes.length}</span>
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
                <span className="stat-value">{startTime || '09:00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="plan-actions">
        <button className="btn btn-primary" onClick={handleSavePlan}>
          Save Plan
        </button>
        <button className="btn btn-primary" onClick={handleShare}>
          Share Plan
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (window.confirm('Clear your current plan?')) {
              setCafes([]);
              updatePlan({ cafes: [] });
            }
          }}
        >
          Clear Plan
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

function SortableCafeItem({ cafe, index, onRemove, onSaveNotes, showNotes, setShowNotes }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cafe.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [notes, setNotes] = useState(cafe.notes || '');

  return (
    <div ref={setNodeRef} style={style} className="plan-cafe-item card">
      <div className="plan-cafe-header">
        <div className="drag-handle" {...attributes} {...listeners}>
          ☰ Drag
        </div>
        <div className="cafe-order">#{index + 1}</div>
        <h3 className="cafe-name">{cafe.name}</h3>
        <button
          className="remove-button"
          onClick={() => onRemove(cafe.id)}
        >
          X
        </button>
      </div>
      <div className="plan-cafe-content">
        <p className="cafe-address">{cafe.address}</p>
        {cafe.timeSlot && (
          <p className="cafe-time">{cafe.timeSlot}</p>
        )}
        <div className="cafe-actions">
          {!showNotes ? (
            <button
              className="btn btn-secondary small"
              onClick={() => setShowNotes(true)}
            >
              {cafe.notes ? 'Edit Notes' : 'Add Notes'}
            </button>
          ) : (
            <div className="notes-editor">
              <textarea
                className="input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this cafe..."
                maxLength={200}
                rows={3}
              />
              <div className="notes-actions">
                <span className="notes-count">{notes.length}/200</span>
                <button
                  className="btn btn-primary small"
                  onClick={() => onSaveNotes(cafe.id, notes)}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary small"
                  onClick={() => {
                    setNotes(cafe.notes || '');
                    setShowNotes(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {cafe.notes && !showNotes && (
          <div className="cafe-notes-display">
            <strong>Notes:</strong> {cafe.notes}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanBuilderScreen;

