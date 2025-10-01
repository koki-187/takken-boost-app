// 宅建BOOST v9.0.0 - Anime.js Animations Library
class TakkenBoostAnimations {
    constructor() {
        this.initializeAnimations();
        this.setupScrollAnimations();
        this.setupHoverEffects();
    }
    
    initializeAnimations() {
        // Page load animations
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1500
        })
        .add({
            targets: '.hero-title',
            translateY: [-50, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: 200
        })
        .add({
            targets: '.hero-subtitle',
            translateY: [-30, 0],
            opacity: [0, 1],
            duration: 800,
            offset: '-=600'
        })
        .add({
            targets: '.feature-card',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            offset: '-=600'
        })
        .add({
            targets: '.btn-primary',
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 600,
            offset: '-=400'
        });
        
        // Gradient animation for backgrounds
        this.animateGradients();
        
        // Particle effects
        this.createParticles();
        
        // Statistics counter animation
        this.animateCounters();
    }
    
    animateGradients() {
        // Animated gradient background
        const gradientAnimation = anime({
            targets: '.gradient-bg',
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            duration: 10000,
            easing: 'linear',
            loop: true
        });
        
        // Purple gradient wave effect
        const waveElements = document.querySelectorAll('.wave-effect');
        waveElements.forEach((el, index) => {
            anime({
                targets: el,
                translateY: [
                    { value: -10, duration: 1000 },
                    { value: 10, duration: 1000 }
                ],
                opacity: [
                    { value: 0.7, duration: 1000 },
                    { value: 1, duration: 1000 }
                ],
                easing: 'easeInOutSine',
                delay: index * 100,
                loop: true
            });
        });
    }
    
    createParticles() {
        const particleContainer = document.querySelector('.particle-container');
        if (!particleContainer) return;
        
        // Create floating particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                opacity: 0;
                pointer-events: none;
                box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
            `;
            
            // Random starting position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            particleContainer.appendChild(particle);
            
            // Animate particle
            anime({
                targets: particle,
                translateY: [0, -Math.random() * 200 - 100],
                translateX: [0, Math.random() * 100 - 50],
                scale: [0, Math.random() + 0.5],
                opacity: [1, 0],
                duration: Math.random() * 3000 + 2000,
                delay: Math.random() * 2000,
                easing: 'easeOutCubic',
                loop: true
            });
        }
    }
    
    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (!target) return;
            
            // Only animate when element is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: counter,
                            innerHTML: [0, target],
                            easing: 'easeInOutExpo',
                            duration: 2000,
                            round: 1,
                            update: function(anim) {
                                counter.innerHTML = Math.floor(anim.animations[0].currentValue);
                            }
                        });
                        observer.unobserve(counter);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }
    
    setupScrollAnimations() {
        // Reveal animations on scroll
        const scrollElements = document.querySelectorAll('.scroll-reveal');
        
        const elementInView = (el, dividend = 1) => {
            const elementTop = el.getBoundingClientRect().top;
            return (
                elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
            );
        };
        
        const displayScrollElement = (element) => {
            if (!element.classList.contains('animated')) {
                element.classList.add('animated');
                
                anime({
                    targets: element,
                    translateY: [30, 0],
                    opacity: [0, 1],
                    duration: 1000,
                    easing: 'easeOutCubic'
                });
            }
        };
        
        const handleScrollAnimation = () => {
            scrollElements.forEach((el) => {
                if (elementInView(el, 1.25)) {
                    displayScrollElement(el);
                }
            });
        };
        
        window.addEventListener('scroll', () => {
            handleScrollAnimation();
        });
        
        // Initial check
        handleScrollAnimation();
    }
    
    setupHoverEffects() {
        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function(e) {
                anime({
                    targets: this,
                    scale: 1.05,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
                
                // Ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    width: 100px;
                    height: 100px;
                    margin-top: -50px;
                    margin-left: -50px;
                    left: ${e.offsetX}px;
                    top: ${e.offsetY}px;
                    transform: scale(0);
                    pointer-events: none;
                `;
                this.appendChild(ripple);
                
                anime({
                    targets: ripple,
                    scale: 4,
                    opacity: [1, 0],
                    duration: 600,
                    easing: 'easeOutExpo',
                    complete: () => {
                        ripple.remove();
                    }
                });
            });
            
            btn.addEventListener('mouseleave', function() {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });
        });
        
        // Card hover effects
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                anime({
                    targets: this,
                    translateY: -5,
                    boxShadow: ['0 4px 6px rgba(0,0,0,0.1)', '0 10px 30px rgba(102,126,234,0.3)'],
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });
            
            card.addEventListener('mouseleave', function() {
                anime({
                    targets: this,
                    translateY: 0,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });
        });
        
        // Progress bar animations
        this.animateProgressBars();
    }
    
    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-progress') || bar.style.width;
            if (!targetWidth) return;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: bar,
                            width: [0, targetWidth],
                            duration: 1500,
                            easing: 'easeInOutQuart',
                            complete: () => {
                                // Add completion animation
                                anime({
                                    targets: bar,
                                    backgroundColor: ['#667eea', '#764ba2', '#667eea'],
                                    duration: 2000,
                                    loop: true,
                                    easing: 'linear'
                                });
                            }
                        });
                        observer.unobserve(bar);
                    }
                });
            });
            
            observer.observe(bar);
        });
    }
    
    // Special effects for correct/incorrect answers
    showCorrectAnimation(element) {
        // Success animation
        anime.timeline({
            easing: 'easeOutExpo'
        })
        .add({
            targets: element,
            scale: [1, 1.1, 1],
            duration: 600
        })
        .add({
            targets: element,
            backgroundColor: ['#ffffff', '#10b981', '#ffffff'],
            duration: 800,
            offset: '-=400'
        });
        
        // Add confetti effect
        this.createConfetti(element);
    }
    
    showIncorrectAnimation(element) {
        // Error animation
        anime({
            targets: element,
            translateX: [0, -10, 10, -10, 10, 0],
            duration: 400,
            easing: 'easeInOutSine'
        });
        
        anime({
            targets: element,
            backgroundColor: ['#ffffff', '#ef4444', '#ffffff'],
            duration: 800,
            easing: 'easeOutExpo'
        });
    }
    
    createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const confettiContainer = document.createElement('div');
        confettiContainer.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left + rect.width / 2}px;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(confettiContainer);
        
        const colors = ['#667eea', '#764ba2', '#FFD700', '#10b981', '#ec4899'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                transform: rotate(${Math.random() * 360}deg);
            `;
            confettiContainer.appendChild(confetti);
            
            anime({
                targets: confetti,
                translateX: Math.random() * 200 - 100,
                translateY: [0, Math.random() * -200 - 50],
                rotate: Math.random() * 360,
                scale: [1, 0],
                opacity: [1, 0],
                duration: 1500,
                easing: 'easeOutCubic',
                complete: () => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }
            });
        }
        
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.remove();
            }
        }, 2000);
    }
    
    // Loading animation
    showLoading(show = true) {
        const loader = document.querySelector('.loading-overlay');
        if (!loader) return;
        
        if (show) {
            loader.style.display = 'flex';
            anime({
                targets: loader,
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutCubic'
            });
            
            anime({
                targets: '.loading-spinner',
                rotate: 360,
                duration: 1000,
                loop: true,
                easing: 'linear'
            });
        } else {
            anime({
                targets: loader,
                opacity: [1, 0],
                duration: 300,
                easing: 'easeOutCubic',
                complete: () => {
                    loader.style.display = 'none';
                }
            });
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Anime.js is loaded
    if (typeof anime !== 'undefined') {
        window.takkenBoostAnimations = new TakkenBoostAnimations();
    }
});