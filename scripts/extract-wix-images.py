#!/usr/bin/env python3
"""
Extract real product images from Wix blog posts and populate imageMap.js
Usage: python scripts/extract-wix-images.py [--item NAME] [--update]

This script:
1. Finds game blogs on Wix by searching for item names
2. Extracts product image URLs from blog posts
3. Generates or updates src/data/imageMap.js with mappings

Examples:
  python scripts/extract-wix-images.py --item "Sacred Flame"    # Find one item's image
  python scripts/extract-wix-images.py --update                  # Update all mapped items
"""

import requests
import re
import urllib.parse
import json
import sys
from argparse import ArgumentParser
from collections import defaultdict
from pathlib import Path

# Configuration
SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1vKUF2VMFlnAjJJ2wvEfF0Tiq7RkeMynUtBR2A1w0vpc/export?format=csv&gid=0'
WIX_BASE_URL = 'https://touchunited.wixsite.com/touchunited'
WIX_BLOG_URL = f'{WIX_BASE_URL}/post'
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
IMAGE_MAP_FILE = PROJECT_ROOT / 'src' / 'data' / 'imageMap.js'

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# Common item types and their known Wix blog posts
KNOWN_ITEMS = {
    'Sacred Flame': 'https://touchunited.wixsite.com/touchunited/post/sacred-flame-treasures-alchemy-shop',
    'Crystal Fragment': 'https://touchunited.wixsite.com/touchunited/post/crystal-fragment-world-rotation-globe',
}

def load_existing_map():
    """Load existing image mappings from imageMap.js"""
    try:
        content = IMAGE_MAP_FILE.read_text()
        # Extract the itemImageMap object using regex
        match = re.search(r'export const itemImageMap = \{(.*?)\};', content, re.DOTALL)
        if match:
            items = {}
            entries = re.findall(r"'([^']+)':\s*'([^']+)'", match.group(1))
            for item_name, image_url in entries:
                items[item_name] = image_url
            return items
        return {}
    except:
        return {}

def extract_images_from_post(post_url):
    """Extract the main product image from a Wix blog post"""
    try:
        response = requests.get(post_url, timeout=30, headers=HEADERS)
        response.raise_for_status()
        
        # Find main image URLs (exclude tiny thumbnails)
        image_urls = re.findall(
            r'https://static\.wixstatic\.com/media/[a-z0-9_]+~mv2\.(?:jpg|jpeg|png|webp)[^"\s]*',
            response.text,
            re.I
        )
        
        if image_urls:
            # Return the first substantive image (usually the main product)
            return image_urls[0]
        
        return None
    
    except Exception as e:
        print(f"    ❌ Error fetching post: {e}")
        return None

def find_item_blog(item_name):
    """Try to find the Wix blog post URL for an item by name variation"""
    # First check known items
    if item_name in KNOWN_ITEMS:
        return KNOWN_ITEMS[item_name]
    
    # Try constructing URL from name
    slug = item_name.lower().replace(' ', '-').replace('/', '-').replace('(', '').replace(')', '')
    slug = re.sub(r'[^a-z0-9-]', '', slug)  # Remove special chars
    slug = re.sub(r'-+', '-', slug).strip('-')  # Clean dashes
    
    if slug:
        post_url = f'{WIX_BLOG_URL}/{slug}'
        try:
            # Check if it exists with a HEAD request
            check = requests.head(post_url, timeout=10, headers=HEADERS)
            if check.status_code == 200:
                return post_url
        except:
            pass
    
    return None

