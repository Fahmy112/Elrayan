import express from 'express';
import Order from '../models/Order.js';
import Car from '../models/Car.js';
import Client from '../models/Client.js';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// جلب جميع الطلبات مع بيانات العميل والسيارة
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('client')
      .populate({ path: 'car', populate: { path: 'client' } })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الطلبات' });
  }
});

// إضافة طلب جديد
router.post('/', async (req, res) => {
  try {
    const { client, car, serviceType, maintenanceCost, items } = req.body;
    // تحقق من وجود العميل والسيارة
    const clientExists = await Client.findById(client);
    const carExists = await Car.findById(car);
    if (!clientExists || !carExists) return res.status(400).json({ error: 'العميل أو السيارة غير موجود' });
    // حساب إجمالي البضائع والمجموع الكلي
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = itemsTotal + Number(maintenanceCost || 0);
    // خصم الكميات من المخزون
    for (const item of items) {
      const inv = await Inventory.findOne({ barcode: item.barcode });
      if (!inv || inv.quantity < item.qty) {
        return res.status(400).json({ error: `الكمية غير متوفرة في المخزون للصنف: ${item.name}` });
      }
      inv.quantity -= item.qty;
      await inv.save();
    }
    // حفظ الطلب
    const order = new Order({
      client,
      car,
      serviceType,
      maintenanceCost,
      items,
      itemsTotal,
      total
    });
    await order.save();
    res.status(201).json(await order.populate('client').populate({ path: 'car', populate: { path: 'client' } }));
  } catch (err) {
    res.status(400).json({ error: 'تعذر إضافة الطلب' });
  }
});

// حذف طلب
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (err) {
    res.status(400).json({ error: 'تعذر حذف الطلب' });
  }
});

export default router;
