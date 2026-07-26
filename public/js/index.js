import { logout } from "./logout.js";
import { checkAuth, renderGreeting, showHideMenuItems } from "./authUI.js";
import { getProducts, populateGenreSelect } from "./productService.js";
import { renderProducts, applySearchFilter } from "./productUI.js";
import { updateCartIcon } from "./cartService.js";

// ===== State Management Trackers =====
// NEW: tracks whatever's currently on screen so Shuffle can reorder
// it instantly, without firing off another fetch.
export let lastRenderedProducts = [];

// ===== Authentication & Menu Toggle =====
document.getElementById("logout-btn").addEventListener("click", logout);

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".header-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

// ===== Initial Load =====
async function init() {
  populateGenreSelect();
  const products = await getProducts();

  // Save initial products to our local state tracker for shufflability
  lastRenderedProducts = products;
  renderProducts(products);

  const name = await checkAuth();
  renderGreeting(name);
  showHideMenuItems(name);

  if (name) {
    await updateCartIcon();
  }
}

init();

// ===== Event Listeners =====
document.getElementById("search-input").addEventListener("input", (e) => {
  e.preventDefault();
  applySearchFilter();
});

// prevent 'enter' from submitting
document.getElementById("search-input").addEventListener("submit", (e) => {
  e.preventDefault();
});

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  applySearchFilter();
});

document
  .getElementById("genre-select")
  .addEventListener("change", async (e) => {
    const genre = e.target.value;
    const products = await getProducts(genre ? { genre } : {});

    // Track newly filtered list state
    lastRenderedProducts = products;
    renderProducts(products);
  });

// =========================================================================
// 🎯 PLATFORM CORRECTION COMPONENT MODULES (NO SKIP RECORDS EXCLUSIVES)
// =========================================================================

// 🔀 FEATURE 1: True Random Shuffle
// NEW: this is the actual Fisher-Yates algorithm — the same one Spotify
// used from 2008–2013, before replacing it with an "anti-repetition"
// algorithm in 2014.
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

document.getElementById("shuffle-btn").addEventListener("click", () => {
  const shuffled = fisherYatesShuffle(lastRenderedProducts);
  renderProducts(shuffled);
});

// 🎲 FEATURE 2: Non-Intrusive "Surprise Me" Recommendation Module
// NEW: picks ONE random item from the full catalog and shows it
// separately — it never touches the grid you're already looking at.
async function surpriseMe() {
  const allProducts = await getProducts(); // no filters = full catalog
  if (!allProducts || allProducts.length === 0) return;

  const randomIndex = Math.floor(Math.random() * allProducts.length);
  const pick = allProducts[randomIndex];

  // FIXED IMAGE PATH: Uses clean path interpolation directly from DB
  document.getElementById("surprise-card").innerHTML = `
    <div class="surprise-pick">
      <p>🎲 You might also like:</p>
      <img src="${pick.image}" alt="${pick.title} album cover">
      <h3>${pick.title}</h3>
      <h4>${pick.artist}</h4>
      <button id="dismiss-surprise">✕ Dismiss</button>
    </div>
  `;

  document.getElementById("dismiss-surprise").addEventListener("click", () => {
    document.getElementById("surprise-card").innerHTML = "";
  });
}

document.getElementById("surprise-btn").addEventListener("click", surpriseMe);

// 🛒 FEATURE 3: Guaranteed Ownership Crate Tracking
// NEW: "My Crate" — once something's added, it stays added.
// Inspired directly by Spotify bricking Car Thing devices people
// had already paid for. Nothing here ever gets silently taken back.
document.getElementById("products-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("add-btn")) {
    const id = e.target.dataset.id;
    let myCrate = JSON.parse(localStorage.getItem("myCrate")) || [];

    if (!myCrate.includes(id)) {
      myCrate.push(id);
      localStorage.setItem("myCrate", JSON.stringify(myCrate));
      e.target.textContent = "✓ In Your Crate, Forever";
      e.target.disabled = true;
    }
  }
});
