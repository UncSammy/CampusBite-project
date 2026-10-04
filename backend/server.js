const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
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


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
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
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE available = TRUE ORDER BY id'
    );

    const menu = rows.map(item => ({
      ...item,
      price: Number(item.price),
      dietary: item.dietary
        ? item.dietary.split(',').map(diet => diet.trim())
        : [],
      available: Boolean(item.available)
    }));

    res.json(menu);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Could not load menu'
    });
  }
});


// Add menu item
app.post('/api/menu', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      weekday,
      dietary
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        error: 'Name and price are required'
      });
    }

    const foodPrice = Number(price);

    if (Number.isNaN(foodPrice) || foodPrice < 0) {
      return res.status(400).json({
        error: 'Invalid price'
      });
    }

    const diet = Array.isArray(dietary)
      ? dietary.join(',')
      : dietary || null;

    const [result] = await db.query(
      `INSERT INTO menu_items
      (name, description, price, category, weekday, dietary)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        foodPrice,
        category || 'Lunch',
        weekday || null,
        diet
      ]
    );

    res.status(201).json({
      message: 'Menu item added',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Could not add menu item'
    });
  }
});


// Edit menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const menuId = Number(req.params.id);

    const {
      name,
      description,
      price,
      category,
      weekday,
      dietary
    } = req.body;

    if (Number.isNaN(menuId)) {
      return res.status(400).json({
        error: 'Invalid menu ID'
      });
    }

    if (!name || price === undefined) {
      return res.status(400).json({
        error: 'Name and price are required'
      });
    }

    const foodPrice = Number(price);

    if (Number.isNaN(foodPrice) || foodPrice < 0) {
      return res.status(400).json({
        error: 'Invalid price'
      });
    }

    const diet = Array.isArray(dietary)
      ? dietary.join(',')
      : dietary || null;

    const [result] = await db.query(
      `UPDATE menu_items
       SET name = ?, description = ?, price = ?,
       category = ?, weekday = ?, dietary = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        foodPrice,
        category || 'Lunch',
        weekday || null,
        diet,
        menuId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    res.json({
      message: 'Menu item updated'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Could not update menu item'
    });
  }
});


// Delete menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const menuId = Number(req.params.id);

    if (Number.isNaN(menuId)) {
      return res.status(400).json({
        error: 'Invalid menu ID'
      });
    }

    const [result] = await db.query(
      'DELETE FROM menu_items WHERE id = ?',
      [menuId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    res.json({
      message: 'Menu item deleted'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Could not delete menu item'
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
    product.price === undefined
  ) {
    return res.status(400).json({
      error: 'Product information is required'
    });
  }

  if (
    quantity !== undefined &&
    (!Number.isInteger(quantity) || quantity <= 0)
  ) {
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


// Update product quantity
app.patch('/api/cart/:id', (req, res) => {
  const productId = Number(req.params.id);
  const { quantity } = req.body;

  if (Number.isNaN(productId)) {
    return res.status(400).json({
      error: 'Invalid product ID'
    });
  }

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      error: 'Quantity must be a positive integer'
    });
  }

  const cart = updateCartQuantity(
    productId,
    quantity
  );

  if (!cart) {
    return res.status(404).json({
      error: 'Product not found in cart'
    });
  }

  res.json(cart);
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

// Create order
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


// Get order by ID
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

  const allowedStatuses = [
    'Pending',
    'Preparing',
    'Ready',
    'Completed',
    'Cancelled'
  ];

  if (Number.isNaN(orderId)) {
    return res.status(400).json({
      error: 'Invalid order ID'
    });
  }

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