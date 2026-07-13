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

      <a href="payment.html?id=${product.id}&qty=1" id="buy-btn" class="btn full">Commander — ${formatPrice(product.price)}</a>
      <p class="total-line" style="margin-top:10px;">Livraison : fichier PDF envoyé par email après vérification du paiement.</p>
    </div>
  `;

  let qty = 1;
  const qtyValue = document.getElementById("qty-value");
  const buyBtn = document.getElementById("buy-btn");

  function updateBuyBtn() {
    qtyValue.textContent = qty;
    const total = product.price * qty;
    buyBtn.textContent = `Commander — ${formatPrice(total)}`;
    buyBtn.href = `payment.html?id=${product.id}&qty=${qty}`;
  }

  document.getElementById("qty-minus").addEventListener("click", () => {
    if (qty > 1) { qty--; updateBuyBtn(); }
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qty++; updateBuyBtn();
  });
}

function renderPayment() {
  const summaryBox = document.getElementById("order-summary");
  if (!summaryBox || !document.getElementById("bank-box")) return;
  if (window.location.pathname.indexOf("payment.html") === -1) return;

  const id = getParam("id");
  const qty = parseInt(getParam("qty") || "1", 10);
  const product = findProduct(id);
  if (!product) {
    summaryBox.innerHTML = `<p>Commande introuvable.</p>`;
    return;
  }
  const total = product.price * qty;

  summaryBox.innerHTML = `
    <div class="row"><span>${product.name}</span><span>x${qty}</span></div>
    <div class="row total"><span>Total à payer</span><span>${formatPrice(total)}</span></div>
  `;

  document.getElementById("back-link").href = `product.html?id=${product.id}`;
  document.getElementById("paid-btn").href = `confirm.html?id=${product.id}&qty=${qty}`;
}

function renderConfirm() {
  const summaryBox = document.getElementById("order-summary");
  if (!summaryBox) return;
  if (window.location.pathname.indexOf("confirm.html") === -1) return;

  const id = getParam("id");
  const qty = parseInt(getParam("qty") || "1", 10);
  const product = findProduct(id);
  if (!product) {
    summaryBox.innerHTML = `<p>Commande introuvable.</p>`;
    return;
  }
  const total = product.price * qty;

  summaryBox.innerHTML = `
    <div class="row"><span>${product.name}</span><span>x${qty}</span></div>
    <div class="row total"><span>Total</span><span>${formatPrice(total)}</span></div>
  `;

  const reference = "SR-" + Date.now().toString(36).toUpperCase();

  const refBox = document.getElementById("order-reference");
  if (refBox) refBox.textContent = reference;

  const mailBtn = document.getElementById("send-receipt-btn");
  if (mailBtn) {
    const subject = encodeURIComponent(`Reçu de paiement — ${reference}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVoici mon reçu de paiement pour la commande ${reference}.\nProduit : ${product.name}\nQuantité : ${qty}\nTotal : ${formatPrice(total)}\n\nMerci !`
    );
    mailBtn.href = `mailto:mystickerplanett@gmail.com?subject=${subject}&body=${body}`;
  }
}

renderCategories();
renderGrid();
renderProduct();
renderPayment();
renderConfirm();
