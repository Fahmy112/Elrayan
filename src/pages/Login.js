import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setError('');
    onLogin();
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f6fa' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 340, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFZyuBA_hKMCmfji2M_URFn2fC9-NDFfCuIg&s" alt="logo" width={80} style={{ marginBottom: 8 }} />
          <Typography variant="h5" fontWeight={700} color="primary.main">El Rayan Auto Service</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            label="اسم المستخدم"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            دخول
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
