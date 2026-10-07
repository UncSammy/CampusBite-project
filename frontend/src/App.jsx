import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAdmin, setShowAdmin] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Lunch',
    weekday: 'Monday',
    dietary: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');

  const [cart, setCart] = useState([]);
  const [cartMessage, setCartMessage] = useState('');
  const [showCart, setShowCart] = useState(false);

  const [orders, setOrders] = useState([]);
  const [orderMessage, setOrderMessage] = useState('');

  const [showLogin, setShowLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

const getAdminHeaders = (json = false) => {
  const token = getAdminToken();

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`
  };
};
  const [loginMessage, setLoginMessage] = useState('');

  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [customerMessage, setCustomerMessage] = useState('');

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        'http://localhost:3000/api/menu'
      );
      if (!response.ok) {
        throw new Error('Could not load the menu.');
      }
      const data = await response.json();
      setMenu(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cart');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not load cart.');
      }
      setCart(data);
    } catch (err) {
      setCartMessage(err.message);
    }
  };
  useEffect(() => {
    fetchMenu();
    fetchCart();
  }, []);
  const closePages=()=>{
  setShowAdmin(false);
  setShowLogin(false);
  setShowCustomerLogin(false);
  setShowRegister(false);
  setShowCart(false);
};
const goHome=(event)=>{
  event?.preventDefault();
  closePages();
  setAdminMessage('');
  setLoginMessage('');
  setCustomerMessage('');
  window.scrollTo({top:0,behavior:'smooth'});
};
const goToSection=(event,sectionId)=>{
  event.preventDefault();
  closePages();
  setAdminMessage('');
  setLoginMessage('');
  setCustomerMessage('');
  setTimeout(()=>{
    document.getElementById(sectionId)?.scrollIntoView({behavior:'smooth'});
  },0);
};
const openAdmin=async(event)=>{
  event.preventDefault();
  closePages();
  if(!isAdminLoggedIn){
    setShowLogin(true);
    setLoginMessage('');
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  setShowAdmin(true);
  setAdminMessage('');
  await fetchOrders();
  window.scrollTo({top:0,behavior:'smooth'});
};
  const scrollToMenu = () => {
    document
      .getElementById('menu')
      ?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      category: 'Lunch',
      weekday: 'Monday',
      dietary: ''
    });
    setEditingId(null);
  };
  const handleEdit = (item) => {
  setEditingId(item.id);

  setForm({
    name: item.name || '',
    description: item.description || '',
    price: item.price || '',
    category: item.category || 'Lunch',
    weekday: item.weekday || 'Monday',
    dietary: Array.isArray(item.dietary)
      ? item.dietary[0] || ''
      : item.dietary || ''
  });

  setAdminMessage('');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
  const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    setAdminMessage('');

    const foodData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      weekday: form.weekday,
      dietary: form.dietary
        ? [form.dietary]
        : []
    };

    let url = 'http://localhost:3000/api/menu';
    let method = 'POST';

    if (editingId) {
      url = `http://localhost:3000/api/menu/${editingId}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: getAdminHeaders(true),
      body: JSON.stringify(foodData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not save menu item.'
      );
    }

    if (editingId) {
      setAdminMessage('Food updated successfully!');
    } else {
      setAdminMessage('Food added successfully!');
    }

    resetForm();
    await fetchMenu();
  } catch (err) {
    setAdminMessage(err.message);
  }
};
 const handleDelete = async (id) => {
  const shouldDelete = window.confirm(
    'Are you sure you want to delete this food?'
  );

  if (!shouldDelete) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/menu/${id}`,
      {
        method: 'DELETE',
        headers: getAdminHeaders()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not delete menu item.'
      );
    }

    if (editingId === id) {
      resetForm();
    }

    setAdminMessage('Food deleted successfully!');
    await fetchMenu();
  } catch (err) {
    setAdminMessage(err.message);
  }
};
  const handleAddToCart = async (item) => {
    try {
      setCartMessage('');
      const response = await fetch(
        'http://localhost:3000/api/cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product: {
              id: item.id,
              name: item.name,
              price: Number(item.price)
            },
            quantity: 1
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || 'Could not add item to cart.'
        );
      }
      setCart(data);
      setCartMessage(`${item.name} added to order!`);
    } catch (err) {
      setCartMessage(err.message);
    }
  };
  const handleQuantityChange = async (id, newQuantity) => {
  if (newQuantity < 1) {
    return;
  }
  try {
    const response = await fetch(
      `http://localhost:3000/api/cart/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: newQuantity
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || 'Could not update quantity.'
      );
    }
    setCart(data);
    setCartMessage('');
  } catch (err) {
    setCartMessage(err.message);
  }
};
  const handleRemoveFromCart = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/cart/${id}`,
      {
        method: 'DELETE'
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Could not remove item from cart.');
    }
    setCart(data);
    setCartMessage('Item removed from cart.');
  } catch (err) {
    setCartMessage(err.message);
  }
};
const handleClearCart = async () => {
  try {
    const response = await fetch(
      'http://localhost:3000/api/cart',
      {
        method: 'DELETE'
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Could not clear cart.');
    }
    setCart(data);
    setCartMessage('Cart cleared successfully!');
  } catch (err) {
    setCartMessage(err.message);
  }
};
const handlePlaceOrder = async () => {
  if (cart.length === 0) {
    setCartMessage('Your cart is empty.');
    return;
  }
  try {
    setCartMessage('Placing order...');
    const response = await fetch(
      'http://localhost:3000/api/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || 'Could not place order.'
      );
    }
    const clearResponse = await fetch(
      'http://localhost:3000/api/cart',
      { method: 'DELETE' }
    );
    const clearedCart = await clearResponse.json();
    if (!clearResponse.ok) {
      throw new Error(
        'Order placed, but cart could not be cleared.'
      );
    }
    setCart(clearedCart);
    setCartMessage(
      `Order placed successfully! Order ID: ${data.id}`
    );
  } catch (err) {
    setCartMessage(err.message);
  }
};
const fetchOrders = async () => {
  try {
    const response = await fetch(
      'http://localhost:3000/api/orders',
      {
        headers: getAdminHeaders()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Could not load orders.');
    }

    setOrders(data);
  } catch (err) {
    setOrderMessage(err.message);
  }
};
const handleOrderStatusChange = async (orderId, status) => {
  try {
    setOrderMessage('');

    const response = await fetch(
      `http://localhost:3000/api/orders/${orderId}/status`,
      {
        method: 'PUT',
        headers: getAdminHeaders(true),
        body: JSON.stringify({ status })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not update order status.'
      );
    }

    setOrderMessage('Order status updated.');
    await fetchOrders();
  } catch (err) {
    setOrderMessage(err.message);
  }
};
  return (
    <div className="app">
      <nav className="navbar">
        <a
          className="logo"
          href="#"
          onClick={goHome}
        >
          Campus<span>Bite</span>
        </a>
        <div className="nav-links">
          <a href="#" onClick={goHome}>
            Home
          </a>
          <a
            href="#menu"
            onClick={(event) =>
              goToSection(event, 'menu')
            }
          >
            Menu
          </a>
          <a
            href="#how-it-works"
            onClick={(event) =>
              goToSection(event, 'how-it-works')
            }
          >
            How it works
          </a>
          <a
            href="#admin"
            onClick={openAdmin}
          >
            Admin
          </a>
        </div>
        <button className="cart-button" onClick={()=>{
  closePages();
  setShowCart(true);
  window.scrollTo({top:0,behavior:'smooth'});
}}>
  Cart ({cart.length})
</button>
<button className="login-button" onClick={()=>{
  if(currentUser){
    setCurrentUser(null);
    closePages();
    setCustomerMessage('');
    window.scrollTo({top:0,behavior:'smooth'});
  }else{
    closePages();
    setShowCustomerLogin(true);
    setCustomerMessage('');
    window.scrollTo({top:0,behavior:'smooth'});
  }
}}>
  <button onClick={() => {
  setShowCustomerLogin(false);
  setShowRegister(true);
}}>
  Register
</button>
  {currentUser?`Logout (${currentUser.name})`:'Sign in'}
</button>
      </nav>
      <main>
        {showLogin ? (
  <section className="menu-section">
    <div className="section-heading">
      <div>
        <span className="eyebrow">ADMIN ACCESS</span>
        <h2>Admin Login</h2>
      </div>
      <p>Sign in to manage the CampusBite menu and orders.</p>
    </div>
    <form
      className="admin-form"
     onSubmit={async (event) => {
  event.preventDefault();
  setLoginMessage('Logging in...');

  try {
    const response = await fetch(
      'http://localhost:3000/api/admin/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    localStorage.setItem('adminToken', data.token);

    setIsAdminLoggedIn(true);
    setShowLogin(false);
    setShowAdmin(true);
    setLoginMessage('');

    await fetchOrders(data.token);
  } catch (error) {
    setLoginMessage(error.message);
  }
}}
    >
     
      <div className="form-group">
  <label>Email</label>
  <input
    type="email"
    value={loginForm.email}
    onChange={(event) =>
      setLoginForm({
        ...loginForm,
        email: event.target.value
      })
    }
    required
  />
</div>
<div className="form-group">
  <label>Password</label>
  <input
    type="password"
    value={loginForm.password}
    onChange={(event) =>
      setLoginForm({
        ...loginForm,
        password: event.target.value
      })
    }
    required
  />

</div>
      {loginMessage && (
        <p className="status-message">{loginMessage}</p>
      )}
      <button className="add-button" type="submit">
        Sign In
      </button>
    </form>
  </section>
) : showCustomerLogin ? (
  <section className="menu-section">
    <div className="section-heading">
      <div>
        <span className="eyebrow">CUSTOMER ACCESS</span>
        <h2>Customer Sign In</h2>
      </div>
      <p>Sign in to order and manage your CampusBite account.</p>
    </div>
    <form
      className="admin-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setCustomerMessage('Signing in...');
        try {
          const response = await fetch(
            'http://localhost:3000/api/login',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: customerForm.email,
                password: customerForm.password
              })
            }
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }
          setCurrentUser(data.user);
          setCustomerMessage('');
          setShowCustomerLogin(false);
          setCustomerForm({
            name: '',
            email: '',
            password: ''
          });
        } catch (error) {
          setCustomerMessage(error.message);
        }
      }}
    >
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={customerForm.email}
          onChange={(event) =>
            setCustomerForm({
              ...customerForm,
              email: event.target.value
            })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={customerForm.password}
          onChange={(event) =>
            setCustomerForm({
              ...customerForm,
              password: event.target.value
            })
          }
          required
        />
      </div>
      {customerMessage && (
        <p className="status-message">{customerMessage}</p>
      )}
      <button className="add-button" type="submit">
        Sign In
      </button>
      <button
        className="login-button"
        type="button"
        onClick={() => {
          setShowCustomerLogin(false);
          setShowRegister(true);
          setCustomerMessage('');
        }}
      >
        Create account
      </button>
    </form>
  </section>
) : showRegister ? (
  <section className="menu-section">
    <div className="section-heading">
      <div>
        <span className="eyebrow">JOIN CAMPUSBITE</span>
        <h2>Create Account</h2>
      </div>
      <p>Create an account to order your meals online.</p>
    </div>
    <form
      className="admin-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setCustomerMessage('Creating account...');
        try {
          const response = await fetch(
            'http://localhost:3000/api/register',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: customerForm.name,
                email: customerForm.email,
                password: customerForm.password
              })
            }
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.error || 'Registration failed'
            );
          }
          setCurrentUser(data.user);
          setCustomerMessage('');
          setShowRegister(false);
          setCustomerForm({
            name: '',
            email: '',
            password: ''
          });
        } catch (error) {
          setCustomerMessage(error.message);
        }
      }}
    >
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={customerForm.name}
          onChange={(event) =>
            setCustomerForm({
              ...customerForm,
              name: event.target.value
            })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={customerForm.email}
          onChange={(event) =>
            setCustomerForm({
              ...customerForm,
              email: event.target.value
            })
          }
          required
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          minLength="6"
          value={customerForm.password}
          onChange={(event) =>
            setCustomerForm({
              ...customerForm,
              password: event.target.value
            })
          }
          required
        />
      </div>
      {customerMessage && (
        <p className="status-message">
          {customerMessage}
        </p>
      )}
      <button className="add-button" type="submit">
        Create Account
      </button>
      <button
        className="login-button"
        type="button"
        onClick={() => {
          setShowRegister(false);
          setShowCustomerLogin(true);
          setCustomerMessage('');
        }}
      >
        Already have an account? Sign in
      </button>
    </form>
  </section>
) : showCart ? (
  <section className="menu-section">
    <div className="section-heading">
      <div>
        <span className="eyebrow">YOUR ORDER</span>
        <h2>Shopping Cart</h2>
      </div>
    </div>
    {cartMessage && (
      <p className="status-message">{cartMessage}</p>
    )}
    {cart.length === 0 ? (
      <p className="status-message">
        Your cart is empty.
      </p>
    ) : (
      <div>
        {cart.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <div className="quantity-controls">
  <button
    onClick={() =>
      handleQuantityChange(item.id, item.quantity - 1)
    }
    disabled={item.quantity <= 1}
  >
    −
  </button>
  <span>{item.quantity}</span>
  <button
    onClick={() =>
      handleQuantityChange(item.id, item.quantity + 1)
    }
  >
    +
  </button>
</div>
            <strong>
              €{(
                Number(item.price) *
                item.quantity
              ).toFixed(2)}
            </strong>
            <button
  className="remove-button"
  onClick={() => handleRemoveFromCart(item.id)}
>
  Remove
</button>
          </div>
        ))}
        <div className="cart-total">
  <h3>
    Total: €
    {cart
      .reduce(
        (total, item) =>
          total + Number(item.price) * item.quantity,
        0
      )
      .toFixed(2)}
  </h3>
</div>
<button
  className="delete-button"
  onClick={handleClearCart}
>
  Clear Cart
</button>
<button
  className="place-order-button"
  onClick={handlePlaceOrder}
>
  Place Order
</button>
  </div>
    )}
  </section>
) : showAdmin ? (
          <section
            className="menu-section"
            id="admin"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  ADMIN PANEL
                </span>
                <h2>Menu management</h2>
              </div>
              <p>
                Add, edit and remove CampusBite menu items.
              </p>
            </div>
            {adminMessage && (
              <p className="status-message">
                {adminMessage}
              </p>
            )}
            <div className="admin-form-card">
              <div className="admin-form-heading">
                <span className="eyebrow">
                  MENU EDITOR
                </span>
                <h3>
                  {editingId
                    ? 'Edit food'
                    : 'Add new food'}
                </h3>
              </div>
              <form
                className="admin-form"
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label>Food name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Chicken Wrap"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (€)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="7.90"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group form-group-wide">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Short description"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                  >
                    <option value="Breakfast">
                      Breakfast
                    </option>
                    <option value="Lunch">
                      Lunch
                    </option>
                    <option value="Dinner">
                      Dinner
                    </option>
                    <option value="Snack">
                      Snack
                    </option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Weekday</label>
                  <select
                    name="weekday"
                    value={form.weekday}
                    onChange={handleFormChange}
                  >
                    <option value="Monday">
                      Monday
                    </option>
                    <option value="Tuesday">
                      Tuesday
                    </option>
                    <option value="Wednesday">
                      Wednesday
                    </option>
                    <option value="Thursday">
                      Thursday
                    </option>
                    <option value="Friday">
                      Friday
                    </option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dietary</label>
                  <select
                    name="dietary"
                    value={form.dietary}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      None
                    </option>
                    <option value="halal">
                      Halal
                    </option>
                    <option value="vegetarian">
                      Vegetarian
                    </option>
                    <option value="vegan">
                      Vegan
                    </option>
                    <option value="gluten-free">
                      Gluten free
                    </option>
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    className="primary-button"
                    type="submit"
                  >
                    {editingId
                      ? 'Save changes'
                      : 'Add food'}
                    <span>
                      {editingId ? '✓' : '+'}
                    </span>
                  </button>
                  {editingId && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            {loading && (
              <p className="status-message">
                Loading menu...
              </p>
            )}
            {error && (
              <p className="error-message">
                {error}
              </p>
            )}
            {!loading && !error && (
              <div className="menu-grid">
                {menu.map((item, index) => (
                  <article
                    className={`menu-card ${
                    item.weekday?.toLowerCase() ===
                    new Date()
                    .toLocaleDateString('en-US', { weekday: 'long' })
                    .toLowerCase()
                  })
                  ? 'today-menu'
                  : ''
                }`}
                    key={item.id}
                  >
                    <div
                      className={`food-placeholder food-${index + 1}`}
                    >
                      <span>
                        {item.name
                          ?.toLowerCase()
                          .includes('pasta')
                          ? '🍝'
                          : '🍔'}
                      </span>
                      <div className="dietary-container">
                        {item.dietary?.map((diet) => (
                          <span
                            className="dietary-tag"
                            key={diet}
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-title">
                        <h3>{item.name}</h3>
                        <strong>
                          €{Number(item.price).toFixed(2)}
                        </strong>
                      </div>
                      <p>{item.description}</p>
                      <p>
                        <strong>Day:</strong>{' '}
                        {item.weekday || 'Not set'}
                      </p>
                      <div className="admin-card-actions">
                        <button
                          className="add-button"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          Edit
                          <span>✎</span>
                        </button>
                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="order-management">
  <div className="section-heading">
    <div>
      <span className="eyebrow">ORDERS</span>
      <h2>Order management</h2>
    </div>
    <p>View orders and update their status.</p>
  </div>
  {orderMessage && (
    <p className="status-message">{orderMessage}</p>
  )}
  {orders.length === 0 ? (
    <p className="status-message">No orders yet.</p>
  ) : (
    <div className="admin-grid">
      {orders.map((order) => (
        <article className="admin-card" key={order.id}>
          <h3>Order #{order.id}</h3>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <div>
            {order.items?.map((item, index) => (
              <p key={`${order.id}-${item.id}-${index}`}>
                {item.name} × {item.quantity}
              </p>
            ))}
          </div>
          <select
            value={order.status}
            onChange={(event) =>
              handleOrderStatusChange(
                order.id,
                event.target.value
              )
            }
          >
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </article>
      ))}
    </div>
  )}
</div>
          </section>
        ) : (
          <>
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">
                  CAMPUS FOOD, MADE EASY
                </span>
                <h1>
                  Good food.
                  <br />
                  <span>Zero wait.</span>
                </h1>
                <p>
                  Fresh and affordable meals for busy campus
                  days. Browse the menu, order online and
                  pick up when it suits you.
                </p>
                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={scrollToMenu}
                  >
                    Explore menu
                    <span>→</span>
                  </button>
                  <a
                    className="secondary-button"
                    href="#how-it-works"
                  >
                    How it works
                  </a>
                </div>
                <div className="hero-details">
                  <div>
                    <strong>Fresh</strong>
                    <span>Made daily</span>
                  </div>
                  <div>
                    <strong>Fast</strong>
                    <span>Easy pickup</span>
                  </div>
                  <div>
                    <strong>Flexible</strong>
                    <span>Dietary options</span>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="visual-card">
                  <span className="visual-label">
                    TODAY'S PICK
                  </span>
                  <div className="plate">
                    <span>🥗</span>
                  </div>
                  <div className="visual-info">
                    <div>
                      <small>Campus favourite</small>
                      <h3>
                        Fresh lunch, ready to go.
                      </h3>
                    </div>
                    <span className="rating">
                      ★ 4.8
                    </span>
                  </div>
                </div>
                <div className="pickup-badge">
                  <span>✓</span>
                  <div>
                    <strong>Quick pickup</strong>
                    <small>Skip the queue</small>
                  </div>
                </div>
              </div>
            </section>
            <section
              className="menu-section"
              id="menu"
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    WHAT'S COOKING?
                  </span>
                  <h2>
                  Today's menu
                  </h2>
                </div>
                <p>
                  Simple, tasty meals with clear prices
                  and dietary information.
                </p>
              </div>
              {loading && (
                <p className="status-message">
                  Loading today's menu...
                </p>
              )}
              {error && (
                <p className="error-message">
                  {error}
                </p>
              )}
              {!loading && !error && (
                <div className="menu-grid">
                  {menu.map((item, index) => (
                    <article
                      className={`menu-card ${
                      item.weekday?.toLowerCase() ===
                      new Date()
                      .toLocaleDateString('en-US', { weekday: 'long' })
                      .toLowerCase()
                      ? 'today-menu'
                      : ''
                }`}
                      key={item.id}
                    >
                      <div
                        className={`food-placeholder food-${index + 1}`}
                      >
                        <span>
                          {item.name
                            ?.toLowerCase()
                            .includes('pasta')
                            ? '🍝'
                            : '🍔'}
                        </span>
                        <div className="dietary-container">
                          {item.dietary?.map((diet) => (
                            <span
                              className="dietary-tag"
                              key={diet}
                            >
                              {diet}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="card-content">
                        <div className="card-title">
                          <h3>{item.name}</h3>
                          <strong>
                            €{Number(item.price).toFixed(2)}
                          </strong>
                        </div>
                        <p>{item.description}</p>
                        <button
                        className="add-button"
                        onClick={() => handleAddToCart(item)}>
                          Add to order
                          <span>+</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <section
              className="how-section"
              id="how-it-works"
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    NO MORE QUEUES
                  </span>
                  <h2>Lunch in three steps.</h2>
                </div>
              </div>
              <div className="steps">
                <article>
                  <span className="step-number">
                    01
                  </span>
                  <h3>Choose your food</h3>
                  <p>
                    Browse today's meals and find
                    something you like.
                  </p>
                </article>
                <article>
                  <span className="step-number">
                    02
                  </span>
                  <h3>Place your order</h3>
                  <p>
                    Add your meals to the cart and
                    choose a pickup time.
                  </p>
                </article>
                <article>
                  <span className="step-number">
                    03
                  </span>
                  <h3>Pick it up</h3>
                  <p>
                    We'll prepare your order so it's
                    ready when you arrive.
                  </p>
                </article>
              </div>
            </section>
          </>
        )}
      </main>
      <footer>
        <a
          className="logo footer-logo"
          href="#"
          onClick={goHome}
        >
          Campus<span>Bite</span>
        </a>
        <p>Fresh food for busy campus days.</p>
        <small>© 2026 CampusBite</small>
      </footer>
    </div>
  );
}
export default App;
