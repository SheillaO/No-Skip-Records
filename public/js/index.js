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
