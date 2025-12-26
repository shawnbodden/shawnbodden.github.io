/**
 * Scroll Animation Library
 * Inspired by SAL (Scroll Animation Library)
 * Animates elements when they come into viewport during scrolling
 */

class ScrollAnimator {
    constructor(options = {}) {
        this.options = {
            threshold: 0.2, // Percentage of element visible before animation triggers
            once: false, // Whether to animate only once or every time element enters viewport
            offset: 0, // Additional offset in pixels
            ...options
        };
        
        this.elements = [];
        this.observer = null;
        
        this.init();
    }
    
    init() {
        // Get all elements with data-scroll attribute
        this.elements = Array.from(document.querySelectorAll('[data-scroll]'));
        
        // Create Intersection Observer
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: this.options.threshold,
                rootMargin: `${this.options.offset}px`
            }
        );
        
        // Observe all elements
        this.elements.forEach(element => {
            // Apply delay if specified
            const delay = element.getAttribute('data-scroll-delay');
            if (delay) {
                element.style.transitionDelay = `${delay}ms`;
            }
            
            this.observer.observe(element);
        });
        
        // Add scroll listener for parallax effect on triangles
        this.addParallaxEffect();
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is in viewport
                entry.target.classList.add('animated');
                
                // If once option is true, stop observing this element
                if (this.options.once) {
                    this.observer.unobserve(entry.target);
                }
            } else {
                // Element left viewport
                if (!this.options.once) {
                    entry.target.classList.remove('animated');
                }
            }
        });
    }
    
    addParallaxEffect() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        const triangles = document.querySelectorAll('.triangle');
        
        triangles.forEach((triangle, index) => {
            // Skip triangles that are part of animated elements to avoid conflicts
            if (triangle.closest('[data-scroll]') && !triangle.classList.contains('animated')) {
                return;
            }
            
            // Different speed for each triangle
            const speed = 0.3 + (index * 0.1);
            const yPos = -(scrolled * speed);
            
            // Apply transform with existing rotation
            const currentTransform = window.getComputedStyle(triangle).transform;
            const rotation = this.getRotationFromMatrix(currentTransform);
            
            triangle.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
        });
    }
    
    getRotationFromMatrix(matrix) {
        if (matrix === 'none' || !matrix) return 0;
        
        try {
            const values = matrix.split('(')[1].split(')')[0].split(',');
            if (values.length < 2) return 0;
            
            const a = parseFloat(values[0]);
            const b = parseFloat(values[1]);
            
            if (isNaN(a) || isNaN(b)) return 0;
            
            const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            return angle;
        } catch (e) {
            console.warn('Failed to parse transform matrix:', matrix);
            return 0;
        }
    }
    
    refresh() {
        // Refresh all observations (useful if DOM changes)
        this.elements.forEach(element => {
            this.observer.unobserve(element);
        });
        this.init();
    }
}

// Initialize scroll animator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const scrollAnimator = new ScrollAnimator({
        threshold: 0.15,
        once: false,
        offset: 50
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const navbar = document.querySelector('.navbar');
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
    
    // Add entrance animation for hero content
    setTimeout(() => {
        document.querySelector('.hero-content').classList.add('animated');
    }, 300);
});

// Expose animator for debugging if needed
window.ScrollAnimator = ScrollAnimator;
