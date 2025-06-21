import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  serviceType: { type: String, required: true },
  maintenanceCost: { type: Number, default: 0 },
  items: [
    {
      barcode: String,
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
