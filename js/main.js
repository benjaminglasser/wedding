/* ============================================
   MAIN JAVASCRIPT
   Vintage Vegas Wedding - Jac & Ben
   ============================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Animation frame management for performance
const animationState = {
    isPageVisible: true,
    animationFrameIds: [],
    intervalIds: []
};

// Cleanup function for animations
function cleanupAnimations() {
    animationState.animationFrameIds.forEach(id => cancelAnimationFrame(id));
    animationState.intervalIds.forEach(id => clearInterval(id));
    animationState.animationFrameIds = [];
    animationState.intervalIds = [];
}

document.addEventListener('DOMContentLoaded', () => {
    // #region agent log
    const rioImg = document.querySelector('.gifts .sign-bottom-right');
    const giftsSection = document.querySelector('.gifts');
    const footerDivider = document.querySelector('.vegas-divider.footer-divider');
    if (rioImg && giftsSection && footerDivider) {
        const rioStyle = window.getComputedStyle(rioImg);
        const giftsStyle = window.getComputedStyle(giftsSection);
        const dividerStyle = window.getComputedStyle(footerDivider);
        const rioRect = rioImg.getBoundingClientRect();
        const giftsRect = giftsSection.getBoundingClientRect();
        const dividerRect = footerDivider.getBoundingClientRect();
        fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c76e7e'},body:JSON.stringify({sessionId:'c76e7e',location:'main.js:23',message:'Rio clipping debug',data:{rioZIndex:rioStyle.zIndex,rioPosition:rioStyle.position,rioBottom:rioRect.bottom,giftsContain:giftsStyle.contain,giftsOverflow:giftsStyle.overflow,giftsBottom:giftsRect.bottom,dividerZIndex:dividerStyle.zIndex,dividerTop:dividerRect.top,dividerBg:dividerStyle.background,overlapAmount:rioRect.bottom-dividerRect.top},timestamp:Date.now(),hypothesisId:'H1-H4'})}).catch(()=>{});
    }
    // #endregion
    if (!prefersReducedMotion) {
        initMarqueeBulbs();
        initTinseltownBulbs();
        initLetterBoardBulbs();
        initCollageSigns();
        initTheaterMarquee();
        initFooterParallax();
    }
    initGSAP();
    initScrollAnimations();
    initCardsFan();
    initHeartAnimation();
    initSmoothScroll();
    initSlotMachine();
});

/* ============================================
   MARQUEE BULB GENERATION
   ============================================ */

function initMarqueeBulbs() {
    const marqueeBorders = document.querySelectorAll('.marquee-border');
    if (marqueeBorders.length === 0) return;

    marqueeBorders.forEach((marqueeBorder, borderIndex) => {
        const rows = marqueeBorder.querySelectorAll('.bulb-row');
        const parent = marqueeBorder.parentElement;
        const parentWidth = parent ? parent.offsetWidth : window.innerWidth;
        const parentHeight = parent ? parent.offsetHeight : window.innerHeight;
        
        rows.forEach((row, rowIndex) => {
            const isHorizontal = row.classList.contains('top') || row.classList.contains('bottom');
            const count = isHorizontal ? Math.floor(parentWidth / 25) : Math.floor(parentHeight / 25);
            
            // Use DocumentFragment for batch DOM insertion
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < count; i++) {
                const bulb = document.createElement('div');
                bulb.className = 'bulb';
                bulb.style.setProperty('--i', i);
                
                const delay = (i * 0.05) + (rowIndex * 0.5);
                bulb.style.animationDelay = `${delay}s`;
                
                fragment.appendChild(bulb);
            }
            row.appendChild(fragment);
        });
    });

    animateMarqueeBulbs();
}

