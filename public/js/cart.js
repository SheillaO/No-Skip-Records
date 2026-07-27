import { logout } from "./logout.js";
import { checkAuth, renderGreeting, showHideMenuItems } from "./authUI.js";
import { loadCart, removeItem, removeAll } from "./cartService.js";

// All API calls must use absolute URL to reach Render from Netlify
const BACKEND_URL = "https://no-skip-records.onrender.com";

const checkoutBtn = document.getElementById("checkout-btn");
const userMessage = document.getElementById("user-message");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");

const dom = { checkoutBtn, userMessage, cartList, cartTotal };

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

if (dom.cartList) {
  dom.cartList.addEventListener("click", (event) => {
    if (event.target.matches(".remove-btn")) {
      removeItem(event.target.dataset.id, dom);
    }
  });
}

if (dom.checkoutBtn) {
  dom.checkoutBtn.addEventListener("click", async () => {
    try {
      const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: "include",
      });
      const me = await meRes.json();

      if (!me.isLoggedIn) {
        window.location.href = "/login.html";
        return;
      }

      const totalText = dom.cartTotal ? dom.cartTotal.textContent : "";
      const amount = parseFloat(totalText.replace(/[^0-9.]/g, ""));

      if (!amount || amount <= 0) {
        if (dom.userMessage)
          dom.userMessage.textContent = "Your cart is empty.";
        return;
      }

      if (dom.userMessage)
        dom.userMessage.textContent =
          "🔄 Connecting to a secure KES checkout channel...";

      const initRes = await fetch(`${BACKEND_URL}/api/payments/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: me.email, amount }),
      });

      if (!initRes.ok) {
        throw new Error(
          `Server returned status code ${initRes.status} during payment initialization.`,
        );
      }

      // 🔥 CRITICAL REFACTOR: Extract the authorizationUrl from your backend payload package
      const { authorizationUrl } = await initRes.json();

      if (authorizationUrl) {
        // Clear local UI components right before leaving the tab frame
        await removeAll(dom);

        // 🔥 UNCRASHABLE SOLUTION: Navigates out of the local window layout straight into Paystack's hosted tab
        window.location.href = authorizationUrl;
      } else {
        throw new Error(
          "Could not retrieve a valid payment gateway authorization URL from server.",
        );
      }
    } catch (err) {
      console.error("Checkout error:", err);
      if (dom.userMessage)
        dom.userMessage.textContent = "Something went wrong. Please try again.";
    }
  });
}

async function init() {
  if (dom.cartList) {
    await loadCart(dom);
  }
  const name = await checkAuth();
  renderGreeting(name);
  showHideMenuItems(name);
}

init();
