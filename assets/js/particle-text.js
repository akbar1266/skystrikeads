document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.hero-content');
    if (!wrapper) return;

    // Create a new canvas element just for the particle text
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-text-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '180px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto 10px auto';
    canvas.style.pointerEvents = 'none'; // let mouse events pass through to window

    // Insert it before the hero title, and hide the original text
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.display = 'none';
        wrapper.insertBefore(canvas, heroTitle);
    } else {
        wrapper.prepend(canvas);
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    let particlesArray = [];
    let animationFrameId;
    
    // Mouse state
    let mouse = {
        x: undefined,
        y: undefined,
        radius: 80
    };

    let rect = canvas.getBoundingClientRect();

    function resizeCanvas() {
        rect = canvas.getBoundingClientRect();
        // use CSS width/height for resolution
        canvas.width = rect.width || window.innerWidth;
        canvas.height = rect.height || 180;
        initParticles();
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = 2.5;
            this.baseX = x;
            this.baseY = y;
            this.density = Math.random() * 30 + 5;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            if (force < 0) force = 0;

            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 10;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
            }
        }
    }

    function initParticles() {
        particlesArray = [];
        const text = 'THE FUTURE IS HERE';
        const fontSize = Math.min(canvas.width / 12, 80); 
        const textX = canvas.width / 2;
        const textY = canvas.height / 2;

        ctx.font = `900 ${fontSize}px "Outfit", "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Gradient perfectly aligned with the site's red/white/black palette
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0.2, "#FFFFFF");
        gradient.addColorStop(0.5, "#E50914"); // --accent-red from styles.css
        gradient.addColorStop(0.8, "#FFFFFF");
        ctx.fillStyle = gradient;

        ctx.fillText(text, textX, textY);
        
        let textCoordinates;
        try {
            textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch(e) {
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < textCoordinates.height; y += 4) {
            for (let x = 0; x < textCoordinates.width; x += 4) {
                const alphaIndex = (y * 4 * textCoordinates.width) + (x * 4) + 3;
                if (textCoordinates.data[alphaIndex] > 128) {
                    const r = textCoordinates.data[alphaIndex - 3];
                    const g = textCoordinates.data[alphaIndex - 2];
                    const b = textCoordinates.data[alphaIndex - 1];
                    const color = `rgb(${r},${g},${b})`;
                    particlesArray.push(new Particle(x, y, color));
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i=0; i<particlesArray.length; i++) {
            particlesArray[i].draw();
            particlesArray[i].update();
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    // Allow initial layout to settle
    setTimeout(() => {
        resizeCanvas();
        animate();
    }, 150);

    window.addEventListener('mousemove', (e) => {
        rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId);
        resizeCanvas();
        animate();
    });
});
