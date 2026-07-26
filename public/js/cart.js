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
  dom.checkoutBtn.addEventListener("click", async () => {
    try {
      // Get current user's email so Paystack can send a receipt
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json();

      if (!me.isLoggedIn) {
        window.location.href = "/login.html";
        return;
      }

      // Get total safely from the cart total paragraph text e.g. "Total: $45.97"
      const totalText = dom.cartTotal ? dom.cartTotal.textContent : "";
      const amount = parseFloat(totalText.replace(/[^0-9.]/g, ""));

      if (!amount || amount <= 0) {
        if (dom.userMessage)
          dom.userMessage.textContent = "Your cart is empty.";
        return;
      }

      // Tell our backend to start a Paystack session
      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: me.email, amount }),
      });

      const { reference } = await initRes.json();

      // Open Paystack's popup
      // Test card: 4084084084084081, any future date, any CVV
      const handler = PaystackPop.setup({
        key: "pk_test_your_public_key_here", // ← replace with your actual test public key
        email: me.email,
        amount: Math.round(amount * 100),
        currency: "USD",
        ref: reference,

        callback: async function (response) {
          // Payment completed — verify it on the backend
          const verifyRes = await fetch(
            `/api/payments/verify/${response.reference}`,
            {
              credentials: "include",
            },
          );
          const result = await verifyRes.json();

          if (result.success) {
            // Clear the cart and show success
            await removeAll(dom);
            if (dom.userMessage)
              dom.userMessage.textContent =
                "✅ Payment confirmed! Your records are on their way.";
            if (dom.checkoutBtn)
              dom.checkoutBtn.classList.add("visually-hidden");
            if (dom.cartTotal) dom.cartTotal.classList.add("visually-hidden");
          } else {
            if (dom.userMessage)
              dom.userMessage.textContent =
                "❌ Payment could not be verified. Please try again.";
          }
        },

        onClose: function () {
          // User closed the popup without paying
          if (dom.userMessage)
            dom.userMessage.textContent =
              "Payment cancelled. Your cart is still saved.";
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error("Checkout error:", err);
      if (dom.userMessage)
        dom.userMessage.textContent = "Something went wrong. Please try again.";
    }
  });
}

// ===== Execution Lifecycle Initialization =====
async function init() {
  // 🔥 FIXED: Only executes the backend items database pull if looking at the active cart list view container
  if (dom.cartList) {
    await loadCart(dom); // Kept the "await" keyword from file 1 to ensure lifecycle order
  }

  const name = await checkAuth();
  renderGreeting(name);
  showHideMenuItems(name);
}

init();
