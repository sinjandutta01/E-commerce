const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
const authRoutes = require('./routes/authroute');
app.use('/api', authRoutes);

const categoryRoutes = require('./routes/categoriesRoutes');
app.use('/api', categoryRoutes);


const productRoutes = require('./routes/productsRoutes');
app.use('/api', productRoutes);


const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api', inventoryRoutes);


const cartRoutes = require('./routes/cartRoutes');
app.use('/api', cartRoutes);


const cartItemsRoutes = require('./routes/cartItemsRoutes');
app.use('/api', cartItemsRoutes);

const addressRoutes = require("./routes/addressRoutes");
app.use("/api", addressRoutes);


const orderRoutes = require("./routes/orderRoutes");
app.use("/api", orderRoutes);


const orderItemsRoutes = require("./routes/orderItemsRoutes");
app.use("/api", orderItemsRoutes);


const paymentsRoutes = require("./routes/paymentsRoutes");
app.use("/api", paymentsRoutes);


const reviewsRoutes = require("./routes/reviewsRoutes");
app.use("/api", reviewsRoutes);


const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api", notificationRoutes);

const deliveryRoutes = require("./routes/deliveryRoutes");
app.use("/api", deliveryRoutes);


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
