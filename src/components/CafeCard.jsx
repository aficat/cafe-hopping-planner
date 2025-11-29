import { useNavigate } from 'react-router-dom';
import './CafeCard.css';

function CafeCard({ cafe }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/cafe/${cafe.id}`);
  };

  return (
    <div className="cafe-card card" onClick={handleClick}>
      <div className="cafe-card-image">
        <img src={cafe.photos[0]} alt={cafe.name} />
        {cafe.popular && <span className="popular-badge">Popular</span>}
      </div>
      <div className="cafe-card-content">
        <h3 className="cafe-card-name">{cafe.name}</h3>
        <p className="cafe-card-address">{cafe.address}</p>
        <div className="cafe-card-meta">
          <span className="cafe-rating">{cafe.rating}</span>
          <span className="cafe-price">{cafe.priceRange}</span>
          {cafe.halal && <span className="cafe-halal">Halal</span>}
        </div>
        <p className="cafe-card-cuisine">{cafe.cuisine}</p>
        <p className="cafe-card-hours">
          {cafe.openingHours.open} - {cafe.openingHours.close}
        </p>
      </div>
    </div>
  );
}

export default CafeCard;

