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
