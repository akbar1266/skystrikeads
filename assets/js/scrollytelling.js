document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const heroContent = document.querySelector('.hero-content');

    // Use alpha: false for better performance when we don't need transparency on the canvas itself
    const context = canvas.getContext('2d', { alpha: false });
    const heroSection = document.getElementById('hero');

    const frameCount = 192;
    const currentFrame = index => (
        // The user specified padding with 3 zeros, frame 1 to 240
        `assets/images/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const airframes = {
        frame: 1
    };

    let imagesLoaded = 0;
    let isFirstFrameRendered = false;

    // Responsive Canvas
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render(); // Force redraw on resize
    };

    window.addEventListener('resize', () => {
        requestAnimationFrame(resizeCanvas);
    });

    // Highly efficient preloader
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);

        img.onload = () => {
            imagesLoaded++;
            // Render as soon as the first image is loaded
            if (!isFirstFrameRendered && (i === 1 || imagesLoaded >= 1)) {
                resizeCanvas();
                airframes.frame = 1;
                render();
                isFirstFrameRendered = true;
            }
        };
    }

    let targetFrame = 1;
    // Lower easing multiplier => smoother interpolated motion
    const ease = 0.07;

    // Calculate frame based on scroll
    const onScroll = () => {
        const scrollTop = window.scrollY;

        // Calculate the maximum distance that can be scrolled within the hero section
        // Note: the hero is 400vh tall, and its sticky container is 100vh.
        const maxScroll = heroSection.scrollHeight - window.innerHeight;

        // Calculate scroll progress (0.0 to 1.0)
        let scrollFraction = scrollTop / maxScroll;
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));

        // Map 0-1 to frame 1-240
        targetFrame = 1 + scrollFraction * (frameCount - 1);
    };

    // Passive listener for scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial calculation
    onScroll();

    // The render function handles "object-fit: cover" natively drawn on canvas
    const render = () => {
        // Clamp to valid array indices (0 to 239)
        let frameIndex = Math.round(airframes.frame) - 1;
        frameIndex = Math.max(0, Math.min(frameCount - 1, frameIndex));

        const img = images[frameIndex];

        // Ensure image exists and is ready
        if (!img || !img.complete) return;

        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        // Calculate drawing bounds to maintain aspect ratio and cover the canvas
        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawWidth = canvas.height * imgRatio;
            drawHeight = canvas.height;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // 60FPS Render Loop using requestAnimationFrame
    const update = () => {
        // Linear interpolation for silky smooth scrub
        const diff = targetFrame - airframes.frame;

        // Threshold check avoids unneeded redundant draws when idle
        if (Math.abs(diff) > 0.01) {
            airframes.frame += diff * ease;
            render();
        } else if (Math.round(airframes.frame) !== Math.round(targetFrame)) {
            // Snap to target exactly and ensure it paints
            airframes.frame = targetFrame;
            render();
        }


        requestAnimationFrame(update);
    };

    update();
});
