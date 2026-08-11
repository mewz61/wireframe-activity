const PRODUCTS = [
  { id: 1, name: 'Pro UFC-Style Headgear', price: 49.99, category: 'Protection', image: 'images/gear%201.jpg', description: 'High-grade leather with impact-absorbing padding for serious training.' },
  { id: 2, name: 'UFC-Style Leather Gloves', price: 39.99, category: 'Gloves', image: 'images/gear%202.avif', description: 'Premium breathable protection for wrists and knuckles during intense sparring.' },
  { id: 3, name: 'Pro MMA Gloves', price: 59.99, category: 'Gloves', image: 'images/gear%203.avif', description: 'Full-face shock protection for hard training sessions and fight prep.' },
  { id: 4, name: 'Knockout Fight Shorts', price: 34.99, category: 'Apparel', image: 'images/ps6.webp', description: 'Lightweight split-side trunks designed for maximum mobility.' },
  { id: 5, name: 'Playstation 5 Controller', price: 59.99, category: 'Gaming', image: 'images/ps1.webp', description: 'Wireless controller built for fast response and high-performance play.' },
  { id: 6, name: 'UFC 6', price: 59.99, category: 'Gaming', image: 'images/ps8.webp', description: 'The latest installment of the UFC video game series for fans and competitors.' },
  { id: 7, name: 'Playstation 5 3D Headset', price: 149.99, category: 'Audio', image: 'images/ps7.jpg', description: 'Immersive 3D audio experience for your next training or gaming session.' },
  { id: 8, name: 'Muay Thai Shin Guards', price: 44.99, category: 'Protection', image: 'images/gear%205.jpg', description: 'Multi-layered foam armor made for heavy kick checks and sparring rounds.' }
];

const CART_KEY = 'mewz_cart_v1';

function currency(value) {
  return '£' + Number(value).toFixed(2);
}

function placeholderImage(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#151515"/><rect x="24" y="24" width="752" height="552" rx="24" fill="#1f1f1f" stroke="#f02020" stroke-width="6"/><text x="50%" y="48%" fill="#f5f5f5" font-family="Arial, sans-serif" font-size="36" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text><text x="50%" y="60%" fill="#ffb400" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" dominant-baseline="middle">Knockout Zone</text></svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
}

function showCartFeedback(productId) {
  const feedback = document.getElementById('cartFeedback');
  if (!feedback) return;

  const product = findProduct(productId);
  feedback.textContent = product ? `${product.name} added to cart.` : 'Item added to cart.';
  feedback.classList.add('is-visible');

  clearTimeout(showCartFeedback.timeoutId);
  showCartFeedback.timeoutId = window.setTimeout(() => {
    feedback.classList.remove('is-visible');
    feedback.textContent = '';
  }, 1800);
}

function normalizeProductId(value) {
  return Number(value);
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === normalizeProductId(id));
}

function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
  });
}

function addToCart(productId) {
  const cart = readCart();
  const normalizedId = normalizeProductId(productId);
  const existing = cart.find((item) => normalizeProductId(item.id) === normalizedId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: normalizedId, qty: 1 });
  }
  saveCart(cart);
  showCartFeedback(normalizedId);
}

function removeFromCart(productId) {
  const normalizedId = normalizeProductId(productId);
  const next = readCart().filter((item) => normalizeProductId(item.id) !== normalizedId);
  saveCart(next);
}

function setQuantity(productId, qty) {
  const cart = readCart();
  const normalizedId = normalizeProductId(productId);
  const target = cart.find((item) => normalizeProductId(item.id) === normalizedId);
  if (!target) return;
  target.qty = Math.max(1, qty);
  saveCart(cart);
}

function adjustQuantity(productId, step) {
  const cart = readCart();
  const normalizedId = normalizeProductId(productId);
  const target = cart.find((item) => normalizeProductId(item.id) === normalizedId);
  if (!target) return;
  target.qty += step;
  if (target.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
}

function renderFeatured() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  const featured = PRODUCTS.slice(0, 4);
  container.innerHTML = featured.map((p) => cardHtml(p)).join('');
  wireAddButtons(container);
}

