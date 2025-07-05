import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // الحقول القديمة (للتوافق مع الطلبات القديمة)
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  // الحقول الجديدة
  clientName: { type: String },
  clientPhone: { type: String },
  carModel: { type: String },
  carPlate: { type: String },
  serviceType: { type: String, required: true },
  maintenanceCost: { type: Number, default: 0 },
  kilometers: { type: Number, default: 0 },
  items: [
    {
      name: String,
      qty: Number,
      price: Number
    }
  ],
  itemsTotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
