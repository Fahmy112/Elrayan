import { dbConnect } from '../../utils/mongodb';
import Client from '../../models/Client';

export default async function handler(req, res) {
  await dbConnect();

  // جلب جميع العملاء
  if (req.method === 'GET') {
    try {
      const clients = await Client.find().sort({ createdAt: -1 });
      return res.status(200).json(clients);
    } catch (err) {
      return res.status(500).json({ error: 'حدث خطأ أثناء جلب العملاء' });
    }
  }

  // إضافة عميل جديد
  if (req.method === 'POST') {
    try {
      const { name, phone, address } = req.body;
      const client = new Client({ name, phone, address });
      await client.save();
      return res.status(201).json(client);
    } catch (err) {
      return res.status(400).json({ error: 'تعذر إضافة العميل' });
    }
  }

  // تعديل عميل
  if (req.method === 'PUT') {
    try {
      const { id, name, phone, address } = req.body;
      const client = await Client.findByIdAndUpdate(
        id,
        { name, phone, address },
        { new: true }
      );
      if (!client) return res.status(404).json({ error: 'العميل غير موجود' });
      return res.status(200).json(client);
    } catch (err) {
      return res.status(400).json({ error: 'تعذر تعديل بيانات العميل' });
    }
  }

  // حذف عميل
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      const client = await Client.findByIdAndDelete(id);
      if (!client) return res.status(404).json({ error: 'العميل غير موجود' });
      return res.status(200).json({ message: 'تم حذف العميل بنجاح' });
    } catch (err) {
      return res.status(400).json({ error: 'تعذر حذف العميل' });
    }
  }

  // إذا لم تكن الطريقة مدعومة
  return res.status(405).json({ error: 'Method Not Allowed' });
}
