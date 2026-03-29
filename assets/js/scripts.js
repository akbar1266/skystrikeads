// Navigation Scroll Effect
const navbar = document.getElementById('navbar');
const heroSection = document.getElementById('hero');

window.addEventListener('scroll', () => {
    // Get the bottom offset of the hero section for the threshold
    const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 50;
    
    // Fade in the navbar after scrolling past the hero section's animation
    if (window.scrollY > heroBottom - window.innerHeight) { 
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scroll Function
function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Mobile Menu Toggle — global functions called via onclick
function toggleMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
}

function closeMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    if (hamburger) hamburger.classList.remove('open');
    if (mobileMenu) mobileMenu.classList.remove('open');
}

// Close menu on outside tap
document.addEventListener('click', function (e) {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu || !hamburger) return;
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
        closeMobileMenu();
    }
});

// Intersection Observer for Animations
const observeElements = (selector, className) => {
    const elements = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(className);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
};

// Apply observers to reveal elements
document.addEventListener('DOMContentLoaded', () => {
    // Initial hero animations
    setTimeout(() => {
        document.querySelectorAll('.reveal-text').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }, 100);

    // Scroll reveal animations
    observeElements('.blur-appear', 'visible');

    // Formation layout morphing trigger
    const formationSection = document.querySelector('.formation-visual');
    const formationAnim = document.querySelector('.formation-animation');

    if (formationSection && formationAnim) {
        const formationObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(() => {
                    formationAnim.classList.add('active');
                }, 500);
            }
        }, { threshold: 0.5 });
        formationObserver.observe(formationSection);
    }

    // Auto-cycle map locations
    const dots = document.querySelectorAll('.pulse-dot');
    let activeDotIndex = 0;

    setInterval(() => {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[activeDotIndex].classList.add('active');
        activeDotIndex = (activeDotIndex + 1) % dots.length;
    }, 4000);
});

// Parallax Scrolling Effect
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Hero Parallax
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
    }

    // General Parallax Elements
    const parallaxElements = document.querySelectorAll('.parallax-element');
    parallaxElements.forEach(el => {
        const parent = el.parentElement;
        const rect = parent.getBoundingClientRect();

        // If element is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Calculate relative scroll position
            const centerOffset = (rect.top + rect.bottom) / 2 - window.innerHeight / 2;
            const yOffset = centerOffset * 0.2; // Adjust multiplier for stronger/weaker parallax
            el.style.transform = `translateY(${yOffset}px)`;
        }
    });
});

