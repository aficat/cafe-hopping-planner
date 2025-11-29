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
import { getCurrentPlan, saveCurrentPlan } from '../utils/storage';
import { optimizeRoute } from '../utils/routeOptimizer';
import { mockCafes } from '../data/mockData';
import './PlanBuilderScreen.css';

function PlanBuilderScreen() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(getCurrentPlan());
  const [cafes, setCafes] = useState(plan.cafes || []);
  const [startTime, setStartTime] = useState(plan.startTime || '09:00');
  const [transportMode, setTransportMode] = useState(plan.transportMode || 'walking');
  const [editingCafe, setEditingCafe] = useState(null);
  const [showNotes, setShowNotes] = useState({});

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
    const optimized = optimizeRoute(cafes, startTime, transportMode);
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
    
    // Save plan and navigate
    saveCurrentPlan(finalPlan);
    navigate('/map');
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
        <div className="setting-group">
          <label>Transport Mode:</label>
          <select
            className="input"
            value={transportMode}
            onChange={(e) => {
              setTransportMode(e.target.value);
              updatePlan({ transportMode: e.target.value });
            }}
          >
            <option value="walking">Walking</option>
            <option value="cycling">Cycling</option>
            <option value="driving">Driving</option>
            <option value="public">Public Transport</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleOptimizeRoute}>
          Optimize Route
        </button>
      </div>

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

      <div className="plan-actions">
        <button className="btn btn-primary" onClick={handleSavePlan}>
          Save & View Map
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