function animateMarqueeBulbs() {
    const marqueeBorders = document.querySelectorAll('.marquee-border');
    
    marqueeBorders.forEach((border, borderIndex) => {
        const bulbs = Array.from(border.querySelectorAll('.bulb'));
        if (bulbs.length === 0) return;
        
        let index = borderIndex * 10;
        const chaseLength = 5;
        let lastTime = 0;
        const interval = 50;

        function animate(currentTime) {
            if (!animationState.isPageVisible) {
                const id = requestAnimationFrame(animate);
                animationState.animationFrameIds.push(id);
                return;
            }
            
            if (currentTime - lastTime >= interval) {
                lastTime = currentTime;
                
                // Batch class changes
                bulbs.forEach((bulb) => {
                    bulb.classList.remove('on', 'hot');
                });

                for (let i = 0; i < chaseLength; i++) {
                    const bulbIndex = (index + i) % bulbs.length;
                    if (i === Math.floor(chaseLength / 2)) {
                        bulbs[bulbIndex]?.classList.add('hot');
                    } else {
                        bulbs[bulbIndex]?.classList.add('on');
                    }
                }

                index = (index + 1) % bulbs.length;
            }
            
            const id = requestAnimationFrame(animate);
            animationState.animationFrameIds.push(id);
        }
        
        const id = requestAnimationFrame(animate);
        animationState.animationFrameIds.push(id);
    });
}

/* ============================================
   THEATER MARQUEE CHASE LIGHTS
   ============================================ */

function initTheaterMarquee() {
    const marqueeFrame = document.querySelector('.marquee-frame');
    if (!marqueeFrame) return;
    
    const sides = ['top', 'right', 'bottom', 'left'];
    const allBulbs = [];
    
    sides.forEach(side => {
        const container = document.getElementById(`chase-${side}`);
        if (!container) return;
        
        const isHorizontal = side === 'top' || side === 'bottom';
        const count = isHorizontal ? 18 : 8;
        
        // Use DocumentFragment for batch DOM insertion
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const bulb = document.createElement('div');
            bulb.className = 'bulb';
            fragment.appendChild(bulb);
            allBulbs.push(bulb);
        }
        container.appendChild(fragment);
    });
    
    // Chase animation using requestAnimationFrame
    let chaseIndex = 0;
    const chaseLength = 8;
    let lastTime = 0;
    const interval = 50;
    
    function animate(currentTime) {
        if (!animationState.isPageVisible) {
            const id = requestAnimationFrame(animate);
            animationState.animationFrameIds.push(id);
            return;
        }
        
        if (currentTime - lastTime >= interval) {
            lastTime = currentTime;
            
            allBulbs.forEach(bulb => bulb.classList.add('dim'));
            
            for (let i = 0; i < chaseLength; i++) {
                const bulbIndex = (chaseIndex + i) % allBulbs.length;
                allBulbs[bulbIndex].classList.remove('dim');
            }
            
            chaseIndex = (chaseIndex + 1) % allBulbs.length;
        }
        
        const id = requestAnimationFrame(animate);
        animationState.animationFrameIds.push(id);
    }
    
    const id = requestAnimationFrame(animate);
    animationState.animationFrameIds.push(id);
}

/* ============================================
   TINSELTOWN ARROW MARQUEE BULBS
   ============================================ */

function initTinseltownBulbs() {
    initSingleTinseltown('tinseltown-bulbs');
    initSingleTinseltown('footer-tinseltown-bulbs');
    initHeartBulbs();
}

function initHeartBulbs() {
    // Initialize both heart bulb containers
    initSingleHeartBulbs('heart-bulbs');
    initSingleHeartBulbs('main-heart-bulbs');
}

