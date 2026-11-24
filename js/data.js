// Shared Data Store & LocalStorage Sync for Client & Admin Panels
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Upwas Popcorn (Batata Sabudana Popcorn) Ready to Fry",
        category: "Upwas Special",
        price: 160,
        mrp: 200,
        badge: "Upwas Special",
        image: "images/adad_na_papad.jpeg",
        fallbackImage: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff26?auto=format&fit=crop&q=80&w=600",
        details: {
            productTitle: "Upwas Popcorn (Batata Sabudana Popcorn) Ready to Fry",
            ingredients: "Potato (Batata), Sabudana (Sago), Jeera & Salt (Sendha Namak - Upwas Special Salt)",
            productType: "Ready to Fry",
            quality: "Premium",
            netQuantity: "400 gm",
            productFeature: "Homemade, Organic, Healthy, Upwas Special, Fasting Essential",
            packaging: "Plastic & Cardboard",
            manufacturer: "Baa No Gruh Udhyog, Rajkot, Gujarat",
            countryOfOrigin: "India",
            customerCare: "9420920320"
        }
    },
    {
        id: 2,
        name: "Crispy Baked Methi Khakhra",
        category: "Baked Khakhra",
        price: 140,
        mrp: 170,
        badge: "Bestseller",
        image: "images/methi-khakhra.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600",
        details: {
            productTitle: "Crispy Baked Methi Khakhra (Whole Wheat)",
            ingredients: "Whole Wheat Flour, Fresh Fenugreek Leaves (Methi), Cumin (Jeera), Cold-Pressed Groundnut Oil, Salt",
            productType: "Ready to Eat",
            quality: "Premium",
            netQuantity: "250 gm",
            productFeature: "100% Roasted, Zero Maida, High Fiber, Homemade",
            packaging: "Vacuum Sealed Pouch & Box",
            manufacturer: "Baa No Gruh Udhyog, Rajkot, Gujarat",
            countryOfOrigin: "India",
            customerCare: "9420920320"
        }
    },
    {
        id: 3,
        name: "Jowar & Bajra Multi-Grain Diet Mixture",
        category: "Millet Snacks",
        price: 180,
        mrp: 220,
        badge: "Healthy Choice",
        image: "images/millet-mix.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=600",
        details: {
            productTitle: "Jowar & Bajra Multi-Grain Roasted Diet Mixture",
            ingredients: "Roasted Jowar Puffs, Bajra Puffs, Peanuts, Curry Leaves, Turmeric, Rock Salt",
            productType: "Ready to Eat",
            quality: "Premium",
            netQuantity: "300 gm",
            productFeature: "Gluten-Free Millets, Low Calorie, No Preservatives",
            packaging: "Food Grade Stand-up Pouch",
            manufacturer: "Baa No Gruh Udhyog, Rajkot, Gujarat",
            countryOfOrigin: "India",
            customerCare: "9420920320"
        }
    },
    {
        id: 4,
        name: "Organic Jaggery & Sesame Laddoo (Til Gul)",
        category: "Traditional Sweets",
        price: 220,
        mrp: 260,
        badge: "Pure Ghee",
        image: "images/til-laddoo.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&q=80&w=600",
        details: {
            productTitle: "Handmade Organic Jaggery & White Sesame Laddoo",
            ingredients: "Unroasted White Sesame Seeds (Til), Organic Kolhapuri Jaggery (Gud), Pure A2 Cow Ghee, Cardamom",
            productType: "Ready to Eat",
            quality: "Premium",
            netQuantity: "400 gm",
            productFeature: "Rich in Iron & Calcium, Sugar-Free (Jaggery Sweetened), Homemade",
            packaging: "Airtight Jar",
            manufacturer: "Baa No Gruh Udhyog, Rajkot, Gujarat",
            countryOfOrigin: "India",
            customerCare: "9420920320"
        }
    }
];

const DEFAULT_ORDERS = [
    {
        id: "ORD-1001",
        customerName: "Priyaben Patel",
        phone: "9876543210",
        address: "102, Gokul Dham Society, Kalawad Road, Rajkot - 360005",
        items: [
            { name: "Upwas Popcorn (Batata Sabudana Popcorn) Ready to Fry", qty: 2, price: 160 }
        ],
        total: 320,
        status: "Pending",
        date: "23 Nov 2026, 03:45 PM"
    }
];

function getProducts() {
    const stored = localStorage.getItem('baa_gruh_products_v2');
    if (!stored) {
        localStorage.setItem('baa_gruh_products_v2', JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }
    return JSON.parse(stored);
}

function saveProducts(products) {
    localStorage.setItem('baa_gruh_products_v2', JSON.stringify(products));
}

function getOrders() {
    const stored = localStorage.getItem('baa_gruh_orders_v2');
    if (!stored) {
        localStorage.setItem('baa_gruh_orders_v2', JSON.stringify(DEFAULT_ORDERS));
        return DEFAULT_ORDERS;
    }
    return JSON.parse(stored);
}

function saveOrders(orders) {
    localStorage.setItem('baa_gruh_orders_v2', JSON.stringify(orders));
}

function getCart() {
    return JSON.parse(localStorage.getItem('baa_gruh_cart_v2')) || [];
}

function saveCart(cart) {
    localStorage.setItem('baa_gruh_cart_v2', JSON.stringify(cart));
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('baa_gruh_wishlist_v2')) || [];
}

function saveWishlist(list) {
    localStorage.setItem('baa_gruh_wishlist_v2', JSON.stringify(list));
}
