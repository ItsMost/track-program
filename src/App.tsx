import TrackFieldPlanner from './components/TrackPlanner/index.jsx';
import CoachGate from './components/Auth/CoachGate.jsx';

function App() {
  return (
    <CoachGate>
      <TrackFieldPlanner />
    </CoachGate>
  );
}

export default App;
