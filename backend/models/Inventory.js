import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  quantity: { type: Number, required: true, default: 0 },
  buyPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
