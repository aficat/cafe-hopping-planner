import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPopularCafes, mockCafes } from '../data/mockData';
import { getCurrentPlan } from '../utils/storage';
import CafeCard from '../components/CafeCard';
import './HomeScreen.css';

function HomeScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [popularCafes, setPopularCafes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: ''
  });
  const [currentPlanCount, setCurrentPlanCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const cafesPerPage = 6;

  useEffect(() => {
    setPopularCafes(getPopularCafes());
    const plan = getCurrentPlan();
    setCurrentPlanCount(plan.cafes?.length || 0);
  }, []);

  useEffect(() => {
    let results = [...mockCafes];

    // Apply search
    if (searchQuery) {
      results = results.filter(cafe =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.cuisine) {
      results = results.filter(cafe => cafe.cuisine === filters.cuisine);
    }
    if (filters.priceRange) {
      results = results.filter(cafe => cafe.priceRange === filters.priceRange);
    }

    setFilteredCafes(results);
  }, [searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ cuisine: '', priceRange: '' });
    setSearchQuery('');
  };

  const displayCafes = searchQuery || Object.values(filters).some(f => f) 
    ? filteredCafes 
    : popularCafes;

  // Pagination calculations
  const totalPages = Math.ceil(displayCafes.length / cafesPerPage);
  const startIndex = (currentPage - 1) * cafesPerPage;
  const endIndex = startIndex + cafesPerPage;
  const paginatedCafes = displayCafes.slice(startIndex, endIndex);

  // Reset to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  return (
    <div className="home-screen">
      <header className="home-header">
        <h1 className="home-title">
          <span className="ribbon">Cafe Hopping Planner</span>
        </h1>
        <p className="home-subtitle">Plan your perfect cafe adventure in Singapore</p>
      </header>

      <div className="home-actions">
        <div className="search-container">
          <input
            type="text"
            className="input search-input"
            placeholder="Search cafes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/nearby')}
          >
            Nearby Cafes
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/past-plans')}
          >
            Past Plans
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/surprise')}
          >
            Surprise Plan
          </button>
          {currentPlanCount > 0 && (
            <button 
              className="btn btn-primary plan-button"
              onClick={() => navigate('/plan')}
            >
              My Plan ({currentPlanCount})
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filters-panel card">
            <h3>Filter Cafes</h3>
            <div className="filter-group">
              <label>Cuisine:</label>
              <select
                className="input"
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              >
                <option value="">All</option>
                <option value="Coffee & Brunch">Coffee & Brunch</option>
                <option value="Brunch & All-Day Dining">Brunch & All-Day Dining</option>
                <option value="Coffee">Coffee</option>
                <option value="Cafe & Bar">Cafe & Bar</option>
                <option value="Bakery & Cafe">Bakery & Cafe</option>
                <option value="Cafe">Cafe</option>
                <option value="French Cafe">French Cafe</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Price Range:</label>
              <select
                className="input"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              >
                <option value="">All</option>
                <option value="$">$ - Budget</option>
                <option value="$$">$$ - Moderate</option>
                <option value="$$$">$$$ - Expensive</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="cafes-section">
        <h2 className="section-title">
          {searchQuery || Object.values(filters).some(f => f) 
            ? `Search Results (${displayCafes.length})` 
            : 'Popular in Singapore'}
        </h2>
        <div className="cafes-grid">
          {paginatedCafes.length > 0 ? (
            paginatedCafes.map(cafe => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))
          ) : (
            <div className="no-results">
              <p>No cafes found. Try adjusting your search or filters!</p>
            </div>
          )}
        </div>
        
        {displayCafes.length > cafesPerPage && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;

