const KEY = 'prstores_products_v1';
const CART = 'prstores_cart_v1';

const defaultProducts = [
  {
    id: "1791325021111",
    name: "HRX Helmet",
    price: 1499,
    image: "https://via.placeholder.com/600x600?text=HRX+Helmet",
    amazon: "#",
    specs: "Matte Black"
  }
];

let stored = JSON.parse(localStorage.getItem(KEY) || 'null');

let products = (Array.isArray(stored) && stored.length > 0)
  ? stored
  : defaultProducts;

let cart = JSON.parse(localStorage.getItem(CART) || '[]');

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem(KEY, JSON.stringify(products));
  localStorage.setItem(CART, JSON.stringify(cart));
}

function money(n) {
  return Number(n || 0).toLocaleString('en-IN');
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function render() {

  const searchBox = $('search');
  const sortBox = $('sort');

  const q = searchBox
    ? searchBox.value.toLowerCase().trim()
    : '';

  let list = products.filter(p =>
    (p.name + ' ' + (p.specs || ''))
      .toLowerCase()
      .includes(q)
  );

  if (sortBox && sortBox.value === 'low') {
    list.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sortBox && sortBox.value === 'high') {
    list.sort((a, b) => Number(b.price) - Number(a.price));
  }

  const empty = $('empty');
  const grid = $('productGrid');

  if (!grid) return;

  if (empty) {
    empty.classList.toggle('hidden', list.length > 0);
  }

  grid.innerHTML = list.map(p => `
    <article class="card">

      <img
        src="${esc(p.image)}"
        alt="${esc(p.name)}"
        onerror="this.src='https://placehold.co/600x600?text=Product'"
      >

      <h3>${esc(p.name)}</h3>

      <div class="price">
        ₹${money(p.price)}
      </div>

      <div class="specs">
        ${esc(p.specs || '')}
      </div>

      <div class="buttons">

        <button onclick="addCart('${p.id}')">
          Add to Cart
        </button>

        <button onclick="buy('${p.id}')">
          Buy on Amazon
        </button>

      </div>

    </article>
  `).join('');

  updateCart();
}

function addCart(id) {

  id = String(id);

  if (!cart.includes(id)) {
    cart.push(id);
  }

  save();
  updateCart();

  alert('Added to cart.');
}

function buy(id) {

  id = String(id);

  const p = products.find(x => String(x.id) === id);

  if (p && p.amazon && p.amazon !== '#') {

    window.open(p.amazon, '_blank');

  } else {

    alert('Add the real Amazon Associate link from Admin first.');

  }
}

function updateCart() {

  const cartCount = $('cartCount');
  const cartItems = $('cartItems');
  const cartTotal = $('cartTotal');

  if (!cartCount || !cartItems || !cartTotal) return;

  cartCount.textContent = cart.length;

  cartItems.innerHTML = cart.length
    ? cart.map(id => {

        const p = products.find(
          x => String(x.id) === String(id)
        );

        return p
          ? `
            <div class="cart-item">

              <b>${esc(p.name)}</b>
              <br>

              ₹${money(p.price)}

              <button onclick="removeCart('${p.id}')">
                Remove
              </button>

            </div>
          `
          : '';

      }).join('')
    : '<p>Your cart is empty.</p>';

  cartTotal.textContent = money(
    cart.reduce((sum, id) => {

      const p = products.find(
        x => String(x.id) === String(id)
      );

      return sum + Number(p?.price || 0);

    }, 0)
  );
}

function removeCart(id) {

  id = String(id);

  cart = cart.filter(
    x => String(x) !== id
  );

  save();
  render();
}

function renderAdmin() {

  const adminProducts = $('adminProducts');

  if (!adminProducts) return;

  adminProducts.innerHTML = products.map(p => `
    <div class="admin-item">

      <b>${esc(p.name)}</b>
      — ₹${money(p.price)}

      <button onclick="delProduct('${p.id}')">
        Delete
      </button>

    </div>
  `).join('');
}

function delProduct(id) {

  id = String(id);

  products = products.filter(
    p => String(p.id) !== id
  );

  cart = cart.filter(
    x => String(x) !== id
  );

  save();
  render();
  renderAdmin();
}

if ($('search')) {
  $('search').addEventListener('input', render);
}

if ($('sort')) {
  $('sort').addEventListener('change', render);
}

if ($('cartBtn')) {
  $('cartBtn').onclick = () => {
    $('cartPanel').classList.remove('hidden');
  };
}

if ($('closeCart')) {
  $('closeCart').onclick = () => {
    $('cartPanel').classList.add('hidden');
  };
}

if ($('adminBtn')) {
  $('adminBtn').onclick = () => {
    $('adminPanel').classList.remove('hidden');
  };
}

if ($('closeAdmin')) {
  $('closeAdmin').onclick = () => {
    $('adminPanel').classList.add('hidden');
  };
}

if ($('loginBtn')) {

  $('loginBtn').onclick = () => {

    if ($('adminPassword').value === 'prstores123') {

      $('loginBox').classList.add('hidden');
      $('adminBox').classList.remove('hidden');

      renderAdmin();

    } else {

      alert('Wrong password.');

    }

  };

}

if ($('logoutBtn')) {

  $('logoutBtn').onclick = () => {

    $('adminBox').classList.add('hidden');
    $('loginBox').classList.remove('hidden');
    $('adminPassword').value = '';

  };

}

if ($('productForm')) {

  $('productForm').onsubmit = e => {

    e.preventDefault();

    const product = {

      id: String(Date.now()),

      name: $('pName').value.trim(),

      price: Number($('pPrice').value),

      image: $('pImage').value.trim(),

      amazon: $('pAmazon').value.trim(),

      specs: $('pSpecs').value.trim()

    };

    products.push(product);

    save();

    e.target.reset();

    render();
    renderAdmin();

    alert('Product added.');

  };

}

render();
