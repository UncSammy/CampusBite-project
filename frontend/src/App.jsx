import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/menu');

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

    fetchMenu();
  }, []);

  const scrollToMenu = () => {
    document
      .getElementById('menu')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#">
          Campus<span>Bite</span>
        </a>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#menu">Menu</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <button className="login-button">Sign in</button>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">CAMPUS FOOD, MADE EASY</span>

            <h1>
              Good food.
              <br />
              <span>Zero wait.</span>
            </h1>

            <p>
              Fresh and affordable meals for busy campus days.
              Browse the menu, order online and pick up when it suits you.
            </p>

            <div className="hero-actions">
              <button className="primary-button" onClick={scrollToMenu}>
                Explore menu
                <span>→</span>
              </button>

              <a className="secondary-button" href="#how-it-works">
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
              <span className="visual-label">TODAY'S PICK</span>

              <div className="plate">
                <span>🥗</span>
              </div>

              <div className="visual-info">
                <div>
                  <small>Campus favourite</small>
                  <h3>Fresh lunch, ready to go.</h3>
                </div>

                <span className="rating">★ 4.8</span>
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

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WHAT'S COOKING?</span>
              <h2>Today's menu</h2>
            </div>

            <p>
              Simple, tasty meals with clear prices and dietary information.
            </p>
          </div>

          {loading && <p className="status-message">Loading today's menu...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && (
            <div className="menu-grid">
              {menu.map((item, index) => (
                <article className="menu-card" key={item.id}>
                  <div className={`food-placeholder food-${index + 1}`}>
                    <span>{index === 2 ? '🍝' : '🍔'}</span>

                    <div className="dietary-container">
                      {item.dietary?.map((diet) => (
                        <span className="dietary-tag" key={diet}>
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="card-title">
                      <h3>{item.name}</h3>
                      <strong>€{Number(item.price).toFixed(2)}</strong>
                    </div>

                    <p>{item.description}</p>

                    <button className="add-button">
                      Add to order
                      <span>+</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NO MORE QUEUES</span>
              <h2>Lunch in three steps.</h2>
            </div>
          </div>

          <div className="steps">
            <article>
              <span className="step-number">01</span>
              <h3>Choose your food</h3>
              <p>Browse today's meals and find something you like.</p>
            </article>

            <article>
              <span className="step-number">02</span>
              <h3>Place your order</h3>
              <p>Add your meals to the cart and choose a pickup time.</p>
            </article>

            <article>
              <span className="step-number">03</span>
              <h3>Pick it up</h3>
              <p>We'll prepare your order so it's ready when you arrive.</p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <a className="logo footer-logo" href="#">
          Campus<span>Bite</span>
        </a>

        <p>Fresh food for busy campus days.</p>

        <small>© 2026 CampusBite</small>
      </footer>
    </div>
  );
}

export default App;