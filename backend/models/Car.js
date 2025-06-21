import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  model: { type: String, required: true },
  plate: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Car', carSchema);
