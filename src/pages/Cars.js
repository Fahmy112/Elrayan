import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_CARS = process.env.REACT_APP_API_URL + '/cars';
const API_CLIENTS = process.env.REACT_APP_API_URL + '/clients';

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ model: '', plate: '', client: '' });
  const [loading, setLoading] = useState(false);

  // جلب السيارات والعم��اء
  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_CARS);
      const data = await res.json();
      setCars(data);
    } catch (err) {}
    setLoading(false);
  };
  const fetchClients = async () => {
    try {
      const res = await fetch(API_CLIENTS);
      const data = await res.json();
      setClients(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchCars();
    fetchClients();
  }, []);

  const handleOpen = (car = null) => {
    if (car) {
      setEditId(car._id);
      setForm({ model: car.model, plate: car.plate, client: car.client?._id || '' });
    } else {
      setEditId(null);
      setForm({ model: '', plate: '', client: '' });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // إضافة أو تعديل سيارة
  const handleSave = async () => {
    if (!form.model || !form.plate || !form.client) return;
    setLoading(true);
    try {
      if (editId) {
        await fetch(`${API_CARS}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        await fetch(API_CARS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      await fetchCars();
      setOpen(false);
    } catch (err) {}
    setLoading(false);
  };

  // حذف سيارة
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await fetch(`${API_CARS}/${id}`, { method: 'DELETE' });
      await fetchCars();
    } catch (err) {}
    setLoading(false);
  };

  const filtered = cars.filter(c =>
    c.model.includes(search) || c.plate.includes(search) || (c.client?.name || '').includes(search)
  );

  const columns = [
    { field: 'model', headerName: 'الموديل', flex: 1 },
    { field: 'plate', headerName: 'رقم اللوحة', flex: 1 },
    { field: 'client', headerName: 'العميل', flex: 1, valueGetter: params => params.row.client?.name || '' },
    { field: 'phone', headerName: 'هاتف العميل', flex: 1, valueGetter: params => params.row.client?.phone || '' },
    {
      field: 'actions',
      headerName: 'إجراءات',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleOpen(params.row)}><EditIcon /></IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row._id)}><DeleteIcon /></IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={2}>
        إدارة السيارات
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="بحث بالموديل أو اللوحة أو العميل"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            إضافة سيارة
          </Button>
        </Box>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filtered.map(c => ({ ...c, id: c._id }))}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            loading={loading}
            localeText={{ noRowsLabel: 'لا يوجد بيانات' }}
          />
        </div>
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'تعديل سيارة' : 'إضافة سيارة'}</DialogTitle>
        <DialogContent>
          <TextField
            label="الموديل"
            name="model"
            value={form.model}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="رقم اللوحة"
            name="plate"
            value={form.plate}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="client-label">العميل</InputLabel>
            <Select
              labelId="client-label"
              name="client"
              value={form.client}
              label="العميل"
              onChange={handleChange}
            >
              {clients.map(client => (
                <MenuItem key={client._id} value={client._id}>{client.name} - {client.phone}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
