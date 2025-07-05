import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Select, InputLabel, FormControl, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const API_ORDERS = process.env.REACT_APP_API_URL + '/orders';
const API_CLIENTS = process.env.REACT_APP_API_URL + '/clients';
const API_CARS = process.env.REACT_APP_API_URL + '/cars';
const API_INVENTORY = process.env.REACT_APP_API_URL + '/inventory';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client: '', car: '', serviceType: '', maintenanceCost: '', items: [] });
  const [newItem, setNewItem] = useState({ barcode: '', itemName: '', itemQty: 1, itemPrice: '' });
  const [itemError, setItemError] = useState('');
  const [loading, setLoading] = useState(false);

  // جلب البيانات
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, clientsRes, carsRes, inventoryRes] = await Promise.all([
        fetch(API_ORDERS),
        fetch(API_CLIENTS),
        fetch(API_CARS),
        fetch(API_INVENTORY)
      ]);
      setOrders(await ordersRes.json());
      setClients(await clientsRes.json());
      setCars(await carsRes.json());
      setInventory(await inventoryRes.json());
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpen = () => {
    setForm({ client: '', car: '', serviceType: '', maintenanceCost: '', items: [] });
    setNewItem({ barcode: '', itemName: '', itemQty: 1, itemPrice: '' });
    setOpen(true);
    setItemError('');
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleNewItemChange = e => setNewItem({ ...newItem, [e.target.name]: e.target.value });

  // عن�� اختيار اسم صنف
  const handleSelectItemName = (event, value) => {
    if (value) {
      setNewItem({ ...newItem, itemName: value.name, barcode: value.barcode, itemPrice: value.sellPrice });
    } else {
      setNewItem({ ...newItem, itemName: '', barcode: '', itemPrice: '' });
    }
  };
  // عند إدخال باركود
  const handleBarcodeBlur = () => {
    if (newItem.barcode) {
      const found = inventory.find(i => i.barcode === newItem.barcode);
      if (found) {
        setNewItem(n => ({ ...n, itemName: found.name, itemPrice: found.sellPrice }));
      }
    }
  };
  // حساب السعر الإجمالي للصنف الجديد
  const newItemTotal = newItem.itemPrice && newItem.itemQty ? Number(newItem.itemPrice) * Number(newItem.itemQty) : 0;

  // إضافة صنف للطلب
  const handleAddItem = () => {
    let found = null;
    if (newItem.barcode) {
      found = inventory.find(i => i.barcode === newItem.barcode);
    } else if (newItem.itemName) {
      found = inventory.find(i => i.name === newItem.itemName);
    }
    if (!found) {
      setItemError('الصنف غير موجود في المخزون');
      return;
    }
    if (newItem.itemQty < 1 || newItem.itemQty > found.quantity) {
      setItemError('الكمية غير متوفرة في المخزون');
      return;
    }
    if (!newItem.itemPrice || isNaN(Number(newItem.itemPrice)) || Number(newItem.itemPrice) < 0) {
      setItemError('يرجى إدخال سعر بيع صحيح');
      return;
    }
    setForm({
      ...form,
      items: [...form.items, { barcode: found.barcode, name: found.name, qty: Number(newItem.itemQty), price: Number(newItem.itemPrice) }],
    });
    setNewItem({ barcode: '', itemName: '', itemQty: 1, itemPrice: '' });
    setItemError('');
  };
  // حذف صنف من الطلب
  const handleRemoveItem = (barcode) => {
    setForm({ ...form, items: form.items.filter(i => i.barcode !== barcode) });
  };
  // حساب إجمالي مبلغ البضائع
  const itemsTotal = form.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  // حساب المجموع الكلي (البضائع + تكلفة الصيانة)
  const maintenanceCostNum = Number(form.maintenanceCost) || 0;
  const total = itemsTotal + maintenanceCostNum;

  // إضافة طلب جديد
  const handleSave = async () => {
    if (!form.client || !form.car || !form.serviceType) return;
    setLoading(true);
    try {
      await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: form.items })
      });
      await fetchAll();
      setOpen(false);
    } catch (err) {}
    setLoading(false);
  };
  // حذف طلب
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await fetch(`${API_ORDERS}/${id}`, { method: 'DELETE' });
      await fetchAll();
    } catch (err) {}
    setLoading(false);
  };

  const filtered = orders.filter(o =>
    (o.client?.name || '').includes(search) ||
    (o.car?.model || '').includes(search) ||
    (o.car?.plate || '').includes(search)
  );

  const columns = [
    { field: 'date', headerName: 'التاريخ', flex: 1, valueGetter: params => new Date(params.row.createdAt).toLocaleString() },
    { field: 'client', headerName: 'العميل', flex: 1, valueGetter: params => params.row.client?.name || '' },
    { field: 'car', headerName: 'السيارة', flex: 1, valueGetter: params => params.row.car ? `${params.row.car.model} - ${params.row.car.plate}` : '' },
    { field: 'serviceType', headerName: 'نوع الصيانة', flex: 1 },
    { field: 'maintenanceCost', headerName: 'تكلفة الصيانة', flex: 1 },
    { field: 'itemsTotal', headerName: 'إجمالي البضائع', flex: 1 },
    { field: 'total', headerName: 'المجموع الكلي', flex: 1 },
    {
      field: 'actions',
      headerName: 'إجراءات',
      width: 100,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDelete(params.row._id)}><DeleteIcon /></IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={2}>
        إدارة الطلبات
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            label="بحث بالعميل أو السيارة أو اللوحة"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            إضافة طلب
          </Button>
        </Box>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filtered.map(o => ({ ...o, id: o._id }))}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            loading={loading}
            localeText={{ noRowsLabel: 'لا يوجد بيانات' }}
          />
        </div>
      </Paper>
      {/* Dialog نموذج الطلب الجديد */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>طلب صيانة جديد</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={4}>
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
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="car-label">السيارة</InputLabel>
                <Select
                  labelId="car-label"
                  name="car"
                  value={form.car}
                  label="السيارة"
                  onChange={handleChange}
                >
                  {cars.map(car => (
                    <MenuItem key={car._id} value={car._id}>{car.model} - {car.plate} ({car.client?.name})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="نوع الصيانة" name="serviceType" value={form.serviceType} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="تكلفة الصيانة" name="maintenanceCost" value={form.maintenanceCost} onChange={handleChange} fullWidth type="number" />
            </Grid>
            {/* البضائع المستخدمة */}
            <Grid item xs={12}>
              <Typography fontWeight={600} mb={1}>البضائع المستخدمة في الصيانة</Typography>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    label="اسم الصنف"
                    name="itemName"
                    value={newItem.itemName}
                    onChange={handleNewItemChange}
                    fullWidth
                    select
                  >
                    {inventory.map(item => (
                      <MenuItem key={item._id} value={item.name}>{item.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="باركود الصنف"
                    name="barcode"
                    value={newItem.barcode}
                    onChange={handleNewItemChange}
                    onBlur={handleBarcodeBlur}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField label="الكمية" name="itemQty" value={newItem.itemQty} onChange={handleNewItemChange} type="number" fullWidth />
                </Grid>
                <Grid item xs={2}>
                  <TextField label="سعر البيع" name="itemPrice" value={newItem.itemPrice} onChange={handleNewItemChange} type="number" fullWidth />
                </Grid>
                <Grid item xs={2}>
                  <Button onClick={handleAddItem} variant="outlined">إضافة</Button>
                </Grid>
              </Grid>
              {/* عرض السعر الإجمالي للصنف الجديد */}
              {newItem.itemPrice && newItem.itemQty > 0 && (
                <Typography mt={1} color="primary.main">
                  إجمالي هذا الصنف: {newItemTotal} ج.م
                </Typography>
              )}
              {itemError && <Typography color="error" mt={1}>{itemError}</Typography>}
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {form.items.map(item => (
                  <li key={item.barcode}>
                    {item.name} (باركود: {item.barcode}) × {item.qty} بسعر {item.price} ج.م = <b>{item.price * item.qty} ج.م</b>
                    <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.barcode)}><DeleteIcon fontSize="small" /></IconButton>
                  </li>
                ))}
              </Box>
              <Typography mt={1} fontWeight={700} color="primary.main">
                إجمالي البضائع: {itemsTotal} ج.م
              </Typography>
              <Typography mt={1} fontWeight={700} color="secondary.main">
                المجموع الكلي (البضائع + الصيانة): {total} ج.م
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ الطلب</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
