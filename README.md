# 🎮 Touch 4 Games Catalog

A modern, professional item catalog website for Touch 4 Games. Browse, search, filter, and view game items with real product images and prices.

## ✨ Features

- **Live Catalog Data**: Real item data from Google Sheets (300+ items)
- **Powerful Search**: Debounced multi-field search (name, type, ID)
- **Dynamic Filtering**: Filter by category, availability, and price
- **Smart Sorting**: Sort by relevance, name, or price
- **Real Product Images**: Integrated Wix CDN images for authentic game artwork
- **Responsive Design**: Works on desktop, tablet, and mobile (375px to 1920px)
- **Dark Gaming Theme**: Modern UI with gaming-inspired colors and effects
- **Item Details**: Individual pages for each item with full information
- **No Login Required**: Pure window shopping experience

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Data Source

Items are fetched live from this Google Sheet:
```
https://docs.google.com/spreadsheets/d/1vKUF2VMFlnAjJJ2wvEfF0Tiq7RkeMynUtBR2A1w0vpc
```

The sheet is parsed automatically into the catalog. No manual data entry needed!

## 🖼️ Adding Real Product Images

The catalog uses real product images from https://touchunited.wixsite.com/touchunited

### Quick way to add images:

```bash
# Add a single item's image
python scripts/extract-wix-images.py --add "Item Name"

# Add multiple items at once
python scripts/extract-wix-images.py --batch "Item 1" "Item 2" "Item 3"

# Extract from a specific blog post URL
python scripts/extract-wix-images.py --url "<blog-post-url>" --add "Item Name"
```

See [IMAGE_EXTRACTION_GUIDE.md](IMAGE_EXTRACTION_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
src/
├── App.jsx                 # Main app with catalog UI
├── main.jsx               # React entry point
├── styles.css             # Dark theme styling
└── data/
    ├── items.js           # CSV parser & catalog fetcher
    └── imageMap.js        # Item -> Wix image URL mapping

netlify.toml              # Netlify deployment config
render.yaml               # Render deployment config
vite.config.js           # Vite build config
package.json             # Dependencies & scripts
```

## 🎯 Key Components

### App.jsx
- **HomePage**: Master catalog view with search, filters, sorting
- **ItemDetailsPage**: Individual item detail page with routing
- **useDebouncedValue**: Debounced search hook

### Catalog Features
- Search: Multi-field (name, ID, category, type)
- Filters: Category dropdown, availability toggle, sort selector
- Grid: Responsive 4-5 cols → 2-3 → 1-2 based on screen size
- Categories: Auto-generated from unique item types
- Empty state: "No items found" with clear filters button
- Loading skeleton: Animated gradient pulses while fetching

### Image System
- `imageMap.js`: Central mapping of item names to Wix image URLs
- Fallback: Generated SVG placeholders for unmapped items
- Auto-scaling: Responsive image rendering on all breakpoints

## 🌐 Deployment

### Netlify (Primary)

```bash
git push origin main
```

Automatically deploys from main branch. See `netlify.toml` for config.

Live at: https://touch-shop-catalog.netlify.app

### Render (Backup)

```bash
git push heroku main
```

Alternative deployment. See `render.yaml` for config.

## 🎨 Styling

Dark gaming theme with:
- Background: Deep blue-gray (#0b1020)
- Accent: Bright blue (#7c9cff)
- Success: Green (#34d399)
- Responsive typography: Scales across 6 breakpoints
- Smooth animations: Hover effects, transitions, skeleton loaders
- Accessibility: High contrast, semantic HTML

## 🔧 Available Scripts

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Build for production (→ dist/)
npm run preview   # Preview production build (port 4173)
npm start         # Production server (uses PORT env var)
```

## 🐛 Troubleshooting

### Images not loading

```bash
npm run build
npm run dev
# Clear browser cache (Ctrl+Shift+Delete)
```

### Search not working

The search debounces at 180ms and searches: name, type, category, ID, description, raw status.

### Filtering not updating

Clear your browser's local storage or hard refresh (Ctrl+Shift+R).

## 📦 Dependencies

- **react**: 18.3.1
- **react-dom**: 18.3.1
- **react-router-dom**: 6.28.0
- **vite**: 5.4.21
- **@vitejs/plugin-react**: 4.3.2

## 📝 License

Private project for Touch 4 Games

## 🤝 Contributing

To add new items or update images:

1. Update Google Sheet directly
2. Images: Use `python scripts/extract-wix-images.py --add "Item Name"`
3. Test locally with `npm run dev`
4. Deploy with `git push`

## 📧 Questions?

See [IMAGE_EXTRACTION_GUIDE.md](IMAGE_EXTRACTION_GUIDE.md) for detailed usage instructions.