def generate_image_map(items_to_images):
    """Generate imageMap.js content from item->image mapping"""
    entries = []
    
    for item, image_url in sorted(items_to_images.items()):
        if image_url:
            entries.append(f"  '{item}': '{image_url}',")
    
    template = f"""// Image mapping for Touch 4 Games catalog items
// Format: itemName -> wix image URL
// Update by running: python scripts/extract-wix-images.py --add "Item Name"

export const itemImageMap = {{
{chr(10).join(entries) if entries else "  // No images added yet. Add items with: python scripts/extract-wix-images.py --add 'Item Name'"}
}};

export function getItemImage(itemName) {{
  // First, try exact match
  if (itemImageMap[itemName]) {{
    return itemImageMap[itemName];
  }}
  
  // Try partial match (search in item name)
  for (const [key, url] of Object.entries(itemImageMap)) {{
    if (itemName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(itemName.toLowerCase())) {{
      return url;
    }}
  }}
  
  // Return null if no match found (will use generated placeholder)
  return null;
}}
"""
    return template

def main():
    parser = ArgumentParser(description='Extract real product images from Wix blog posts')
    parser.add_argument('--add', metavar='ITEM', help='Search for and add a specific item image')
    parser.add_argument('--url', metavar='URL', help='Extract image from a specific Wix blog post URL')
    parser.add_argument('--batch', nargs='+', metavar='ITEMS', help='Add multiple items')
    args = parser.parse_args()
    
    print("🎮 Touch 4 Games Image Extractor")
    print("=" * 60)
    
    # Load existing mappings
    items_to_images = load_existing_map()
    print(f"✓ Loaded {len(items_to_images)} existing image mappings\n")
    
    # Handle --url flag: extract from specific post
    if args.url:
        print(f"Extracting from: {args.url}")
        image_url = extract_images_from_post(args.url)
        if image_url:
            print(f"✓ Found image: {image_url}\n")
            print("Copy this URL and add to imageMap.js:")
            print(f"  '{args.add}': '{image_url}',")
        else:
            print("❌ No product images found in post")
        return
    
    # Handle --add flag: search for single item
    if args.add:
        print(f"🔍 Searching for: {args.add}\n")
        post_url = find_item_blog(args.add)
        if post_url:
            print(f"✓ Found blog post: {post_url}")
            image_url = extract_images_from_post(post_url)
            if image_url:
                items_to_images[args.add] = image_url
                print(f"✓ Extracted image: {image_url[:100]}...\n")
                
                # Save updated map
                content = generate_image_map(items_to_images)
                IMAGE_MAP_FILE.write_text(content)
                print(f"✓ Updated {IMAGE_MAP_FILE}")
                print("\nNext steps:")
                print("  1. npm run build")
                print("  2. npm run dev")
                print("  3. Verify image displays correctly")
            else:
                print("❌ No product images found in post")
        else:
            print(f"❌ Blog post not found for '{args.add}'")
            print("\nTry manually with --url flag:")
            print(f"  python scripts/extract-wix-images.py --url <post_url> --add '{args.add}'")
        return
    
    # Handle --batch flag: add multiple items
    if args.batch:
        for item in args.batch:
            print(f"🔍 Processing: {item}...")
            post_url = find_item_blog(item)
            if post_url:
                image_url = extract_images_from_post(post_url)
                if image_url:
                    items_to_images[item] = image_url
                    print(f"  ✓ Added image")
                else:
                    print(f"  ⚠ No image found in post")
            else:
                print(f"  ⚠ Blog post not found")
        
        # Save updated map
        content = generate_image_map(items_to_images)
        IMAGE_MAP_FILE.write_text(content)
        print(f"\n✓ Updated {IMAGE_MAP_FILE}")
        return
    
    # Default: show usage and existing mappings
    print("Usage:")
    print("  python scripts/extract-wix-images.py --add 'Item Name'")
    print("    Search for and add a single item's image")
    print()
    print("  python scripts/extract-wix-images.py --url <post_url> --add 'Item Name'")
    print("    Extract image from a specific Wix blog post")
    print()
    print("  python scripts/extract-wix-images.py --batch Item1 Item2 Item3")
    print("    Add multiple items at once")
    print()
    print("Current mappings in imageMap.js:")
    if items_to_images:
        for item in sorted(items_to_images.keys())[:5]:
            print(f"  ✓ {item}")
        if len(items_to_images) > 5:
            print(f"  ... and {len(items_to_images)-5} more")
    else:
        print("  (none yet)")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
