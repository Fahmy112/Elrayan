import { dbConnect } from '../../utils/mongodb';
import Order from '../../models/Order';
import Car from '../../models/Car';
import Client from '../../models/Client';
import Inventory from '../../models/Inventory';

export default async function handler(req, res) {
  await dbConnect();

  // جلب جميع الطلبات مع بيانات العميل والسيارة
  if (req.method === 'GET') {
    try {
      const orders = await Order.find()
        .populate('client')
        .populate({ path: 'car', populate: { path: 'client' } })
        .sort({ createdAt: -1 });
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ error: 'حدث خطأ أثناء جلب الطلبات' });
    }
  }

  // إضافة طلب جديد
  if (req.method === 'POST') {
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
      return res.status(201).json(await order.populate('client').populate({ path: 'car', populate: { path: 'client' } }));
    } catch (err) {
      return res.status(400).json({ error: 'تعذر إضافة الطلب' });
    }
  }

  // حذف طلب
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      const order = await Order.findByIdAndDelete(id);
      if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
      return res.status(200).json({ message: 'تم حذف الطلب بنجاح' });
    } catch (err) {
      return res.status(400).json({ error: 'تعذر حذف الطلب' });
    }
  }

  // إذا لم تكن الطريقة مدعومة
  return res.status(405).json({ error: 'Method Not Allowed' });
}
