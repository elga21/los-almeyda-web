// pedido-confirmado.js
document.addEventListener('DOMContentLoaded', () => {
    const confirmationData = JSON.parse(localStorage.getItem('order-confirmation'));

    if (!confirmationData) {
        alert('No hay datos de confirmación');
        window.location.href = '/index.html';
        return;
    }

    // Mostrar datos del pedido
    document.getElementById('order-number').textContent = `#${confirmationData.orderNumber}`;
    document.getElementById('customer-name').textContent = confirmationData.customerName;
    document.getElementById('customer-phone').textContent = confirmationData.phone || 'No registrado';
    document.getElementById('delivery-address').textContent = confirmationData.requireDelivery ? confirmationData.address : 'Recoger en tienda';
    document.getElementById('payment-method').textContent = confirmationData.paymentMethod;
    document.getElementById('receipt-number').textContent = `#${confirmationData.receipt}`;

    // Mostrar productos
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = confirmationData.cart.map(item => `
        <div class="flex justify-between border-b pb-2">
            <div>
                <span class="font-semibold">${item.nombre}</span>
                <span class="text-gray-600">x${item.cantidad}</span>
            </div>
            <span class="font-bold">$ ${(item.precio * item.cantidad).toLocaleString()}</span>
        </div>
    `).join('');

    // Mostrar totales
    document.getElementById('subtotal').textContent = `$ ${confirmationData.subtotal.toLocaleString()}`;
    document.getElementById('shipping').textContent = `$ ${confirmationData.shippingCost.toLocaleString()}`;
    document.getElementById('total').textContent = `$ ${confirmationData.total.toLocaleString()}`;
});
