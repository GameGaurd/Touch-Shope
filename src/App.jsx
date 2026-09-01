import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { buildCategorySummary, fetchCatalogData, slugify } from './data/items';

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(numeric);
};

function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

function HomePage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 180);

  useEffect(() => {
    let active = true;
    fetchCatalogData()
      .then((data) => {
        if (!active) return;
        setItems(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Could not load the catalog.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = ['All', ...new Set(items.map((item) => item.category).filter(Boolean))];
    return unique;
  }, [items]);

  const categoryCards = useMemo(
    () => buildCategorySummary(items).slice(0, 8),
    [items]
  );

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const result = items.filter((item) => {
      const categoryMatches = selectedCategory === 'All' || item.category === selectedCategory;
      const stockMatches =
        stockFilter === 'All' ||
        (stockFilter === 'In Stock' && item.inStock) ||
        (stockFilter === 'Out of Stock' && !item.inStock);
      const haystack = [
        item.name,
        item.category,
        item.type,
        item.description,
        item.id,
        item.rawStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const searchMatches = !query || haystack.includes(query);
      return categoryMatches && stockMatches && searchMatches;
    });

    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        result.sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.price - b.price);
        break;
    }

    return result;
  }, [items, debouncedSearch, selectedCategory, stockFilter, sortBy]);

  const showingText = `${filteredItems.length} of ${items.length} items`;

  if (loading) {
    return <CatalogPageSkeleton />;
  }

  return (
    <>
      <header className="topbar">
        <div className="container nav-row">
          <div className="brand">🛍️ Liam Shoppee</div>
          <nav className="main-nav">
            <a href="#">Home</a>
            <a href="#items">Items</a>
            <a href="#categories">Categories</a>
          </nav>
          <div className="nav-search desktop-only">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search items..." />
          </div>
          <button className="menu-button mobile-only" aria-label="Open menu">☰</button>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div>
            <p className="eyebrow">Liam Shoppee Items</p>
            <h1>Browse our available in-game items</h1>
            <div className="hero-search">
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search items..." />
            </div>
          </div>
        </section>

        <section className="container catalog-shell" id="items">
          <div className="filters-panel">
            <div className="filter-group">
              <label>Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Availability</label>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="name-asc">Name: A → Z</option>
                <option value="name-desc">Name: Z → A</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="catalog-meta">
            <p>Showing {showingText}</p>
          </div>

          <section className="category-section" id="categories">
            <div className="section-heading-row">
              <h2>Categories</h2>
            </div>
            <div className="category-grid">
              {categoryCards.map((category) => (
                <button
                  key={category.name}
                  className="category-card"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <strong>{category.name}</strong>
                  <span>{category.count} Items</span>
                </button>
              ))}
            </div>
          </section>

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <h3>No items found</h3>
              <p>Try changing your search or filters.</p>
              <button
                className="clear-button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setStockFilter('All');
                  setSortBy('recommended');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="item-grid">
              {filteredItems.map((item) => (
                <Link key={item.id} className="item-card" to={`/items/${slugify(item.name)}`} state={{ item }}>
                  <div className="item-image-wrap">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="image-placeholder">No Image Available</div>
                    )}
                    {!item.inStock && <span className="stock-badge out">OUT OF STOCK</span>}
                  </div>
                  <div className="card-body">
                    <div className="meta-line">
                      <span>{item.category}</span>
                      {item.rarity && <span>{item.rarity}</span>}
                    </div>
                    <h3>{item.name}</h3>
                    <div className="price-row">
                      <span className="price">{formatCurrency(item.price)}</span>
                      <span className={`availability ${item.inStock ? 'in' : 'out'}`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <button className="detail-button">View Details</button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <div>
            <strong>🛍️ Liam Shoppee</strong>
            <p>Browse available Liam Shoppee items.</p>
          </div>
          <nav>
            <a href="#">Home</a>
            <a href="#items">Items</a>
            <a href="#categories">Categories</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

function CatalogPageSkeleton() {
  return (
    <div className="container skeleton-shell">
      <div className="skeleton-line short" />
      <div className="skeleton-line long" />
      <div className="skeleton-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton-card" />
        ))}
      </div>
    </div>
  );
}

function ItemDetailsPage() {
  const { itemSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  if (!item) {
    return (
      <div className="container detail-empty">
        <h2>Item not found</h2>
        <button className="back-button" onClick={() => navigate('/')}>← Back to Items</button>
      </div>
    );
  }

  return (
    <main className="container detail-page">
      <button className="back-button" onClick={() => navigate('/')}>← Back to Items</button>
      <div className="detail-layout">
        <div className="detail-image-wrap">
          {item.image ? (
            <img src={item.image} alt={item.name} />
          ) : (
            <div className="image-placeholder large">No Image Available</div>
          )}
        </div>
        <div className="detail-content">
          <p className="eyebrow">{item.category}</p>
          <h1>{item.name}</h1>
          <div className="detail-price-row">
            <span className="price big">{formatCurrency(item.price)}</span>
            {item.rarity && <span className="rarity-pill">{item.rarity}</span>}
          </div>
          <div className="detail-meta-list">
            <p>
              <strong>Availability:</strong> {item.inStock ? 'In Stock' : 'Out of Stock'}
            </p>
            <p>
              <strong>Stock:</strong> {item.stock ?? 0}
            </p>
            <p>
              <strong>Item ID:</strong> {item.id}
            </p>
            {item.type && (
              <p>
                <strong>Type:</strong> {item.type}
              </p>
            )}
          </div>
          <div className="detail-description">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/items/:itemSlug" element={<ItemDetailsPage />} />
    </Routes>
  );
}
