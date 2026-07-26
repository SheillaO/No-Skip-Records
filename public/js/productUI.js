import { addBtnListeners } from "./cartService.js";
import { lastRenderedProducts } from "./index.js";
import { getProducts } from "./productService.js"; // Ensure your fetch service is imported for filtering

export function renderProducts(products) {
  // Sync state tracking mirror array properties
  lastRenderedProducts.splice(0, lastRenderedProducts.length, ...products);

  const albumsContainer = document.getElementById("products-container");

  // Fetch your custom localStorage state to ensure ownership records are locked down
  const myCrate = JSON.parse(localStorage.getItem("myCrate")) || [];

  const cards = products
    .map((album) => {
      // Check if this album's ID is already explicitly locked into your Crate
      const isSaved = myCrate.includes(String(album.id));
      const buttonText = isSaved ? "✓ In Your Crate, Forever" : "Add to Cart";
      const buttonDisabled = isSaved ? "disabled" : "";

      return `
      <div class="product-card">
        <!-- FIXED IMAGE PATH: Uses clean path interpolation directly from DB -->
        <img src="${album.image}" alt="${album.title} album cover">
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

  // Restores your operational shopping cart listener assignments
  addBtnListeners();
}

// ===== Handling filtering =====
export async function applySearchFilter() {
  const search = document.getElementById("search-input").value.trim();
  const filters = {};
  if (search) filters.search = search;

  const products = await getProducts(filters);
  renderProducts(products);
}
