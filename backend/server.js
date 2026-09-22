const express = require('express');
const fs = require('fs');
const path = require('path');

const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('./cart/cart');

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require('./orders/order');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());


// ==========================================
// HOME
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: 'CampusBite API is running'
  });
});


// ==========================================
// MENU API
// ==========================================

// Get all menu items
app.get('/api/menu', (req, res) => {
  const menuPath = path.join(__dirname, 'data', 'menu.json');

  try {
    const menu = JSON.parse(
      fs.readFileSync(menuPath, 'utf8')
    );

    res.json(menu);
  } catch (error) {
    res.status(500).json({
      error: 'Could not load menu'
    });
  }
});


// ==========================================
// SHOPPING CART API
// ==========================================

// Get shopping cart
app.get('/api/cart', (req, res) => {
  res.json(getCart());
});


// Add product to shopping cart
app.post('/api/cart', (req, res) => {
  const { product, quantity } = req.body;

  if (
    !product ||
    !product.id ||
    !product.name ||
    !product.price
  ) {
    return res.status(400).json({
      error: 'Product information is required'
    });
  }

  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
    return res.status(400).json({
      error: 'Quantity must be a positive integer'
    });
  }

  const cart = addToCart(
    product,
    quantity || 1
  );

  res.status(201).json(cart);
});


// Remove product from shopping cart
app.delete('/api/cart/:id', (req, res) => {
  const productId = Number(req.params.id);

  if (Number.isNaN(productId)) {
    return res.status(400).json({
      error: 'Invalid product ID'
    });
  }

  const cart = removeFromCart(productId);

  res.json(cart);
});


// Clear shopping cart
app.delete('/api/cart', (req, res) => {
  const cart = clearCart();

  res.json(cart);
});


// ==========================================
// ORDERS API
// ==========================================

// Create a new order
app.post('/api/orders', (req, res) => {
  const { items } = req.body;

  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error: 'Order must contain at least one item'
    });
  }

  const order = createOrder(items);

  res.status(201).json(order);
});


// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(getOrders());
});


// Get one order by ID
app.get('/api/orders/:id', (req, res) => {
  const orderId = Number(req.params.id);

  if (Number.isNaN(orderId)) {
    return res.status(400).json({
      error: 'Invalid order ID'
    });
  }

  const order = getOrderById(orderId);

  if (!order) {
    return res.status(404).json({
      error: 'Order not found'
    });
  }

  res.json(order);
});


// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  if (Number.isNaN(orderId)) {
    return res.status(400).json({
      error: 'Invalid order ID'
    });
  }

  const allowedStatuses = [
    'Pending',
    'Preparing',
    'Ready for pickup',
    'Completed'
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid order status',
      allowedStatuses
    });
  }

  const order = updateOrderStatus(
    orderId,
    status
  );

  if (!order) {
    return res.status(404).json({
      error: 'Order not found'
    });
  }

  res.json(order);
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});