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



  useEffect(() => {

    fetchMenu();

  }, []);



  const goHome = (event) => {

    event?.preventDefault();



    setShowAdmin(false);

    setAdminMessage('');



    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  };



  const goToSection = (event, sectionId) => {

    event.preventDefault();

    setShowAdmin(false);



    setTimeout(() => {

      document

        .getElementById(sectionId)

        ?.scrollIntoView({ behavior: 'smooth' });

    }, 0);

  };



  const openAdmin = (event) => {

    event.preventDefault();



    setShowAdmin(true);

    setAdminMessage('');



    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

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

        headers: {

          'Content-Type': 'application/json'

        },

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



  const handleEdit = (item) => {

    setEditingId(item.id);



    setForm({

      name: item.name || '',

      description: item.description || '',

      price: item.price || '',

      category: item.category || 'Lunch',

      weekday: item.weekday || 'Monday',

      dietary: item.dietary?.[0] || ''

    });



    setAdminMessage('');



    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

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
          method: 'DELETE'
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

        <button className="cart-button">

          Cart ({cart.length})

        </button>

        <button className="login-button">

          Sign in

        </button>

      </nav>



      <main>

        {showAdmin ? (

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

                    className="menu-card"

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



                  <h2>Today's menu</h2>

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

                      className="menu-card"

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