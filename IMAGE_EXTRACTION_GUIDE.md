# 🎮 Image Extraction Guide

This guide shows how to add real product images from the Wix site to your catalog.

## Quick Start

### Add a single item image

```bash
python scripts/extract-wix-images.py --add "Item Name"
```

Example:
```bash
python scripts/extract-wix-images.py --add "Sacred Flame"
python scripts/extract-wix-images.py --add "Blooming Vow"
```

The script will:
1. Search for the item's blog post on Wix
2. Extract the product image URL
3. Update `src/data/imageMap.js`

### Manual extraction from a specific blog post

If automatic search doesn't find the blog post, you can manually extract from a URL:

```bash
python scripts/extract-wix-images.py --url "https://touchunited.wixsite.com/touchunited/post/item-name" --add "Item Name"
```

### Add multiple items at once

```bash
python scripts/extract-wix-images.py --batch "Item 1" "Item 2" "Item 3"
```

---

## How to find the blog post URL

1. Go to: https://touchunited.wixsite.com/touchunited
2. Search for the item name (e.g., "Sacred Flame")
3. Click on the blog post
4. Copy the URL from the address bar
5. Use the `--url` flag to extract the image

---

## Example workflow

### Step 1: Add one item

```bash
python scripts/extract-wix-images.py --add "Crystal Fragment"
```

Output:
```
🎮 Touch 4 Games Image Extractor
============================================================
✓ Loaded 1 existing image mappings

🔍 Searching for: Crystal Fragment

✓ Found blog post: https://touchunited.wixsite.com/touchunited/post/crystal-fragment-world-rotation-globe
✓ Extracted image: https://static.wixstatic.com/media/...

✓ Updated /workspaces/Touch-Shope/src/data/imageMap.js

Next steps:
  1. npm run build
  2. npm run dev
  3. Verify image displays correctly
```

### Step 2: Test locally

```bash
npm run build   # Rebuild the app
npm run dev     # Start dev server on http://localhost:3000
```

Then check if the image appears for "Crystal Fragment" items in the catalog.

### Step 3: Add more items

Repeat Step 1 for each item type you want to add images for.

### Step 4: Deploy

```bash
git add .
git commit -m "Add real product images for [item names]"
git push
```

Netlify will automatically redeploy!

---

## Current mapped items

View existing image mappings:

```bash
cat src/data/imageMap.js
```

Or run the script without arguments to see stats:

```bash
python scripts/extract-wix-images.py
```

---

## Troubleshooting

### "Blog post not found"

This means the script couldn't construct the URL from the item name. Solution:

1. Find the blog post manually on Wix
2. Use the `--url` flag:
   ```bash
   python scripts/extract-wix-images.py --url "https://..." --add "Item Name"
   ```

### Image not showing in catalog

1. Run: `npm run build`
2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Restart dev server: `npm run dev`

### Multiple images per item

Some blog posts have multiple product images. The script extracts the first substantial one. To use a different image:

1. Find the blog post
2. Right-click the image you want
3. Copy the image URL
4. Manually edit `src/data/imageMap.js` and paste it

---

## Priority items to add

Based on catalog popularity, prioritize these game types:

- Sacred Flame
- Blooming Vow  
- Divine Dance
- Lyrical
- Focus
- Advance

Add them with:
```bash
python scripts/extract-wix-images.py --batch "Sacred Flame" "Blooming Vow" "Divine Dance" "Lyrical" "Focus" "Advance"
```

---

## Next steps

1. Add 10-20 popular item images
2. Deploy to Netlify
3. Get user feedback
4. Add remaining items gradually based on popularity

