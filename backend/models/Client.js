import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Client', clientSchema);
