import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';

const Orders = lazy(() => import('./pages/Orders'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Reports = lazy(() => import('./pages/Reports'));

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
              <Suspense fallback={<div>جاري التحميل...</div>}>
                <Routes>
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="*" element={<Navigate to="/orders" />} />
                </Routes>
              </Suspense>
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
