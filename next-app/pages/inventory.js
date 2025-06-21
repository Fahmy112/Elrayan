import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = '/api/inventory';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', barcode: '', quantity: '', buyPrice: '', sellPrice: '' });
  const [loading, setLoading] = useState(false);

  // جلب الأصناف من الـ API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setEditId(item._id);
      setForm({ name: item.name, barcode: item.barcode, quantity: item.quantity, buyPrice: item.buyPrice, sellPrice: item.sellPrice });
    } else {
      setEditId(null);
      setForm({ name: '', barcode: '', quantity: '', buyPrice: '', sellPrice: '' });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // إضافة أو تعديل صنف
  const handleSave = async () => {
    if (!form.name || !form.barcode || !form.quantity) return;
    setLoading(true);
    try {
      if (editId) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: editId })
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      await fetchItems();
      setOpen(false);
    } catch (err) {}
    setLoading(false);
  };

  // حذف صنف
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchItems();
    } catch (err) {}
    setLoading(false);
  };

  const filtered = items.filter(i =>
    i.name.includes(search) || i.barcode.includes(search)
  );

  const columns = [
    { field: 'name', headerName: 'اسم الصنف', flex: 1 },
    { field: 'barcode', headerName: 'الباركود', flex: 1 },
    { field: 'quantity', headerName: 'الكمية', flex: 1 },
    { field: 'buyPrice', headerName: 'سعر الشراء', flex: 1 },
    { field: 'sellPrice', headerName: 'سعر البيع', flex: 1 },
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
        إدارة المخزون
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="بحث بالاسم أو الباركود"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            إضافة صنف
          </Button>
        </Box>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filtered.map(i => ({ ...i, id: i._id }))}
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
        <DialogTitle>{editId ? 'تعديل صنف' : 'إضافة صنف'}</DialogTitle>
        <DialogContent>
          <TextField
            label="اسم الصنف"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="الباركود"
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="الكمية"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            label="سعر الشراء"
            name="buyPrice"
            value={form.buyPrice}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            label="سعر البيع"
            name="sellPrice"
            value={form.sellPrice}
            onChange={handleChange}
            type="number"
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
