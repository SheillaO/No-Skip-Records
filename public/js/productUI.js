import { addBtnListeners } from "./cartService.js";
import { lastRenderedProducts } from "./index.js";
import { getProducts } from "./productService.js";

export function renderProducts(products) {
  lastRenderedProducts.splice(0, lastRenderedProducts.length, ...products);

  const albumsContainer = document.getElementById("products-container");
  const myCrate = JSON.parse(localStorage.getItem("myCrate")) || [];

  const cards = products
    .map((album) => {
      const isSaved = myCrate.includes(String(album.id));
      const buttonText = isSaved ? "✓ In Your Crate, Forever" : "Add to Cart";
      const buttonDisabled = isSaved ? "disabled" : "";

      return `
      <div class="product-card">
        <img src="/images/${album.image}" alt="${album.title} album cover">
        <h2>${album.title}</h2>
        <h3>${album.artist}</h3>
        <p>$${album.price.toFixed(2)}</p>
        <button class="main-btn add-btn" data-id="${album.id}" ${buttonDisabled}>${buttonText}</button>
        <p class="genre-label">${album.genre}</p>
      </div>

       `;
    })
    .join("");

  albumsContainer.innerHTML = cards;
  addBtnListeners();
}

export async function applySearchFilter() {
  const search = document.getElementById("search-input").value.trim();
  const filters = {};
  if (search) filters.search = search;
  const products = await getProducts(filters);
  renderProducts(products);
}