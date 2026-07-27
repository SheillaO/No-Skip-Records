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
      // FIXED: was "/api/auth/me" (relative) — broken from Netlify to Render
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

      // FIXED: was "/api/payments/initialize" (relative) — broken from Netlify to Render
      const initRes = await fetch(`${BACKEND_URL}/api/payments/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: me.email, amount }),
      });

      // Guard Clause: Block execution immediately if Render server responds with a 500 or 400 error
      if (!initRes.ok) {
        throw new Error(
          `Server returned status code ${initRes.status} during payment initialization.`,
        );
      }

      const { reference } = await initRes.json();

      // Open Paystack popup setup
      const handler = PaystackPop.setup({
        key: "pk_test_4bf1586ca0dbcd82c09ea209c30c893c00fa4605",
        email: me.email,
        amount: Math.round(amount * 100),
        currency: "USD",
        ref: reference,

        // FIXED: Replaced explicit "async function" with a regular synchronous function wrapper to pass validation checks
        callback: function (response) {
          // Isolate asynchronous verification steps safely inside an Immediately Invoked Function Expression (IIFE)
          (async () => {
            try {
              const verifyRes = await fetch(
                `${BACKEND_URL}/api/payments/verify/${response.reference}`,
                { credentials: "include" },
              );
              const result = await verifyRes.json();

              if (result.success) {
                await removeAll(dom);
                if (dom.userMessage)
                  dom.userMessage.textContent =
                    "✅ Payment confirmed! Your records are on their way.";
                if (dom.checkoutBtn)
                  dom.checkoutBtn.classList.add("visually-hidden");
                if (dom.cartTotal)
                  dom.cartTotal.classList.add("visually-hidden");
              } else {
                if (dom.userMessage)
                  dom.userMessage.textContent =
                    "❌ Payment could not be verified. Please try again.";
              }
            } catch (verifyErr) {
              console.error("Verification connection error:", verifyErr);
              if (dom.userMessage)
                dom.userMessage.textContent =
                  "Something went wrong verifying payment status.";
            }
          })();
        },

        onClose: function () {
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

async function init() {
  if (dom.cartList) {
    await loadCart(dom);
  }
  const name = await checkAuth();
  renderGreeting(name);
  showHideMenuItems(name);
}

init();
