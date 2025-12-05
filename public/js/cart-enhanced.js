// cart-enhanced.js
const API_BASE_URL = `${window.location.origin}/api`;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let user = JSON.parse(localStorage.getItem('user'));
let requireDelivery = true;

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    renderCart();
    setupDeliveryCheckbox();
    setupCheckout();
    updateAuthUI();
});

function loadUserInfo() {
    const token = localStorage.getItem('token');
    if (token && user) {
        const addressEl = document.getElementById('user-address');
        const shippingSection = document.getElementById('shipping-section');

        if (user.direccion) {
            addressEl.textContent = user.direccion;
            shippingSection.classList.remove('hidden');
        } else {
            addressEl.textContent = 'No has registrado una dirección';
            shippingSection.classList.remove('hidden');
        }

        document.getElementById('perfil-link').classList.remove('hidden');
        document.getElementById('user-name').classList.remove('hidden');
        document.getElementById('user-name').textContent = user.nombre_usuario;
        document.getElementById('auth-nav-link').classList.add('hidden');
        document.getElementById('logout-button').classList.remove('hidden');

        if (user.rol === 'admin') {
            document.getElementById('admin-link').classList.remove('hidden');
        }
    }
}

function renderCart() {
    const cartItemsEl = document.getElementById('cart-items');
    const emptyCartEl = document.getElementById('empty-cart');
    const cartCountEl = document.getElementById('cart-count');

    cartCountEl.textContent = cart.length;

    if (cart.length === 0) {
        emptyCartEl.classList.remove('hidden');
        cartItemsEl.innerHTML = '';
        document.getElementById('checkout-btn').disabled = true;
        updateTotals();
        return;
    }

    emptyCartEl.classList.add('hidden');
    document.getElementById('checkout-btn').disabled = false;

    cartItemsEl.innerHTML = cart.map((item, index) => `
        <tr class="border-b border-gray-100">
            <td class="py-4">${item.nombre}</td>
            <td class="py-4">${item.unidad || 'lb'}</td>
            <td class="py-4 text-center">
                <div class="flex items-center justify-center space-x-2">
                    <button onclick="decreaseQuantity(${index})" class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">-</button>
                    <span class="font-semibold">${item.cantidad}</span>
                    <button onclick="increaseQuantity(${index})" class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">+</button>
                </div>
            </td>
            <td class="py-4 text-right">$ ${Number(item.precio).toLocaleString()}</td>
            <td class="py-4 text-right font-bold">$ ${(item.precio * item.cantidad).toLocaleString()}</td>
        </tr>
    `).join('');

    updateTotals();
}

function increaseQuantity(index) {
    cart[index].cantidad++;
    saveCart();
    renderCart();
}

function decreaseQuantity(index) {
    if (cart[index].cantidad > 1) {
        cart[index].cantidad--;
    } else {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
}

function setupDeliveryCheckbox() {
    const checkbox = document.getElementById('require-delivery');
    checkbox.addEventListener('change', (e) => {
        requireDelivery = e.target.checked;
        updateTotals();
    });
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const shippingCost = requireDelivery ? 10000 : 0;
    const total = subtotal + shippingCost;

    document.getElementById('subtotal').textContent = `$ ${subtotal.toLocaleString()}`;
    document.getElementById('shipping-cost').textContent = `$ ${shippingCost.toLocaleString()}`;
    document.getElementById('total').textContent = `$ ${total.toLocaleString()}`;
}

// Función para recargar datos del usuario desde el servidor
async function reloadUserData() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('No se pudo cargar el perfil');
        }

        const freshUserData = await response.json();

        // Actualizar localStorage con los datos frescos
        localStorage.setItem('user', JSON.stringify(freshUserData));
        user = freshUserData;

        // Actualizar la visualización de la dirección
        const addressEl = document.getElementById('user-address');
        if (addressEl) {
            addressEl.textContent = freshUserData.direccion || 'No has registrado una dirección';
        }

        return freshUserData;
    } catch (error) {
        console.error('Error al recargar datos del usuario:', error);
        return null;
    }
}

function setupCheckout() {
    document.getElementById('checkout-btn').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión para continuar');
            window.location.href = '/auth.html';
            return;
        }

        // IMPORTANTE: Recargar datos del usuario desde el servidor antes de validar
        const freshUser = await reloadUserData();

        if (!freshUser) {
            alert('Error al cargar tus datos. Por favor intenta de nuevo.');
            return;
        }

        // Ahora validar con los datos actualizados
        if (!freshUser.direccion && requireDelivery) {
            alert('Debes registrar una dirección en tu perfil para solicitar envío a domicilio.');
            window.location.href = '/perfil.html';
            return;
        }

        // Guardar datos del pedido en localStorage para la página de pago
        const orderData = {
            cart: cart,
            subtotal: cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
            requireDelivery: requireDelivery,
            shippingCost: requireDelivery ? 10000 : 0,
            total: cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) + (requireDelivery ? 10000 : 0),
            address: freshUser.direccion,
            phone: freshUser.telefono
        };

        localStorage.setItem('pending-order', JSON.stringify(orderData));
        window.location.href = '/pago.html';
    });
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateAuthUI() {
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
    });
}