// Cinematic Carousel Interaction 
function initCinematicCarousel() {
    const track = document.getElementById('cinematic-track');
    const cards = document.querySelectorAll('.cinematic-card-container');
    if (!track || !cards.length) return;

    function apply3DEffects() {
        if (!track) return;
        const viewportCenter = window.innerWidth / 2;

        cards.forEach(cardContainer => {
            const rect = cardContainer.getBoundingClientRect();
            if (rect.left < window.innerWidth && rect.right > 0) {
                const cardCenter = rect.left + rect.width / 2;
                const distance = cardCenter - viewportCenter;
                let normalized = Math.max(-1, Math.min(1, distance / 600));

                const wrapper3d = cardContainer.querySelector('.js-3d-wrapper');
                const focusCard = cardContainer.querySelector('.cinematic-card');
                if (!wrapper3d || !focusCard) return;

                const scale = 1 - Math.abs(normalized) * 0.15;
                const rotateY = normalized * -35;
                const blurAmt = Math.abs(normalized) * 8;
                const opacity = 1 - Math.abs(normalized) * 0.6;
                const zIndex = Math.round((1 - Math.abs(normalized)) * 100);
                const translateZ = Math.abs(normalized) * -100;

                wrapper3d.style.transform = `scale(${scale}) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
                wrapper3d.style.filter = `blur(${Math.max(0, blurAmt)}px) brightness(${1 - Math.abs(normalized) * 0.5})`;
                wrapper3d.style.opacity = Math.max(0.3, opacity);
                cardContainer.style.zIndex = zIndex;

                if (Math.abs(normalized) < 0.15) {
                    focusCard.classList.add('focused-glow');
                } else {
                    focusCard.classList.remove('focused-glow');
                }
            }
        });
    }

    // --- High-Performance Manual Drive (with Lerp) ---
    let isDown = false;
    let startX, scrollLeftAtStart;
    let targetScroll = track.scrollLeft;
    let currentScroll = track.scrollLeft;
    const scrollEase = 0.15; // smoothness factor

    function rafLoop() {
        // Only lerp when the user is actively dragging or we need to catch up
        if (isDown) {
            currentScroll += (targetScroll - currentScroll) * scrollEase;
            track.scrollLeft = currentScroll;
        } else {
            // Stop lerping once user lets go, letting browser native scroll-snap take over
            currentScroll = track.scrollLeft;
            targetScroll = track.scrollLeft;
        }
        
        apply3DEffects();
        requestAnimationFrame(rafLoop);
    }

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.classList.add('active'); // CSS uses this to disable snap during move
        startX = e.pageX - track.offsetLeft;
        scrollLeftAtStart = track.scrollLeft;
        targetScroll = track.scrollLeft;
        currentScroll = track.scrollLeft;
    });

    const stopDragging = () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('active'); // CSS uses this to re-enable snap
    };

    track.addEventListener('mouseleave', stopDragging);
    window.addEventListener('mouseup', stopDragging); // Global release for safety

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2; 
        targetScroll = scrollLeftAtStart - walk;
    });

    window.addEventListener('resize', () => {
        requestAnimationFrame(apply3DEffects);
    });

    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    let autoScrollingTimeout = null;
    const triggerAutoScroll = (offset) => {
        isDown = true;
        track.classList.add('active'); // disable scroll snap natively
        targetScroll = currentScroll + offset;
        
        clearTimeout(autoScrollingTimeout);
        autoScrollingTimeout = setTimeout(() => {
            isDown = false;
            track.classList.remove('active');
        }, 600);
    };

    const getScrollOffset = () => {
        const cardsArray = track.querySelectorAll('.cinematic-card-container');
        if (cardsArray.length >= 2) {
            return cardsArray[1].offsetLeft - cardsArray[0].offsetLeft;
        }
        return cardsArray[0] ? cardsArray[0].offsetWidth + 24 : 300;
    };

    if (prevBtn) {
        const handlePrev = (e) => { e.preventDefault(); triggerAutoScroll(-getScrollOffset()); };
        prevBtn.addEventListener('click', handlePrev);
        prevBtn.addEventListener('touchstart', handlePrev, {passive: false});
    }

    if (nextBtn) {
        const handleNext = (e) => { e.preventDefault(); triggerAutoScroll(getScrollOffset()); };
        nextBtn.addEventListener('click', handleNext);
        nextBtn.addEventListener('touchstart', handleNext, {passive: false});
    }

    // Autoplay functionality
    let autoplayInterval;
    const startAutoplay = () => {
        autoplayInterval = setInterval(() => {
            // Check if user is actively dragging, if not, perform scroll
            if (!track.classList.contains('active')) {
                if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
                    // Smoothly scroll back to the start
                    triggerAutoScroll(-track.scrollLeft); 
                } else {
                    // Scroll to next card
                    triggerAutoScroll(getScrollOffset());
                }
            }
        }, 3000); // Automatic scroll interval
    };

    const stopAutoplay = () => {
        clearInterval(autoplayInterval);
    };

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
    track.addEventListener('touchstart', stopAutoplay, { passive: true });
    track.addEventListener('touchend', startAutoplay);

    startAutoplay();

    // Start Loop
    rafLoop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCinematicCarousel);
} else {
    initCinematicCarousel();
}
