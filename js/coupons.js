/**
 * Crust & Co - Coupon & Discount Integration Module
 *
 * Implements authoritative backend integration for coupon validation and discounts.
 * The frontend never invents fake discounts or hardcodes coupon codes.
 * Authoritative discount calculation and eligibility remain with the Node.js backend API.
 */

export const COUPON_STORAGE_KEY = 'crust_co_applied_coupon';
export const COUPON_VALIDATE_ENDPOINT = '/api/coupons/validate';

/**
 * Standard error codes returned by the backend or synthesized for network/HTTP failures.
 */
export const COUPON_ERROR_CODES = {
  EMPTY_CODE: 'EMPTY_CODE',
  INVALID_CODE: 'INVALID_CODE',
  EXPIRED: 'EXPIRED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  MIN_ORDER_NOT_MET: 'MIN_ORDER_NOT_MET',
  USAGE_LIMIT_REACHED: 'USAGE_LIMIT_REACHED',
  CUSTOMER_INELIGIBLE: 'CUSTOMER_INELIGIBLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
};

/**
 * Get currently applied coupon from session storage
 * Shape: {
 *   code: string,
 *   discountAmount: number,
 *   discountType: 'percentage' | 'fixed',
 *   description?: string,
 *   minOrderAmount?: number,
 *   appliedAt: string
 * }
 */
export function getAppliedCoupon() {
  try {
    const raw = sessionStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read applied coupon from sessionStorage:', e);
    return null;
  }
}

/**
 * Save applied coupon to session storage
 */
export function setAppliedCoupon(couponData) {
  try {
    sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponData));
    window.dispatchEvent(new CustomEvent('crust:coupon-updated', { detail: { coupon: couponData } }));
  } catch (e) {
    console.error('Failed to save applied coupon to sessionStorage:', e);
  }
}

/**
 * Remove applied coupon from session storage
 */
export function removeAppliedCoupon() {
  try {
    sessionStorage.removeItem(COUPON_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('crust:coupon-updated', { detail: { coupon: null } }));
  } catch (e) {
    console.error('Failed to remove applied coupon from sessionStorage:', e);
  }
}

/**
 * Validate a coupon code with the backend API
 *
 * Sends:
 * - code: normalized coupon code (uppercase, trimmed)
 * - subtotal: current cart subtotal
 * - itemCount: total items count
 * - items: cart items payload with sku, productId, quantity, unitPrice
 * - customerId: current user ID or 'guest'
 *
 * Handles:
 * - Empty code (client-side validation before request)
 * - 200 OK valid coupon response
 * - 400 / 422 business rejection (invalid, expired, min order, usage limit)
 * - 404 endpoint not found (gracefully informs user/developer that backend endpoint is pending)
 * - 500 / Network / Fetch failures
 */
