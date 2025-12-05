// public/js/index.js

document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const cartCountSpan = document.getElementById('cart-count');
    const logoutButton = document.getElementById('logout-button');
    const messageBox = document.getElementById('message-box');
    const loadingSpinner = document.getElementById('loading-spinner');
    const adminLink = document.getElementById('admin-link');
    const authNavLink = document.getElementById('auth-nav-link'); // Este es el enlace "Login / Registro"
    const pedidosLink = document.getElementById('pedidos-link'); // Enlace "Mis Pedidos"

    // CAMBIO CLAVE: API_BASE_URL ahora es dinámica para apuntar al dominio de la aplicación desplegada
    const API_BASE_URL = `${window.location.origin}/api`;

    // Cargar el carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Función para mostrar mensajes en la caja de mensajes global
    function showMessage(message, type = 'success') {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `message-box show ${type}`;
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000);
        } else {
            console.warn('Elemento message-box no encontrado en el DOM.');
            // No usar alert() en producción o en apps complejas
            // alert(message); // Fallback si no hay messageBox
        }
    }

    // Función para mostrar/ocultar el spinner de carga global
    function toggleLoading(show) {
        if (loadingSpinner) {
            if (show) {
                loadingSpinner.classList.add('show');
            } else {
                loadingSpinner.classList.remove('show');
            }
        }
    }

    // Actualiza el contador de ítems en el carrito en la barra de navegación
    function updateCartCount() {
        if (cartCountSpan) {
            cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.cantidad, 0);
        }
    }

    // Función para mostrar/ocultar los enlaces de navegación basados en el estado de autenticación
    function updateNavigationLinks() {
        const user = JSON.parse(localStorage.getItem('user')); // Obtiene la información del usuario logueado
        const userNameSpan = document.getElementById('user-name');
        const perfilLink = document.getElementById('perfil-link');

        if (authNavLink && logoutButton && adminLink) { // Asegúrate de que los elementos existan
            if (user) { // Si hay un usuario logueado
                // Mostrar nombre de usuario
                if (userNameSpan) {
                    userNameSpan.textContent = user.nombre_usuario;
                    userNameSpan.classList.remove('hidden');
                }
                authNavLink.classList.add('hidden'); // Ocultar el enlace de Login/Registro
                logoutButton.classList.remove('hidden'); // Mostrar el botón de Cerrar Sesión
                if (perfilLink) perfilLink.classList.remove('hidden'); // Mostrar perfil
                if (pedidosLink) pedidosLink.classList.remove('hidden'); // Mostrar el enlace de Mis Pedidos

                if (user.rol === 'admin') {
                    adminLink.classList.remove('hidden'); // Mostrar el enlace de Administración si es admin
                } else {
                    adminLink.classList.add('hidden'); // Ocultar el enlace de Administración si es cliente
                }
            } else { // Si no hay usuario logueado
                if (userNameSpan) userNameSpan.classList.add('hidden');
                authNavLink.classList.remove('hidden'); // Mostrar el enlace de Login/Registro
                logoutButton.classList.add('hidden'); // Ocultar el botón de Cerrar Sesión
                adminLink.classList.add('hidden'); // Ocultar el enlace de Administración
                if (perfilLink) perfilLink.classList.add('hidden');
                if (pedidosLink) pedidosLink.classList.add('hidden'); // Ocultar el enlace de Mis Pedidos
            }
        }
    }

    // Manejo de pestañas de categorías
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover clase active de todas
            categoryTabs.forEach(t => t.classList.remove('active', 'bg-red-600', 'text-white'));
            categoryTabs.forEach(t => t.classList.add('bg-white', 'text-gray-700'));

            // Activar la actual
            tab.classList.add('active', 'bg-red-600', 'text-white');
            tab.classList.remove('bg-white', 'text-gray-700');

            const category = tab.dataset.category;
            fetchProducts(category === 'all' ? null : category);
        });
    });

    // Añade un producto al carrito
    function addToCart(product) {
        const existingItemIndex = cart.findIndex(item => item.id_producto === product.id_producto);

        if (existingItemIndex > -1) {
            if (cart[existingItemIndex].cantidad < product.stock) {
                cart[existingItemIndex].cantidad++;
                showMessage(`"${product.nombre}" añadido al carrito. Cantidad: ${cart[existingItemIndex].cantidad}`, 'success');
            } else {
                showMessage(`No puedes añadir más de la cantidad disponible (${product.stock}) de "${product.nombre}".`, 'error');
                return;
            }
        } else {
            if (product.stock > 0) {
                cart.push({ ...product, cantidad: 1, imagen_url: product.imagen_url, unidad: product.unidad });
                showMessage(`"${product.nombre}" añadido al carrito.`, 'success');
            } else {
                showMessage(`El producto "${product.nombre}" no tiene stock disponible.`, 'error');
                return;
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Renderiza los productos en la interfaz
    function renderProducts(products) {
        if (!productsContainer) return;
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">No hay productos disponibles en esta categoría.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-lg shadow-md p-6 flex flex-col justify-between transform transition duration-300 hover:scale-105';

            const displayPrice = (typeof product.precio === 'number')
                ? product.precio.toFixed(2)
                : (parseFloat(product.precio) || 0).toFixed(2);

            const imageUrl = product.imagen_url || `https://placehold.co/400x300/E0E0E0/333333?text=${encodeURIComponent(product.nombre)}`;
            const unitDisplay = product.unidad === 'item' ? 'unid' : 'lb';

            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.nombre}" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.onerror=null;this.src='https://placehold.co/400x300/E0E0E0/333333?text=Imagen+no+disponible';" />
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${product.nombre}</h3>
                <p class="text-gray-600 text-sm mb-2">Categoría: ${product.categoria_nombre || 'N/A'}</p>
                <p class="text-gray-700 text-sm mb-4 flex-grow">${product.descripcion || 'Sin descripción'}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-bold text-blue-600">$${displayPrice} / ${unitDisplay}</span>
                    <span class="text-gray-500 text-sm">Stock: ${product.stock} ${unitDisplay}</span>
                </div>
                <button class="add-to-cart-btn bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md w-full
                            ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                            data-product-id="${product.id_producto}"
                            data-product-name="${product.nombre}"
                            data-product-price="${product.precio}"
                            data-product-stock="${product.stock}"
                            data-product-image="${product.imagen_url || ''}" 
                            data-product-unit="${product.unidad || 'lb'}"
                            ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            `;
            productsContainer.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const productName = e.target.dataset.productName;
                const productPrice = parseFloat(e.target.dataset.productPrice);
                const productStock = parseInt(e.target.dataset.productStock);
                const productImage = e.target.dataset.productImage;
                const productUnit = e.target.dataset.productUnit;

                addToCart({
                    id_producto: productId,
                    nombre: productName,
                    precio: productPrice,
                    stock: productStock,
                    imagen_url: productImage,
                    unidad: productUnit
                });
            });
        });
    }

    // Obtiene los productos del backend
    async function fetchProducts(category = null) {
        toggleLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            let url = `${API_BASE_URL}/productos`;
            if (category) {
                url += `?categoria=${encodeURIComponent(category)}`;
            }

            const response = await fetch(url, { method: 'GET', headers: headers });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();
            renderProducts(result);

        } catch (error) {
            console.error('Error al cargar productos:', error);
            showMessage('Error al cargar productos.', 'error');
            if (productsContainer) {
                productsContainer.innerHTML = '<p class="text-center text-red-600 col-span-full">Error al cargar productos.</p>';
            }
        } finally {
            toggleLoading(false);
        }
    }

    // Maneja el cierre de sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('cart');
            updateNavigationLinks();
            window.location.href = '/';
        });
    }

    updateNavigationLinks();
    fetchProducts(); // Carga inicial (todos)

    // Funcionalidad de búsqueda de productos
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterProductsBySearch(searchTerm);
        });
    }

    function filterProductsBySearch(searchTerm) {
        const productCards = document.querySelectorAll('#products-container > div');

        productCards.forEach(card => {
            const productName = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const productDescription = card.querySelector('.text-gray-700')?.textContent.toLowerCase() || '';

            if (searchTerm === '' || productName.includes(searchTerm) || productDescription.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });

        // Mostrar mensaje si no hay resultados
        const visibleProducts = Array.from(productCards).filter(card => card.style.display !== 'none');
        const container = document.getElementById('products-container');

        let noResultsMsg = document.getElementById('no-results-message');
        if (visibleProducts.length === 0 && searchTerm !== '') {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.id = 'no-results-message';
                noResultsMsg.className = 'text-center text-gray-500 col-span-full py-8';
                noResultsMsg.textContent = `No se encontraron productos para "${searchTerm}"`;
                container.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
});

