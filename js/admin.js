// Admin Panel Logic for Baa No Gruh Udhyog
let uploadedBase64Image = '';

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('baa_admin_logged_in') === 'true') {
        showDashboard();
    }
});

function loginAdmin(e) {
    e.preventDefault();
    const pwd = document.getElementById('admin-pwd-input').value;
    if (pwd === 'admin123') {
        sessionStorage.setItem('baa_admin_logged_in', 'true');
        showDashboard();
    } else {
        alert('Invalid password! Default password is: admin123');
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('baa_admin_logged_in');
    document.getElementById('admin-dashboard-screen').classList.add('hidden');
    document.getElementById('admin-login-screen').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard-screen').classList.remove('hidden');
    refreshAdminData();
}

function switchAdminSection(section) {
    if (section === 'products') {
        document.getElementById('admin-products-view').classList.remove('hidden');
        document.getElementById('admin-orders-view').classList.add('hidden');
        document.getElementById('tab-btn-products').className = "px-5 py-3 text-sm font-extrabold border-b-2 border-orange-600 text-orange-600";
        document.getElementById('tab-btn-orders').className = "px-5 py-3 text-sm font-extrabold text-gray-500 hover:text-gray-800";
    } else {
        document.getElementById('admin-products-view').classList.add('hidden');
        document.getElementById('admin-orders-view').classList.remove('hidden');
        document.getElementById('tab-btn-products').className = "px-5 py-3 text-sm font-extrabold text-gray-500 hover:text-gray-800";
        document.getElementById('tab-btn-orders').className = "px-5 py-3 text-sm font-extrabold border-b-2 border-orange-600 text-orange-600";
    }
    refreshAdminData();
}

function refreshAdminData() {
    const products = getProducts();
    const orders = getOrders();

    // Update Stats
    document.getElementById('stat-total-products').innerText = products.length;
    document.getElementById('stat-total-orders').innerText = orders.length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    document.getElementById('stat-total-revenue').innerText = `₹${revenue}`;

    // Render Products Table
    const tbody = document.getElementById('admin-products-tbody');
    tbody.innerHTML = products.map(p => `
        <tr class="hover:bg-orange-50/40">
            <td class="p-4 flex items-center gap-3">
                <img src="${p.image}" onerror="this.src='${p.fallbackImage || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff26?auto=format&fit=crop&q=80&w=200'}'" class="w-12 h-12 rounded-xl object-cover border">
                <div>
                    <p class="font-bold text-gray-900">${p.name}</p>
                    <span class="text-xs text-gray-500">${p.details?.productType || ''}</span>
                </div>
            </td>
            <td class="p-4 text-xs font-bold text-orange-700">${p.category}</td>
            <td class="p-4 text-xs font-semibold text-gray-600">${p.details?.netQuantity || '-'}</td>
            <td class="p-4">
                <span class="font-extrabold text-gray-900">₹${p.price}</span>
                ${p.mrp > p.price ? `<span class="text-xs text-gray-400 line-through ml-1">₹${p.mrp}</span>` : ''}
            </td>
            <td class="p-4 text-right space-x-2">
                <button onclick="openProductFormModal(${p.id})" class="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button onclick="removeProduct(${p.id})" class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Render Orders List
    const ordersContainer = document.getElementById('admin-orders-list');
    if (orders.length === 0) {
        ordersContainer.innerHTML = `<div class="col-span-full bg-white p-10 rounded-2xl text-center text-gray-500 border">No customer orders yet.</div>`;
        return;
    }

    ordersContainer.innerHTML = orders.map(o => `
        <div class="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
            <div class="flex justify-between items-center border-b pb-3">
                <div>
                    <span class="text-xs font-extrabold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md">${o.id}</span>
                    <span class="text-xs text-gray-500 ml-2">${o.date}</span>
                </div>
                <span class="text-xs font-bold px-3 py-1 rounded-full ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}">${o.status}</span>
            </div>
            <div class="text-xs text-gray-700 space-y-1">
                <p><strong>Customer:</strong> ${o.customerName} (${o.phone})</p>
                <p><strong>Address:</strong> ${o.address}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-xl text-xs space-y-1">
                ${o.items.map(i => `<p>• ${i.name} (×${i.qty}) — ₹${i.price * i.qty}</p>`).join('')}
            </div>
            <div class="flex justify-between items-center pt-2">
                <span class="font-extrabold text-base text-gray-900">Total: ₹${o.total}</span>
                <div class="space-x-2">
                    <button onclick="toggleOrderStatus('${o.id}')" class="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700">
                        Mark ${o.status === 'Pending' ? 'Delivered' : 'Pending'}
                    </button>
                    <button onclick="deleteOrder('${o.id}')" class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function previewUploadedImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedBase64Image = e.target.result;
        document.getElementById('prod-photo-preview').src = uploadedBase64Image;
    };
    reader.readAsDataURL(file);
}

function openProductFormModal(id = null) {
    uploadedBase64Image = '';
    document.getElementById('prod-photo-file').value = '';

    if (id) {
        const p = getProducts().find(item => item.id === id);
        if (!p) return;
        const d = p.details || {};
        document.getElementById('modal-form-heading').innerText = 'Edit Product & Details';
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-badge').value = p.badge || '';
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-mrp').value = p.mrp || '';
        document.getElementById('prod-image-path').value = p.image.startsWith('data:') ? '' : p.image;
        document.getElementById('prod-photo-preview').src = p.image;

        document.getElementById('spec-title').value = d.productTitle || p.name;
        document.getElementById('spec-ingredients').value = d.ingredients || '';
        document.getElementById('spec-type').value = d.productType || '';
        document.getElementById('spec-quality').value = d.quality || 'Premium';
        document.getElementById('spec-qty').value = d.netQuantity || '';
        document.getElementById('spec-packaging').value = d.packaging || '';
        document.getElementById('spec-feature').value = d.productFeature || '';
        document.getElementById('spec-manufacturer').value = d.manufacturer || 'Baa No Gruh Udhyog, Rajkot, Gujarat';
        document.getElementById('spec-origin').value = d.countryOfOrigin || 'India';
        document.getElementById('spec-care').value = d.customerCare || '9420920320';
    } else {
        document.getElementById('modal-form-heading').innerText = 'Add New Product';
        document.getElementById('prod-id').value = '';
        document.getElementById('prod-name').value = '';
        document.getElementById('prod-category').value = 'Upwas Special';
        document.getElementById('prod-badge').value = '';
        document.getElementById('prod-price').value = '';
        document.getElementById('prod-mrp').value = '';
        document.getElementById('prod-image-path').value = 'images/';
        document.getElementById('prod-photo-preview').src = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff26?auto=format&fit=crop&q=80&w=300';

        document.getElementById('spec-title').value = '';
        document.getElementById('spec-ingredients').value = '';
        document.getElementById('spec-type').value = 'Ready to Eat';
        document.getElementById('spec-quality').value = 'Premium';
        document.getElementById('spec-qty').value = '250 gm';
        document.getElementById('spec-packaging').value = 'Plastic & Cardboard';
        document.getElementById('spec-feature').value = 'Homemade, Organic, Healthy';
        document.getElementById('spec-manufacturer').value = 'Baa No Gruh Udhyog, Rajkot, Gujarat';
        document.getElementById('spec-origin').value = 'India';
        document.getElementById('spec-care').value = '9420920320';
    }

    document.getElementById('admin-product-modal').classList.remove('hidden');
}

function closeProductFormModal() {
    document.getElementById('admin-product-modal').classList.add('hidden');
}

function handleSaveProduct(e) {
    e.preventDefault();
    let products = getProducts();
    const editId = document.getElementById('prod-id').value;
    const typedPath = document.getElementById('prod-image-path').value.trim();

    let finalImage = uploadedBase64Image || typedPath || 'images/default.jpg';

    const productObj = {
        id: editId ? Number(editId) : (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1),
        name: document.getElementById('prod-name').value,
        category: document.getElementById('prod-category').value,
        badge: document.getElementById('prod-badge').value,
        price: Number(document.getElementById('prod-price').value),
        mrp: Number(document.getElementById('prod-mrp').value) || Number(document.getElementById('prod-price').value),
        image: finalImage,
        fallbackImage: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff26?auto=format&fit=crop&q=80&w=600',
        details: {
            productTitle: document.getElementById('spec-title').value || document.getElementById('prod-name').value,
            ingredients: document.getElementById('spec-ingredients').value,
            productType: document.getElementById('spec-type').value,
            quality: document.getElementById('spec-quality').value,
            netQuantity: document.getElementById('spec-qty').value,
            productFeature: document.getElementById('spec-feature').value,
            packaging: document.getElementById('spec-packaging').value,
            manufacturer: document.getElementById('spec-manufacturer').value,
            countryOfOrigin: document.getElementById('spec-origin').value,
            customerCare: document.getElementById('spec-care').value
        }
    };

    if (editId) {
        const idx = products.findIndex(p => p.id === Number(editId));
        if (idx !== -1) {
            if (!uploadedBase64Image && !typedPath) {
                productObj.image = products[idx].image;
            }
            products[idx] = productObj;
        }
    } else {
        products.unshift(productObj);
    }

    saveProducts(products);
    closeProductFormModal();
    refreshAdminData();
    alert('Product saved! It is now live on index.html.');
}

function removeProduct(id) {
    if (confirm('Delete this product from the store?')) {
        const updated = getProducts().filter(p => p.id !== id);
        saveProducts(updated);
        refreshAdminData();
    }
}

function toggleOrderStatus(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = order.status === 'Pending' ? 'Delivered' : 'Pending';
        saveOrders(orders);
        refreshAdminData();
    }
}

function deleteOrder(orderId) {
    if (confirm('Remove this order record?')) {
        const updated = getOrders().filter(o => o.id !== orderId);
        saveOrders(updated);
        refreshAdminData();
    }
}
