import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    carModel: '',
    carPlate: '',
    serviceType: '',
    maintenanceCost: '',
    items: [],
  });
  const [newItem, setNewItem] = useState({ name: '', barcode: '', qty: 1, price: 0 });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      // يمكن إضافة معالجة الخطأ هنا
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setForm({ clientName: '', clientPhone: '', carModel: '', carPlate: '', serviceType: '', maintenanceCost: '', items: [] });
    setFormError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleNewItemChange = (e) => {
    setNewItem(i => ({ ...i, [e.target.name]: e.target.value }));
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.barcode || !newItem.qty || !newItem.price) return;
    setForm(f => ({ ...f, items: [...f.items, { ...newItem, qty: Number(newItem.qty), price: Number(newItem.price) }] }));
    setNewItem({ name: '', barcode: '', qty: 1, price: 0 });
  };

  const handleSave = async () => {
    if (!form.clientName || !form.clientPhone || !form.carModel || !form.carPlate || !form.serviceType) {
      setFormError('جميع الحقول مطلوبة');
      return;
    }
    try {
      await axios.post('/api/orders', { ...form });
      fetchOrders();
      setOpen(false);
    } catch (err) {
      setFormError('حدث خطأ أثناء حفظ الطلب: ' + (err.response?.data?.error || err.message));
    }
  };

  const columns = [
    { field: 'clientName', headerName: 'اسم العميل', flex: 1 },
    { field: 'clientPhone', headerName: 'رقم هاتف العميل', flex: 1 },
    { field: 'carModel', headerName: 'موديل السيارة', flex: 1 },
    { field: 'carPlate', headerName: 'رقم اللوحة', flex: 1 },
    { field: 'serviceType', headerName: 'نوع الخدمة', flex: 1 },
    { field: 'maintenanceCost', headerName: 'تكلفة الصيانة', flex: 1 },
    { field: 'total', headerName: 'الإجمالي', flex: 1 },
    { field: 'date', headerName: 'التاريخ', flex: 1, valueGetter: params => params.row.createdAt ? (new Date(params.row.createdAt).toLocaleString()) : '' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">الطلبات</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          إضافة طلب جديد
        </Button>
      </Box>
      <DataGrid autoHeight
        rows={Array.isArray(orders) ? orders.map((order, i) => ({ id: order._id || i, ...order })) : []}
        columns={columns}
        loading={loading}
        pageSize={8}
      />
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>إضافة طلب جديد</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField label="اسم العميل" name="clientName" value={form.clientName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="رقم هاتف العميل" name="clientPhone" value={form.clientPhone} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="موديل السيارة" name="carModel" value={form.carModel} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="رقم اللوحة" name="carPlate" value={form.carPlate} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="نوع الخدمة" name="serviceType" value={form.serviceType} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="تكلفة الصيانة" name="maintenanceCost" type="number" value={form.maintenanceCost} onChange={handleChange} fullWidth />
            </Grid>
          </Grid>
          <Box mt={3}>
            <Typography fontWeight="bold">البضائع/المواد المستخدمة:</Typography>
            <Grid container spacing={2} alignItems="center" mt={1}>
              <Grid item xs={3}>
                <TextField label="اسم المادة" name="name" value={newItem.name} onChange={handleNewItemChange} fullWidth />
              </Grid>
              <Grid item xs={3}>
                <TextField label="باركود" name="barcode" value={newItem.barcode} onChange={handleNewItemChange} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <TextField label="الكمية" name="qty" type="number" value={newItem.qty} onChange={handleNewItemChange} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <TextField label="سعر البيع" name="price" type="number" value={newItem.price} onChange={handleNewItemChange} fullWidth />
              </Grid>
              <Grid item xs={2}>
                <Button onClick={handleAddItem} variant="outlined">إضافة</Button>
              </Grid>
            </Grid>
            <ul>
              {form.items.map((item, i) => (
                <li key={i}>{item.name} - {item.qty} × {item.price} = {item.qty * item.price}</li>
              ))}
            </ul>
          </Box>
          {formError && (
            <Typography color="error" mt={2}>{formError}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ الطلب</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Orders;
