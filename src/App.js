import React from 'react';
import {  BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarApp from './CalendarApp';
import CalendarAppAdmin from './CalendarAppAdmin';

function App() {
  return (
    <Router>
      <div>
        <Routes>
            <Route path="/" element={<CalendarApp />} />
            <Route path="/admin" element={<CalendarAppAdmin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
