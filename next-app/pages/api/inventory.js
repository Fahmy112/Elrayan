import { dbConnect } from '../../utils/mongodb';
import Inventory from '../../models/Inventory';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const items = await Inventory.find().sort({ createdAt: -1 });
      return res.status(200).json(items);
    } catch (err) {
      return res.status(500).json({ error: 'حدث خطأ أثناء جلب الأصناف' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, barcode, quantity, buyPrice, sellPrice } = req.body;
      const item = new Inventory({ name, barcode, quantity, buyPrice, sellPrice });
      await item.save();
      return res.status(201).json(item);
    } catch (err) {
      return res.status(400).json({ error: 'تعذر إضافة الصنف (ربما الباركود مكرر)' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, barcode, quantity, buyPrice, sellPrice } = req.body;
      const item = await Inventory.findByIdAndUpdate(
        id,
        { name, barcode, quantity, buyPrice, sellPrice },
        { new: true }
      );
      if (!item) return res.status(404).json({ error: 'الصنف غير موجود' });
      return res.status(200).json(item);
    } catch (err) {
      return res.status(400).json({ error: 'تعذر تعديل بيانات الصنف' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      const item = await Inventory.findByIdAndDelete(id);
      if (!item) return res.status(404).json({ error: 'الصنف غير موجود' });
      return res.status(200).json({ message: 'تم حذف الصنف بنجاح' });
    } catch (err) {
      return res.status(400).json({ error: 'تعذر حذف الصنف' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
