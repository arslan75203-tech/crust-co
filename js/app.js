/**
 * Crust & Co - Global Application Controller
 */
import { updateHeaderState, initMobileNav, initPageLoader, initLiveSearch } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  updateHeaderState();
  initMobileNav();
  initLiveSearch();

  window.addEventListener('crust:cart-updated', () => {
    updateHeaderState();
  });

  window.addEventListener('crust:auth-changed', () => {
    updateHeaderState();
  });
});
