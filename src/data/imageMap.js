// Image mapping for Touch 4 Games catalog items
// Format: itemName -> wix image URL
// You can populate this by:
// 1. Going to the Wix site (https://touchunited.wixsite.com/touchunited)
// 2. Finding the item's blog post
// 3. Copying the main image URL and pasting it here

export const itemImageMap = {
  // Example:
  // 'Accessories Package': 'https://static.wixstatic.com/media/9f8412_example~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/9f8412_example~mv2.jpg',
  
  'Crystal Fragment': 'https://static.wixstatic.com/media/9f8412_f258b3d3fa2d448687de3dfa4e0367ed~mv2.jpg/v1/fill/w_1000,h_715,al_c,q_85/9f8412_f258b3d3fa2d448687de3dfa4e0367ed~mv2.jpg',
  
  // Add more mappings below:
  // 'Item Name': 'https://wix-image-url-here',
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
