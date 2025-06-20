import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = 'http://localhost:5000/api/clients';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  // جلب العملاء من الـ API
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      // يمكن عرض رسالة خطأ هنا
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpen = (client = null) => {
    if (client) {
      setEditId(client._id);
      setForm({ name: client.name, phone: client.phone, address: client.address });
    } else {
      setEditId(null);
      setForm({ name: '', phone: '', address: '' });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // إضافة أو تعديل عميل
  const handleSave = async () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    try {
      if (editId) {
        await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      fetchClients();
      setOpen(false);
    } catch (err) {}
    setLoading(false);
  };

  // حذف عميل
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchClients();
    } catch (err) {}
    setLoading(false);
  };

  const filtered = clients.filter(c =>
    c.name.includes(search) || c.phone.includes(search) || (c.address || '').includes(search)
  );

  const columns = [
    { field: 'name', headerName: 'الاسم', flex: 1 },
    { field: 'phone', headerName: 'رقم الهاتف', flex: 1 },
    { field: 'address', headerName: 'العنوان', flex: 1 },
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
        إدارة العملاء
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="بحث بالاسم أو الهاتف أو العنوان"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            إضافة عميل
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
        <DialogTitle>{editId ? 'تعديل عميل' : 'إضافة عميل'}</DialogTitle>
        <DialogContent>
          <TextField
            label="الاسم"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="رقم الهاتف"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="العنوان"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
