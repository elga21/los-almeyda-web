// pago.js
const API_BASE_URL = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', () => {
    loadOrderSummary();
    setupPaymentMethodSelection();
    setupOrderConfirmation();
});

function loadOrderSummary() {
    const orderData = JSON.parse(localStorage.getItem('pending-order'));

    if (!orderData) {
        alert('No hay orden pendiente');
        window.location.href = '/cart.html';
        return;
    }

    document.getElementById('order-subtotal').textContent = `$ ${orderData.subtotal.toLocaleString()}`;
    document.getElementById('order-shipping').textContent = `$ ${orderData.shippingCost.toLocaleString()}`;
    document.getElementById('order-total').textContent = `$ ${orderData.total.toLocaleString()}`;
    document.getElementById('delivery-address').textContent = orderData.requireDelivery ? orderData.address : 'Recoger en tienda';
}

function setupPaymentMethodSelection() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const qrDisplay = document.getElementById('qr-display');
    const qrImage = document.getElementById('qr-image');
    const qrReference = document.getElementById('qr-reference');

    // QR placeholders - El usuario debe reemplazar con sus QR reales
    const qrCodes = {
        'Bancolombia': {
            image: '/Imagenes/qr-bancolombia.png',
            reference: 'Referencia: BC-12345'
        },
        'Bre-B': {
            image: '/Imagenes/qr-breb.png',
            reference: 'Referencia: BB-67890'
        }
    };

    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            const selected = e.target.value;
            const qr = qrCodes[selected];

            if (qr) {
                qrImage.src = qr.image;
                qrImage.onerror = () => {
                    qrImage.src = 'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=QR+' + selected;
                };
                qrReference.textContent = qr.reference;
                qrDisplay.classList.remove('hidden');
            }
        });
    });
}

async function setupOrderConfirmation() {
    document.getElementById('confirm-order-btn').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        const orderData = JSON.parse(localStorage.getItem('pending-order'));
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
        const receiptNumber = document.getElementById('payment-receipt').value;

        // Validaciones
        if (!paymentMethod) {
            alert('Por favor selecciona un método de pago');
            return;
        }

        if (!receiptNumber) {
            alert('Por favor ingresa el número del comprobante de pago');
            return;
        }

        try {
            // Crear pedido en la base de datos
            const user = JSON.parse(localStorage.getItem('user'));

            // IMPORTANTE: El backend espera 'items' con estructura { id_producto, cantidad }
            const items = orderData.cart.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const pedidoData = {
                items: items  // Backend espera este formato
            };

            console.log('Enviando pedido:', pedidoData);

            const response = await fetch(`${API_BASE_URL}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pedidoData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                console.error('Error del servidor:', errorData);
                throw new Error(errorData.message || 'Error al crear el pedido');
            }

            const result = await response.json();
            console.log('Pedido creado exitosamente:', result);

            // Guardar datos de confirmación
            const confirmationData = {
                orderNumber: result.id_pedido,
                ...orderData,
                paymentMethod: paymentMethod.value,
                receipt: receiptNumber,
                customerName: user.nombre_usuario,
                phone: orderData.phone || user.telefono
            };

            localStorage.setItem('order-confirmation', JSON.stringify(confirmationData));
            localStorage.removeItem('pending-order');
            localStorage.removeItem('cart');

            // Redirigir a confirmación
            window.location.href = '/pedido-confirmado.html';

        } catch (error) {
            console.error('Error completo:', error);
            alert(`Error al procesar el pago: ${error.message}\n\nPor favor revisa la consola (F12) para más detalles.`);
        }
    });
}
