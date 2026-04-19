/* ============================================
   FIREWORKS EFFECT
   Vintage Vegas Wedding - Jac & Ben
   ============================================ */

class Fireworks {
    constructor(container) {
        this.container = container;
        this.colors = [
            '#ff2d7b', // neon pink
            '#ffcc00', // gold
            '#ff3333', // neon red
            '#00e5cc', // turquoise
            '#ff6b35', // orange
            '#ffffff'  // white
        ];
        this.isRunning = false;
    }

    start(duration = 5000, intensity = 'medium') {
        if (this.isRunning) return;
        this.isRunning = true;

        const intervals = {
            low: 500,
            medium: 300,
            high: 150
        };

        const interval = setInterval(() => {
            this.createBurst();
        }, intervals[intensity] || intervals.medium);

        setTimeout(() => {
            clearInterval(interval);
            this.isRunning = false;
        }, duration);
    }

    createBurst() {
        const x = Math.random() * this.container.offsetWidth;
        const y = Math.random() * (this.container.offsetHeight * 0.6);
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const particleCount = 15 + Math.floor(Math.random() * 15);

        this.createRocket(x, y, color, () => {
            this.createExplosion(x, y, color, particleCount);
        });
    }

    createRocket(x, y, color, onExplode) {
        const rocket = document.createElement('div');
        rocket.className = 'firework-rocket';
        rocket.style.cssText = `
            position: absolute;
            left: ${x}px;
            bottom: 0;
            width: 4px;
            height: 10px;
            background: ${color};
            border-radius: 2px;
            box-shadow: 0 0 10px ${color};
        `;

        this.container.appendChild(rocket);

        const targetY = this.container.offsetHeight - y;

        gsap.to(rocket, {
            bottom: targetY,
            duration: 0.5 + Math.random() * 0.3,
            ease: 'power2.out',
            onComplete: () => {
                rocket.remove();
                onExplode();
            }
        });
    }

    createExplosion(x, y, color, particleCount) {
        const sparkle = document.createElement('div');
        sparkle.className = 'firework-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
        `;

        this.container.appendChild(sparkle);

        gsap.to(sparkle, {
            scale: 3,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => sparkle.remove()
        });

        for (let i = 0; i < particleCount; i++) {
            this.createParticle(x, y, color, i, particleCount);
        }
    }

    createParticle(x, y, color, index, total) {
        const particle = document.createElement('div');
        const size = 3 + Math.random() * 3;
        
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 ${size * 2}px ${color};
            pointer-events: none;
        `;

        this.container.appendChild(particle);

        const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = 50 + Math.random() * 100;
        const duration = 0.8 + Math.random() * 0.5;

        gsap.to(particle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance + 50,
            opacity: 0,
            scale: 0,
            duration: duration,
            ease: 'power2.out',
            onComplete: () => particle.remove()
        });
    }

    createSparkleTrail(x, y, color) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                const size = 2 + Math.random() * 2;
                
                sparkle.style.cssText = `
                    position: absolute;
                    left: ${x + (Math.random() - 0.5) * 10}px;
                    top: ${y + (Math.random() - 0.5) * 10}px;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    border-radius: 50%;
                    box-shadow: 0 0 ${size}px ${color};
                `;

                this.container.appendChild(sparkle);

                gsap.to(sparkle, {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                    onComplete: () => sparkle.remove()
                });
            }, i * 50);
        }
    }
}

class FooterFireworks extends Fireworks {
    constructor(container) {
        super(container);
        this.loopInterval = null;
    }

    startLoop(intensity = 'medium') {
        if (this.isRunning) return;
        this.isRunning = true;

        const intervals = {
            low: 500,
            medium: 300,
            high: 150
        };

        this.loopInterval = setInterval(() => {
            this.createBurst();
        }, intervals[intensity] || intervals.medium);
    }

    stopLoop() {
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        this.isRunning = false;
    }

    triggerOnScroll() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        ScrollTrigger.create({
            trigger: footer,
            start: 'top 80%',
            end: 'bottom top',
            onEnter: () => {
                this.startLoop('high');
            },
            onLeave: () => {
                this.stopLoop();
            },
            onEnterBack: () => {
                this.startLoop('high');
            },
            onLeaveBack: () => {
                this.stopLoop();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const footerFireworksContainer = document.querySelector('.fireworks-finale');
    if (footerFireworksContainer) {
        const footerFireworks = new FooterFireworks(footerFireworksContainer);
        footerFireworks.triggerOnScroll();
    }
});

window.Fireworks = Fireworks;
