import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Cars from './pages/Cars';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);

  return (
    <Router>
      <CssBaseline />
      {loggedIn ? (
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
            <Navbar onLogout={() => setLoggedIn(false)} />
            <Box sx={{ p: 3 }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </Router>
  );
}

export default App;
