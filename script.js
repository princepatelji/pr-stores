const SUPABASE_URL = 'https://ittzyizopjjaznqwjshj.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_iws6jkjcJ0MYDGH6LRhdig__fqQD_al';

const KEY='prstores_products_v1';
const CART='prstores_cart_v1';

const FALLBACK_IMAGE='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
<rect width="600" height="600" fill="#f3f4f6"/>
<text x="300" y="280" text-anchor="middle" font-family="Arial" font-size="42" font-weight="bold" fill="#333">PR STORES</text>
<text x="300" y="335" text-anchor="middle" font-family="Arial" font-size="28" fill="#777">Product Image</text>
</svg>`);

const defaultProducts=[{
  id:"1791325021111",name:"HRX Helmet",price:1499,
  image:FALLBACK_IMAGE,amazon:"#",specs:"Matte Black"
}];

let products=[];
let cart=JSON.parse(localStorage.getItem(CART)||'[]');
const $=id=>document.getElementById(id);

function handleImageError(img){img.onerror=null;img.src=FALLBACK_IMAGE;}


async function loadProducts() {
  try {
    const response = await fetch(
      `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/Products?select=*`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error ${response.status}: ${errorText}`);
    }

    const onlineProducts = await response.json();

    products = onlineProducts.map(p => ({
      ...p,
      id: String(p.id)
    }));

    render();
  } catch (error) {
    console.error('Product loading error:', error);
    alert('Products load nahi hue. Browser Console mein error check karein.');
  }
}

function save(){
  localStorage.setItem(KEY,JSON.stringify(products));
  localStorage.setItem(CART,JSON.stringify(cart));
}
function money(n){return Number(n||0).toLocaleString('en-IN');}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function render(){
  const searchBox=$('search'),sortBox=$('sort'),grid=$('productGrid');
  if(!grid)return;
  const q=searchBox?searchBox.value.toLowerCase().trim():'';
  let list=products.filter(p=>(String(p.name||'')+' '+String(p.specs||'')).toLowerCase().includes(q));
  if(sortBox&&sortBox.value==='low')list.sort((a,b)=>Number(a.price)-Number(b.price));
  if(sortBox&&sortBox.value==='high')list.sort((a,b)=>Number(b.price)-Number(a.price));
  const empty=$('empty');
  if(empty)empty.classList.toggle('hidden',list.length>0);
  grid.innerHTML=list.map(p=>{
    const image=p.image&&String(p.image).trim()?p.image:FALLBACK_IMAGE;
    return `<article class="card">
      <img src="${esc(image)}" alt="${esc(p.name)}" loading="lazy" onerror="handleImageError(this)">
      <h3>${esc(p.name)}</h3>
      <div class="price">₹${money(p.price)}</div>
      <div class="specs">${esc(p.specs||'')}</div>
      <div class="buttons">
        <button onclick="addCart('${p.id}')">Add to Cart</button>
        <button onclick="buy('${p.id}')">Buy on Amazon</button>
      </div>
    </article>`;
  }).join('');
  updateCart();
}

function addCart(id){
  id=String(id);
  if(!cart.some(x=>String(x)===id))cart.push(id);
  save();updateCart();alert('Added to cart.');
}
function buy(id){
  id=String(id);
  const p=products.find(x=>String(x.id)===id);
  if(p&&p.amazon&&p.amazon!=='#')window.open(p.amazon,'_blank');
  else alert('Add the real Amazon Associate link from Admin first.');
}
function updateCart(){
  const cartCount=$('cartCount'),cartItems=$('cartItems'),cartTotal=$('cartTotal');
  if(!cartCount||!cartItems||!cartTotal)return;
  cartCount.textContent=cart.length;
  cartItems.innerHTML=cart.length?cart.map(id=>{
    const p=products.find(x=>String(x.id)===String(id));
    return p?`<div class="cart-item"><b>${esc(p.name)}</b><br>₹${money(p.price)}
      <button onclick="removeCart('${p.id}')">Remove</button></div>`:'';
  }).join(''):'<p>Your cart is empty.</p>';
  cartTotal.textContent=money(cart.reduce((sum,id)=>{
    const p=products.find(x=>String(x.id)===String(id));
    return sum+Number(p?.price||0);
  },0));
}
function removeCart(id){
  id=String(id);cart=cart.filter(x=>String(x)!==id);save();render();
}
function renderAdmin(){
  const adminProducts=$('adminProducts');if(!adminProducts)return;
  adminProducts.innerHTML=products.map(p=>`<div class="admin-item"><b>${esc(p.name)}</b> — ₹${money(p.price)}
    <button onclick="delProduct('${p.id}')">Delete</button></div>`).join('');
}
function delProduct(id){
  id=String(id);
  products=products.filter(p=>String(p.id)!==id);
  cart=cart.filter(x=>String(x)!==id);
  save();render();renderAdmin();
}

if($('search'))$('search').addEventListener('input',render);
if($('sort'))$('sort').addEventListener('change',render);
if($('cartBtn'))$('cartBtn').onclick=()=>{$('cartPanel').classList.remove('hidden');};
if($('closeCart'))$('closeCart').onclick=()=>{$('cartPanel').classList.add('hidden');};
if($('adminBtn'))$('adminBtn').onclick=()=>{$('adminPanel').classList.remove('hidden');};
if($('closeAdmin'))$('closeAdmin').onclick=()=>{$('adminPanel').classList.add('hidden');};

if($('loginBtn'))$('loginBtn').onclick=()=>{
  if($('adminPassword').value==='prstores123'){
    $('loginBox').classList.add('hidden');$('adminBox').classList.remove('hidden');renderAdmin();
  }else alert('Wrong password.');
};

if($('logoutBtn'))$('logoutBtn').onclick=()=>{
  $('adminBox').classList.add('hidden');$('loginBox').classList.remove('hidden');$('adminPassword').value='';
};

if($('productForm'))$('productForm').onsubmit=e=>{
  e.preventDefault();
  const product={
    id:String(Date.now()),
    name:$('pName').value.trim(),
    price:Number($('pPrice').value),
    image:$('pImage').value.trim(),
    amazon:$('pAmazon').value.trim(),
    specs:$('pSpecs').value.trim()
  };
  products.push(product);save();e.target.reset();render();renderAdmin();alert('Product added.');
};

loadProducts();