function initSingleHeartBulbs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const heartShape = container.closest('.heart-shape');
    if (!heartShape) return;
    
    const width = heartShape.offsetWidth;
    const height = heartShape.offsetHeight;
    const centerX = width / 2;
    const centerY = height * 0.44;
    const bulbs = [];
    
    // Check if point is inside the heart shape (excluding center cutout)
    function isInHeartRing(x, y) {
        const scale = width * 0.36;
        const nx = (x - centerX) / scale;
        const ny = (centerY - y) / scale;
        
        // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 < 0
        const val = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        const inHeart = val < 0;
        
        // Check if in center cutout (ellipse) - matches CSS ::after
        const cutoutCenterY = height * 0.48;
        const cutoutWidth = width * 0.24;
        const cutoutHeight = height * 0.21;
        const dx = (x - centerX) / cutoutWidth;
        const dy = (y - cutoutCenterY) / cutoutHeight;
        const inCutout = (dx * dx + dy * dy) < 1;
        
        return inHeart && !inCutout;
    }
    
    // Create grid of bulbs filling the heart ring
    const bulbSize = Math.max(16, width * 0.05);
    const spacing = bulbSize * 1.7;
    
    const rows = [];
    for (let y = height * 0.1; y < height * 0.92; y += spacing) {
        const rowBulbs = [];
        for (let x = width * 0.06; x < width * 0.94; x += spacing) {
            if (isInHeartRing(x, y)) {
                rowBulbs.push({ x, y });
            }
        }
        if (rowBulbs.length > 0) {
            rows.push(rowBulbs);
        }
    }
    
    // Create bulb elements using DocumentFragment
    const fragment = document.createDocumentFragment();
    rows.forEach((row, rowIndex) => {
        row.forEach((pos) => {
            const bulb = document.createElement('div');
            bulb.className = 'bulb';
            bulb.style.left = `${pos.x - bulbSize/2}px`;
            bulb.style.top = `${pos.y - bulbSize/2}px`;
            bulb.dataset.row = rowIndex;
            bulbs.push(bulb);
            fragment.appendChild(bulb);
        });
    });
    container.appendChild(fragment);
    
    // All bulbs lit with subtle twinkling - using requestAnimationFrame
    let lastTime = 0;
    const interval = 180;
    
    function animate(currentTime) {
        if (!animationState.isPageVisible) {
            const id = requestAnimationFrame(animate);
            animationState.animationFrameIds.push(id);
            return;
        }
        
        if (currentTime - lastTime >= interval) {
            lastTime = currentTime;
            
            const numToToggle = Math.floor(bulbs.length * 0.06);
            for (let i = 0; i < numToToggle; i++) {
                const randomBulb = bulbs[Math.floor(Math.random() * bulbs.length)];
                randomBulb.classList.add('dim');
                setTimeout(() => {
                    randomBulb.classList.remove('dim');
                }, 120 + Math.random() * 180);
            }
        }
        
        const id = requestAnimationFrame(animate);
        animationState.animationFrameIds.push(id);
    }
    
    const id = requestAnimationFrame(animate);
    animationState.animationFrameIds.push(id);
}

function initSingleTinseltown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sign = container.closest('.tinseltown-sign');
    if (!sign) return;
    
    const width = sign.offsetWidth;
    const height = sign.offsetHeight;
    const bulbSpacing = 18;
    const bulbSize = 12;
    const margin = 8; // Distance from the edge of the arrow shape
    
    const bulbs = [];
    const fragment = document.createDocumentFragment();
    
    // Clip-path polygon points: (0,0), (85%,0), (100%,50%), (85%,100%), (0,100%)
    // Place bulbs along these edges, inset by margin
    
    const p1 = { x: margin, y: margin }; // top-left (inset)
    const p2 = { x: width * 0.85 - margin, y: margin }; // top-right before arrow (inset)
    const p3 = { x: width - margin - bulbSize, y: height * 0.5 }; // arrow tip (inset)
    const p4 = { x: width * 0.85 - margin, y: height - margin - bulbSize }; // bottom-right before arrow (inset)
    const p5 = { x: margin, y: height - margin - bulbSize }; // bottom-left (inset)
    
    // Top edge: p1 to p2
    const topCount = Math.floor((p2.x - p1.x) / bulbSpacing);
    for (let i = 0; i <= topCount; i++) {
        const bulb = createBulb(p1.x + (i * bulbSpacing), p1.y);
        bulbs.push(bulb);
        fragment.appendChild(bulb);
    }
    
    // Upper diagonal: p2 to p3
    const upperDx = p3.x - p2.x;
    const upperDy = p3.y - p2.y;
    const upperLen = Math.sqrt(upperDx * upperDx + upperDy * upperDy);
    const upperDiagCount = Math.max(3, Math.floor(upperLen / bulbSpacing));
    
    for (let i = 1; i <= upperDiagCount; i++) {
        const t = i / (upperDiagCount + 1);
        const x = p2.x + t * upperDx;
        const y = p2.y + t * upperDy;
        const bulb = createBulb(x, y);
        bulbs.push(bulb);
        fragment.appendChild(bulb);
    }
    
    // Lower diagonal: p3 to p4
    const lowerDx = p4.x - p3.x;
    const lowerDy = p4.y - p3.y;
    const lowerLen = Math.sqrt(lowerDx * lowerDx + lowerDy * lowerDy);
    const lowerDiagCount = Math.max(3, Math.floor(lowerLen / bulbSpacing));
    
    for (let i = 1; i <= lowerDiagCount; i++) {
        const t = i / (lowerDiagCount + 1);
        const x = p3.x + t * lowerDx;
        const y = p3.y + t * lowerDy;
        const bulb = createBulb(x, y);
        bulbs.push(bulb);
        fragment.appendChild(bulb);
    }
    
    // Bottom edge: p4 to p5 (right to left)
    const bottomCount = Math.floor((p4.x - p5.x) / bulbSpacing);
    for (let i = 0; i <= bottomCount; i++) {
        const bulb = createBulb(p4.x - (i * bulbSpacing), p4.y);
        bulbs.push(bulb);
        fragment.appendChild(bulb);
    }
    
    // Left edge: p5 to p1 (bottom to top)
    const leftCount = Math.floor((p5.y - p1.y) / bulbSpacing) - 1;
    for (let i = 1; i <= leftCount; i++) {
        const bulb = createBulb(p5.x, p5.y - (i * bulbSpacing));
        bulbs.push(bulb);
        fragment.appendChild(bulb);
    }
    
    container.appendChild(fragment);
    animateTinseltownBulbs(bulbs);
}

