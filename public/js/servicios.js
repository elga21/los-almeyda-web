// servicios.js - Carga y muestra los servicios disponibles
const API_BASE_URL = `${window.location.origin}/api`;
let servicios = [];

document.addEventListener('DOMContentLoaded', () => {
    loadServicios();
    updateNavigation();
});

async function loadServicios() {
    try {
        const response = await fetch(`${API_BASE_URL}/servicios`);

        if (!response.ok) {
            throw new Error('Error al cargar servicios');
        }

        servicios = await response.json();
        console.log('Servicios cargados:', servicios);
        renderServicios();
    } catch (error) {
        console.error('Error al cargar servicios:', error);
        const container = document.getElementById('servicios-container');
        if (container) {
            container.innerHTML = '<p class="text-center text-red-500">Error al cargar servicios. Por favor intenta de nuevo.</p>';
        }
    }
}

function renderServicios() {
    const container = document.getElementById('servicios-container');
    if (!container) return;

    if (servicios.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No hay servicios disponibles en este momento.</p>';
        return;
    }

    container.innerHTML = servicios.map(servicio => `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
            ${servicio.imagen_url ?
            `<img src="${servicio.imagen_url}" alt="${servicio.nombre}" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.src='https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=${encodeURIComponent(servicio.nombre)}'">`
            :
            `<div class="w-full h-48 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
                    <span class="text-white text-2xl font-bold">${servicio.nombre.charAt(0)}</span>
                </div>`
        }
            <h3 class="text-xl font-bold text-gray-800 mb-2">${servicio.nombre}</h3>
            <p class="text-gray-600 mb-4 line-clamp-3">${servicio.descripcion || 'Servicio de calidad'}</p>
            <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-red-600">$ ${Number(servicio.precio).toLocaleString()}</span>
                <button onclick="verDetalleServicio(${servicio.id_servicio})" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300">
                    Ver Más
                </button>
            </div>
        </div>
    `).join('');
}

function verDetalleServicio(id) {
    const servicio = servicios.find(s => s.id_servicio === id);
    if (!servicio) return;

    alert(`
📋 Servicio: ${servicio.nombre}
💰 Precio: $${Number(servicio.precio).toLocaleString()}
📝 Descripción: ${servicio.descripcion || 'No disponible'}

Para contratar este servicio, por favor contacta con nosotros:
📞 Teléfono: +57 300 123 4567
📧 Email: contacto@losalmeyda.com
    `);
}

function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userNameSpan = document.getElementById('user-name');
    const perfilLink = document.getElementById('perfil-link');
    const authNavLink = document.getElementById('auth-nav-link');
    const logoutButton = document.getElementById('logout-button');
    const adminLink = document.getElementById('admin-link');
    const cartCountSpan = document.getElementById('cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartCountSpan) cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.cantidad, 0);

    if (user && token) {
        if (userNameSpan) {
            userNameSpan.textContent = user.nombre_usuario;
            userNameSpan.classList.remove('hidden');
        }
        if (authNavLink) authNavLink.classList.add('hidden');
        if (logoutButton) logoutButton.classList.remove('hidden');
        if (perfilLink) perfilLink.classList.remove('hidden');
        if (user.rol === 'admin' && adminLink) adminLink.classList.remove('hidden');
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('cart');
            window.location.href = '/';
        });
    }

    // Aplicar estilos a nav-links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.add('bg-transparent', 'text-red-600', 'py-2', 'px-4', 'rounded-lg', 'transition', 'duration-300', 'ease-in-out', 'transform', 'hover:scale-105', 'hover:shadow-md', 'hover:bg-gray-300', 'hover:text-black', 'inline-block');
    });
}
