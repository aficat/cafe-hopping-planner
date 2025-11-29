// Route optimization algorithm using nearest neighbor heuristic
import { calculateDistance } from '../data/mockData';

// Calculate travel time in minutes (simplified)
const getTravelTime = (cafe1, cafe2, transportMode) => {
  const distance = calculateDistance(
    cafe1.coordinates.lat,
    cafe1.coordinates.lng,
    cafe2.coordinates.lat,
    cafe2.coordinates.lng
  );
  
  // Average speeds in km/h
  const speeds = {
    walking: 5,
    cycling: 15,
    driving: 40,
    public: 30
  };
  
  const speed = speeds[transportMode] || 5;
  return Math.round((distance / speed) * 60); // Convert to minutes
};

// Optimize route using nearest neighbor algorithm
export const optimizeRoute = (cafes, startTime, transportMode) => {
  if (cafes.length === 0) return cafes;
  
  const optimized = [];
  const remaining = [...cafes];
  
  // Start with first cafe (or user's starting point)
  let current = remaining.shift();
  optimized.push(current);
  
  // Find nearest neighbor for each remaining cafe
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.coordinates.lat,
        current.coordinates.lng,
        remaining[i].coordinates.lat,
        remaining[i].coordinates.lng
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    current = remaining.splice(nearestIndex, 1)[0];
    optimized.push(current);
  }
  
  // Calculate time slots
  const [hours, minutes] = startTime.split(':').map(Number);
  let currentTime = new Date();
  currentTime.setHours(hours, minutes, 0, 0);
  
  return optimized.map((cafe, index) => {
    const timeSlot = new Date(currentTime);
    const timeString = timeSlot.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    // Add travel time to next cafe (except for last one)
    if (index < optimized.length - 1) {
      const travelTime = getTravelTime(cafe, optimized[index + 1], transportMode);
      currentTime.setMinutes(currentTime.getMinutes() + 60 + travelTime); // 60 min at cafe + travel
    }
    
    return {
      ...cafe,
      timeSlot: timeString,
      order: index + 1
    };
  });
};