function createBulb(x, y) {
    const bulb = document.createElement('div');
    bulb.className = 'bulb';
    bulb.style.left = `${x}px`;
    bulb.style.top = `${y}px`;
    return bulb;
}

function animateTinseltownBulbs(bulbs) {
    let index = 0;
    const chaseLength = 8;
    let lastTime = 0;
    const interval = 60;
    
    function animate(currentTime) {
        if (!animationState.isPageVisible) {
            const id = requestAnimationFrame(animate);
            animationState.animationFrameIds.push(id);
            return;
        }
        
        if (currentTime - lastTime >= interval) {
            lastTime = currentTime;
            
            bulbs.forEach(bulb => {
                bulb.classList.remove('lit');
            });
            
            for (let i = 0; i < chaseLength; i++) {
                const bulbIndex = (index + i) % bulbs.length;
                bulbs[bulbIndex]?.classList.add('lit');
            }
            
            index = (index + 1) % bulbs.length;
        }
        
        const id = requestAnimationFrame(animate);
        animationState.animationFrameIds.push(id);
    }
    
    const id = requestAnimationFrame(animate);
    animationState.animationFrameIds.push(id);
}

/* ============================================
   LETTER BOARD BULBS
   ============================================ */

function initLetterBoardBulbs() {
    const topRow = document.getElementById('letterboard-bulbs-top');
    const bottomRow = document.getElementById('letterboard-bulbs-bottom');
    
    if (!topRow || !bottomRow) return;
    
    const sign = topRow.closest('.letter-board-sign');
    if (!sign) return;
    
    const width = sign.offsetWidth;
    const bulbCount = Math.floor(width / 25);
    
    const topBulbs = [];
    const bottomBulbs = [];
    
    // Use DocumentFragment for batch DOM insertion
    const topFragment = document.createDocumentFragment();
    const bottomFragment = document.createDocumentFragment();
    
    for (let i = 0; i < bulbCount; i++) {
        const bulb1 = document.createElement('div');
        bulb1.className = 'bulb';
        topFragment.appendChild(bulb1);
        topBulbs.push(bulb1);
        
        const bulb2 = document.createElement('div');
        bulb2.className = 'bulb';
        bottomFragment.appendChild(bulb2);
        bottomBulbs.push(bulb2);
    }
    
    topRow.appendChild(topFragment);
    bottomRow.appendChild(bottomFragment);
    
    animateLetterBoardBulbs(topBulbs, bottomBulbs);
}

