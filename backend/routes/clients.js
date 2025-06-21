import express from 'express';
import Client from '../models/Client.js';

const router = express.Router();

// جلب جميع العملاء
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب العملاء' });
  }
});

// إضافة عميل جديد
router.post('/', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const client = new Client({ name, phone, address });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: 'تعذر إضافة العميل' });
  }
});

// تعديل بيانات عميل
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true }
    );
    if (!client) return res.status(404).json({ error: 'العميل غير موجود' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: 'تعذر تعديل بيانات العميل' });
  }
});

// حذف عميل
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'العميل غير موجود' });
    res.json({ message: 'تم حذف العميل بنجاح' });
  } catch (err) {
    res.status(400).json({ error: 'تعذر حذف العميل' });
  }
});

export default router;
