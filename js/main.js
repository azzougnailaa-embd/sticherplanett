function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatPrice(n) {
  return n.toLocaleString("fr-FR") + " DA";
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

let activeCategory = "tous";

function renderCategories() {
  const bar = document.getElementById("category-bar");
  if (!bar) return;

  const categories = ["tous", ...new Set(PRODUCTS.map((p) => p.category))];
  const labels = {
    tous: "Tous",
    nature: "Nature",
    citations: "Citations",
    animaux: "Animaux",
    voyage: "Voyage",
    mer: "Mer & Océan",
  };

  bar.innerHTML = categories
    .map(
      (cat) => `
      <button type="button" class="cat-btn ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">
        ${labels[cat] || cat}
      </button>
    `
    )
    .join("");

  bar.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderCategories();
      renderGrid();
    });
  });
}

function renderGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const filtered =
    activeCategory === "tous"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `<p>Aucun produit dans cette catégorie pour le moment.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (p) => `
    <a class="sticker-card" href="product.html?id=${p.id}">
      <div class="card-visual bg-${p.color}">${p.image ? `<img src="${p.image}" alt="${p.name}" class="card-img" />` : p.emoji}</div>
      <h3 class="card-title">${p.name}</h3>
      <p class="card-short">${p.short}</p>
      <span class="price-tag">${formatPrice(p.price)}</span>
    </a>
  `
    )
    .join("");
}

function renderProduct() {
  const root = document.getElementById("product-root");
  if (!root) return;

  const id = getParam("id");
  const product = findProduct(id);

  if (!product) {
    root.innerHTML = `<p>Produit introuvable. <a href="index.html">Retour à la boutique</a></p>`;
    return;
  }

  root.innerHTML = `
    <div class="product-visual bg-${product.color}">${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-img" />` : product.emoji}</div>
    <div class="product-info">
      <h1>${product.name}</h1>
      <div class="meta-row">
        <span class="badge">${product.sheets}</span>
        <span class="badge">${product.format}</span>
        <span class="badge">état : neuf — format numérique</span>
      </div>
      <div class="price-big" id="price-big">${formatPrice(product.price)}</div>
      <p class="desc">${product.description}</p>

      <div class="qty-row">
        <span style="font-weight:600;">Quantité</span>
        <div class="qty-control">
          <button type="button" id="qty-minus">–</button>
          <span id="qty-value">1</span>
          <button type="button" id="qty-plus">+</button>
        </div>
      </div>

      <a href="payment.html?id=${product.id}&qty=1" id="buy-btn" class="btn