function animateLetterBoardBulbs(topBulbs, bottomBulbs) {
    let on = true;
    let lastTime = 0;
    const interval = 500;
    
    function animate(currentTime) {
        if (!animationState.isPageVisible) {
            const id = requestAnimationFrame(animate);
            animationState.animationFrameIds.push(id);
            return;
        }
        
        if (currentTime - lastTime >= interval) {
            lastTime = currentTime;
            on = !on;
            
            topBulbs.forEach((bulb, i) => {
                if ((i % 2 === 0) === on) {
                    bulb.classList.add('lit');
                } else {
                    bulb.classList.remove('lit');
                }
            });
            
            bottomBulbs.forEach((bulb, i) => {
                if ((i % 2 === 0) !== on) {
                    bulb.classList.add('lit');
                } else {
                    bulb.classList.remove('lit');
                }
            });
        }
        
        const id = requestAnimationFrame(animate);
        animationState.animationFrameIds.push(id);
    }
    
    const id = requestAnimationFrame(animate);
    animationState.animationFrameIds.push(id);
}

/* ============================================
   COLLAGE SIGNS PARALLAX
   ============================================ */

function initCollageSigns() {
    const collageSigns = document.querySelectorAll('.collage-sign');
    const floatingSigns = document.querySelectorAll('.floating-sign');
    
    if (collageSigns.length === 0) return;
    
    gsap.utils.toArray(collageSigns).forEach((sign, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        const speed = 0.3 + (Math.random() * 0.4);
        
        gsap.to(sign, {
            y: () => direction * 50 * speed,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    });
    
    gsap.utils.toArray(floatingSigns).forEach((sign, i) => {
        const delay = i * 0.3;
        gsap.to(sign, {
            y: -20,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: delay
        });
    });
}

/* ============================================
   GSAP INITIALIZATION
   ============================================ */

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero content fades in immediately to frame the marquee
    gsap.set('.hero-content', { opacity: 0 });
    gsap.set('.tinseltown-sign', { opacity: 0, scale: 0.8, rotation: -5 });
    gsap.set('.letter-board-sign', { opacity: 0, y: 30 });
    gsap.set('.collage-sign', { opacity: 0, scale: 0.5 });
    gsap.set('.floating-sign', { opacity: 0 });
    gsap.set('.chip-decoration', { opacity: 0, scale: 0 });

    // Hero content fades in quickly to reveal the marquee bounce
    gsap.to('.hero-content', { 
        opacity: 1, 
        duration: 0.4, 
        delay: 0.1,
        ease: 'power2.out' 
    });

    // Other hero elements animate in after marquee bounce and bg images (delay ~2.5s total)
    const heroTl = gsap.timeline({ delay: 2.5 });
    
    heroTl
        .to('.tinseltown-sign', { 
            opacity: 1, 
            scale: 1, 
            rotation: 0,
            duration: 1.2, 
            ease: 'elastic.out(1, 0.6)' 
        })
        .to('.letter-board-sign', { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            ease: 'back.out(1.7)',
            stagger: 0.2
        }, '-=0.6')
        .to('.collage-sign', { 
            opacity: 0.85, 
            scale: 1, 
            duration: 0.8, 
            ease: 'back.out(1.5)',
            stagger: { each: 0.1, from: 'random' }
        }, '-=0.8')
        .to('.floating-sign', { 
            opacity: 1, 
            duration: 0.5, 
            stagger: 0.05 
        }, '-=0.5')
        .to('.chip-decoration', { 
            opacity: 1, 
            scale: 1, 
            duration: 0.4, 
            ease: 'back.out(2)',
            stagger: 0.1
        }, '-=0.3');

    gsap.to('.starburst', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
    });

    gsap.to('.floating-hearts .heart', {
        y: -30,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.5
    });
    
    gsap.to('.dice-decoration', {
        rotation: 15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */

function initScrollAnimations() {
    // Animate section sign cutouts when they come into view
    gsap.utils.toArray('.section-sign-cutout').forEach(sign => {
        ScrollTrigger.create({
            trigger: sign.closest('section'),
            start: 'top 70%',
            onEnter: () => sign.classList.add('animate-in'),
            onLeaveBack: () => sign.classList.remove('animate-in')
        });
    });

    gsap.utils.toArray('.event-panel').forEach((panel, i) => {
        gsap.from(panel, {
            scrollTrigger: {
                trigger: panel,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: i * 0.2,
            ease: 'power2.out'
        });

        gsap.from(panel.querySelector('.event-name'), {
            scrollTrigger: {
                trigger: panel,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
            delay: i * 0.2 + 0.3,
            ease: 'back.out(1.7)'
        });
    });

    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    gsap.utils.toArray('.section-copy').forEach(copy => {
        gsap.from(copy, {
            scrollTrigger: {
                trigger: copy,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out'
        });
    });

    gsap.utils.toArray('.cta-button').forEach(button => {
        gsap.from(button, {
            scrollTrigger: {
                trigger: button,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.9,
            duration: 0.5,
            ease: 'back.out(1.7)'
        });
    });

    const rsvpSign = document.querySelector('.rsvp-sign');
    if (rsvpSign) {
        gsap.from(rsvpSign, {
            scrollTrigger: {
                trigger: rsvpSign,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.8,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)'
        });
    }

    const hotelSign = document.querySelector('.hotel-sign');
    if (hotelSign) {
        gsap.from(hotelSign, {
            scrollTrigger: {
                trigger: hotelSign,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: -30,
            duration: 0.8,
            ease: 'bounce.out'
        });
    }

    const slotMachine = document.querySelector('.slot-machine');
    if (slotMachine) {
        gsap.from('.lucky-seven', {
            scrollTrigger: {
                trigger: slotMachine,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: -50,
            opacity: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: 'bounce.out'
        });
    }

    gsap.from('.neon-icons .neon-icon', {
        scrollTrigger: {
            trigger: '.neon-icons',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        scale: 0,
        rotation: -180,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    });

    const telegramFrame = document.querySelector('.telegram-frame');
    if (telegramFrame) {
        gsap.from(telegramFrame, {
            scrollTrigger: {
                trigger: telegramFrame,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            ease: 'power2.out'
        });
    }

    const footerSign = document.querySelector('.footer-sign');
    if (footerSign) {
        gsap.from(footerSign, {
            scrollTrigger: {
                trigger: footerSign,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.8,
            duration: 1,
            ease: 'elastic.out(1, 0.5)'
        });
    }

    gsap.from('.end-card', {
        scrollTrigger: {
            trigger: '.the-end',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out'
    });
}

/* ============================================
   CARDS FAN ANIMATION
   ============================================ */

function initCardsFan() {
    const cardsFan = document.querySelector('.cards-fan');
    if (!cardsFan) return;

    ScrollTrigger.create({
        trigger: cardsFan,
        start: 'top 80%',
        onEnter: () => cardsFan.classList.add('spread'),
        onLeaveBack: () => cardsFan.classList.remove('spread')
    });
}

/* ============================================
   HEART ANIMATION
   ============================================ */

function initHeartAnimation() {
    const heartSection = document.querySelector('.heart-section');
    if (!heartSection) return;
    
    const heartMarquee = heartSection.querySelector('.heart-marquee-sign');

    ScrollTrigger.create({
        trigger: heartSection,
        start: 'top 60%',
        onEnter: () => {
            if (heartMarquee) {
                heartMarquee.classList.add('active');
            }
            
            setTimeout(() => {
                createFireworks(heartSection.querySelector('.fireworks-container'));
            }, 500);
        },
        onLeaveBack: () => {
            if (heartMarquee) {
                heartMarquee.classList.remove('active');
            }
        }
    });
}

/* ============================================
   FIREWORKS EFFECT
   ============================================ */

function createFireworks(container) {
    if (!container) return;
    
    const colors = ['#ff2d7b', '#ffcc00', '#ff3333', '#00e5cc', '#ff6b35'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createFireworkBurst(container, colors);
        }, i * 300);
    }
}

function createFireworkBurst(container, colors) {
    const x = Math.random() * container.offsetWidth;
    const y = Math.random() * (container.offsetHeight * 0.6);
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
        
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
}

/* ============================================
   SCROLL INDICATOR HIDE
   ============================================ */

let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                if (window.scrollY > 100) {
                    scrollIndicator.style.opacity = '0';
                } else {
                    scrollIndicator.style.opacity = '0.7';
                }
            }
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

/* ============================================
   RESIZE HANDLER
   ============================================ */

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (prefersReducedMotion) return;
        
        // Cleanup existing animations before reinitializing
        cleanupAnimations();
        
        const marqueeBorders = document.querySelectorAll('.marquee-border');
        marqueeBorders.forEach(marqueeBorder => {
            marqueeBorder.querySelectorAll('.bulb-row').forEach(row => {
                row.innerHTML = '';
            });
        });
        if (marqueeBorders.length > 0) {
            initMarqueeBulbs();
        }
    }, 250);
}, { passive: true });

/* ============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================ */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ============================================
   PERFORMANCE: PAUSE ANIMATIONS WHEN NOT VISIBLE
   ============================================ */

document.addEventListener('visibilitychange', () => {
    animationState.isPageVisible = !document.hidden;
    
    const bannerTracks = document.querySelectorAll('.banner-track');
    
    if (document.hidden) {
        bannerTracks.forEach(track => {
            track.style.animationPlayState = 'paused';
        });
    } else {
        bannerTracks.forEach(track => {
            track.style.animationPlayState = 'running';
        });
    }
});

/* ============================================
   LAZY LOAD SECTIONS (Intersection Observer)
   ============================================ */

const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
});

/* ============================================
   BACKGROUND COLLAGE PARALLAX
   ============================================ */

function initBgCollageParallax() {
    const cutouts = document.querySelectorAll('.bg-cutout[data-parallax]');
    if (cutouts.length === 0 || prefersReducedMotion) return;
    
    let ticking = false;
    
    function updateParallax() {
        const scrollY = window.scrollY;
        
        cutouts.forEach(cutout => {
            const speed = parseFloat(cutout.dataset.parallax) || 0.02;
            const yOffset = scrollY * speed * 100;
            const currentTransform = cutout.style.transform || '';
            const baseRotation = currentTransform.match(/rotate\([^)]+\)/)?.[0] || '';
            
            cutout.style.transform = `translateY(${yOffset}px) ${baseRotation}`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

if (!prefersReducedMotion) {
    initBgCollageParallax();
}

/* ============================================
   FOOTER JAC BEN PARALLAX
   ============================================ */

function initFooterParallax() {
    const footerSection = document.querySelector('.footer-jacben-section');
    const cutoutPhoto = document.querySelector('.footer-cutout-photo');
    const cutoutWrapper = document.querySelector('.footer-cutout-wrapper');
    
    if (!footerSection || !cutoutPhoto) return;
    
    // #region agent log
    const sectionStyles = getComputedStyle(footerSection);
    const wrapperStyles = cutoutWrapper ? getComputedStyle(cutoutWrapper) : null;
    const photoStyles = getComputedStyle(cutoutPhoto);
    fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c77be2'},body:JSON.stringify({sessionId:'c77be2',location:'main.js:initFooterParallax',message:'Footer parallax init - element dimensions',data:{
        sectionHeight: footerSection.offsetHeight,
        sectionMinHeight: sectionStyles.minHeight,
        sectionOverflow: sectionStyles.overflow,
        wrapperBottom: wrapperStyles?.bottom,
        wrapperHeight: cutoutWrapper?.offsetHeight,
        photoHeight: cutoutPhoto.offsetHeight,
        photoNaturalHeight: cutoutPhoto.naturalHeight,
        photoTransform: photoStyles.transform
    },timestamp:Date.now(),hypothesisId:'H1,H2,H3,H4'})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    setTimeout(() => {
        const rect = cutoutPhoto.getBoundingClientRect();
        const sectionRect = footerSection.getBoundingClientRect();
        fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c77be2'},body:JSON.stringify({sessionId:'c77be2',location:'main.js:initFooterParallax:afterGSAP',message:'After GSAP setup - bounding rects',data:{
            photoTop: rect.top,
            photoBottom: rect.bottom,
            photoHeight: rect.height,
            sectionTop: sectionRect.top,
            sectionBottom: sectionRect.bottom,
            sectionHeight: sectionRect.height,
            viewportHeight: window.innerHeight,
            gapFromViewportBottom: window.innerHeight - rect.bottom,
            photoExtendsBelow: rect.bottom > sectionRect.bottom
        },timestamp:Date.now(),hypothesisId:'H1,H3,H5'})}).catch(()=>{});
    }, 500);
    // #endregion
}

