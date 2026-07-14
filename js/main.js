function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatPrice(n) {
  return n.toLocaleString("fr-FR") + " DA";
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

// ---------- PANIER ----------
function getCart() {
  try {
    const raw = localStorage.getItem("stickr_cart");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("stickr_cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, qty) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty: qty });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
}

function updateCartItemQty(productId, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      item.qty = qty;
      saveCart(cart);
    }
  }
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => {
    const p = findProduct(item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = getCartCount();
}
// ---------- FIN PANIER ----------

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

  const galleryHTML = product.gallery && product.gallery.length
    ? `
      <div class="product-gallery" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
        ${product.gallery.map(img => `<img src="${img}" alt="${product.name}" class="gallery-thumb" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border:2px solid var(--ink); cursor:pointer;" />`).join("")}
      </div>
    `
    : "";

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
      ${galleryHTML}

      <div class="qty-row">
        <span style="font-weight:600;">Quantité</span>
        <div class="qty-control">
          <button type="button" id="qty-minus">–</button>
          <span id="qty-value">1</span>
          <button type="button" id="qty-plus">+</button>
        </div>
      </div>

      <a href="payment.html?id=${product.id}&qty=1" id="buy-btn" class="btn full">Commander — ${formatPrice(product.price)}</a>
      <button type="button" id="add-cart-btn" class="btn secondary full" style="margin-top:10px;">🛒 Ajouter au panier</button>
      <p class="total-line" style="margin-top:10px;">Livraison : fichier PDF envoyé par email après vérification du paiement.</p>
    </div>
  `;

  let qty = 1;
  const qtyValue = document.getElementById("qty-value");
  const buyBtn = document.getElementById("buy-btn");
  const addCartBtn = document.getElementById("add-cart-btn");

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

  addCartBtn.addEventListener("click", () => {
    addToCart(product.id, qty);
    addCartBtn.textContent = "✅ Ajouté au panier !";
    setTimeout(() => {
      addCartBtn.textContent = "🛒 Ajouter au panier";
    }, 1500);
  });

  const lightbox = document.getElementById("lightbox-overlay");
  if (lightbox && product.gallery) {
    document.querySelectorAll(".gallery-thumb").forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        lightbox.openAt(product.gallery, index);
      });
    });
  }
}

