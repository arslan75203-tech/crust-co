/**
 * Crust & Co - Cart Module
 * Persistent shopping cart using localStorage (key: crust_co_cart)
 * Follows Sections 74-77 of specification.
 */

const CART_STORAGE_KEY = 'crust_co_cart';
export const DELIVERY_FEE = 150;
export const FREE_DELIVERY_THRESHOLD = 2500;

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load cart from localStorage:', e);
    return [];
  }
}

export function saveCart(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('crust:cart-updated', { detail: { items } }));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
}

/**
 * Generate a deterministic cart item ID to distinguish different configurations
 * of the same product (Section 77).
 */
export function generateCartItemId(productId, variantName, addOns = [], instructions = '') {
  const sortedAddOns = (addOns || [])
    .map((a) => (typeof a === 'string' ? a : a.name))
    .sort()
    .join('|');
  const cleanInstructions = (instructions || '').trim().toLowerCase();
  const rawKey = `${productId}__${variantName || 'default'}__${sortedAddOns}__${cleanInstructions}`;
  // Simple clean hash string
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    hash = (hash << 5) - hash + rawKey.charCodeAt(i);
    hash |= 0;
  }
  return `item-${Math.abs(hash)}`;
}

/**
 * Add or update configured product in cart
 */
export function addToCart(product, options = {}) {
  const cart = getCart();

  const variant = options.variant || { name: 'Regular', priceAdjustment: 0 };
  const addOns = options.addOns || [];
  const instructions = (options.specialInstructions || '').trim();
  const quantity = Math.max(1, parseInt(options.quantity, 10) || 1);

  const addOnTotal = addOns.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const unitPrice = (Number(product.price) || 0) + (Number(variant.priceAdjustment) || 0) + addOnTotal;
  const cartItemId = generateCartItemId(product.id, variant.name, addOns, instructions);

  const existingIndex = cart.findIndex((item) => item.id === cartItemId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
    cart[existingIndex].totalPrice = cart[existingIndex].quantity * cart[existingIndex].unitPrice;
  } else {
    const newItem = {
      id: cartItemId,
      productId: product.id,
      sku: product.sku || product.id,
      name: product.name || product.title,
      image: product.image,
      basePrice: Number(product.price) || 0,
      variant: {
        name: variant.name,
        priceAdjustment: Number(variant.priceAdjustment) || 0,
      },
      addOns: addOns.map((a) => ({ name: a.name, price: Number(a.price) || 0 })),
      quantity,
      specialInstructions: instructions,
      unitPrice,
      totalPrice: unitPrice * quantity,
    };
    cart.push(newItem);
  }

  saveCart(cart);
  return cartItemId;
}

export function updateQuantity(cartItemId, newQty) {
  let cart = getCart();
  const index = cart.findIndex((item) => item.id === cartItemId);
  if (index === -1) return;

  const qty = parseInt(newQty, 10);
  if (isNaN(qty) || qty <= 0) {
    // Remove if 0 or negative
    cart = cart.filter((item) => item.id !== cartItemId);
  } else {
    cart[index].quantity = qty;
    cart[index].totalPrice = cart[index].quantity * cart[index].unitPrice;
  }
  saveCart(cart);
}

export function removeFromCart(cartItemId) {
  const cart = getCart().filter((item) => item.id !== cartItemId);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartSummary() {
  const items = getCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0;
  const deliveryCharge = subtotal > 0 && !isFreeDelivery ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryCharge;

  return {
    items,
    itemCount,
    subtotal,
    deliveryCharge,
    grandTotal,
    isFreeDelivery,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  };
}
