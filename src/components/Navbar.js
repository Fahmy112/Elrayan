import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function Navbar({ onLogout }) {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          El Rayan Auto Service 
        </Typography>
        <Button color="inherit" onClick={onLogout}>تسجيل الخروج</Button>
      </Toolbar>
    </AppBar>
  );
}
