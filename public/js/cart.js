import { logout } from './logout.js'
import { checkAuth, renderGreeting, showHideMenuItems } from './authUI.js'
import { loadCart, removeItem, removeAll } from './cartService.js'

const dom = {
  checkoutBtn: document.getElementById('checkout-btn'),
  userMessage: document.getElementById('user-message'),
  cartList: document.getElementById('cart-list'),
  cartTotal: document.getElementById('cart-total')
}

// Global authorization event binding
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// Dynamic item deletion listener assignment
if (dom.cartList) {
  dom.cartList.addEventListener('click', event => {
    if (event.target.matches('.remove-btn')) {
      removeItem(event.target.dataset.id, dom)
    }
  })
}

// Platform correction check-out processing module
if (dom.checkoutBtn) {
  dom.checkoutBtn.addEventListener('click', () => {
    removeAll(dom)
    if (dom.userMessage) dom.userMessage.textContent = 'Your order has been sent for processing.'
    if (dom.checkoutBtn) dom.checkoutBtn.classList.add('visually-hidden')
    if (dom.cartTotal) dom.cartTotal.classList.add('visually-hidden')
  })
}

// Page execution lifecycle bootstrapper
async function init() {
  if (dom.cartList) {
    await loadCart(dom)
  }
  const name = await checkAuth()
  renderGreeting(name)
  showHideMenuItems(name)
} 
 
init()
