import express from 'express';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// جلب جميع الأصناف
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأصناف' });
  }
});

// إضافة صنف جديد
router.post('/', async (req, res) => {
  try {
    const { name, barcode, quantity, buyPrice, sellPrice } = req.body;
    const item = new Inventory({ name, barcode, quantity, buyPrice, sellPrice });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'تعذر إضافة الصنف (ربما الباركود مكرر)' });
  }
});

// تعديل بيانات صنف
router.put('/:id', async (req, res) => {
  try {
    const { name, barcode, quantity, buyPrice, sellPrice } = req.body;
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { name, barcode, quantity, buyPrice, sellPrice },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'الصنف غير موجود' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'تعذر تعديل بيانات الصنف' });
  }
});

// حذف صنف
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'الصنف غير موجود' });
    res.json({ message: 'تم حذف الصنف بنجاح' });
  } catch (err) {
    res.status(400).json({ error: 'تعذر حذف الصنف' });
  }
});

export default router;
