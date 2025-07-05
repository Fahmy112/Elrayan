import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Box, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, IconButton, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';

const API_ORDERS = process.env.REACT_APP_API_URL + '/orders';
const API_INVENTORY = process.env.REACT_APP_API_URL + '/inventory';

const initialForm = {
  clientName: '',
  clientPhone: '',
  carModel: '',
  carPlate: '',
  serviceType: '',
  maintenanceCost: '',
  kilometers: '',
  carComments: '',
  items: [],
};
const initialNewItem = { itemName: '', itemQty: 1, itemPrice: '' };

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [newItem, setNewItem] = useState(initialNewItem);
  const [itemError, setItemError] = useState('');
  const [formError, setFormError] = useState('');

  // جلب الطلبات والمخزون دفعة واحدة
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        fetch(API_ORDERS),
        fetch(API_INVENTORY)
      ]);
      setOrders(await ordersRes.json());
      setInventory(await inventoryRes.json());
    } catch (err) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // فتح وغلق النموذج
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setOpen(false);
    setForm({ ...initialForm });
    setNewItem({ ...initialNewItem });
    setItemError('');
    setFormError('');
  }, []);

  // البحث في الطلبات
  const filtered = useMemo(() =>
    orders.filter(o =>
      (o.clientName || '').includes(search) ||
      (o.carModel || '').includes(search) ||
      (o.carPlate || '').includes(search)
    ), [orders, search]
  );

  // اختيار الصنف في Autocomplete
  const selectedInventoryItem = useMemo(
    () => newItem.itemName ? inventory.find(i => i.name === newItem.itemName) || null : null,
    [newItem.itemName, inventory]
  );

  // تغيير بيانات النموذج الرئيسي
  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value ?? '' }));
  }, []);

  // تغيير بيانات الصنف الجديد
  const handleNewItemChange = useCallback(e => {
    const { name, value } = e.target;
    setNewItem(n => ({ ...n, [name]: value ?? '' }));
  }, []);

  // عند اختيار اسم صنف من Autocomplete
  const handleSelectItemName = useCallback((event, value) => {
    if (value) {
      setNewItem(n => ({ ...n, itemName: value.name, itemPrice: value.price }));
    } else {
      setNewItem(n => ({ ...n, itemName: '', itemPrice: '' }));
    }
  }, []);

  // حساب السعر الإجمالي للصنف الجديد
  const newItemTotal = useMemo(() =>
    newItem.itemPrice && newItem.itemQty ? Number(newItem.itemPrice) * Number(newItem.itemQty) : 0,
    [newItem.itemPrice, newItem.itemQty]
  );

  // إضافة صنف مستخدم في الطلب
  const handleAddItem = useCallback(() => {
    let found = null;
    if (newItem.itemName) {
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
    setForm(f => ({
      ...f,
      items: [...f.items, { name: found.name, qty: Number(newItem.itemQty), price: Number(newItem.itemPrice) }],
    }));
    setNewItem({ itemName: '', itemQty: 1, itemPrice: '' });
    setItemError('');
  }, [newItem, inventory]);

  // حذف صنف من الطلب
  const handleRemoveItem = useCallback((idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }, []);

  // حساب إجمالي مبلغ البضائع
  const itemsTotal = useMemo(() =>
    form.items.reduce((sum, item) => sum + (item.price * item.qty), 0),
    [form.items]
  );
  // حساب المجموع الكلي (البضائع + تكلفة الصيانة)
  const maintenanceCostNum = Number(form.maintenanceCost) || 0;
  const total = itemsTotal + maintenanceCostNum;

  // حفظ الطلب
  const handleSave = useCallback(async () => {
    setFormError('');
    if (!form.clientName || !form.clientPhone || !form.carModel || !form.carPlate || !form.serviceType) {
      setFormError('جميع الحقول مطلوبة');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, items: form.items };
      Object.keys(payload).forEach(k => {
        if (payload[k] === undefined || payload[k] === null) payload[k] = '';
      });
      payload.items = payload.items.map(i => ({
        name: i.name || '',
        qty: i.qty || 0,
        price: i.price || 0
      }));
      const res = await fetch(API_ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        handleClose();
      }
    } catch (err) {}
    setLoading(false);
  }, [form, handleClose]);

  // حذف طلب
  const handleDelete = useCallback(async (id) => {
    setLoading(true);
    try {
      await fetch(`${API_ORDERS}/${id}`, { method: 'DELETE' });
      await fetchAll();
    } catch (err) {}
    setLoading(false);
  }, [fetchAll]);

  const columns = [
    { field: 'date', headerName: 'التاريخ', flex: 1, valueGetter: params => params?.row?.createdAt ? new Date(params.row.createdAt).toLocaleString() : '' },
    { field: 'clientName', headerName: 'اسم العميل', flex: 1 },
    { field: 'clientPhone', headerName: 'هاتف العميل', flex: 1 },
    { field: 'carModel', headerName: 'موديل السيارة', flex: 1 },
    { field: 'carPlate', headerName: 'رقم اللوحة', flex: 1 },
    { field: 'serviceType', headerName: 'نوع الصيانة', flex: 1 },
    { field: 'maintenanceCost', headerName: 'تكلفة الصيانة', flex: 1 },
    {
      field: 'itemsTotal',
      headerName: 'إجمالي البضائع',
      flex: 1,
      valueGetter: params =>
        params.row && Array.isArray(params.row.items)
          ? params.row.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
          : 0
    },
    {
      field: 'total',
      headerName: 'المجموع الكلي',
      flex: 1,
      valueGetter: params => {
        const itemsSum = params.row && Array.isArray(params.row.items)
          ? params.row.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
          : 0;
        const maintenance = Number(params.row?.maintenanceCost) || 0;
        return itemsSum + maintenance;
      }
    },
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
        لوحة التحكم
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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>طلب صيانة جديد</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid>
              <TextField label="اسم العميل" name="clientName" value={form.clientName ?? ''} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid>
              <TextField label="رقم الهاتف" name="clientPhone" value={form.clientPhone ?? ''} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid>
              <TextField label="موديل السيارة" name="carModel" value={form.carModel ?? ''} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid>
              <TextField label="رقم اللوحة" name="carPlate" value={form.carPlate ?? ''} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid>
              <TextField label="نوع الصيانة" name="serviceType" value={form.serviceType ?? ''} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid>
              <TextField label="تكلفة الصيانة" name="maintenanceCost" value={form.maintenanceCost ?? ''} onChange={handleChange} fullWidth type="number" />
            </Grid>
            <Grid>
              <TextField label="عدد الكيلومترات" name="kilometers" value={form.kilometers ?? ''} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid>
              <TextField
                label="ملاحظات على السيارة"
                name="carComments"
                value={form.carComments ?? ''}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            {/* البضائع المستخدمة */}
            <Grid>
              <Typography fontWeight={600} mb={1}>البضائع المستخدمة في الصيانة</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Autocomplete
                  options={inventory}
                  getOptionLabel={option => option.name}
                  value={selectedInventoryItem}
                  onChange={handleSelectItemName}
                  renderInput={(params) => (
                    <TextField {...params} label="اسم الصنف" name="itemName" />
                  )}
                  isOptionEqualToValue={(option, value) => option.name === value.name}
                  sx={{ minWidth: 180 }}
                />
                <TextField label="الكمية" name="itemQty" value={newItem.itemQty ?? 1} onChange={handleNewItemChange} type="number" fullWidth sx={{ minWidth: 100 }} />
                <TextField label="سعر البيع" name="itemPrice" value={newItem.itemPrice ?? ''} onChange={handleNewItemChange} type="number" fullWidth sx={{ minWidth: 100 }} />
                <Button onClick={handleAddItem} variant="outlined">إضافة</Button>
              </Box>
              {newItem.itemPrice && newItem.itemQty > 0 && (
                <Typography mt={1} color="primary.main">
                  إجمالي هذا الصنف: {newItemTotal} ج.م
                </Typography>
              )}
              {itemError && <Typography color="error" mt={1}>{itemError}</Typography>}
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {form.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.qty} بسعر {item.price} ج.م = <b>{item.price * item.qty} ج.م</b>
                    <IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)}><DeleteIcon fontSize="small" /></IconButton>
                  </li>
                ))}
              </Box>
              <Typography mt={1} fontWeight={700} color="primary.main">
                إجمالي البضائع: {itemsTotal} ج.م
              </Typography>
              <Typography mt={1} fontWeight={700} color="secondary.main">
                المجموع الكلي (البضائع + الصيانة): {total} ج.م
              </Typography>
              {formError && <Typography color="error" mt={2}>{formError}</Typography>}
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