function cardHtml(product) {
  return `
    <article class="product-card" data-product-id="${product.id}">
      <img src="${placeholderImage(product.name)}" alt="${product.name}" class="product-image">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">${currency(product.price)}</p>
      <p class="product-category">${product.category}</p>
      <div class="product-actions">
        <button class="btn detail-btn" data-detail="${product.id}">View Details</button>
        <button class="btn" data-add="${product.id}">Add to Cart</button>
      </div>
    </article>
  `;
}

function renderProductsPage() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map((p) => cardHtml(p)).join('');
  wireAddButtons(grid);
  wireDetailButtons(grid);
}

function renderDetail(productId) {
  const panel = document.getElementById('productDetailPanel');
  if (!panel) return;

  const product = findProduct(productId);
  if (!product) return;

  panel.innerHTML = `
    <div class="detail-shell">
      <img src="${placeholderImage(product.name)}" alt="${product.name}" class="detail-image">
      <div>
        <h3>${product.name}</h3>
        <p class="product-price">${currency(product.price)}</p>
        <p class="product-category">${product.category}</p>
        <p>${product.description}</p>
        <button class="btn" data-add="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;

  const addBtn = panel.querySelector('[data-add]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addToCart(product.id);
      panel.setAttribute('data-state', 'added');
    });
  }
}

function wireDetailButtons(root) {
  root.querySelectorAll('[data-detail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-detail'));
      renderDetail(id);
    });
  });
}

function wireAddButtons(root) {
  root.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-add'));
      addToCart(id);
    });
  });
}

function computeTotal(cart) {
  return cart.reduce((sum, item) => {
    const product = findProduct(item.id);
    if (!product) return sum;
    return sum + (product.price * item.qty);
  }, 0);
}

function renderCart() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!list || !totalEl) return;

  const cart = readCart();
  if (!cart.length) {
    list.innerHTML = '<p class="empty-state">Your cart is empty. Add products from Products page.</p>';
    totalEl.textContent = currency(0);
    return;
  }

  list.innerHTML = cart.map((item) => {
    const product = findProduct(item.id);
    if (!product) return '';
    return `
      <article class="cart-row" data-cart-id="${item.id}">
        <img src="${placeholderImage(product.name)}" alt="${product.name}" class="cart-thumb">
        <div>
          <h4>${product.name}</h4>
          <p>${product.category}</p>
          <p>${currency(product.price)}</p>
        </div>
        <div class="qty-controls">
          <button class="btn qty-btn" data-dec="${item.id}">-</button>
          <span>${item.qty}</span>
          <button class="btn qty-btn" data-inc="${item.id}">+</button>
        </div>
        <button class="btn danger-btn" data-remove="${item.id}">Remove</button>
      </article>
    `;
  }).join('');

  totalEl.textContent = currency(computeTotal(cart));

  list.querySelectorAll('[data-inc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      adjustQuantity(Number(btn.getAttribute('data-inc')), 1);
      renderCart();
    });
  });

  list.querySelectorAll('[data-dec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      adjustQuantity(Number(btn.getAttribute('data-dec')), -1);
      renderCart();
    });
  });

  list.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCart(Number(btn.getAttribute('data-remove')));
      renderCart();
    });
  });
}

function initContactValidation() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.querySelector('[name="name"]')?.value.trim() || '';
    const email = form.querySelector('[name="email"]')?.value.trim() || '';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';

    if (name.length < 2) {
      status.textContent = 'Please enter a valid name (minimum 2 characters).';
      status.className = 'form-status error';
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.className = 'form-status error';
      return;
    }

    if (message.length < 10) {
      status.textContent = 'Please write at least 10 characters in your message.';
      status.className = 'form-status error';
      return;
    }

    status.textContent = 'Message sent successfully. We will contact you shortly.';
    status.className = 'form-status success';
    form.reset();
  });
}

function initNavActiveState() {
  const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href === current) link.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initNavActiveState();
  renderFeatured();
  renderProductsPage();
  renderCart();
  initContactValidation();

  const firstDetail = PRODUCTS[0];
  if (firstDetail) renderDetail(firstDetail.id);
});
