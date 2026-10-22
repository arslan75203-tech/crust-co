/**
 * Crust & Co - Order Management & Tracking Module
 * Follows Sections 82-85, 89-90, 93 of specification.
 * Stored in localStorage: crust_co_orders
 */

const ORDERS_STORAGE_KEY = 'crust_co_orders';

export const ORDER_STATUSES = [
  {
    key: 'placed',
    label: 'Order Placed',
    description: 'Received at Crust & Co kitchen terminal',
    step: 1,
    icon: '📝',
  },
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    description: 'Verified and queued by head chef',
    step: 2,
    icon: '✅',
  },
  {
    key: 'preparing',
    label: 'Cooking in Kitchen',
    description: 'Stone-oven baking & fresh frying in progress',
    step: 3,
    icon: '👨‍🍳',
  },
  {
    key: 'ready',
    label: 'Packed & Ready',
    description: 'Quality checked & sealed in thermal hot-bag',
    step: 4,
    icon: '📦',
  },
  {
    key: 'out_for_delivery',
    label: 'On the Way',
    description: 'Dispatched with delivery rider',
    step: 5,
    icon: '🛵',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Handed over at customer doorstep',
    step: 6,
    icon: '🎉',
  },
];

export const DEFAULT_RIDER = {
  name: 'Muhammad Rizwan',
  phone: '0300 1234567',
  rating: '4.9 ★ (380+ deliveries)',
  vehicle: 'Honda 125 (Bike No: LEN-8492)',
  bagType: 'Thermal Insulated Hot-Box',
  hub: 'Crust & Co Central Hub, Main Blvd, Gulberg III',
  /**
   * Real-time GPS coordinates stream hook.
   * Null when awaiting rider device GPS transmission or backend socket packet.
   * Shape: { lat: number, lng: number, heading?: number, updatedAt: string }
   */
  currentCoordinates: null,
};

function generateTimeline(currentStatus, placedDate) {
  const baseTime = new Date(placedDate).getTime();
  const offsets = {
    placed: 0,
    confirmed: 3 * 60 * 1000,
    preparing: 8 * 60 * 1000,
    ready: 22 * 60 * 1000,
    out_for_delivery: 26 * 60 * 1000,
    delivered: 38 * 60 * 1000,
  };

  const statusOrder = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return statusOrder.map((key, idx) => {
    const statusMeta = ORDER_STATUSES.find((s) => s.key === key);
    const isCompleted = idx <= currentIndex;
    const isCurrent = idx === currentIndex;
    const time = new Date(baseTime + (offsets[key] || 0)).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      status: key,
      label: statusMeta ? statusMeta.label : key,
      description: statusMeta ? statusMeta.description : '',
      icon: statusMeta ? statusMeta.icon : '•',
      step: idx + 1,
      isCompleted,
      isCurrent,
      time: isCompleted ? time : null,
    };
  });
}

function initDefaultOrders() {
  const existing = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!existing) {
    const now = Date.now();
    const defaultOrders = [
      {
        id: 'CC-1025',
        userId: 'user-001',
        date: new Date(now - 24 * 60 * 1000).toISOString(), // 24 mins ago (out for delivery)
        status: 'out_for_delivery',
        paymentMethod: 'cash_on_delivery',
        estimatedDeliveryTime: '30–40 mins',
        rider: {
          ...DEFAULT_RIDER,
          assignedAt: new Date(now - 6 * 60 * 1000).toISOString(),
          // Live location hook ready for backend ingestion
          currentCoordinates: {
            lat: 31.5186,
            lng: 74.3512,
            locationName: 'Near Main Market Roundabout, Gulberg',
            updatedAt: new Date(now - 1 * 60 * 1000).toISOString(),
          },
        },
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
            specialInstructions: 'Less spicy, extra crisp fillet',
          },
          {
            id: 'item-demo-2',
            productId: 'sides-001',
            name: 'Supreme Loaded Fries Platter',
            variant: { name: 'Regular Bowl', priceAdjustment: 0 },
            addOns: [{ name: 'Smoked Garlic Mayo Dip', price: 50 }],
            quantity: 1,
            unitPrice: 600,
            totalPrice: 600,
            specialInstructions: 'Keep sauce on side',
          },
        ],
        subtotal: 2520,
        deliveryCharge: 0, // Above free delivery threshold (2500)
        total: 2520,
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
        date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (delivered)
        status: 'delivered',
        paymentMethod: 'cash_on_delivery',
        estimatedDeliveryTime: 'Delivered',
        rider: {
          ...DEFAULT_RIDER,
          name: 'Ali Raza',
          phone: '0321 7654321',
          vehicle: 'Honda CD 70 (Bike No: LEA-3120)',
        },
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
    return all.filter((o) => o.userId === 'guest');
  }
  return all.filter((o) => o.userId === userId);
}