function setupLightbox() {
  if (document.getElementById("lightbox-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "lightbox-overlay";
  overlay.style.cssText = `
    display:none; position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center;
    padding:20px; box-sizing:border-box;
  `;

  const img = document.createElement("img");
  img.id = "lightbox-img";
  img.style.cssText = `
    max-width:80%; max-height:90%; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.5);
  `;

  const prevBtn = document.createElement("button");
  prevBtn.id = "lightbox-prev";
  prevBtn.innerHTML = "‹";
  prevBtn.style.cssText = `
    position:fixed; left:20px; top:50%; transform:translateY(-50%);
    background:#fff; border:none; border-radius:50%; width:50px; height:50px;
    font-size:2rem; line-height:1; cursor:pointer; font-weight:700;
  `;

  const nextBtn = document.createElement("button");
  nextBtn.id = "lightbox-next";
  nextBtn.innerHTML = "›";
  nextBtn.style.cssText = `
    position:fixed; right:20px; top:50%; transform:translateY(-50%);
    background:#fff; border:none; border-radius:50%; width:50px; height:50px;
    font-size:2rem; line-height:1; cursor:pointer; font-weight:700;
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.style.cssText = `
    position:fixed; top:20px; right:20px;
    background:#fff; border:none; border-radius:50%; width:44px; height:44px;
    font-size:1.3rem; cursor:pointer; font-weight:700;
  `;

  overlay.appendChild(img);
  overlay.appendChild(prevBtn);
  overlay.appendChild(nextBtn);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  let currentGallery = [];
  let currentIndex = 0;

  function showImage(index) {
    if (!currentGallery.length) return;
    currentIndex = (index + currentGallery.length) % currentGallery.length;
    img.src = currentGallery[currentIndex];
  }

  overlay.openAt = function (galleryArray, index) {
    currentGallery = galleryArray;
    showImage(index);
    overlay.style.display = "flex";
  };

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.style.display = "none";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (overlay.style.display !== "flex") return;
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
    if (e.key === "Escape") overlay.style.display = "none";
  });
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `<p>Ton panier est vide. <a href="index.html">Voir les stickers disponibles</a></p>`;
    document.getElementById("cart-total-box").innerHTML = "";
    return;
  }

  container.innerHTML = cart
    .map((item) => {
      const product = findProduct(item.id);
      if (!product) return "";
      const lineTotal = product.price * item.qty;
      return `
        <div class="cart-line" style="display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:2px solid var(--dot);">
          <img src="${product.image}" alt="${product.name}" style="width:70px; height:70px; object-fit:cover; border-radius:10px; border:2px solid var(--ink);" />
          <div style="flex:1;">
            <div style="font-weight:700;">${product.name}</div>
            <div style="color:var(--ink-soft);">${formatPrice(product.price)} / unité</div>
          </div>
          <div class="qty-control">
            <button type="button" class="cart-qty-minus" data-id="${product.id}">–</button>
            <span>${item.qty}</span>
            <button type="button" class="cart-qty-plus" data-id="${product.id}">+</button>
          </div>
          <div style="font-weight:700; min-width:80px; text-align:right;">${formatPrice(lineTotal)}</div>
          <button type="button" class="cart-remove" data-id="${product.id}" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">🗑️</button>
        </div>
      `;
    })
    .join("");

  const total = getCartTotal();
  document.getElementById("cart-total-box").innerHTML = `
    <div class="row total" style="display:flex; justify-content:space-between; font-size:1.3rem; font-weight:700; padding:16px 0;">
      <span>Total</span><span>${formatPrice(total)}</span>
    </div>
    <a href="payment.html?cart=1" class="btn full">Commander tout le panier →</a>
  `;

  container.querySelectorAll(".cart-qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const item = cart.find((i) => i.id === btn.dataset.id);
      if (item) updateCartItemQty(item.id, item.qty - 1);
      renderCart();
    });
  });

  container.querySelectorAll(".cart-qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const item = cart.find((i) => i.id === btn.dataset.id);
      if (item) updateCartItemQty(item.id, item.qty + 1);
      renderCart();
    });
  });

  container.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.id);
      renderCart();
    });
  });
}

function renderPayment() {
  const summaryBox = document.getElementById("order-summary");
  if (!summaryBox || !document.getElementById("bank-box")) return;
  if (window.location.pathname.indexOf("payment.html") === -1) return;

  const isCart = getParam("cart") === "1";

  if (isCart) {
    // Cas panier : plusieurs produits
    const cart = getCart();
    if (cart.length === 0) {
      summaryBox.innerHTML = `<p>Ton panier est vide.</p>`;
      return;
    }

    const lines = cart.map((item) => {
      const product = findProduct(item.id);
      if (!product) return "";
      return `<div class="row"><span>${product.name}</span><span>x${item.qty}</span></div>`;
    }).join("");

    const total = getCartTotal();

    summaryBox.innerHTML = `
      ${lines}
      <div class="row total"><span>Total à payer</span><span>${formatPrice(total)}</span></div>
    `;

    document.getElementById("back-link").href = `cart.html`;
    document.getElementById("paid-btn").href = `confirm.html?cart=1`;

  } else {
    // Cas achat direct : un seul produit (comme avant)
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
}

function renderConfirm() {
  const summaryBox = document.getElementById("order-summary");
  if (!summaryBox) return;
  if (window.location.pathname.indexOf("confirm.html") === -1) return;

  const isCart = getParam("cart") === "1";
  const reference = "SR-" + Date.now().toString(36).toUpperCase();

  let total = 0;
  let linesHTML = "";
  let linesText = "";

  if (isCart) {
    // Cas panier : plusieurs produits
    const cart = getCart();
    if (cart.length === 0) {
      summaryBox.innerHTML = `<p>Commande introuvable.</p>`;
      return;
    }

    cart.forEach((item) => {
      const product = findProduct(item.id);
      if (!product) return;
      const lineTotal = product.price * item.qty;
      total += lineTotal;
      linesHTML += `<div class="row"><span>${product.name}</span><span>x${item.qty}</span></div>`;
      linesText += `- ${product.name} x${item.qty} — ${formatPrice(lineTotal)}\n`;
    });

  } else {
    // Cas achat direct : un seul produit (comme avant)
    const id = getParam("id");
    const qty = parseInt(getParam("qty") || "1", 10);
    const product = findProduct(id);
    if (!product) {
      summaryBox.innerHTML = `<p>Commande introuvable.</p>`;
      return;
    }
    total = product.price * qty;
    linesHTML = `<div class="row"><span>${product.name}</span><span>x${qty}</span></div>`;
    linesText = `- ${product.name} x${qty} — ${formatPrice(total)}\n`;
  }

  summaryBox.innerHTML = `
    ${linesHTML}
    <div class="row total"><span>Total</span><span>${formatPrice(total)}</span></div>
  `;

  const refBox = document.getElementById("order-reference");
  if (refBox) refBox.textContent = reference;

  const mailBtn = document.getElementById("send-receipt-btn");
  const nameInput = document.getElementById("client-name");
  const phoneInput = document.getElementById("client-phone");

  function buildMailLink() {
    const clientName = (nameInput && nameInput.value.trim()) || "(non renseigné)";
    const clientPhone = (phoneInput && phoneInput.value.trim()) || "(non renseigné)";

    const subject = encodeURIComponent(`Reçu de paiement — ${reference}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVoici mon reçu de paiement pour la commande ${reference}.\n\nNom et prénom : ${clientName}\nTéléphone : ${clientPhone}\n\nProduits :\n${linesText}\nTotal : ${formatPrice(total)}\n\nMerci !`
    );
    if (mailBtn) mailBtn.href = `mailto:mystickerplanett@gmail.com?subject=${subject}&body=${body}`;
  }

  buildMailLink();
  if (nameInput) nameInput.addEventListener("input", buildMailLink);
  if (phoneInput) phoneInput.addEventListener("input", buildMailLink);

  // Vide le panier une fois la commande confirmée (seulement si c'était un achat via panier)
  if (isCart) {
    saveCart([]);
  }
}
setupLightbox();
renderCategories();
renderGrid();
renderProduct();
renderPayment();
renderConfirm();
renderCart();
updateCartBadge();
