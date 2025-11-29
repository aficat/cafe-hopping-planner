import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Extract postal code from address
const extractPostalCode = (address) => {
  // Singapore postal codes are 6 digits, typically at the end of address
  // Format: "Singapore 238872" or just "238872"
  const postalCodeMatch = address.match(/\b(\d{6})\b/);
  return postalCodeMatch ? postalCodeMatch[1] : null;
};

// Create custom numbered icon for markers
const createNumberedIcon = (numbers) => {
  const isMultiple = numbers.length > 1;
  const numbersText = numbers.join(', ');
  
  return L.divIcon({
    className: `custom-numbered-marker ${isMultiple ? 'merged-marker' : ''}`,
    html: `<div class="numbered-marker-badge ${isMultiple ? 'merged-badge' : ''}">${numbersText}</div>`,
    iconSize: isMultiple ? [40, 40] : [32, 32],
    iconAnchor: isMultiple ? [20, 40] : [16, 32],
    popupAnchor: [0, isMultiple ? -40 : -32],
  });
};

// Group cafes by postal code (same postal code = same building/location)
const groupCafesByLocation = (cafes) => {
  if (!cafes || cafes.length === 0) return [];
  
  const groups = [];
  const processed = new Set();
  // Use a plain object instead of Map to avoid potential conflicts
  const postalCodeToGroupIndex = {};

  cafes.forEach((cafe, index) => {
    if (processed.has(index)) return;
    
    // Ensure cafe has valid coordinates
    if (!cafe.coordinates || typeof cafe.coordinates.lat !== 'number' || typeof cafe.coordinates.lng !== 'number') {
      return; // Skip cafes without valid coordinates
    }

    const cafeNumber = index + 1;
    const postalCode = extractPostalCode(cafe.address);

    // If no postal code found, treat as separate location
    if (!postalCode) {
      groups.push({
        cafes: [{ ...cafe, originalIndex: index, cafeNumber }],
        position: [cafe.coordinates.lat, cafe.coordinates.lng],
        numbers: [cafeNumber],
      });
      processed.add(index);
      return;
    }

    // Check if we already have a group for this postal code
    if (postalCodeToGroupIndex.hasOwnProperty(postalCode)) {
      const groupIndex = postalCodeToGroupIndex[postalCode];
      const group = groups[groupIndex];
      group.cafes.push({ ...cafe, originalIndex: index, cafeNumber });
      group.numbers.push(cafeNumber);
      processed.add(index);
    } else {
      // Create new group for this postal code
      const group = {
        cafes: [{ ...cafe, originalIndex: index, cafeNumber }],
        position: [cafe.coordinates.lat, cafe.coordinates.lng],
        numbers: [cafeNumber],
      };
      groups.push(group);
      postalCodeToGroupIndex[postalCode] = groups.length - 1;
      processed.add(index);

      // Find other cafes with the same postal code
      cafes.forEach((otherCafe, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return;
        
        // Ensure other cafe has valid coordinates
        if (!otherCafe.coordinates || typeof otherCafe.coordinates.lat !== 'number' || typeof otherCafe.coordinates.lng !== 'number') {
          return; // Skip cafes without valid coordinates
        }

        const otherPostalCode = extractPostalCode(otherCafe.address);
        if (otherPostalCode === postalCode) {
          const otherCafeNumber = otherIndex + 1;
          group.cafes.push({ ...otherCafe, originalIndex: otherIndex, cafeNumber: otherCafeNumber });
          group.numbers.push(otherCafeNumber);
          processed.add(otherIndex);
        }
      });
    }
  });

  return groups;
};

function Map(props) {
  // Destructure with defaults to prevent undefined errors
  const { cafes = [], routePolyline = [], center } = props || {};
  
  // Ensure cafes array is valid
  if (!cafes || !Array.isArray(cafes) || cafes.length === 0) {
    return (
      <div style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '16px' }}>
        <p>No cafes to display on map</p>
      </div>
    );
  }

  // Ensure center is in correct format [lat, lng]
  const mapCenter = Array.isArray(center) ? center : 
    (center && center.lat && center.lng ? [center.lat, center.lng] : [1.2839, 103.8608]);

  const locationGroups = groupCafesByLocation(cafes);

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      style={{ height: '500px', width: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locationGroups.map((group, groupIndex) => {
        const isMultiple = group.cafes.length > 1;
        return (
          <Marker 
            key={`group-${groupIndex}`}
            position={group.position}
            icon={createNumberedIcon(group.numbers)}
          >
            <Popup>
              <div className="marker-popup">
                {isMultiple ? (
                  <>
                    <div className="merged-popup-header">
                      <strong>Multiple Cafes at This Location</strong>
                      <span className="merged-count">({group.cafes.length} cafes)</span>
                    </div>
                    <div className="merged-cafes-list">
                      {group.cafes.map((cafe) => (
                        <div key={cafe.id} className="merged-cafe-item">
                          <div className="merged-cafe-header">
                            <strong>#{cafe.cafeNumber} {cafe.name}</strong>
                          </div>
                          <p className="merged-cafe-address">{cafe.address}</p>
                          {cafe.timeSlot && (
                            <p className="merged-cafe-time">{cafe.timeSlot}</p>
                          )}
                          <div className="merged-cafe-meta">
                            <span className="cafe-rating">{cafe.rating}</span>
                            <span className="cafe-price">{cafe.priceRange}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <strong>#{group.cafes[0].cafeNumber} {group.cafes[0].name}</strong>
                    <p>{group.cafes[0].address}</p>
                    {group.cafes[0].timeSlot && <p>{group.cafes[0].timeSlot}</p>}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
      {routePolyline && routePolyline.length > 1 && (
        <Polyline
          positions={routePolyline}
          color="#ff6b9d"
          weight={4}
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
}

export default Map;

