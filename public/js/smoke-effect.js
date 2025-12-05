// Bright smoke falling from top - with STRONG cursor repulsion
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'smoke-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Smoke particle with BRIGHT colors
    class SmokeParticle {
        constructor(x, y) {
            this.x = x !== undefined ? x : Math.random() * canvas.width;
            this.y = y !== undefined ? y : -100; // Start from top

            // Downward flow with some horizontal drift - MUCH FASTER
            this.vx = (Math.random() - 0.5) * 0.8; // Increased horizontal drift
            this.vy = Math.random() * 2.0 + 2.0; // VERY FAST fall (2.0-4.0)

            this.size = Math.random() * 180 + 120; // Large, dense smoke
            this.alpha = 0;
            this.life = 0;
            this.maxLife = Math.random() * 800 + 600;

            // Organic movement
            this.noiseOffset = Math.random() * 1000;
            this.noiseScale = Math.random() * 0.6 + 0.4;

            // 3 BRIGHT COLOR VARIATIONS for excellent visibility
            const colorType = Math.floor(Math.random() * 3);

            if (colorType === 0) {
                // PURE WHITE (250-255) - maximum brightness
                const brightness = 250 + Math.floor(Math.random() * 5);
                this.color = `${brightness}, ${brightness}, ${brightness}`;
            } else if (colorType === 1) {
                // LIGHT CYAN-BLUE (sky blue/ice smoke)
                const r = 200 + Math.floor(Math.random() * 30); // 200-230
                const g = 230 + Math.floor(Math.random() * 25); // 230-255
                const b = 255; // Full blue for contrast
                this.color = `${r}, ${g}, ${b}`;
            } else {
                // BRIGHT LIGHT GRAY (220-240)
                const gray = 220 + Math.floor(Math.random() * 20);
                this.color = `${gray}, ${gray}, ${gray}`;
            }
        }

        update() {
            this.life++;

            // Organic wave motion
            const time = this.life * 0.01;
            const noiseX = Math.sin(time + this.noiseOffset) * this.noiseScale;
            const noiseY = Math.cos(time * 1.3 + this.noiseOffset) * this.noiseScale * 0.5;

            // STRONG MOUSE REPULSION - smoke scatters away dramatically
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 300 && distance > 0) { // Larger radius (300px)
                const force = (300 - distance) / 300 * 5; // Much stronger force
                this.vx += (dx / distance) * force * 1.2; // Strong push
                this.vy += (dy / distance) * force * 1.2;
            }

            // Apply velocity with noise
            this.x += this.vx + noiseX;
            this.y += this.vy + noiseY;

            // Slowly return to downward flow
            this.vy = this.vy * 0.98 + 0.5 * 0.02; // Slightly faster return
            this.vx *= 0.96; // More friction for visibility

            // Grow as it falls
            this.size += 0.25;

            // Fade in and out - HIGHER OPACITY for visibility
            const fadeIn = 100;
            const fadeOut = 180;

            if (this.life < fadeIn) {
                this.alpha = (this.life / fadeIn) * 0.9; // Increased to 0.9
            } else if (this.life > this.maxLife - fadeOut) {
                this.alpha = ((this.maxLife - this.life) / fadeOut) * 0.9;
            } else {
                this.alpha = 0.9; // Very visible
            }

            // Remove if off screen or dead
            return this.life < this.maxLife && this.y < canvas.height + 300;
        }

        draw() {
            ctx.save();

            // Heavy blur for soft smoke
            ctx.filter = `blur(${Math.min(this.size * 0.5, 70)}px)`;

            // Create soft gradient
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
            gradient.addColorStop(0.4, `rgba(${this.color}, ${this.alpha * 0.7})`);
            gradient.addColorStop(0.7, `rgba(${this.color}, ${this.alpha * 0.3})`);
            gradient.addColorStop(1, `rgba(${this.color}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // Create smoke from top
    function createSmoke() {
        // Create multiple particles across the top
        const baseX = Math.random() * canvas.width;
        for (let i = 0; i < 3; i++) {
            const x = baseX + (Math.random() - 0.5) * 150;
            particles.push(new SmokeParticle(x, -50));
        }
    }

    // Mouse tracking for STRONG interaction
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animation loop
    function animate() {
        // Clear canvas with medium gray background
        ctx.fillStyle = '#706f6f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles = particles.filter(particle => {
            const alive = particle.update();
            if (alive) particle.draw();
            return alive;
        });

        // Continuously create smoke from top
        if (Math.random() < 0.12) { // 12% chance each frame
            createSmoke();
        }

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Initial smoke
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createSmoke(), i * 250);
    }
});
