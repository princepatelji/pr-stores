const KEY='prstores_products_v1', CART='prstores_cart_v1';
const seed=[
 {id:1,name:'Sample Wireless Headphones',price:1499,image:'https://placehold.co/600x600?text=Headphones',amazon:'#',specs:'Add your real product details and Amazon Associate link from Admin.'},
 {id:2,name:'Sample Backpack',price:999,image:'https://placehold.co/600x600?text=Backpack',amazon:'#',specs:'Replace this sample with your own product.'}
];
let products=JSON.parse(localStorage.getItem(KEY)||'null')||seed;
let cart=JSON.parse(localStorage.getItem(CART)||'[]');
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(products));localStorage.setItem(CART,JSON.stringify(cart));}
function money(n){return Number(n).toLocaleString('en-IN')}
function render(){
 const q=$('search').value.toLowerCase().trim();
 let list=products.filter(p=>(p.name+' '+(p.specs||'')).toLowerCase().includes(q));
 if($('sort').value==='low')list.sort((a,b)=>a.price-b.price);
 if($('sort').value==='high')list.sort((a,b)=>b.price-a.price);
 $('empty').classList.toggle('hidden',list.length>0);
 $('productGrid').innerHTML=list.map(p=>`<article class="card">
 <img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.src='https://placehold.co/600x600?text=Product'">
 <h3>${esc(p.name)}</h3><div class="price">₹${money(p.price)}</div>
 <div class="specs">${esc(p.specs||'')}</div>
 <div class="buttons"><button onclick="addCart(${p.id})">Add to Cart</button><button onclick="buy(${p.id})">Buy on Amazon</button></div>
 </article>`).join('');
 updateCart();
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function addCart(id){if(!cart.includes(id))cart.push(id);save();updateCart();alert('Added to cart.')}
function buy(id){const p=products.find(x=>x.id===id);if(p&&p.amazon&&p.amazon!=='#')window.open(p.amazon,'_blank');else alert('Add the real Amazon Associate link from Admin first.')}
function updateCart(){
 $('cartCount').textContent=cart.length;
 $('cartItems').innerHTML=cart.length?cart.map(id=>{let p=products.find(x=>x.id===id);return p?`<div class="cart-item"><b>${esc(p.name)}</b><br>₹${money(p.price)} <button onclick="removeCart(${id})">Remove</button></div>`:''}).join(''):'<p>Your cart is empty.</p>';
 $('cartTotal').textContent=money(cart.reduce((s,id)=>{let p=products.find(x=>x.id===id);return s+(p?.price||0)},0));
}
function removeCart(id){cart=cart.filter(x=>x!==id);save();render()}
$('search').addEventListener('input',render);$('sort').addEventListener('change',render);
$('cartBtn').onclick=()=>{$('cartPanel').classList.remove('hidden')};$('closeCart').onclick=()=>{$('cartPanel').classList.add('hidden')};
$('adminBtn').onclick=()=>{$('adminPanel').classList.remove('hidden')};$('closeAdmin').onclick=()=>{$('adminPanel').classList.add('hidden')};
$('loginBtn').onclick=()=>{if($('adminPassword').value==='prstores123'){$('loginBox').classList.add('hidden');$('adminBox').classList.remove('hidden');renderAdmin()}else alert('Wrong password.')};
$('logoutBtn').onclick=()=>{$('adminBox').classList.add('hidden');$('loginBox').classList.remove('hidden');$('adminPassword').value=''};
$('productForm').onsubmit=e=>{e.preventDefault();products.push({id:Date.now(),name:$('pName').value,price:Number($('pPrice').value),image:$('pImage').value,amazon:$('pAmazon').value,specs:$('pSpecs').value});save();e.target.reset();render();renderAdmin();alert('Product added.')};
function renderAdmin(){$('adminProducts').innerHTML=products.map(p=>`<div class="admin-item"><b>${esc(p.name)}</b> — ₹${money(p.price)} <button onclick="delProduct(${p.id})">Delete</button></div>`).join('')}
function delProduct(id){products=products.filter(p=>p.id!==id);cart=cart.filter(x=>x!==id);save();render();renderAdmin()}
render();
