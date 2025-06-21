import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
