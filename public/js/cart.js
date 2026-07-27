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

      if (dom.userMessage) {
        dom.userMessage.textContent = "🔄 Initializing secure payment...";
      }

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

      const { reference } = await initRes.json();

      // 🔥 CRITICAL LAYOUT FIX: Re-verify that the global Paystack constructor object is explicitly ready
      if (typeof PaystackPop === "undefined") {
        throw new Error(
          "Paystack SDK script header failed to load or parse in the global window layout scope.",
        );
      }

      // Re-instantiate a clean isolated object instance to completely avoid target document context errors
      const handler = PaystackPop.setup({
        key: "pk_test_4bf1586ca0dbcd82c09ea209c30c893c00fa4605",
        email: me.email,
        amount: Math.round(amount * 100),
        currency: "KES", // Verified Kenya Shillings channel
        ref: reference,

        callback: function (response) {
          // Wrapped safely inside an immediately invoked function to bypass type constraints
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

      // Call the iframe overlay anchor link directly
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
