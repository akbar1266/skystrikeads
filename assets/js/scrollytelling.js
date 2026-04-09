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
    let currentScrollFraction = 0;   // lerped scroll value – drives frames smoothly
    let rawScrollFraction = 0;   // set instantly on every scroll event

    // ease: how quickly the frame catches up to the scroll target
    // We increase this so it relies on the new Lenis smooth scroll for fluidity instead of lagging behind.
    const ease = 0.1;

    // ── Scroll phase split ────────────────────────────────────────
    // Set ANIMATION_END to 1.0 universally to eliminate any dead scrolling gap 
    // between the animation stopping and the next section appearing.
    const ANIMATION_END = 1.0;

    // Frame 170 out of 192 → fade starts earlier for a wider, more gradual reveal
    // ANIMATION_END * (169/191) ≈ 0.664
    const FADE_IN_START = ANIMATION_END * (169 / 191); // scroll fraction at frame 170
    const FADE_IN_END = ANIMATION_END;               // scroll fraction at frame 192

    // ── Lerped text values (updated every RAF frame for silky fade) ──
    let currentTextOpacity = 0;   // actual rendered opacity, lerped each frame
    let targetTextOpacity = 0;   // desired opacity from scroll position
    let currentTextY = 30;  // actual translateY (px), lerped each frame
    let targetTextY = 30;  // desired translateY from scroll position
    const TEXT_EASE = 0.06;       // independent ease for text — slower = silkier

    // ── Hero text fade-IN ─────────────────────────────────────────
    // Disable CSS transitions — JS lerp handles all smoothness
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'none';
        heroContent.style.willChange = 'opacity, transform';
    }
    if (scrollIndicator) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.transition = 'none';
    }

    const updateHeroText = (scrollFraction) => {
        if (!heroContent) return;

        // Calculate TARGET opacity/Y from scroll — actual rendering is lerped in RAF
        const fadeRange = FADE_IN_END - FADE_IN_START;
        const fadeProgress = Math.max(0, Math.min(1, (scrollFraction - FADE_IN_START) / fadeRange));

        targetTextOpacity = fadeProgress;             // 0 → 1
        targetTextY = (1 - fadeProgress) * 30; // 30px → 0px
    };

    // Calculate raw scroll fraction instantly on every scroll event
    const onScroll = () => {
        const scrollTop = window.scrollY;
        const maxScroll = heroSection.scrollHeight - window.innerHeight;
        rawScrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
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

        let img = images[frameIndex];

        // Ensure image exists and is ready. If not, use the closest loaded frame
        if (!img || !img.complete) {
            let found = false;
            // Search down for the most recently loaded frame (since they load sequentially 0->end)
            for (let i = frameIndex; i >= 0; i--) {
                if (images[i] && images[i].complete) {
                    img = images[i];
                    found = true;
                    break;
                }
            }
            // If none found below, search above
            if (!found) {
                for (let i = frameIndex + 1; i < frameCount; i++) {
                    if (images[i] && images[i].complete) {
                        img = images[i];
                        found = true;
                        break;
                    }
                }
            }
            // If totally no images loaded yet, fallback to css background
            if (!found) return;
        }

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

            // Mobile specific logic to make the camera follow the drone
            if (window.innerWidth <= 768) {
                const progress = (airframes.frame - 1) / (frameCount - 1);

                // To keep the drone consistently on the RIGHT side of the mobile screen,
                // we map the panning alignment from 0.3 (start) to 0.7 (end). 
                // Any alignment closer to 1.0 pans the camera too far right, 
                // pushing the drone back towards the left of the screen.
                const easeOutSine = Math.sin((progress * Math.PI) / 2);
                const alignment = 0.3 + 0.4 * easeOutSine;

                offsetX = (canvas.width - drawWidth) * alignment;
            } else {
                offsetX = (canvas.width - drawWidth) / 2;
            }

            offsetY = 0;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // 60FPS Render Loop using requestAnimationFrame
    const update = () => {
        // ── Step 1: smoothly lerp the scroll fraction itself ──────
        // This prevents sudden frame jumps on fast scroll flicks.
        const scrollDiff = rawScrollFraction - currentScrollFraction;
        if (Math.abs(scrollDiff) > 0.0001) {
            currentScrollFraction += scrollDiff * ease;
        } else {
            currentScrollFraction = rawScrollFraction;
        }

        // ── Step 2: map smoothed scroll → target frame ────────────
        const frameFraction = Math.min(1, currentScrollFraction / ANIMATION_END);
        targetFrame = 1 + frameFraction * (frameCount - 1);

        // ── Step 3: update target text values from smoothed scroll ─
        updateHeroText(currentScrollFraction);

        // ── Step 4: lerp text opacity & Y independently ────────────
        // This gives the fade its own silky motion, unaffected by scroll speed.
        currentTextOpacity += (targetTextOpacity - currentTextOpacity) * TEXT_EASE;
        currentTextY += (targetTextY - currentTextY) * TEXT_EASE;

        if (heroContent) {
            heroContent.style.opacity = currentTextOpacity.toFixed(4);
            heroContent.style.transform = `translateY(${currentTextY.toFixed(3)}px)`;
        }
        if (scrollIndicator) {
            scrollIndicator.style.opacity = (0.7 * currentTextOpacity).toFixed(4);
        }

        // ── Step 5: lerp the displayed frame toward target ────────
        const frameDiff = targetFrame - airframes.frame;
        if (Math.abs(frameDiff) > 0.01) {
            airframes.frame += frameDiff * ease;
            render();
        } else if (airframes.frame !== targetFrame) {
            airframes.frame = targetFrame;
            render();
        }

        requestAnimationFrame(update);
    };

    update();
});
