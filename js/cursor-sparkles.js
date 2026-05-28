/* ============================================
   CURSOR SPARKLES
   Vintage Vegas Wedding - Jac & Ben
   Little Vegasy sparkles trail the cursor on
   move, and burst out on click.
   ============================================ */

(function () {
    'use strict';

    // Bail only on reduced motion — touch users get tap bursts and finger-drag trails.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const COLORS = [
        '#ffcc00', // gold
        '#ff2d7b', // neon pink
        '#00e5cc', // turquoise
        '#ff6b35', // orange
        '#ffffff'  // white
    ];

    // 4-pointed sparkle star, clipped from a div for a crisp "twinkle".
    const STAR_CLIP = 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)';

    class CursorSparkles {
        constructor() {
            this.container = document.createElement('div');
            this.container.className = 'cursor-sparkles-container';
            this.container.setAttribute('aria-hidden', 'true');
            this.container.style.cssText = [
                'position:fixed',
                'top:0',
                'left:0',
                'width:100%',
                'height:100%',
                'pointer-events:none',
                'z-index:9999',
                'overflow:hidden',
                'contain:strict'
            ].join(';');
            document.body.appendChild(this.container);

            this.lastSpawnTime = 0;
            this.lastX = 0;
            this.lastY = 0;
            this.hasMoved = false;
            // Cap active sparkles so a frantic mouse doesn't tank perf.
            this.active = 0;
            this.maxActive = 160;

            this.onPointerMove = this.onPointerMove.bind(this);
            this.onPointerDown = this.onPointerDown.bind(this);

            // Pointer Events cover mouse, touch, and pen with one API.
            // - pointermove: trail (mouse hover + finger drag)
            // - pointerdown: burst (mouse click + tap)
            if (window.PointerEvent) {
                window.addEventListener('pointermove', this.onPointerMove, { passive: true });
                window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
            } else {
                // Legacy fallback for browsers without Pointer Events.
                window.addEventListener('mousemove', this.onPointerMove, { passive: true });
                window.addEventListener('click', this.onPointerDown, { passive: true });
                window.addEventListener(
                    'touchstart',
                    (e) => {
                        const t = e.touches && e.touches[0];
                        if (t) this.onPointerDown({ clientX: t.clientX, clientY: t.clientY });
                    },
                    { passive: true }
                );
            }
        }

        randColor() {
            return COLORS[(Math.random() * COLORS.length) | 0];
        }

        onPointerMove(e) {
            const now = performance.now();
            // Throttle trail spawns to keep this cheap.
            if (now - this.lastSpawnTime < 40) return;

            if (this.hasMoved) {
                const dx = e.clientX - this.lastX;
                const dy = e.clientY - this.lastY;
                if (dx * dx + dy * dy < 25) return; // require ~5px movement
            }

            this.lastSpawnTime = now;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.hasMoved = true;

            // 1-2 little sparkles per trail tick.
            const count = 1 + ((Math.random() * 2) | 0);
            for (let i = 0; i < count; i++) {
                const jitterX = (Math.random() - 0.5) * 18;
                const jitterY = (Math.random() - 0.5) * 18;
                this.spawnSparkle(e.clientX + jitterX, e.clientY + jitterY, {
                    size: 3 + Math.random() * 6,
                    duration: 1.1 + Math.random() * 0.9,
                    driftX: (Math.random() - 0.5) * 40,
                    driftY: 20 + Math.random() * 40, // gentle gravity
                    rotate: (Math.random() - 0.5) * 320,
                    star: Math.random() < 0.7
                });
            }
        }

        onPointerDown(e) {
            // Outward burst of sparkly particles
            const total = 22;
            for (let i = 0; i < total; i++) {
                const angle = (i / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
                const distance = 55 + Math.random() * 75;
                const size = 4 + Math.random() * 6;
                this.spawnSparkle(e.clientX, e.clientY, {
                    size: size,
                    duration: 0.7 + Math.random() * 0.5,
                    driftX: Math.cos(angle) * distance,
                    driftY: Math.sin(angle) * distance,
                    rotate: (Math.random() - 0.5) * 540,
                    star: Math.random() < 0.65,
                    burst: true
                });
            }

            // A few slower "embers" that linger and fall
            for (let i = 0; i < 6; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 20 + Math.random() * 40;
                this.spawnSparkle(e.clientX, e.clientY, {
                    size: 3 + Math.random() * 3,
                    duration: 1.0 + Math.random() * 0.6,
                    driftX: Math.cos(angle) * distance + (Math.random() - 0.5) * 20,
                    driftY: Math.sin(angle) * distance + 40 + Math.random() * 30,
                    rotate: (Math.random() - 0.5) * 360,
                    star: true
                });
            }
        }

        spawnSparkle(x, y, opts) {
            if (this.active >= this.maxActive) return;

            const el = document.createElement('div');
            const color = this.randColor();
            const size = opts.size;
            const isStar = !!opts.star;

            // Use box-shadow for the neon glow, clip-path for the star shape.
            const glow = Math.max(4, size * 1.6);
            const cssParts = [
                'position:absolute',
                'left:' + x + 'px',
                'top:' + y + 'px',
                'width:' + size + 'px',
                'height:' + size + 'px',
                'margin-left:' + (-size / 2) + 'px',
                'margin-top:' + (-size / 2) + 'px',
                'background:' + color,
                'box-shadow:0 0 ' + glow + 'px ' + color + ',0 0 ' + (glow * 2) + 'px ' + color,
                'pointer-events:none',
                'will-change:transform,opacity'
            ];
            if (isStar) {
                cssParts.push('clip-path:' + STAR_CLIP);
                cssParts.push('-webkit-clip-path:' + STAR_CLIP);
            } else {
                cssParts.push('border-radius:50%');
            }
            el.style.cssText = cssParts.join(';');

            this.container.appendChild(el);
            this.active++;

            const finish = () => {
                el.remove();
                this.active--;
            };

            if (window.gsap) {
                window.gsap.fromTo(
                    el,
                    { scale: opts.burst ? 0.4 : 0.6, opacity: 1, rotation: 0 },
                    {
                        x: opts.driftX,
                        y: opts.driftY,
                        rotation: opts.rotate,
                        scale: 0.1,
                        opacity: 0,
                        duration: opts.duration,
                        ease: 'power2.out',
                        onComplete: finish
                    }
                );
            } else {
                // Fallback without GSAP: WAAPI animation.
                const anim = el.animate(
                    [
                        { transform: 'translate(0,0) rotate(0deg) scale(' + (opts.burst ? 0.4 : 0.6) + ')', opacity: 1 },
                        {
                            transform:
                                'translate(' + opts.driftX + 'px,' + opts.driftY + 'px) rotate(' + opts.rotate + 'deg) scale(0.1)',
                            opacity: 0
                        }
                    ],
                    { duration: opts.duration * 1000, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
                );
                anim.onfinish = finish;
            }
        }

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new CursorSparkles());
    } else {
        new CursorSparkles();
    }
})();