export async function validateCouponWithBackend({ code, subtotal, items = [], customerId = 'guest' }) {
  const cleanCode = (code || '').trim().toUpperCase();

  // State 1: Empty coupon
  if (!cleanCode) {
    return {
      success: false,
      valid: false,
      errorCode: COUPON_ERROR_CODES.EMPTY_CODE,
      message: 'Please enter a coupon code.',
    };
  }

  const payload = {
    code: cleanCode,
    subtotal: Number(subtotal) || 0,
    itemCount: items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
    items: items.map((i) => ({
      productId: i.productId,
      sku: i.sku || i.productId,
      name: i.name,
      quantity: Number(i.quantity) || 1,
      unitPrice: Number(i.unitPrice) || 0,
      totalPrice: Number(i.totalPrice) || 0,
    })),
    customerId: customerId || 'guest',
  };

  try {
    const response = await fetch(COUPON_VALIDATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Successful backend validation (Status 200)
    if (response.ok) {
      const data = await response.json();

      if (data && data.valid) {
        const discountAmount = Math.max(0, Number(data.discountAmount) || 0);
        return {
          success: true,
          valid: true,
          coupon: {
            code: cleanCode,
            discountAmount,
            discountType: data.discountType || 'fixed',
            description: data.description || '',
            minOrderAmount: data.minOrderAmount || 0,
            authoritativeTotal: data.finalTotal,
            appliedAt: new Date().toISOString(),
          },
          message: data.message || `Coupon "${cleanCode}" applied successfully! You saved PKR ${discountAmount.toLocaleString()}`,
        };
      }

      // Backend returned 200 but valid is false
      const errCode = data.errorCode || COUPON_ERROR_CODES.INVALID_CODE;
      return {
        success: false,
        valid: false,
        errorCode: errCode,
        message: data.message || formatCouponErrorMessage(errCode, cleanCode),
      };
    }

    // Business rejection (400 Bad Request / 422 Unprocessable Entity)
    if (response.status === 400 || response.status === 422) {
      const errorJson = await response.json().catch(() => ({}));
      const errorCode = errorJson.errorCode || errorJson.code || COUPON_ERROR_CODES.INVALID_CODE;
      return {
        success: false,
        valid: false,
        errorCode,
        message: formatCouponErrorMessage(errorCode, cleanCode, errorJson.message, errorJson.minOrderAmount),
      };
    }

    // Backend endpoint not implemented yet on server (404 Not Found)
    if (response.status === 404) {
      return {
        success: false,
        valid: false,
        errorCode: COUPON_ERROR_CODES.ENDPOINT_NOT_FOUND,
        message: `Backend coupon validation endpoint (${COUPON_VALIDATE_ENDPOINT}) returned 404 Not Found. Backend integration is required.`,
      };
    }

    // Other HTTP error statuses (500, 502, 503)
    return {
      success: false,
      valid: false,
      errorCode: COUPON_ERROR_CODES.SERVER_ERROR,
      message: `Coupon service error (${response.status}). Please try again later.`,
    };
  } catch (err) {
    // Network failure (offline, connection refused, DNS error)
    return {
      success: false,
      valid: false,
      errorCode: COUPON_ERROR_CODES.NETWORK_ERROR,
      message: 'Network error connecting to coupon validation service. Please check your connection or try again.',
    };
  }
}

/**
 * Format user-friendly error messages based on authoritative backend error codes
 */
export function formatCouponErrorMessage(code, couponCode, customMessage, minOrderAmount) {
  if (customMessage) return customMessage;

  switch (code) {
    case COUPON_ERROR_CODES.EMPTY_CODE:
      return 'Please enter a coupon code.';
    case COUPON_ERROR_CODES.EXPIRED:
      return `Coupon "${couponCode}" has expired and is no longer valid.`;
    case COUPON_ERROR_CODES.NOT_APPLICABLE:
      return `Coupon "${couponCode}" is not applicable to the items in your cart.`;
    case COUPON_ERROR_CODES.MIN_ORDER_NOT_MET:
      return minOrderAmount
        ? `Minimum order amount of PKR ${minOrderAmount.toLocaleString()} required for coupon "${couponCode}".`
        : `Minimum order requirement not met for coupon "${couponCode}".`;
    case COUPON_ERROR_CODES.USAGE_LIMIT_REACHED:
      return `Coupon "${couponCode}" has reached its maximum redemption limit.`;
    case COUPON_ERROR_CODES.CUSTOMER_INELIGIBLE:
      return `Your account is not eligible for coupon "${couponCode}".`;
    case COUPON_ERROR_CODES.NETWORK_ERROR:
      return 'Unable to reach coupon server. Please check your connection.';
    case COUPON_ERROR_CODES.ENDPOINT_NOT_FOUND:
      return `Coupon endpoint (${COUPON_VALIDATE_ENDPOINT}) is pending backend deployment.`;
    case COUPON_ERROR_CODES.INVALID_CODE:
    default:
      return `Invalid coupon code "${couponCode}". Please verify and try again.`;
  }
}

/**
 * Revalidate currently applied coupon against new cart state.
 * Called when cart items, quantity, or add-ons change.
 * If invalid or expired, automatically clears the coupon and returns notification.
 */
export async function revalidateAppliedCoupon(currentCartItems, currentSubtotal, customerId) {
  const applied = getAppliedCoupon();
  if (!applied) return null;

  // If cart is empty
  if (!currentCartItems || currentCartItems.length === 0 || currentSubtotal <= 0) {
    removeAppliedCoupon();
    return {
      removed: true,
      reason: 'Cart is empty',
      message: 'Applied coupon was removed because your cart is empty.',
    };
  }

  // Pre-check minimum order if defined on the coupon
  if (applied.minOrderAmount && currentSubtotal < applied.minOrderAmount) {
    removeAppliedCoupon();
    return {
      removed: true,
      reason: 'Minimum order amount not met',
      message: `Coupon "${applied.code}" was removed because your cart subtotal (PKR ${currentSubtotal.toLocaleString()}) is below the required PKR ${applied.minOrderAmount.toLocaleString()}.`,
    };
  }

  // Re-verify with backend API for authoritative recalculated discount
  const validation = await validateCouponWithBackend({
    code: applied.code,
    subtotal: currentSubtotal,
    items: currentCartItems,
    customerId,
  });

  if (validation.valid && validation.coupon) {
    // Update with freshly calculated authoritative discount
    setAppliedCoupon(validation.coupon);
    return {
      removed: false,
      updated: true,
      coupon: validation.coupon,
      message: validation.message,
    };
  }

  // If backend says coupon is no longer applicable to updated cart
  removeAppliedCoupon();
  return {
    removed: true,
    reason: validation.message,
    message: `Coupon "${applied.code}" was removed: ${validation.message}`,
  };
}
