// Image mapping for Touch 4 Games catalog items
// Format: itemName -> wix image URL
// Update by running: python scripts/extract-wix-images.py --add "Item Name"

export const itemImageMap = {
  'Crystal Fragment': 'https://static.wixstatic.com/media/9f8412_166e4068510c43ffbc2e368738a91fe7~mv2.jpg/v1/fill/w_1000,h_714,al_c,q_85/9f8412_166e4068510c43ffbc2e368738a91fe7~mv2.jpg',
};

export function getItemImage(itemName) {
  // First, try exact match
  if (itemImageMap[itemName]) {
    return itemImageMap[itemName];
  }
  
  // Try partial match (search in item name)
  for (const [key, url] of Object.entries(itemImageMap)) {
    if (itemName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(itemName.toLowerCase())) {
      return url;
    }
  }
  
  // Return null if no match found (will use generated placeholder)
  return null;
}
