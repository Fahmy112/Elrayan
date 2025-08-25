import express from 'express';
import Car from '../models/Car.js';
import Client from '../models/Client.js';

const router = express.Router();

// جلب جميع السيارات مع بيانات العميل
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().populate('client').sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب السيارات' });
  }
});

// إضافة سيارة جديدة
router.post('/', async (req, res) => {
  try {
    const { model, plate, client } = req.body;
    // تحقق من وجود العميل
    const clientExists = await Client.findById(client);
    if (!clientExists) return res.status(400).json({ error: 'العميل غير موجود' });
    const car = new Car({ model, plate, client });
    await car.save();
    res.status(201).json(await car.populate('client'));
  } catch (err) {
    res.status(400).json({ error: 'تعذر إضافة السيارة' });
  }
});

// تعديل بيانات سيارة
router.put('/:id', async (req, res) => {
  try {
    const { model, plate, client } = req.body;
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { model, plate, client },
      { new: true }
    ).populate('client');
    if (!car) return res.status(404).json({ error: 'السيارة غير موجودة' });
    res.json(car);
  } catch (err) {
    res.status(400).json({ error: 'تعذر تعديل بيانات السيارة' });
  }
});

// حذف سيارة
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ error: 'السيارة غير موجودة' });
    res.json({ message: 'تم حذف السيارة بنجاح' });
  } catch (err) {
    res.status(400).json({ error: 'تعذر حذف السيارة' });
  }
});

export default router;
