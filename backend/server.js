const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const JWT_SECRET =
  process.env.JWT_SECRET || 'campusbite-development-secret';

/* ==========================================
   MIDDLEWARE
========================================== */

app.use(cors());
app.use(express.json());

/* ==========================================
   ADMIN AUTHENTICATION
========================================== */

function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Admin authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired admin token'
    });
  }
}

/* ==========================================
   HOME
========================================== */

app.get('/', (req, res) => {
  res.json({
    message: 'CampusBite API is running'
  });
});

/* ==========================================
   CUSTOMER AUTH API
========================================== */

// Register customer
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'student')`,
      [name, email, passwordHash]
    );

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: result.insertId,
        name,
        email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      error: 'Could not register user'
    });
  }
});

// Login customer
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);

    res.status(500).json({
      error: 'Could not log in'
    });
  }
});

/* ==========================================
   ADMIN LOGIN
========================================== */

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const [users] = await db.query(
      `SELECT *
       FROM users
       WHERE email = ?
       AND role = 'admin'`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid admin credentials'
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Invalid admin credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: '2h'
      }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);

    res.status(500).json({
      error: 'Could not log in as admin'
    });
  }
});

/* ==========================================
   MENU API
========================================== */

// Get all available menu items
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM menu_items
       WHERE available = TRUE
       ORDER BY id`
    );

    const menu = rows.map(item => ({
      ...item,
      price: Number(item.price),
      dietary: item.dietary
        ? item.dietary
            .split(',')
            .map(diet => diet.trim())
        : [],
      available: Boolean(item.available)
    }));

    res.json(menu);
  } catch (error) {
    console.error('Get menu error:', error);

    res.status(500).json({
      error: 'Could not load menu'
    });
  }
});

// Add menu item - ADMIN ONLY
app.post('/api/menu', requireAdmin, async (req, res) => {
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
    console.error('Add menu error:', error);

    res.status(500).json({
      error: 'Could not add menu item'
    });
  }
});

// Edit menu item - ADMIN ONLY
app.put('/api/menu/:id', requireAdmin, async (req, res) => {
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
       SET name = ?,
           description = ?,
           price = ?,
           category = ?,
           weekday = ?,
           dietary = ?
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
    console.error('Update menu error:', error);

    res.status(500).json({
      error: 'Could not update menu item'
    });
  }
});

// Delete menu item - ADMIN ONLY
app.delete('/api/menu/:id', requireAdmin, async (req, res) => {
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
    console.error('Delete menu error:', error);

    res.status(500).json({
      error: 'Could not delete menu item'
    });
  }
});

/* ==========================================
   SHOPPING CART API
========================================== */

// Get shopping cart
app.get('/api/cart', (req, res) => {
  res.json(getCart());
});

// Add product to cart
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

// Update cart quantity
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

// Remove product from cart
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

// Clear cart
app.delete('/api/cart', (req, res) => {
  const cart = clearCart();

  res.json(cart);
});

/* ==========================================
   ORDERS API
========================================== */

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

// Get all orders - ADMIN ONLY
app.get('/api/orders', requireAdmin, (req, res) => {
  res.json(getOrders());
});

// Get one order - ADMIN ONLY
app.get('/api/orders/:id', requireAdmin, (req, res) => {
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

// Update order status - ADMIN ONLY
app.put('/api/orders/:id/status', requireAdmin, (req, res) => {
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

/* ==========================================
   ERROR HANDLER
========================================== */

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  res.status(500).json({
    error: 'Internal server error'
  });
});

/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});