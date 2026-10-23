/**
 * Crust & Co - UI Helpers, Live Search, Product Customization Modal, Elastic Nav, and Page Loader
 */
import { getCartSummary, addToCart } from './cart.js';
import { getCurrentUser, logout } from './auth.js';
import { PRODUCTS, DEALS, formatPrice, getProductById } from './products.js';

export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast px-4 py-3 rounded-lg shadow-lg text-xs sm:text-sm font-medium flex items-center gap-3 border ${
    type === 'error'
      ? 'bg-rose-50 text-rose-900 border-rose-200'
      : 'bg-[#12372A] text-white border-[#1F4D3A]'
  }`;

  const iconSvg =
    type === 'error'
      ? `<svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
      : `<svg class="w-5 h-5 text-[#D4A72C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

/**
 * Top Page Loader Animation (progress bar when loading / transitioning pages)
 */
export function initPageLoader() {
  let progressBar = document.getElementById('page-progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'page-progress-bar';
    document.body.appendChild(progressBar);
  }

  // Initial page load completion animation
  progressBar.style.width = '35%';
  requestAnimationFrame(() => {
    progressBar.style.width = '100%';
    setTimeout(() => {
      progressBar.style.opacity = '0';
      setTimeout(() => {
        progressBar.style.width = '0%';
        progressBar.style.opacity = '1';
      }, 350);
    }, 200);
  });

  // Attach to internal links for seamless page transition feel
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (
      href &&
      !href.startsWith('#') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:') &&
      !href.startsWith('http') &&
      !link.hasAttribute('target') &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      progressBar.style.opacity = '1';
      progressBar.style.width = '40%';
      setTimeout(() => {
        progressBar.style.width = '85%';
      }, 100);
    }
  });
}

/**
 * PRODUCT CUSTOMIZATION POPUP / MODAL
 * Requirement 1 & 2:
 * Replaces direct "Add to Cart" with a rich customization popup containing:
 * - Product image, name, description, prep time, price
 * - Variant selection (sizes/patties)
 * - Gourmet Add-ons selection (omitted cleanly if product has none)
 * - Special kitchen instructions
 * - Quantity stepper
 * - Dynamic price calculation
 * - Authoritative Add to Cart submission
 * - Keyboard (Escape) & click-outside dismiss
 * - Background scroll lock
 */
let currentModalKeydownHandler = null;

export function openProductModal(productOrId) {
  let product = null;
  if (typeof productOrId === 'string') {
    product = getProductById(productOrId) || PRODUCTS.find((p) => p.id === productOrId);
  } else {
    product = productOrId;
  }

  if (!product) {
    showToast('Product could not be found.', 'error');
    return;
  }

  if (!product.available) {
    showToast(`${product.name} is currently sold out for today.`, 'error');
    return;
  }

  // Find or create modal backdrop
  let modalWrapper = document.getElementById('global-product-modal');
  if (!modalWrapper) {
    modalWrapper = document.createElement('div');
    modalWrapper.id = 'global-product-modal';
    modalWrapper.className =
      'fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-4 overflow-y-auto';
    document.body.appendChild(modalWrapper);
  }

  // Initial state for this item
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  let selectedVariant = variants.length > 0 ? variants[0] : { name: 'Regular', priceAdjustment: 0 };
  let selectedAddOns = []; // Array of { name, price }
  let quantity = 1;
  let specialInstructions = '';

  const addOnsList = product.addOns && product.addOns.length > 0 ? product.addOns : [];

  function calculateTotals() {
    const basePrice = Number(product.price) || 0;
    const variantAdj = Number(selectedVariant?.priceAdjustment) || 0;
    const addOnsSum = selectedAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const unitPrice = basePrice + variantAdj + addOnsSum;
    const lineTotal = unitPrice * quantity;
    return { basePrice, variantAdj, addOnsSum, unitPrice, lineTotal };
  }

  function renderModalContent() {
    const { unitPrice, lineTotal, addOnsSum } = calculateTotals();

    modalWrapper.innerHTML = `
      <div
        class="bg-white rounded-2xl border border-[#E8E5DC] shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden relative my-auto animate-modal-enter transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
      >
        <!-- Modal Top Navigation Header -->
        <div class="px-5 py-3.5 border-b border-[#E8E5DC] flex items-center justify-between gap-3 bg-[#F8F6F0] shrink-0">
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-wider text-[#D4A72C] block">Customize Item</span>
            <span class="text-xs font-semibold text-[#12372A] uppercase tracking-wide truncate block">${product.category}</span>
          </div>
          <button
            type="button"
            id="product-modal-close-btn"
            class="w-8 h-8 rounded-full border border-[#E8E5DC] bg-white hover:bg-neutral-100 text-[#1C1C1C] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close customization modal"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable Customization Body -->
        <div class="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 overscroll-contain">
          
          <!-- Product Hero Intro -->
          <div class="flex gap-4 items-start">
            <div class="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[#E8E5DC]">
              <img
                src="${product.image}"
                alt="${product.name}"
                class="w-full h-full object-cover"
                referrerpolicy="no-referrer"
              />
              ${
                product.badge
                  ? `<span class="absolute top-1.5 left-1.5 bg-[#12372A] text-[#D4A72C] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">${product.badge}</span>`
                  : ''
              }
            </div>

            <div class="flex-1 min-w-0">
              <h2 id="modal-product-title" class="font-serif font-bold text-lg sm:text-xl text-[#12372A] leading-snug">
                ${product.name}
              </h2>
              <div class="flex items-center gap-2 mt-1 text-xs text-[#6B6B6B]">
                <span class="font-serif font-bold text-base text-[#12372A] tabular-nums">${formatPrice(product.price)}</span>
                <span>•</span>
                <span>${product.prepTime || '15 mins'}</span>
              </div>
              <p class="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed line-clamp-3">
                ${product.description || product.shortDescription || ''}
              </p>
            </div>
          </div>

          <!-- Section 1: Variants (Sizes / Patty Options) -->
          ${
            variants.length > 0
              ? `
            <div class="pt-3 border-t border-[#E8E5DC]">
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#12372A] flex items-center gap-1.5">
                  <span>Choose Variant</span>
                  <span class="text-[10px] px-1.5 py-0.2 bg-[#12372A]/10 text-[#12372A] rounded font-semibold">Required</span>
                </label>
                <span class="text-[11px] text-[#6B6B6B]">Select one</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${variants
                  .map((v) => {
                    const isSelected = selectedVariant.name === v.name;
                    return `
                    <button
                      type="button"
                      data-modal-variant="${v.name}"
                      class="flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#12372A] bg-[#12372A]/5 text-[#12372A] font-semibold ring-1 ring-[#12372A]'
                          : 'border-[#E8E5DC] text-[#1C1C1C] hover:border-[#12372A]/40 bg-white'
                      }"
                    >
                      <div class="flex items-center gap-2">
                        <span class="w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#12372A] bg-[#12372A]' : 'border-[#6B6B6B]'
                        }">
                          ${isSelected ? '<span class="w-1.5 h-1.5 rounded-full bg-white"></span>' : ''}
                        </span>
                        <span class="truncate">${v.name}</span>
                      </div>
                      <span class="text-[11px] tabular-nums font-semibold ${
                        v.priceAdjustment > 0 ? 'text-[#12372A]' : 'text-[#6B6B6B]'
                      }">
                        ${v.priceAdjustment > 0 ? `+${formatPrice(v.priceAdjustment)}` : 'Standard'}
                      </span>
                    </button>
                  `;
                  })
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <!-- Section 2: Gourmet Add-ons (Omitted cleanly if none available) -->
          ${
            addOnsList.length > 0
              ? `
            <div class="pt-3 border-t border-[#E8E5DC]">
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#12372A] flex items-center gap-1.5">
                  <span>Gourmet Add-ons</span>
                  <span class="text-[10px] px-1.5 py-0.2 bg-neutral-100 text-[#6B6B6B] rounded font-medium">Optional</span>
                </label>
                <span class="text-[11px] text-[#6B6B6B]">Select any</span>
              </div>
              <div class="space-y-2">
                ${addOnsList
                  .map((a) => {
                    const isChecked = selectedAddOns.some((item) => item.name === a.name);
                    return `
                    <label class="flex items-center justify-between p-2.5 rounded-lg border border-[#E8E5DC] hover:border-[#12372A]/40 cursor-pointer text-xs transition-colors select-none ${
                      isChecked ? 'bg-[#12372A]/5 border-[#12372A] font-semibold text-[#12372A]' : 'bg-white text-[#1C1C1C]'
                    }">
                      <div class="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          data-modal-addon-name="${a.name}"
                          data-modal-addon-price="${a.price}"
                          class="w-4 h-4 rounded border-[#E8E5DC] text-[#12372A] focus:ring-[#12372A] cursor-pointer"
                          ${isChecked ? 'checked' : ''}
                        />
                        <span>${a.name}</span>
                      </div>
                      <span class="font-bold text-[#12372A] tabular-nums text-xs">+${formatPrice(a.price)}</span>
                    </label>
                  `;
                  })
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <!-- Section 3: Special Kitchen Instructions -->
          <div class="pt-3 border-t border-[#E8E5DC]">
            <label for="modal-instructions" class="block text-xs font-bold uppercase tracking-wider text-[#12372A] mb-1.5">
              Special Kitchen Instructions
            </label>
            <textarea
              id="modal-instructions"
              rows="2"
              placeholder="e.g. Less spicy, well toasted, sauce on the side..."
              class="w-full text-xs p-2.5 rounded-lg border border-[#E8E5DC] focus:outline-hidden focus:border-[#12372A] bg-white resize-none placeholder:text-[#6B6B6B]/60"
            >${specialInstructions}</textarea>
          </div>

        </div>

        <!-- Sticky Modal Footer with Quantity Stepper & Add to Cart -->
        <div class="px-5 py-4 border-t border-[#E8E5DC] bg-[#F8F6F0] shrink-0 space-y-3">
          
          <div class="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span>Item Price Breakdown:</span>
            <span class="tabular-nums text-[#12372A] font-semibold">
              ${formatPrice(unitPrice)} each ${addOnsSum > 0 ? `(incl. ${formatPrice(addOnsSum)} extras)` : ''}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3">
            <!-- Quantity Stepper -->
            <div class="flex items-center border border-[#E8E5DC] rounded-lg bg-white shadow-2xs shrink-0">
              <button
                type="button"
                id="modal-qty-minus"
                class="w-9 h-10 flex items-center justify-center text-[#1C1C1C] hover:bg-[#E8E5DC] rounded-l-lg font-bold text-base transition-colors cursor-pointer select-none"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span id="modal-qty-display" class="w-10 text-center text-xs sm:text-sm font-bold tabular-nums text-[#12372A]">
                ${quantity}
              </span>
              <button
                type="button"
                id="modal-qty-plus"
                class="w-9 h-10 flex items-center justify-center text-[#1C1C1C] hover:bg-[#E8E5DC] rounded-r-lg font-bold text-base transition-colors cursor-pointer select-none"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <!-- Authoritative Add to Cart CTA -->
            <button
              type="button"
              id="modal-add-to-cart-submit"
              class="flex-1 py-3 px-4 bg-[#12372A] hover:bg-[#1F4D3A] text-white text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-between shadow-sm active:scale-98 cursor-pointer"
            >
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#D4A72C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Add to Cart</span>
              </span>
              <span class="font-serif font-bold text-sm sm:text-base text-[#D4A72C] tabular-nums">
                ${formatPrice(lineTotal)}
              </span>
            </button>
          </div>

        </div>
      </div>
    `;

    attachModalEvents();
  }

  function attachModalEvents() {
    // Close button
    const closeBtn = document.getElementById('product-modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = closeProductModal;
    }

    // Variants toggle
    modalWrapper.querySelectorAll('[data-modal-variant]').forEach((btn) => {
      btn.onclick = (e) => {
        const vName = e.currentTarget.getAttribute('data-modal-variant');
        const v = variants.find((item) => item.name === vName);
        if (v) {
          selectedVariant = v;
          saveInstructionsBeforeRerender();
          renderModalContent();
        }
      };
    });

    // Add-ons checkbox toggle
    modalWrapper.querySelectorAll('input[data-modal-addon-name]').forEach((chk) => {
      chk.onchange = (e) => {
        const aName = e.currentTarget.getAttribute('data-modal-addon-name');
        const aPrice = Number(e.currentTarget.getAttribute('data-modal-addon-price'));
        if (e.currentTarget.checked) {
          if (!selectedAddOns.some((i) => i.name === aName)) {
            selectedAddOns.push({ name: aName, price: aPrice });
          }
        } else {
          selectedAddOns = selectedAddOns.filter((i) => i.name !== aName);
        }
        saveInstructionsBeforeRerender();
        renderModalContent();
      };
    });

    // Quantity buttons
    const minusBtn = document.getElementById('modal-qty-minus');
    const plusBtn = document.getElementById('modal-qty-plus');
    if (minusBtn) {
      minusBtn.onclick = () => {
        if (quantity > 1) {
          quantity--;
          saveInstructionsBeforeRerender();
          renderModalContent();
        }
      };
    }
    if (plusBtn) {
      plusBtn.onclick = () => {
        quantity++;
        saveInstructionsBeforeRerender();
        renderModalContent();
      };
    }

    // Submit Add to Cart
    const submitBtn = document.getElementById('modal-add-to-cart-submit');
    if (submitBtn) {
      submitBtn.onclick = () => {
        saveInstructionsBeforeRerender();

        addToCart(product, {
          variant: selectedVariant,
          addOns: selectedAddOns,
          quantity,
          specialInstructions,
        });

        const extrasText = selectedAddOns.length > 0 ? ` with ${selectedAddOns.length} extra(s)` : '';
        showToast(`Added ${quantity}× ${product.name}${extrasText} to cart!`);
        closeProductModal();
      };
    }
  }

  function saveInstructionsBeforeRerender() {
    const instEl = document.getElementById('modal-instructions');
    if (instEl) {
      specialInstructions = instEl.value;
    }
  }

  // Backdrop click dismiss
  modalWrapper.onclick = (e) => {
    if (e.target === modalWrapper) {
      closeProductModal();
    }
  };

  // Keyboard Escape listener
  if (currentModalKeydownHandler) {
    document.removeEventListener('keydown', currentModalKeydownHandler);
  }
  currentModalKeydownHandler = (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
    }
  };
  document.addEventListener('keydown', currentModalKeydownHandler);

  // Prevent background scroll
  document.body.style.overflow = 'hidden';

  // Render initial modal state
  renderModalContent();
  modalWrapper.classList.remove('hidden');
}

export function closeProductModal() {
  const modalWrapper = document.getElementById('global-product-modal');
  if (modalWrapper) {
    modalWrapper.classList.add('hidden');
    modalWrapper.innerHTML = '';
  }
  document.body.style.overflow = '';
  if (currentModalKeydownHandler) {
    document.removeEventListener('keydown', currentModalKeydownHandler);
    currentModalKeydownHandler = null;
  }
}

/**
 * Live Search Component with Instant Dropdown
 * Updated to open customization popup on item selection!
 */
export function initLiveSearch() {
  const searchInputs = document.querySelectorAll('.live-search-input');

  searchInputs.forEach((input) => {
    const wrapper = input.closest('.search-wrapper');
    if (!wrapper) return;

    const dropdown = wrapper.querySelector('.search-dropdown');
    const clearBtn = wrapper.querySelector('.search-clear-btn');

    if (!dropdown) return;

    const handleSearch = () => {
      const query = input.value.trim().toLowerCase();

      if (clearBtn) {
        if (query.length > 0) {
          clearBtn.classList.remove('hidden');
        } else {
          clearBtn.classList.add('hidden');
        }
      }

      if (query.length < 1) {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        return;
      }

      // Filter products & deals
      const matchingProducts = PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(query)) ||
          p.sku.toLowerCase().includes(query)
      );

      const matchingDeals = DEALS.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.shortDescription.toLowerCase().includes(query)
      );

      if (matchingProducts.length === 0 && matchingDeals.length === 0) {
        dropdown.classList.remove('hidden');
        dropdown.innerHTML = `
          <div class="p-4 sm:p-5 text-center text-xs text-[#6B6B6B]">
            <p>No dishes found for "<span class="font-semibold text-[#12372A]">${query}</span>"</p>
            <p class="text-[11px] mt-1 text-[#6B6B6B]/80">Try searching for "pizza", "burger", "fries", or "deal"</p>
          </div>
        `;
        return;
      }

      let html = '<div class="py-2 divide-y divide-[#E8E5DC] max-h-96 overflow-y-auto">';

      // Matching Deals
      if (matchingDeals.length > 0) {
        html += `<div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D4A72C] bg-[#12372A]/5">Combo Deals</div>`;
        matchingDeals.forEach((d) => {
          html += `
            <div class="p-2.5 sm:p-3 hover:bg-[#F8F6F0] flex items-center justify-between gap-3 transition-colors">
              <a href="./deals.html" class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                <img src="${d.image}" alt="${d.title}" class="w-10 h-10 rounded-md object-cover bg-neutral-100 shrink-0" />
                <div class="min-w-0">
                  <div class="text-xs font-bold text-[#12372A] truncate">${d.title}</div>
                  <div class="text-[11px] text-[#6B6B6B] truncate">${d.shortDescription}</div>
                </div>
              </a>
              <div class="text-right shrink-0">
                <div class="text-xs font-bold font-serif text-[#12372A]">${formatPrice(d.dealPrice)}</div>
                <button data-search-add-deal="${d.id}" class="text-[10px] text-[#12372A] font-bold bg-[#D4A72C]/20 hover:bg-[#D4A72C] px-2 py-0.5 rounded transition-colors mt-0.5 cursor-pointer">
                  + Add
                </button>
              </div>
            </div>
          `;
        });
      }

      // Matching Products
      if (matchingProducts.length > 0) {
        html += `<div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#12372A] bg-[#F8F6F0]">Dishes & Items (${matchingProducts.length})</div>`;
        matchingProducts.forEach((p) => {
          const isUnavailable = !p.available;
          html += `
            <div class="p-2.5 sm:p-3 hover:bg-[#F8F6F0] flex items-center justify-between gap-3 transition-colors ${
              isUnavailable ? 'opacity-60 bg-neutral-50' : ''
            }">
              <a href="${isUnavailable ? '#' : `./product.html?slug=${p.slug}`}" class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                <img src="${p.image}" alt="${p.name}" class="w-10 h-10 rounded-md object-cover bg-neutral-100 shrink-0 ${isUnavailable ? 'grayscale' : ''}" />
                <div class="min-w-0">
                  <div class="text-xs font-bold text-[#12372A] truncate flex items-center gap-1.5">
                    <span>${p.name}</span>
                    ${isUnavailable ? '<span class="text-[9px] bg-neutral-800 text-white px-1.5 py-0.2 rounded">Sold Out</span>' : ''}
                  </div>
                  <div class="text-[11px] text-[#6B6B6B] uppercase tracking-wider">${p.category}</div>
                </div>
              </a>
              <div class="text-right shrink-0">
                <div class="text-xs font-bold font-serif text-[#12372A]">${formatPrice(p.price)}</div>
                ${
                  isUnavailable
                    ? '<span class="text-[10px] text-neutral-400 font-medium">Sold Out</span>'
                    : `<button data-search-customize-product="${p.id}" class="text-[10px] text-white font-bold bg-[#12372A] hover:bg-[#1F4D3A] px-2 py-0.5 rounded transition-colors mt-0.5 cursor-pointer">
                        + Customize
                       </button>`
                }
              </div>
            </div>
          `;
        });
      }

      html += '</div>';

      dropdown.innerHTML = html;
      dropdown.classList.remove('hidden');

      // Hook up product customization popup from search dropdown
      dropdown.querySelectorAll('[data-search-customize-product]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = e.currentTarget.getAttribute('data-search-customize-product');
          dropdown.classList.add('hidden');
          openProductModal(pId);
        });
      });

      dropdown.querySelectorAll('[data-search-add-deal]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const dId = e.currentTarget.getAttribute('data-search-add-deal');
          const deal = DEALS.find((d) => d.id === dId);
          if (deal) {
            addToCart(
              { id: deal.id, sku: deal.sku, name: deal.title, price: deal.dealPrice, image: deal.image },
              { variant: { name: 'Combo Deal', priceAdjustment: 0 }, quantity: 1 }
            );
            showToast(`Added ${deal.title} to cart`);
            dropdown.classList.add('hidden');
          }
        });
      });
    };

    input.addEventListener('input', handleSearch);
    input.addEventListener('focus', () => {
      if (input.value.trim().length > 0) {
        handleSearch();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.add('hidden');
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        input.focus();
      });
    }

    // Close on click outside or Escape
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.add('hidden');
      }
    });
  });
}

