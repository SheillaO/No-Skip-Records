import { logout } from "./logout.js";
import { checkAuth, renderGreeting, showHideMenuItems } from "./authUI.js";
import { loadCart, removeItem, removeAll } from "./cartService.js";

// Cache elements safely
const checkoutBtn = document.getElementById("checkout-btn");
const userMessage = document.getElementById("user-message");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");

const dom = { checkoutBtn, userMessage, cartList, cartTotal };

// ===== Global Element Event Listeners =====
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

// 🔥 FIXED: Only binds the click listener if the cart list wrapper is present on screen
if (dom.cartList) {
  dom.cartList.addEventListener("click", (event) => {
    if (event.target.matches(".remove-btn")) {
      removeItem(event.target.dataset.id, dom);
    }
  });
}

// 🔥 FIXED: Only processes checkout mechanics if the button exists on the current page DOM context
if (dom.checkoutBtn) {
  dom.checkoutBtn.addEventListener("click", () => {
    removeAll(dom);
    if (dom.userMessage)
      dom.userMessage.textContent = "Your order has been sent for processing.";
    if (dom.checkoutBtn) dom.checkoutBtn.classList.add("visually-hidden");
    if (dom.cartTotal) dom.cartTotal.classList.add("visually-hidden");
  });
}

// ===== Execution Lifecycle Initialization =====
async function init() {
  // 🔥 FIXED: Only executes the backend items database pull if looking at the active cart list view container
  if (dom.cartList) {
    await loadCart(dom);
  }

  const name = await checkAuth();
  renderGreeting(name);
  showHideMenuItems(name);
}

init();
