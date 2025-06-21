import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/elrayan';

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
import clientsRoutes from './routes/clients.js';
import carsRoutes from './routes/cars.js';
import inventoryRoutes from './routes/inventory.js';
import ordersRoutes from './routes/orders.js';
app.use('/api/clients', clientsRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Elrayan Auto Service API is running');
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
