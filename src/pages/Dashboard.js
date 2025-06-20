import React, { useState } from 'react';
import { Typography, Box, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, IconButton, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// بيانات مخزون افتراضي
const initialInventory = [
  { barcode: '123456', name: 'فلتر زيت', quantity: 10, price: 100 },
  { barcode: '789012', name: 'زيت محرك', quantity: 20, price: 250 },
  { barcode: '345678', name: 'بوجيه', quantity: 15, price: 80 },
];

export default function Dashboard() {
  // بيانات الطلبات (محلي فقط للعرض)
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [inventory] = useState(initialInventory);
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    carModel: '',
    carPlate: '',
    serviceType: '',
    maintenanceCost: '', // تكلفة الصيانة
    items: [], // [{barcode, name, qty, price}]
  });
  // صنف جديد للإضافة
  const [newItem, setNewItem] = useState({ barcode: '', itemName: '', itemQty: 1, itemPrice: '' });
  const [itemError, setItemError] = useState('');

  // فتح وغلق النموذج
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      clientName: '', clientPhone: '', carModel: '', carPlate: '', serviceType: '', maintenanceCost: '', items: []
    });
    setNewItem({ barcode: '', itemName: '', itemQty: 1, itemPrice: '' });
    setItemError('');
  };

  // تغيير بيانات النموذج الرئيسي
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // تغيير بيانات الصنف الجديد
  const handleNewItemChange = e => setNewItem({ ...newItem, [e.target.name]: e.target.value });

  // عند اختيار اسم صنف من Autocomplete
  const handleSelectItemName = (event, value) => {
    if (value) {
      setNewItem({ ...newItem, itemName: value.name, barcode: value.barcode, itemPrice: value.price });
    } else {
      setNewItem({ ...newItem, itemName: '', barcode: '', itemPrice: '' });
    }
  };

  // عند إدخال باركود: إذا وجد في المخزون، يتم تعبئة الاسم والسعر تلقائيًا
  const handleBarcodeBlur = () => {
    if (newItem.barcode) {
      const found = inventory.find(i => i.barcode === newItem.barcode);
      if (found) {
        setNewItem(n => ({ ...n, itemName: found.name, itemPrice: found.price }));
      }
    }
  };

  // حساب السعر الإجمالي للصنف الجديد
  const newItemTotal = newItem.itemPrice && newItem.itemQty ? Number(newItem.itemPrice) * Number(newItem.itemQty) : 0;

  // إضافة صنف مستخدم في الطلب
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

  // حفظ الطلب
  const handleSave = () => {
    if (!form.clientName || !form.clientPhone || !form.carModel || !form.carPlate || !form.serviceType) return;
    setOrders([...orders, {
      ...form,
      id: Date.now(),
      date: new Date().toLocaleString(),
      itemsTotal,
      total,
    }]);
    handleClose();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={2}>
        لوحة التحكم
      </Typography>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          طلب جديد
        </Button>
      </Paper>
      {/* عرض الطلبات الأخيرة */}
      {orders.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" mb={2}>آخر الطلبات</Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {orders.slice(-5).reverse().map(order => (
              <li key={order.id}>
                {order.date} - {order.clientName} - {order.carModel} - {order.serviceType} - المجموع الكلي: {order.total} ج.م
              </li>
            ))}
          </Box>
        </Paper>
      )}
      {/* Dialog نموذج الطلب الجديد */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>طلب صيانة جديد</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField label="اسم العميل" name="clientName" value={form.clientName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="رقم الهاتف" name="clientPhone" value={form.clientPhone} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="موديل السيارة" name="carModel" value={form.carModel} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="رقم اللوحة" name="carPlate" value={form.carPlate} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="نوع الصيانة" name="serviceType" value={form.serviceType} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="تكلفة الصيانة" name="maintenanceCost" value={form.maintenanceCost} onChange={handleChange} fullWidth type="number" />
            </Grid>
            {/* البضائع المستخدمة */}
            <Grid item xs={12}>
              <Typography fontWeight={600} mb={1}>البضائع المستخدمة في الصيانة</Typography>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={3}>
                  <Autocomplete
                    options={inventory}
                    getOptionLabel={option => option.name}
                    value={newItem.itemName ? inventory.find(i => i.name === newItem.itemName) || null : null}
                    onChange={handleSelectItemName}
                    renderInput={(params) => (
                      <TextField {...params} label="اسم الصنف" name="itemName" />
                    )}
                    isOptionEqualToValue={(option, value) => option.name === value.name}
                  />
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
