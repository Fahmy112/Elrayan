import mongoose from 'mongoose';

const CarSchema = new mongoose.Schema({
  model: { type: String, required: true },
  plate: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Car || mongoose.model('Car', CarSchema);