/**
 * Synchronize Header State & Elastic Active Nav Link
 */
export function updateHeaderState() {
  const summary = getCartSummary();
  const cartBadges = document.querySelectorAll('.cart-badge');
  cartBadges.forEach((badge) => {
    badge.textContent = summary.itemCount;
    if (summary.itemCount > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });

  const user = getCurrentUser();
  const authSlots = document.querySelectorAll('.auth-slot');
  authSlots.forEach((slot) => {
    if (user) {
      slot.innerHTML = `
        <div class="flex items-center gap-1.5 sm:gap-2.5">
          <a href="./account.html" class="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1C1C1C] hover:text-[#12372A] transition-colors whitespace-nowrap" title="My Account">
            <span class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs font-serif font-bold">
              ${user.name.charAt(0).toUpperCase()}
            </span>
            <span class="hidden xl:inline">${user.name.split(' ')[0]}</span>
          </a>
          <button id="logout-btn" class="text-[11px] text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors underline whitespace-nowrap cursor-pointer">
            Logout
          </button>
        </div>
      `;
    } else {
      slot.innerHTML = `
        <a href="./login.html" class="text-xs sm:text-sm font-medium text-[#1C1C1C] hover:text-[#12372A] transition-colors whitespace-nowrap">
          Login
        </a>
      `;
    }
  });

  // Attach logout handler if button exists
  document.querySelectorAll('#logout-btn').forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      logout();
      showToast('Logged out successfully');
      setTimeout(() => {
        window.location.href = './index.html';
      }, 500);
    };
  });

  // Highlight active link with elastic animation class
  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.add('nav-elastic-link');
    if (
      (currentPath === '/' && (href === '/' || href === '/index.html' || href === './index.html')) ||
      (currentPath.endsWith(href) && href !== '/' && href !== './')
    ) {
      link.classList.add('active-nav');
    } else {
      link.classList.remove('active-nav');
    }
  });
}

export function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-backdrop');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.remove('translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
}
