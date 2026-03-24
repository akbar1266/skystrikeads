// Navigation Scroll Effect
const navbar = document.getElementById('navbar');
const heroSection = document.getElementById('hero');

window.addEventListener('scroll', () => {
    // Get the bottom offset of the hero section for the threshold
    const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 50;

    // Add the solid background only after scrolling past the hero section
    if (window.scrollY > heroBottom - 80) { // 80px buffer for smooth transition before leaving the section
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
document.addEventListener('click', function(e) {
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
            const cardCenter = rect.left + rect.width / 2;
            const distance = cardCenter - viewportCenter;
            
            // Normalize distance based on max dist effect (600px width limit)
            let normalized = Math.max(-1, Math.min(1, distance / 600)); 
            
            const wrapper3d = cardContainer.querySelector('.js-3d-wrapper');
            const focusCard = cardContainer.querySelector('.cinematic-card');
            if(!wrapper3d || !focusCard) return;
            
            const scale = 1 - Math.abs(normalized) * 0.15; // 1 at center, 0.85 at outer edges
            const rotateY = normalized * -35; 
            const blurAmt = Math.abs(normalized) * 8;
            const opacity = 1 - Math.abs(normalized) * 0.6;
            const zIndex = Math.round((1 - Math.abs(normalized)) * 100);
            const translateZ = Math.abs(normalized) * -100;
            
            // Apply JS transform specifically to the wrapper to not conflict with CSS floating animation
            wrapper3d.style.transform = `scale(${scale}) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
            wrapper3d.style.filter = `blur(${Math.max(0, blurAmt)}px) brightness(${1 - Math.abs(normalized)*0.5})`;
            wrapper3d.style.opacity = Math.max(0.3, opacity);
            cardContainer.style.zIndex = zIndex; 
            
            if (Math.abs(normalized) < 0.15) {
                focusCard.classList.add('focused-glow');
            } else {
                focusCard.classList.remove('focused-glow');
            }
        });
    }

    // Scroll drag mechanism for Desktop
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.classList.add('active'); 
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.classList.remove('active');
    });

    track.addEventListener('mouseup', () => {
        isDown = false;
        track.classList.remove('active');
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2.5; // the multiplier represents scroll speed
        track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener('scroll', () => {
        requestAnimationFrame(apply3DEffects);
    });
    
    window.addEventListener('resize', () => {
        requestAnimationFrame(apply3DEffects);
    });
    
    // Initial call after small delay for layout calculations to finish rendering correctly
    setTimeout(() => {
        requestAnimationFrame(apply3DEffects);
        // center the track perfectly automatically (e.g. scroll slowly)
        // track.scrollLeft = (track.scrollWidth - track.clientWidth) / 2;
    }, 150);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCinematicCarousel);
} else {
    initCinematicCarousel();
}
