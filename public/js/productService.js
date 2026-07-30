const BACKEND_URL = "https://no-skip-records.onrender.com";

export async function getProducts(filters = {}) {
  const queryParams = new URLSearchParams(filters);
  const res = await fetch(`${BACKEND_URL}/api/products?${queryParams}`);
  return await res.json();
}

export async function populateGenreSelect() {
  const res = await fetch(`${BACKEND_URL}/api/products/genres`);
  const genres = await res.json();
  const select = document.getElementById("genre-select");

  if (select) {
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      select.appendChild(option);
    });
  }
}
