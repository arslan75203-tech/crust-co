/**
 * Crust & Co - UI Helpers, Live Search, Elastic Nav, and Page Loader
 */
import { getCartSummary, addToCart } from './cart.js';
import { getCurrentUser, logout } from './auth.js';
import { PRODUCTS, DEALS, formatPrice } from './products.js';

export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-3 border ${
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
 * Live Search Component with Instant Dropdown
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
          <div class="p-5 text-center text-xs text-[#6B6B6B]">
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
            <div class="p-3 hover:bg-[#F8F6F0] flex items-center justify-between gap-3 transition-colors">
              <a href="./deals.html" class="flex items-center gap-3 flex-1 min-w-0">
                <img src="${d.image}" alt="${d.title}" class="w-10 h-10 rounded-md object-cover bg-neutral-100 shrink-0" />
                <div class="min-w-0">
                  <div class="text-xs font-bold text-[#12372A] truncate">${d.title}</div>
                  <div class="text-[11px] text-[#6B6B6B] truncate">${d.shortDescription}</div>
                </div>
              </a>
              <div class="text-right shrink-0">
                <div class="text-xs font-bold font-serif text-[#12372A]">${formatPrice(d.dealPrice)}</div>
                <button data-search-add-deal="${d.id}" class="text-[10px] text-[#12372A] font-bold bg-[#D4A72C]/20 hover:bg-[#D4A72C] px-2 py-0.5 rounded transition-colors mt-0.5">
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
            <div class="p-3 hover:bg-[#F8F6F0] flex items-center justify-between gap-3 transition-colors ${
              isUnavailable ? 'opacity-60 bg-neutral-50' : ''
            }">
              <a href="${isUnavailable ? '#' : `./product.html?slug=${p.slug}`}" class="flex items-center gap-3 flex-1 min-w-0">
                <img src="${p.image}" alt="${p.name}" class="w-10 h-10 rounded-md object-cover bg-neutral-100 shrink-0 ${isUnavailable ? 'grayscale' : ''}" />
                <div class="min-w-0">
                  <div class="text-xs font-bold text-[#12372A] truncate flex items-center gap-1.5">
                    <span>${p.name}</span>
                    ${isUnavailable ? '<span class="text-[9px] bg-neutral-800 text-white px-1.5 py-0.5 rounded">Sold Out</span>' : ''}
                  </div>
                  <div class="text-[11px] text-[#6B6B6B] uppercase tracking-wider">${p.category}</div>
                </div>
              </a>
              <div class="text-right shrink-0">
                <div class="text-xs font-bold font-serif text-[#12372A]">${formatPrice(p.price)}</div>
                ${
                  isUnavailable
                    ? '<span class="text-[10px] text-neutral-400 font-medium">Sold Out</span>'
                    : `<button data-search-add-product="${p.id}" class="text-[10px] text-white font-bold bg-[#12372A] hover:bg-[#1F4D3A] px-2 py-0.5 rounded transition-colors mt-0.5">
                        + Add
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

      // Attach add-to-cart handlers in dropdown
      dropdown.querySelectorAll('[data-search-add-product]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = e.currentTarget.getAttribute('data-search-add-product');
          const prod = PRODUCTS.find((p) => p.id === pId);
          if (prod && prod.available) {
            addToCart(prod, {
              variant: prod.variants[0] || { name: 'Regular', priceAdjustment: 0 },
              quantity: 1,
            });
            showToast(`Added ${prod.name} to cart`);
          }
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
        <div class="flex items-center gap-3">
          <a href="./account.html" class="flex items-center gap-2 text-sm font-medium text-[#1C1C1C] hover:text-[#12372A] transition-colors whitespace-nowrap">
            <span class="w-7 h-7 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs font-serif font-bold">
              ${user.name.charAt(0).toUpperCase()}
            </span>
            <span class="hidden lg:inline">${user.name.split(' ')[0]}</span>
          </a>
          <button id="logout-btn" class="text-xs text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors underline whitespace-nowrap">
            Logout
          </button>
        </div>
      `;
    } else {
      slot.innerHTML = `
        <a href="./login.html" class="text-sm font-medium text-[#1C1C1C] hover:text-[#12372A] transition-colors whitespace-nowrap">
          Login / Sign Up
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
      (currentPath === '/' && (href === '/' || href === '/index.html')) ||
      (currentPath.endsWith(href) && href !== '/')
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
