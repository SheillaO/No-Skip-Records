import { addBtnListeners } from "./cartService.js";
import { lastRenderedProducts } from "./index.js";
import { getProducts } from "./productService.js";

export function renderProducts(products) {
  lastRenderedProducts.splice(0, lastRenderedProducts.length, ...products);