/* ============================================
   INTERACTIVE SLOT MACHINE GAME
   ============================================ */

function initSlotMachine() {
    const lever = document.getElementById('slot-lever');
    const resultDisplay = document.getElementById('slot-result');
    const reels = [
        document.getElementById('reel-1'),
        document.getElementById('reel-2'),
        document.getElementById('reel-3')
    ];
    
    if (!lever || !resultDisplay || reels.some(r => !r)) return;
    
    const symbols = ['J♠', '🍒', '💎', '♥', '🔔', 'J♥'];
    const jackSymbols = ['J♠', 'J♥', 'J♦', 'J♣'];
    const symbolHeight = reels[0].offsetHeight;
    let isSpinning = false;
    
    function isJack(symbol) {
        return jackSymbols.includes(symbol) || symbol.startsWith('J');
    }
    
    function spinReels() {
        if (isSpinning) return;
        isSpinning = true;
        
        lever.classList.add('pulled', 'spinning');
        resultDisplay.textContent = '';
        resultDisplay.className = 'slot-result';
        
        reels.forEach(reel => reel.classList.add('spinning'));
        
        setTimeout(() => {
            lever.classList.remove('pulled');
        }, 150);
        
        const results = [];
        const stopTimes = [1000, 1500, 2000];
        
        reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning');
                
                const strip = reel.querySelector('.reel-strip');
                const symbolElements = strip.querySelectorAll('.reel-symbol');
                const randomIndex = Math.floor(Math.random() * 6);
                const result = symbolElements[randomIndex].textContent.trim();
                results.push(result);
                
                const offset = -randomIndex * symbolHeight;
                strip.style.transform = `translateY(${offset}px)`;
                
                if (index === 2) {
                    checkWin(results);
                    isSpinning = false;
                    lever.classList.remove('spinning');
                }
            }, stopTimes[index]);
        });
    }
    
    function checkWin(results) {
        const [r1, r2, r3] = results;
        const allJacks = isJack(r1) && isJack(r2) && isJack(r3);
        const jackCount = [r1, r2, r3].filter(isJack).length;
        
        if (allJacks) {
            resultDisplay.textContent = '🎉 JAC-POT! Three Jacs! 🎉';
            resultDisplay.className = 'slot-result jackpot';
            createSlotFireworks();
        } else if (r1 === r2 && r2 === r3) {
            resultDisplay.textContent = '🎊 WINNER! 🎊';
            resultDisplay.className = 'slot-result winner';
        } else if (jackCount === 2) {
            resultDisplay.textContent = '🃏 Two Jacs! So close!';
            resultDisplay.className = 'slot-result winner';
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            resultDisplay.textContent = 'Two of a kind!';
            resultDisplay.className = 'slot-result';
        } else {
            resultDisplay.textContent = 'Try again!';
            resultDisplay.className = 'slot-result';
        }
    }
    
    function createSlotFireworks() {
        const slotMachine = document.getElementById('slot-machine');
        if (!slotMachine) return;
        
        const colors = ['#ffcc00', '#ff2d7b', '#ff3333', '#00e5cc'];
        
        for (let burst = 0; burst < 3; burst++) {
            setTimeout(() => {
                for (let i = 0; i < 15; i++) {
                    const particle = document.createElement('div');
                    particle.style.cssText = `
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        background: ${colors[Math.floor(Math.random() * colors.length)]};
                        border-radius: 50%;
                        pointer-events: none;
                        z-index: 100;
                        left: 50%;
                        top: 50%;
                    `;
                    
                    slotMachine.appendChild(particle);
                    
                    const angle = (i / 15) * Math.PI * 2;
                    const distance = 80 + Math.random() * 60;
                    const tx = Math.cos(angle) * distance;
                    const ty = Math.sin(angle) * distance;
                    
                    gsap.to(particle, {
                        x: tx,
                        y: ty,
                        opacity: 0,
                        scale: 0,
                        duration: 1,
                        ease: 'power2.out',
                        onComplete: () => particle.remove()
                    });
                }
            }, burst * 200);
        }
    }
    
    lever.addEventListener('click', spinReels);
    lever.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            spinReels();
        }
    });
    
    reels.forEach(reel => {
        const strip = reel.querySelector('.reel-strip');
        strip.style.transform = 'translateY(0)';
    });
}
