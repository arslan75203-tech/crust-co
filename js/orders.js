/**
 * Crust & Co - Order Management Module
 * Follows Sections 82-85, 89-90, 93 of specification.
 * Stored in localStorage: crust_co_orders
 */

const ORDERS_STORAGE_KEY = 'crust_co_orders';

export const ORDER_STATUSES = [
  { key: 'placed', label: 'Order Placed', step: 1 },
  { key: 'confirmed', label: 'Confirmed', step: 2 },
  { key: 'preparing', label: 'Preparing', step: 3 },
  { key: 'ready', label: 'Ready', step: 4 },
  { key: 'out_for_delivery', label: 'Out for Delivery', step: 5 },
  { key: 'delivered', label: 'Delivered', step: 6 },
];

function initDefaultOrders() {
  const existing = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!existing) {
    const defaultOrders = [
      {
        id: 'CC-1025',
        userId: 'user-001',
        date: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago (active)
        status: 'preparing',
        paymentMethod: 'cash_on_delivery',
        items: [
          {
            id: 'item-demo-1',
            productId: 'burger-001',
            name: 'Crispy Zinger Fillet Burger',
            variant: { name: 'Double Patty', priceAdjustment: 220 },
            addOns: [{ name: 'Extra Melted Cheddar', price: 90 }],
            quantity: 2,
            unitPrice: 960,
            totalPrice: 1920,
            specialInstructions: 'Less spicy, extra crisp',
          },
          {
            id: 'item-demo-2',
            productId: 'sides-001',
            name: 'Supreme Loaded Fries Platter',
            variant: { name: 'Regular Bowl', priceAdjustment: 0 },
            addOns: [],
            quantity: 1,
            unitPrice: 550,
            totalPrice: 550,
            specialInstructions: '',
          },
        ],
        subtotal: 2470,
        deliveryCharge: 150,
        total: 2620,
        customer: {
          name: 'Hamza Farooq',
          phone: '03001234567',
          address: 'House 42, Street 7, Block F',
          area: 'Gulberg III, Lahore',
          landmark: 'Near Mini Market',
        },
        notes: 'Please call when outside gate.',
      },
      {
        id: 'CC-1018',
        userId: 'user-001',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (delivered)
        status: 'delivered',
        paymentMethod: 'cash_on_delivery',
        items: [
          {
            id: 'item-demo-3',
            productId: 'deal-001',
            name: 'Grand Family Feast Deal',
            variant: { name: 'Standard Bundle', priceAdjustment: 0 },
            addOns: [],
            quantity: 1,
            unitPrice: 3299,
            totalPrice: 3299,
            specialInstructions: '',
          },
        ],
        subtotal: 3299,
        deliveryCharge: 0,
        total: 3299,
        customer: {
          name: 'Hamza Farooq',
          phone: '03001234567',
          address: 'House 42, Street 7, Block F',
          area: 'Gulberg III, Lahore',
          landmark: 'Near Mini Market',
        },
        notes: '',
      },
    ];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(defaultOrders));
  }
}

initDefaultOrders();

export function getAllOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getUserOrders(userId) {
  const all = getAllOrders();
  if (!userId) {
    // Return guest orders placed in this browser session
    return all.filter((o) => o.userId === 'guest');
  }
  return all.filter((o) => o.userId === userId);
}

export function getOrderById(orderId) {
  const all = getAllOrders();
  return all.find((o) => o.id === orderId) || null;
}

export function createOrder({ items, subtotal, deliveryCharge, total, customer, notes, userId = 'guest' }) {
  const orders = getAllOrders();
  // Generate friendly order ID like CC-1048
  const nextNum = 1030 + orders.length;
  const orderId = `CC-${nextNum}`;

  const newOrder = {
    id: orderId,
    userId: userId || 'guest',
    date: new Date().toISOString(),
    status: 'placed',
    paymentMethod: 'cash_on_delivery',
    items: JSON.parse(JSON.stringify(items)),
    subtotal: Number(subtotal),
    deliveryCharge: Number(deliveryCharge),
    total: Number(total),
    customer: {
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || '',
      area: customer.area || '',
      landmark: customer.landmark || '',
    },
    notes: (notes || '').trim(),
  };

  orders.unshift(newOrder); // newest first
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return newOrder;
}

export function updateOrderStatus(orderId, nextStatus) {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index > -1) {
    orders[index].status = nextStatus;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return orders[index];
  }
  return null;
}
