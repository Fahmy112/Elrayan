import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

export default function Reports() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={2}>
        التقارير والإحصائيات
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>صفحة التقارير والإحصائيات (مبيعات، صيانة، مخزون، عملاء) ستظهر هنا.</Typography>
      </Paper>
    </Box>
  );
}
