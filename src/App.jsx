import { Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import CafeDetailsScreen from './screens/CafeDetailsScreen';
import PlanBuilderScreen from './screens/PlanBuilderScreen';
import PastPlansScreen from './screens/PastPlansScreen';
import NearbyCafesScreen from './screens/NearbyCafesScreen';
import SurprisePlanScreen from './screens/SurprisePlanScreen';
import './App.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/cafe/:id" element={<CafeDetailsScreen />} />
        <Route path="/plan" element={<PlanBuilderScreen />} />
        <Route path="/past-plans" element={<PastPlansScreen />} />
        <Route path="/nearby" element={<NearbyCafesScreen />} />
        <Route path="/surprise" element={<SurprisePlanScreen />} />
      </Routes>
    </div>
  );
}

export default App;

