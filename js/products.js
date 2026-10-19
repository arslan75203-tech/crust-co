/**
 * Crust & Co - Products & Deals Data Layer
 * Clean, WooCommerce-ready schema.
 */

export const CATEGORIES = [
  { id: 'all', name: 'All Menu', icon: '🍽️' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'pizza', name: 'Artisan Pizza', icon: '🍕' },
  { id: 'wraps', name: 'Wraps & Rolls', icon: '🌯' },
  { id: 'sides', name: 'Loaded Sides', icon: '🍟' },
  { id: 'drinks', name: 'Beverages', icon: '🥤' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
];

export const PRODUCTS = [
  {
    id: 'burger-001',
    sku: 'BUR-001',
    slug: 'zinger-burger',
    name: 'Crispy Zinger Fillet Burger',
    shortDescription: 'Crispy fried chicken breast fillet with shredded iceberg lettuce and house recipe garlic mayonnaise.',
    description: 'Our crown jewel burger. Thick whole-muscle chicken breast hand-dredged in 11 secret herbs and spices, double fried to a golden crunch, layered with crisp iceberg lettuce, sharp pickles, and our signature smoked garlic mayonnaise on a toasted brioche bun.',
    category: 'burgers',
    price: 650,
    image: '/src/assets/images/product_zinger_burger_1792406743675.jpg',
    available: true,
    badge: 'Chef Favorite',
    prepTime: '15-20 mins',
    variants: [
      { name: 'Regular', priceAdjustment: 0 },
      { name: 'Double Patty', priceAdjustment: 220 },
      { name: 'Spicy Fire Fillet', priceAdjustment: 50 },
    ],
    addOns: [
      { name: 'Extra Melted Cheddar', price: 90 },
      { name: 'Crispy Smoked Bacon Strips', price: 140 },
      { name: 'Signature Secret Sauce Dip', price: 50 },
      { name: 'Pickled Jalapeño Coins', price: 40 },
    ],
    relatedProducts: ['sides-001', 'burger-002', 'drink-001'],
  },
  {
    id: 'pizza-001',
    sku: 'PIZ-001',
    slug: 'artisan-pepperoni-pizza',
    name: 'Artisan Pepperoni & Mozzarella Pizza',
    shortDescription: 'Slow-fermented sourdough crust topped with San Marzano marinara, cured pepperoni, and fresh basil.',
    description: 'Crafted with 48-hour slow-fermented artisanal dough, stone-baked at 450°C. Finished with San Marzano crushed tomato sauce, rich whole-milk fior di latte mozzarella, artisanal spiced pepperoni slices with blistered charred edges, and fresh garden basil.',
    category: 'pizza',
    price: 1450,
    image: '/src/assets/images/product_artisan_pizza_1792406742861.jpg',
    available: true,
    badge: 'Bestseller',
    prepTime: '20-25 mins',
    variants: [
      { name: 'Medium 10 inch', priceAdjustment: 0 },
      { name: 'Large 13 inch', priceAdjustment: 400 },
      { name: 'Family Pan 16 inch', priceAdjustment: 750 },
    ],
    addOns: [
      { name: 'Stuffed Garlic Herb Crust', price: 180 },
      { name: 'Extra Buffalo Mozzarella', price: 150 },
      { name: 'Chili Infused Hot Honey Drizzle', price: 80 },
      { name: 'Caramelized Roasted Garlic', price: 70 },
    ],
    relatedProducts: ['sides-001', 'sides-002', 'drink-002'],
  },
  {
    id: 'sides-001',
    sku: 'SID-001',
    slug: 'supreme-loaded-fries',
    name: 'Supreme Loaded Fries Platter',
    shortDescription: 'Golden fries loaded with warm cheddar sauce, crispy fried chicken chunks, and jalapeños.',
    description: 'Crispy skin-on potato fries tossed in smoked sea salt and paprika seasoning, smothered with rich melted cheddar cheese sauce, crispy diced buttermilk chicken nuggets, spicy pickled jalapeños, and drizzled with chipotle ranch.',
    category: 'sides',
    price: 550,
    image: '/src/assets/images/product_loaded_fries_1792406743883.jpg',
    available: true,
    badge: 'Popular',
    prepTime: '12-15 mins',
    variants: [
      { name: 'Regular Bowl', priceAdjustment: 0 },
      { name: 'Party Sharing Platter', priceAdjustment: 250 },
    ],
    addOns: [
      { name: 'Extra Cheddar Meltdown', price: 90 },
      { name: 'Double Crispy Chicken Chunks', price: 160 },
      { name: 'Smoked Garlic Mayo Dip', price: 50 },
    ],
    relatedProducts: ['burger-001', 'pizza-001', 'drink-001'],
  },
  {
    id: 'burger-002',
    sku: 'BUR-002',
    slug: 'classic-smash-beef-burger',
    name: 'Classic Smash Beef Burger',
    shortDescription: 'Double smashed beef patties, caramelized onions, American cheddar, and tangy relish.',
    description: 'Two 100% prime beef patties smashed wafer-thin onto a blistering griddle for caramelized crispy lacy edges. Topped with American melted cheese, grilled sweet onions, crunchy pickles, and house burger relish.',
    category: 'burgers',
    price: 850,
    image: '/src/assets/images/product_zinger_burger_1792406743675.jpg',
    available: true,
    badge: 'Premium Cut',
    prepTime: '15-18 mins',
    variants: [
      { name: 'Double Patty (Standard)', priceAdjustment: 0 },
      { name: 'Triple Patty Beast', priceAdjustment: 260 },
    ],
    addOns: [
      { name: 'Fried Farm Egg', price: 70 },
      { name: 'Extra Cheddar Slice', price: 80 },
      { name: 'Grilled Portobello Mushroom', price: 120 },
    ],
    relatedProducts: ['burger-001', 'sides-001', 'drink-002'],
  },
  {
    id: 'pizza-003',
    sku: 'PIZ-003',
    slug: 'truffle-mushroom-sourdough',
    name: 'Wild Truffle & Portobello Pizza',
    shortDescription: 'Slow-roasted wild portobello mushrooms, black truffle glaze, fior di latte, and thyme.',
    description: 'Artisanal sourdough crust layered with roasted wild forest mushrooms, black truffle emulsion, fresh fior di latte mozzarella, and aromatic mountain thyme. Limited batch seasonal special.',
    category: 'pizza',
    price: 1650,
    image: '/src/assets/images/product_artisan_pizza_1792406742861.jpg',
    available: false, // Out of stock example to show faded grey state
    badge: 'Sold Out Today',
    prepTime: '20-25 mins',
    variants: [
      { name: 'Medium 10 inch', priceAdjustment: 0 },
      { name: 'Large 13 inch', priceAdjustment: 420 },
    ],
    addOns: [],
    relatedProducts: ['pizza-001', 'sides-001'],
  },
  {
    id: 'pizza-002',
    sku: 'PIZ-002',
    slug: 'charred-chicken-tikka-pizza',
    name: 'Charred Chicken Tikka Pizza',
    shortDescription: 'Tender marinated chicken tikka cubes, red onions, bell peppers, mozzarella, and cilantro.',
    description: 'A classic local favorite done with artisanal finesse. Clay-oven charred chicken breast tikka chunks, crisp red onions, bell peppers, creamy mozzarella, and an aromatic spiced tomato base on our hand-stretched crust.',
    category: 'pizza',
    price: 1350,
    image: '/src/assets/images/product_artisan_pizza_1792406742861.jpg',
    available: true,
    badge: 'House Special',
    prepTime: '20-25 mins',
    variants: [
      { name: 'Medium 10 inch', priceAdjustment: 0 },
      { name: 'Large 13 inch', priceAdjustment: 380 },
      { name: 'Family Pan 16 inch', priceAdjustment: 720 },
    ],
    addOns: [
      { name: 'Cheese Burst Stuffed Crust', price: 190 },
      { name: 'Extra Tikka Chunks', price: 160 },
      { name: 'Green Mint Raita Swirl', price: 50 },
    ],
    relatedProducts: ['pizza-001', 'sides-003', 'drink-001'],
  },
  {
    id: 'wrap-001',
    sku: 'WRA-001',
    slug: 'smoky-bbq-chicken-wrap',
    name: 'Smoky BBQ Crisp Chicken Wrap',
    shortDescription: 'Golden crispy chicken tenderloins wrapped in toasted flatbread with smoky barbecue sauce.',
    description: 'Crispy buttermilk chicken tenders rolled in a warm, toasted tortilla with shredded purple cabbage, cheddar cheese, smoked honey BBQ glaze, and creamy herb ranch dressing.',
    category: 'wraps',
    price: 590,
    image: '/src/assets/images/product_zinger_burger_1792406743675.jpg',
    available: true,
    badge: '',
    prepTime: '10-15 mins',
    variants: [
      { name: 'Regular Wrap', priceAdjustment: 0 },
      { name: 'Jumbo Double Wrap', priceAdjustment: 180 },
    ],
    addOns: [
      { name: 'Extra Cheese Sauce', price: 70 },
      { name: 'Jalapeño Crunch', price: 40 },
    ],
    relatedProducts: ['sides-001', 'drink-001'],
  },
  {
    id: 'sides-002',
    sku: 'SID-002',
    slug: 'garlic-parmesan-crust-bites',
    name: 'Garlic Parmesan Crust Dough Bites',
    shortDescription: 'Tossed in garlic herb butter, aged parmesan, and served with warm marinara dip.',
    description: 'Golden nuggets of our fermented pizza dough, baked until puffy and tender, tossed in roasted garlic herb butter, grated Grana Padano parmesan cheese, and served with warm house marinara.',
    category: 'sides',
    price: 380,
    image: '/src/assets/images/hero_crust_co_spread_1792406742006.jpg',
    available: true,
    badge: 'Vegetarian',
    prepTime: '12-15 mins',
    variants: [
      { name: 'Basket of 8', priceAdjustment: 0 },
      { name: 'Party Basket of 16', priceAdjustment: 280 },
    ],
    addOns: [
      { name: 'Extra Marinara Cup', price: 50 },
      { name: 'Truffle Aioli Dip', price: 90 },
    ],
    relatedProducts: ['pizza-001', 'pizza-002'],
  },
  {
    id: 'sides-003',
    sku: 'SID-003',
    slug: 'crispy-buffalo-wings',
    name: 'Flame Glazed Buffalo Wings',
    shortDescription: 'Crispy bone-in chicken wings tossed in tangy cayenne buffalo sauce with blue cheese dip.',
    description: 'Crispy fried jumbo chicken wings coated in our authentic butter-rich cayenne buffalo glaze. Served with celery batons and creamy dipping sauce.',
    category: 'sides',
    price: 680,
    image: '/src/assets/images/deal_family_feast_1792406743262.jpg',
    available: true,
    badge: 'Spicy',
    prepTime: '15-20 mins',
    variants: [
      { name: '6 Wings Pack', priceAdjustment: 0 },
      { name: '12 Wings Feast', priceAdjustment: 550 },
    ],
    addOns: [
      { name: 'Extra Buffalo Sauce Dip', price: 50 },
      { name: 'Ranch Herb Dip', price: 50 },
    ],
    relatedProducts: ['burger-001', 'pizza-001', 'drink-002'],
  },
  {
    id: 'dessert-001',
    sku: 'DES-001',
    slug: 'belgian-molten-lava-cake',
    name: 'Belgian Molten Chocolate Lava Cake',
    shortDescription: 'Warm Belgian dark chocolate cake with a molten ganache center, dusted with cacao.',
    description: 'Individual warm chocolate sponge cake baked to order with a silky molten center of pure 70% Belgian chocolate ganache.',
    category: 'desserts',
    price: 520,
    image: '/src/assets/images/hero_crust_co_spread_1792406742006.jpg',
    available: false, // Another out of stock example
    badge: 'Sold Out',
    prepTime: '15 mins',
    variants: [
      { name: 'Single Serving', priceAdjustment: 0 },
    ],
    addOns: [],
    relatedProducts: ['pizza-001', 'burger-001'],
  },
  {
    id: 'drink-001',
    sku: 'DRI-001',
    slug: 'crust-co-fresh-mint-lemonade',
    name: 'Crust & Co Fresh Mint Lemonade',
    shortDescription: 'Crushed garden mint, freshly squeezed lemons, and rock salt blended over ice.',
    description: 'Refreshing homemade cooler prepared with fresh mint leaves, tart lemon juice, sparkling water, and pink rock salt.',
    category: 'drinks',
    price: 290,
    image: '/src/assets/images/hero_crust_co_spread_1792406742006.jpg',
    available: true,
    badge: 'Signature',
    prepTime: '5 mins',
    variants: [
      { name: 'Regular Glass (350ml)', priceAdjustment: 0 },
      { name: 'Large Pitcher Glass (500ml)', priceAdjustment: 90 },
    ],
    addOns: [],
    relatedProducts: ['burger-001', 'pizza-001'],
  },
  {
    id: 'drink-002',
    sku: 'DRI-002',
    slug: 'chilled-gourmet-cola',
    name: 'Chilled Gourmet Cola',
    shortDescription: 'Crisp, carbonated cola served ice-cold in a glass bottle.',
    description: 'Classic ice-cold carbonated beverage served with ice and lemon wedge on request.',
    category: 'drinks',
    price: 150,
    image: '/src/assets/images/hero_crust_co_spread_1792406742006.jpg',
    available: true,
    badge: '',
    prepTime: '3 mins',
    variants: [
      { name: 'Can (250ml)', priceAdjustment: 0 },
      { name: 'Bottle (500ml)', priceAdjustment: 70 },
      { name: 'Sharing (1.5L)', priceAdjustment: 160 },
    ],
    addOns: [],
    relatedProducts: ['burger-001', 'pizza-001'],
  },
];

export const DEALS = [
  {
    id: 'deal-001',
    sku: 'DEAL-001',
    slug: 'grand-family-feast',
    title: 'Grand Family Feast Deal',
    shortDescription: '2 Large Stone-Baked Pizzas + 8 Buffalo Wings + Loaded Fries + 1.5L Drink',
    description: 'The ultimate dining feast for 4 to 6 people. Includes any 2 Large 13-inch pizzas of your choice, a basket of 8 crispy flame-glazed wings, our signature supreme loaded fries, and a chilled 1.5-liter drink bottle.',
    includedItems: [
      '2× Large 13-inch Artisan Pizzas (Pepperoni & Tikka)',
      '1× Basket of 8 Glazed Wings with Dip',
      '1× Supreme Loaded Fries Platter',
      '1× Chilled 1.5L Beverage Bottle'
    ],
    originalPrice: 4200,
    dealPrice: 3299,
    savings: 901,
    image: '/src/assets/images/deal_family_feast_1792406743262.jpg',
    badge: 'Best Value Deal',
    available: true,
  },
  {
    id: 'deal-002',
    sku: 'DEAL-002',
    slug: 'duo-crunch-combo',
    title: 'Duo Zinger & Loaded Fries Box',
    shortDescription: '2 Crispy Zinger Burgers + 1 Regular Loaded Fries + 2 Cold Drinks',
    description: 'Designed for two. Two succulent golden zinger chicken fillet burgers with crisp iceberg lettuce and garlic mayo, paired with a piping-hot bowl of loaded cheddar fries and two cold soft drinks.',
    includedItems: [
      '2× Crispy Zinger Fillet Burgers',
      '1× Regular Bowl of Loaded Cheese Fries',
      '2× 250ml Chilled Soft Drinks'
    ],
    originalPrice: 1950,
    dealPrice: 1549,
    savings: 401,
    image: '/src/assets/images/hero_crust_co_spread_1792406742006.jpg',
    badge: 'Popular Combo',
    available: true,
  },
  {
    id: 'deal-003',
    sku: 'DEAL-003',
    slug: 'solo-artisan-pizza-box',
    title: 'Artisan Solo Pizza Box',
    shortDescription: '1 Medium Stone-Baked Pizza + 4 Garlic Dough Bites + 1 Drink',
    description: 'A comforting individual treat. Any Medium 10-inch stone-oven pizza, fresh roasted garlic dough bites with marinara dip, and a beverage of your choice.',
    includedItems: [
      '1× Medium 10-inch Artisan Pizza',
      '1× 4-piece Garlic Herb Dough Bites with Marinara',
      '1× 250ml Chilled Soft Drink'
    ],
    originalPrice: 1850,
    dealPrice: 1490,
    savings: 360,
    image: '/src/assets/images/product_artisan_pizza_1792406742861.jpg',
    badge: 'Solo Craving',
    available: true,
  },
];

export function getProducts(category = 'all') {
  if (!category || category === 'all') {
    return PRODUCTS;
  }
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function getDeals() {
  return DEALS;
}

export function getDealBySlug(slug) {
  return DEALS.find((d) => d.slug === slug) || null;
}

export function formatPrice(amount) {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
}
