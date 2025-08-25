import express from 'express';
import Inventory from '../models/Inventory.js';

const app = express();
app.use(express.json());

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
    const item = new Inventory(req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// تعديل بيانات صنف
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// حذف صنف
router.delete('/:id', async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
