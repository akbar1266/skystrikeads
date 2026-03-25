document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const heroContent = document.querySelector('.hero-content');
    const scrollIndicator = document.querySelector('.scroll-indicator');

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

    // ── Scroll phase split ────────────────────────────────────────
    // 0.00 → 0.75 : frame animation plays through all 192 frames
    // 0.75 → 1.00 : frame locked at last frame, text stays visible
    const ANIMATION_END = 0.75; // scroll fraction when all 192 frames finish

    // Frame 180 out of 192 maps to scroll fraction within animation window:
    // ANIMATION_END * (179/191) ≈ 0.703
    const FADE_IN_START = ANIMATION_END * (179 / 191); // scroll fraction at frame 180
    const FADE_IN_END   = ANIMATION_END;               // scroll fraction at frame 192

    // ── Hero text fade-IN ─────────────────────────────────────────
    // Hide text at the beginning; fade it in starting at frame 180
    if (heroContent) {
        heroContent.style.opacity    = '0';
        heroContent.style.transform  = 'translateY(30px)';
        heroContent.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    }
    if (scrollIndicator) {
        scrollIndicator.style.opacity    = '0';
        scrollIndicator.style.transition = 'opacity 0.2s ease';
    }

    const updateHeroText = (scrollFraction) => {
        if (!heroContent) return;

        // Fade IN from frame 180 (FADE_IN_START) to frame 192 (FADE_IN_END)
        const fadeRange    = FADE_IN_END - FADE_IN_START;
        const fadeProgress = Math.max(0, Math.min(1, (scrollFraction - FADE_IN_START) / fadeRange));

        const opacity    = fadeProgress;             // 0 → 1
        const translateY = (1 - fadeProgress) * 30; // 30px → 0px (rises into place)

        heroContent.style.opacity   = opacity;
        heroContent.style.transform = `translateY(${translateY}px)`;

        // Scroll indicator fades in with the text
        if (scrollIndicator) {
            const indFadeIn = Math.max(0, Math.min(1, (scrollFraction - FADE_IN_START) / fadeRange));
            scrollIndicator.style.opacity = 0.7 * indFadeIn;
        }
    };

    // Calculate frame and text opacity based on scroll
    const onScroll = () => {
        const scrollTop = window.scrollY;

        // Calculate the maximum distance that can be scrolled within the hero section
        // Note: the hero is 400vh tall, and its sticky container is 100vh.
        const maxScroll = heroSection.scrollHeight - window.innerHeight;

        // Calculate scroll progress (0.0 to 1.0)
        let scrollFraction = scrollTop / maxScroll;
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));

        // Map scroll 0 → ANIMATION_END to frames 1 → 192
        // Beyond ANIMATION_END the frame is locked at the last frame
        const frameFraction = Math.min(1, scrollFraction / ANIMATION_END);
        targetFrame = 1 + frameFraction * (frameCount - 1);

        // Drive hero text fade
        updateHeroText(scrollFraction);
    };

    // Passive listener for scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial calculation
    onScroll();

    // The render function handles "object-fit: cover" natively drawn on canvas
    const render = () => {
        // Clamp to valid array indices (0 to frameCount-1)
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
