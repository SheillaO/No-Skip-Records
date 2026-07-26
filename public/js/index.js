import { logout } from "./logout.js";
import { checkAuth, renderGreeting, showHideMenuItems } from "./authUI.js";
import { getProducts, populateGenreSelect } from "./productService.js";
import { renderProducts, applySearchFilter } from "./productUI.js";
import { updateCartIcon } from "./cartService.js";

export let lastRenderedProducts = [];

document.getElementById("logout-btn").addEventListener("click", logout);

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".header-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

async function init() {
  populateGenreSelect();
  const products = await getProducts();
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

document.getElementById("search-input").addEventListener("input", (e) => {
  e.preventDefault();
  applySearchFilter();
});

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
    lastRenderedProducts = products;
    renderProducts(products);
  });

// 🔀 True Shuffle — Fisher-Yates algorithm (what Spotify retired in 2014)
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


