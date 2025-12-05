// perfil.js
const API_BASE_URL = `${window.location.origin}/api`;

let currentUser = {
    nombre_usuario: '',
    email: '',
    telefono: '',
    direccion: ''
};

// Cargar datos del perfil al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadOrderHistory();
    updateUserName();
    setupLogout();
});

async function loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No token found, redirecting to login');
        window.location.href = '/auth.html';
        return;
    }

    try {
        console.log('Loading profile from:', `${API_BASE_URL}/usuarios/perfil`);
        const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Profile response status:', response.status);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Token inválido o expirado');
                alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth.html';
                return;
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const user = await response.json();
        console.log('Profile loaded successfully:', user.nombre_usuario);
        currentUser = user;

        // Rellenar campos
        document.getElementById('nombre_usuario').value = user.nombre_usuario || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('telefono').value = user.telefono || '';
        document.getElementById('direccion').value = user.direccion || '';

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error al cargar perfil. Verifica que el servidor esté ejecutándose.\n\nDetalles: ' + error.message);
    }
}

async function saveProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No estás autenticado. Por favor inicia sesión.');
        window.location.href = '/auth.html';
        return;
    }

    const updatedData = {
        nombre_usuario: document.getElementById('nombre_usuario').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value
    };

    if (!updatedData.nombre_usuario || !updatedData.email) {
        alert('Nombre y email son obligatorios');
        return;
    }

    const saveButton = document.getElementById('save-button');
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.textContent = '💾 Guardando...';

    try {
        console.log('Saving profile to:', `${API_BASE_URL}/usuarios/perfil`);
        const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        console.log('Save response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        alert('✅ Perfil actualizado exitosamente');

        // Actualizar localStorage si cambió el nombre
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            user.nombre_usuario = updatedData.nombre_usuario;
            localStorage.setItem('user', JSON.stringify(user));
            updateUserName();
        }

    } catch (error) {
        console.error('Error al guardar perfil:', error);
        alert('Error al guardar cambios.\n\nVerifica que el servidor esté ejecutándose.\n\nDetalles: ' + error.message);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = originalText;
    }
}

// Attach save handler to button
document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', saveProfile);
    }
});

async function loadOrderHistory() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar pedidos');

        const pedidos = await response.json();
        const tbody = document.getElementById('orders-table');

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">No hay pedidos aún</td></tr>';
            return;
        }

        tbody.innerHTML = pedidos.map(pedido => `
            <tr>
                <td class="px-6 py-4 text-sm">${new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-sm font-bold text-red-600">#${pedido.id_pedido}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${pedido.estado === 'Entregado' ? 'bg-green-100 text-green-800' :
                pedido.estado === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'}">
                        ${pedido.estado}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm font-semibold">$ ${Number(pedido.total_pedido).toLocaleString()}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
    }
}

function updateUserName() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('user-name').textContent = user.nombre_usuario;
    }
}

function setupLogout() {
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
    });
}