export function getOrderById(orderId) {
  if (!orderId) return null;
  const all = getAllOrders();
  const clean = orderId.trim().toUpperCase();
  return all.find((o) => o.id.toUpperCase() === clean) || null;
}

export function findOrdersByQuery(query) {
  if (!query) return [];
  const all = getAllOrders();
  const clean = query.trim().toLowerCase();
  return all.filter((o) => {
    const matchId = o.id.toLowerCase().includes(clean);
    const matchPhone = o.customer && o.customer.phone && o.customer.phone.includes(clean);
    const matchName = o.customer && o.customer.name && o.customer.name.toLowerCase().includes(clean);
    return matchId || matchPhone || matchName;
  });
}

export function createOrder({ items, subtotal, deliveryCharge, total, customer, notes, userId = 'guest' }) {
  const orders = getAllOrders();
  const nextNum = 1030 + orders.length;
  const orderId = `CC-${nextNum}`;

  const newOrder = {
    id: orderId,
    userId: userId || 'guest',
    date: new Date().toISOString(),
    status: 'placed',
    paymentMethod: 'cash_on_delivery',
    estimatedDeliveryTime: '30–40 mins',
    rider: null, // assigned when entering preparing / out_for_delivery
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
  window.dispatchEvent(new CustomEvent('crust:order-created', { detail: { order: newOrder } }));
  return newOrder;
}

export function updateOrderStatus(orderId, nextStatus) {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index > -1) {
    orders[index].status = nextStatus;

    // Attach rider if moving to out_for_delivery and none attached
    if (nextStatus === 'out_for_delivery' && !orders[index].rider) {
      orders[index].rider = {
        ...DEFAULT_RIDER,
        assignedAt: new Date().toISOString(),
        currentCoordinates: {
          lat: 31.5186,
          lng: 74.3512,
          locationName: 'Dispatched from Gulberg III Kitchen',
          updatedAt: new Date().toISOString(),
        },
      };
    }

    if (nextStatus === 'delivered') {
      orders[index].estimatedDeliveryTime = 'Delivered';
    }

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('crust:order-updated', { detail: { order: orders[index] } }));
    return orders[index];
  }
  return null;
}

/**
 * Convenience method to cycle/advance an order's status for live demo/testing
 */
export function advanceOrderStatus(orderId) {
  const order = getOrderById(orderId);
  if (!order) return null;

  const sequence = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const curIdx = sequence.indexOf(order.status);
  if (curIdx === -1 || curIdx === sequence.length - 1) {
    // If delivered or invalid, cycle back to placed for continuous testability
    return updateOrderStatus(orderId, 'placed');
  }
  return updateOrderStatus(orderId, sequence[curIdx + 1]);
}

/**
 * Backend telemetry integration hook:
 * Used by central Node.js server or WebSocket handler to update live rider coordinates.
 */
export function updateRiderTelemetry(orderId, coordinates) {
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index > -1 && orders[index].rider) {
    orders[index].rider.currentCoordinates = {
      ...coordinates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('crust:rider-location-updated', { detail: { orderId, coordinates } }));
    return orders[index];
  }
  return null;
}

export function getOrderTimeline(order) {
  if (!order) return [];
  return generateTimeline(order.status, order.date);
}
