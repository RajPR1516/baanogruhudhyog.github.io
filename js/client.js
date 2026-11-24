// Client Side Storefront Logic for Baa No Gruh Udhyog
let currentFilter = 'All';
let searchQuery = '';
let activeDetailProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    renderProductGrid();
    updateCartCounter();
});

function switchView(viewName) {
    ['home', 'product-detail', 'wishlist', 'orders', 'contact'].forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
    });
    document.getElementById(`view-${viewName}`).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'home') renderProductGrid();
    if (viewName === 'wishlist') renderWishlist();
    if (viewName === 'orders') renderClientOrders();
}

function toggleSidebar() {
    document.getElementById('category-sidebar').classList.toggle('hidden');
}

function filterByCategory(category) {
    currentFilter = category;
    switchView('home');
    document.querySelectorAll('.cat-pill').forEach(btn => {
        if (btn.dataset.cat === category) {
            btn.className = "cat-pill px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-orange-600 text-white whitespace-nowrap shadow-sm";
        } else {
            btn.className = "cat-pill px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white text-gray-700 border border-orange-200 hover:bg-orange-50 whitespace-nowrap";
        }
    });
    document.getElementById('catalog-heading').innerText = category === 'All' ? 'All Healthy Snacks' : category;
    renderProductGrid();
}

function handleSearch(val) {
    searchQuery = val.toLowerCase().trim();
    switchView('home');
    renderProductGrid();
}

