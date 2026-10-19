// Data Produk
const products = [
    { id: 1, name: "Seragam Putih Perempuan", price: 150000, popular: true, image: "seragam abu cewe.jpeg" },
    { id: 2, name: "Seragam Putih Laki-laki", price: 150000, popular: true, image: "putih cowo.jpeg" },
    { id: 3, name: "Seragam Pramuka", price: 150000, popular: true, image: "seragam pramuka.jpeg" },
    { id: 4, name: "Seragam Olahraga Perempuan", price: 150000, popular: true, image: "olga cewe.jpeg" },
    { id: 5, name: "Seragam Olahraga Laki-laki", price: 150000, popular: false, image: "olga cowo.jpeg" },
    { id: 6, name: "Seragam Batik", price: 150000, popular: false, image: "batik.jpeg" },
    { id: 7, name: "Jas Almet", price: 150000, popular: false, image: "jas.jpeg" },
    { id: 8, name: "Topi", price: 150000, popular: false, image: "topi.jpeg" },
    { id: 9, name: "Seragam Jurusan RPL", price: 150000, popular: false, image: "jurusan rpl.jpeg" },
    { id: 10, name: "Seragam Jurusan TBSM", price: 150000, popular: false, image: "jurusan laki laki.jpeg" },
    { id: 11, name: "Dasi", price: 150000, popular: false, image: "dasi.jpeg" },
    { id: 12, name: "Ikat Pinggang", price: 150000, popular: false, image: "ikat pinggang.jpeg" },
    { id: 13, name: "Androk Abu", price: 150000, popular: false, image: "androk abu.jpeg" },
    { id: 14, name: "Celana Abu", price: 150000, popular: false, image: "celana abu.jpeg" }
];

// Global State
let currentUser = { nama: "", kelas: "" };
let cart = [];
let selectedProductForOption = null;

// Nomor WhatsApp Tujuan Koperasi
const PHONE_NUMBER_WA = "6281234567890";

// Helper Format Rupiah
function formatRupiah(num) {
    return "RP." + num.toLocaleString('id-ID');
}

// 1. LOGIN SYSTEM
function handleLogin(e) {
    e.preventDefault();
    const nama = document.getElementById('input-nama').value.trim();
    const kelas = document.getElementById('input-kelas').value.trim();

    if (nama !== "" && kelas !== "") {
        currentUser.nama = nama;
        currentUser.kelas = kelas;
        
        // Isi form checkout otomatis dari data login
        document.getElementById('checkout-nama').value = nama;
        document.getElementById('checkout-kelas').value = kelas;

        // Sembunyikan login & tampilkan aplikasi utama
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'flex';

        renderProducts();
    }
}

// 2. FITUR LOGOUT
function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar dari sesi ini?")) {
        currentUser = { nama: "", kelas: "" };
        cart = [];
        updateCartUI();

        document.getElementById('input-nama').value = "";
        document.getElementById('input-kelas').value = "";

        document.getElementById('app-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';

        switchTab('beranda');
    }
}

// 3. NAVIGASI TAB (Beranda, Profil, Produk)
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.page-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const navs = document.querySelectorAll('.nav-links a');
    navs.forEach(nav => nav.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    const targetNav = document.getElementById(`nav-${tabName}`);

    if (targetTab) targetTab.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
}

// 4. RENDER PRODUK
function renderProducts(filterKeyword = "") {
    const popularContainer = document.getElementById('popular-products-container');
    const allContainer = document.getElementById('all-products-container');

    if (!popularContainer || !allContainer) return;

    popularContainer.innerHTML = "";
    allContainer.innerHTML = "";

    const filtered = products.filter(p => p.name.toLowerCase().includes(filterKeyword.toLowerCase()));

    // Render 4 Produk Populer Pertama
    const populars = products.slice(0, 4);
    populars.forEach(prod => {
        popularContainer.appendChild(createProductCard(prod));
    });

    // Render Semua Produk (atau hasil pencarian)
    filtered.forEach(prod => {
        allContainer.appendChild(createProductCard(prod));
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-img-box">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='logo.jpeg'">
        </div>
        <div class="product-title">${product.name}</div>
        <div class="product-price">${formatRupiah(product.price)}</div>
        <button class="btn-beli" onclick="openActionModal(${product.id})">Beli</button>
    `;
    return card;
}

// 5. ACTION MODAL (Beli / + Keranjang)
function openActionModal(productId) {
    selectedProductForOption = products.find(p => p.id === productId);
    if (!selectedProductForOption) return;

    document.getElementById('opt-title').innerText = selectedProductForOption.name;
    document.getElementById('opt-price').innerText = `Harga: ${formatRupiah(selectedProductForOption.price)}`;

    document.getElementById('modal-option').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function confirmAddToCart() {
    if (selectedProductForOption) {
        addToCart(selectedProductForOption);
        closeModal('modal-option');
        alert(`"${selectedProductForOption.name}" berhasil ditambahkan ke keranjang!`);
    }
}

function confirmDirectBuy() {
    if (selectedProductForOption) {
        addToCart(selectedProductForOption);
        closeModal('modal-option');
        openCartModal();
    }
}

// 6. MANAJEMEN KERANJANG
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    updateCartUI();
    renderCartItems();
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-count').innerText = totalCount;
}

function openCartModal() {
    renderCartItems();
    document.getElementById('modal-cart').classList.add('active');
}

function renderCartItems() {
    const wrapper = document.getElementById('cart-items-wrapper');
    const totalPriceEl = document.getElementById('cart-total-price');

    if (cart.length === 0) {
        wrapper.innerHTML = `<p style="text-align: center; color: #94a3b8; padding: 1.5rem 0;">Keranjang masih kosong.</p>`;
        totalPriceEl.innerText = "RP.0";
        return;
    }

    let html = "";
    let grandTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;

        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small style="color: #64748b;">${formatRupiah(item.price)} x ${item.qty}</small>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button type="button" onclick="updateCartQty(${item.id}, -1)" style="padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">-</button>
                    <span>${item.qty}</span>
                    <button type="button" onclick="updateCartQty(${item.id}, 1)" style="padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">+</button>
                    <span style="font-weight: bold; margin-left: 0.5rem;">${formatRupiah(itemTotal)}</span>
                </div>
            </div>
        `;
    });

    wrapper.innerHTML = html;
    totalPriceEl.innerText = formatRupiah(grandTotal);
}

// 7. SEARCH BAR FILTER
function filterProducts() {
    const query = document.getElementById('search-input').value;
    renderProducts(query);
    if (query.trim() !== "") {
        switchTab('produk');
    }
}

// 8. CHECKOUT KE WHATSAPP
function handleCheckoutWhatsApp(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Keranjang Anda masih kosong!");
        return;
    }

    const nama = document.getElementById('checkout-nama').value;
    const kelas = document.getElementById('checkout-kelas').value;

    let daftarPesanan = "";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        daftarPesanan += `${index + 1}. ${item.name} (x${item.qty}) - ${formatRupiah(subtotal)}\n`;
    });

    const message = 
`PESANAN KOPERASI SEKOLAH
---------------------------------------
Data Pemesan:
- Nama: ${nama}
- Kelas: ${kelas}
- Metode Pembayaran: Cash / Tunai (di Koperasi)

Daftar Barang:
${daftarPesanan}
---------------------------------------
TOTAL PEMBAYARAN: ${formatRupiah(grandTotal)}
---------------------------------------
Mohon segera diproses, terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${PHONE_NUMBER_WA}?text=${encodedMessage}`;

    cart = [];
    updateCartUI();
    closeModal('modal-cart');

    window.open(waUrl, '_blank');
}