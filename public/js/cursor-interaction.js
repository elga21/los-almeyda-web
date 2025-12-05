// Interacción del fondo con el cursor - versión mejorada
document.addEventListener('DOMContentLoaded', () => {
    // Crear el contenedor del fondo animado
    const bgContainer = document.createElement('div');
    bgContainer.className = 'animated-background';

    const smokeContainer = document.createElement('div');
    smokeContainer.className = 'smoke-container';

    // Crear 7 elementos de humo
    for (let i = 0; i < 7; i++) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke cursor-interact';
        smokeContainer.appendChild(smoke);
    }

    bgContainer.appendChild(smokeContainer);
    document.body.insertBefore(bgContainer, document.body.firstChild);

    // Interacción con el cursor
    const smokes = document.querySelectorAll('.smoke');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        smokes.forEach((smoke, index) => {
            const rect = smoke.getBoundingClientRect();
            const smokeX = rect.left + rect.width / 2;
            const smokeY = rect.top + rect.height / 2;

            // Calcular distancia del cursor al humo
            const deltaX = mouseX - smokeX;
            const deltaY = mouseY - smokeY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Área de influencia varía por elemento
            const influenceRadius = 300 + (index * 20);

            if (distance < influenceRadius) {
                const force = (influenceRadius - distance) / influenceRadius;
                // Movimiento más suave y orgánico
                const moveX = -deltaX * force * 0.15;
                const moveY = -deltaY * force * 0.15;
                const rotate = (deltaX / influenceRadius) * force * 5;

                smoke.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;
                smoke.style.opacity = 0.2 + (force * 0.15);
            } else {
                smoke.style.transform = 'translate(0, 0)';
                smoke.style.opacity = 0.35;
            }
        });
    });
});