function renderProductGrid() {
    const products = getProducts();
    const wishlist = getWishlist();
    const grid = document.getElementById('client-product-grid');

    const filtered = products.filter(p => {
        const matchCat = currentFilter === 'All' || p.category === currentFilter;
        const matchSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery) ||
            (p.details && p.details.ingredients.toLowerCase().includes(searchQuery));
        return matchCat && matchSearch;
    });

    document.getElementById('product-count-label').innerText = `${filtered.length} product(s)`;

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border">No snacks found matching your search.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const isWished = wishlist.includes(p.id);
        const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
        return `
            <div class="bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group">
                <div>
                    <!-- Product Image Space -->
                    <div class="relative h-52 bg-orange-50 overflow-hidden cursor-pointer" onclick="openProductDetail(${p.id})">
                        <img src="${p.image}" onerror="this.src='${p.fallbackImage || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff26?auto=format&fit=crop&q=80&w=600'}'" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        ${p.badge ? `<span class="absolute top-2.5 left-2.5 bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow">${p.badge}</span>` : ''}
                        <button onclick="event.stopPropagation(); toggleWishlist(${p.id})" class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow hover:scale-110 transition">
                            <i class="${isWished ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart"></i>
                        </button>
                    </div>

                    <!-- Card Content -->
                    <div class="p-4 space-y-1.5">
                        <div class="flex items-center justify-between text-[11px] font-bold text-orange-600 uppercase">
                            <span>${p.category}</span>
                            <span class="text-gray-500">${p.details?.netQuantity || ''}</span>
                        </div>
                        <h4 onclick="openProductDetail(${p.id})" class="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 cursor-pointer hover:text-orange-600">${p.name}</h4>
                        <p class="text-xs text-gray-500 line-clamp-1">${p.details?.productFeature || ''}</p>
                    </div>
                </div>

                <div class="p-4 pt-2 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        <div class="flex items-baseline gap-1.5">
                            <span class="text-lg font-extrabold text-gray-900">₹${p.price}</span>
                            ${p.mrp > p.price ? `<span class="text-xs text-gray-400 line-through">₹${p.mrp}</span>` : ''}
                        </div>
                        ${discount > 0 ? `<span class="text-[11px] font-bold text-green-600">${discount}% OFF</span>` : ''}
                    </div>
                    <button onclick="addToCart(${p.id})" class="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Product Detail View (Structured Bullet Specs like Reference Screenshot)
function openProductDetail(id) {
    const p = getProducts().find(item => item.id === id);
    if (!p) return;
    activeDetailProductId = id;
    const d = p.details || {};
    const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

    document.getElementById('product-detail-container').innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column: Product Photo Space -->
            <div class="space-y-4">
                <div class="rounded-2xl overflow-hidden border border-orange-100 bg-orange-50 aspect-square max-h-[420px] w-full flex items-center justify-center">
                    <img src="${p.image}" onerror="this.src='${p.fallbackImage || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff26?auto=format&fit=crop&q=80&w=600'}'" alt="${p.name}" class="w-full h-full object-cover">
                </div>
                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button onclick="addToCart(${p.id})" class="w-full py-3.5 px-4 rounded-xl border-2 border-orange-600 text-orange-600 font-extrabold text-sm hover:bg-orange-50 transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                    </button>
                    <button onclick="buyNow(${p.id})" class="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2">
                        <span>&raquo; Buy Now</span>
                    </button>
                </div>
            </div>

            <!-- Right Column: Title, Price & Features & Details -->
            <div class="space-y-5">
                <div>
                    <span class="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase mb-2">${p.category}</span>
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">${p.name}</h2>
                    <div class="flex items-baseline gap-3 mt-3">
                        <span class="text-3xl font-extrabold text-gray-900">₹${p.price}</span>
                        ${p.mrp > p.price ? `<span class="text-base text-gray-400 line-through">₹${p.mrp}</span>` : ''}
                        ${discount > 0 ? `<span class="bg-green-100 text-green-700 text-xs font-extrabold px-2.5 py-1 rounded-md">${discount}% OFF</span>` : ''}
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Inclusive of all taxes • Freshly packed on order</p>
                </div>

                <hr class="border-gray-200">

                <!-- Features & Details Section (Exact structure from reference image) -->
                <div class="space-y-3">
                    <h3 class="text-xl font-extrabold text-gray-900">Features & Details</h3>
                    <ul class="space-y-2.5 text-sm sm:text-base text-gray-800 list-disc pl-5 marker:text-gray-900">
                        <li><strong>Product:</strong> ${d.productTitle || p.name}</li>
                        <li><strong>Ingredients:</strong> ${d.ingredients || 'Traditional natural ingredients'}</li>
                        <li><strong>Product Type:</strong> ${d.productType || 'Ready to Eat'}</li>
                        <li><strong>Quality:</strong> ${d.quality || 'Premium'}</li>
                        <li><strong>Net Quantity:</strong> ${d.netQuantity || '250 gm'}</li>
                        <li><strong>Product Feature:</strong> ${d.productFeature || 'Homemade, Organic, Healthy'}</li>
                        <li><strong>Packaging:</strong> ${d.packaging || 'Food Grade Pouch & Box'}</li>
                        <li><strong>Manufacturer:</strong> ${d.manufacturer || 'Baa No Gruh Udhyog, Gujarat'}</li>
                        <li><strong>Country of Origin:</strong> ${d.countryOfOrigin || 'India'}</li>
                        <li><strong>Customer Care Contact:</strong> <a href="tel:${d.customerCare || '9420920320'}" class="text-orange-600 font-bold underline">${d.customerCare || '9420920320'}</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    switchView('product-detail');
}

// Wishlist Functions
function toggleWishlist(id) {
    let list = getWishlist();
    if (list.includes(id)) {
        list = list.filter(item => item !== id);
    } else {
        list.push(id);
    }
    saveWishlist(list);
    renderProductGrid();
}

function renderWishlist() {
    const list = getWishlist();
    const products = getProducts().filter(p => list.includes(p.id));
    const grid = document.getElementById('wishlist-grid');

    if (products.length === 0) {
        grid.innerHTML = `<div class="col-span-full bg-white p-12 rounded-2xl text-center text-gray-500 border">Your wishlist is empty. Tap the heart icon on any snack to save it!</div>`;
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="bg-white rounded-2xl border p-4 flex flex-col justify-between space-y-3">
            <img src="${p.image}" onerror="this.src='${p.fallbackImage}'" class="w-full h-44 object-cover rounded-xl">
            <div>
                <h4 class="font-bold text-gray-900 text-sm">${p.name}</h4>
                <p class="font-extrabold text-orange-600 mt-1">₹${p.price}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="addToCart(${p.id})" class="flex-1 bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl">Move to Cart</button>
                <button onclick="toggleWishlist(${p.id}); renderWishlist();" class="px-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Cart Functions
function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('hidden');
    renderCartItems();
}

function addToCart(id) {
    const product = getProducts().find(p => p.id === id);
    if (!product) return;
    let cart = getCart();
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, fallbackImage: product.fallbackImage, qty: 1 });
    }
    saveCart(cart);
    updateCartCounter();
    toggleCart();
}

function buyNow(id) {
    const product = getProducts().find(p => p.id === id);
    if (!product) return;
    let cart = getCart();
    const existing = cart.find(c => c.id === id);
    if (!existing) {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, fallbackImage: product.fallbackImage, qty: 1 });
        saveCart(cart);
        updateCartCounter();
    }
    openCheckoutModal();
}

function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('header-cart-count').innerText = totalItems;
}

function renderCartItems() {
    const cart = getCart();
    const container = document.getElementById('cart-items-list');
    if (cart.length === 0) {
        container.innerHTML = `<div class="py-12 text-center text-gray-500">Your cart is empty.</div>`;
        document.getElementById('cart-subtotal').innerText = '₹0';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="py-4 flex items-center justify-between gap-3">
            <img src="${item.image}" onerror="this.src='${item.fallbackImage}'" class="w-16 h-16 rounded-xl object-cover border">
            <div class="flex-1">
                <h4 class="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2">${item.name}</h4>
                <span class="text-xs font-extrabold text-orange-600">₹${item.price} × ${item.qty}</span>
            </div>
            <div class="flex items-center gap-1.5">
                <button onclick="changeCartQty(${item.id}, -1)" class="w-7 h-7 rounded-lg bg-gray-100 font-bold">-</button>
                <span class="w-6 text-center text-xs font-bold">${item.qty}</span>
                <button onclick="changeCartQty(${item.id}, 1)" class="w-7 h-7 rounded-lg bg-gray-100 font-bold">+</button>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('cart-subtotal').innerText = `₹${subtotal}`;
}

function changeCartQty(id, delta) {
    let cart = getCart();
    const item = cart.find(c => c.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
    }
    saveCart(cart);
    updateCartCounter();
    renderCartItems();
}

// Checkout & Order Placement
function openCheckoutModal() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Please add at least one snack to your cart first.');
        return;
    }
    document.getElementById('cart-drawer').classList.add('hidden');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('checkout-total-label').innerText = `₹${total}`;
    document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

function confirmOrder(e) {
    e.preventDefault();
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const orders = getOrders();

    const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
        total: total,
        status: 'Pending',
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    orders.unshift(newOrder);
    saveOrders(orders);
    saveCart([]);
    updateCartCounter();
    closeCheckoutModal();
    alert(`Thank you! Your order (${newOrder.id}) has been placed.`);
    switchView('orders');
}

function renderClientOrders() {
    const orders = getOrders();
    const container = document.getElementById('client-orders-list');
    if (orders.length === 0) {
        container.innerHTML = `<div class="bg-white p-10 rounded-2xl text-center text-gray-500 border">No orders placed yet.</div>`;
        return;
    }

    container.innerHTML = orders.map(o => `
        <div class="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm space-y-3">
            <div class="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
                <div>
                    <span class="text-xs font-extrabold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md">${o.id}</span>
                    <span class="text-xs text-gray-500 ml-2">${o.date}</span>
                </div>
                <span class="text-xs font-bold px-3 py-1 rounded-full ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}">${o.status}</span>
            </div>
            <div class="text-sm text-gray-700 space-y-1">
                ${o.items.map(i => `<p>• ${i.name} <strong>(×${i.qty})</strong> — ₹${i.price * i.qty}</p>`).join('')}
            </div>
            <div class="flex justify-between items-center pt-2 border-t text-sm">
                <span class="text-gray-500">Deliver to: <strong>${o.customerName}</strong></span>
                <span class="font-extrabold text-base text-gray-900">Total: ₹${o.total}</span>
            </div>
        </div>
    `).join('');
}

function submitContactForm(e) {
    e.preventDefault();
    alert('Thank you for contacting Baa No Gruh Udhyog! We will call you back shortly.');
    e.target.reset();
}
