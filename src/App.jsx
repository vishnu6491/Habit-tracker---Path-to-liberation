import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useApp } from './hooks/useApp';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import CalendarPage from './pages/Calendar';
import Shop from './pages/Shop';
import Reports from './pages/Reports';
import Temple from './pages/Temple';
import Settings from './pages/Settings';

function App() {
  const { state, actions } = useApp();

  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard state={state} actions={actions} />} />
            <Route path="/habits" element={<Habits state={state} actions={actions} />} />
            <Route path="/calendar" element={<CalendarPage state={state} actions={actions} />} />
            <Route path="/shop" element={<Shop state={state} actions={actions} />} />
            <Route path="/reports" element={<Reports state={state} actions={actions} />} />
            <Route path="/temple" element={<Temple state={state} actions={actions} />} />
            <Route path="/settings" element={<Settings state={state} actions={actions} />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
