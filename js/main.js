/* ============================================
   MAIN JAVASCRIPT
   Vintage Vegas Wedding - Jac & Ben
   PERFORMANCE OPTIMIZED
   ============================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let isMobile = window.innerWidth < 768;

// Section visibility observer - pauses animations when off-screen
const SectionObserver = {
    observers: new Map(),
    visibleSections: new Set(),
    
    observe(element, sectionId, onVisible, onHidden) {
        if (!element) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.visibleSections.add(sectionId);
                    onVisible?.();
                } else {
                    this.visibleSections.delete(sectionId);
                    onHidden?.();
                }
            });
        }, { rootMargin: '50px', threshold: 0.01 });
        
        observer.observe(element);
        this.observers.set(sectionId, observer);
    },
    
    isVisible(sectionId) {
        return this.visibleSections.has(sectionId);
    },
    
    disconnect(sectionId) {
        const observer = this.observers.get(sectionId);
        if (observer) {
            observer.disconnect();
            this.observers.delete(sectionId);
            this.visibleSections.delete(sectionId);
        }
    }
};

// Unified animation manager - single RAF loop for all animations
const AnimationManager = {
    isPageVisible: true,
    callbacks: new Map(),
    rafId: null,
    
    register(id, callback, interval = 0, sectionId = null) {
        this.callbacks.set(id, { callback, interval, lastRun: 0, sectionId });
        if (!this.rafId) this.start();
    },
    
    unregister(id) {
        this.callbacks.delete(id);
        if (this.callbacks.size === 0) this.stop();
    },
    
    start() {
        if (this.rafId) return;
        const tick = (currentTime) => {
            this.rafId = requestAnimationFrame(tick);
            if (!this.isPageVisible) return;
            
            this.callbacks.forEach((config, id) => {
                // Skip if section is off-screen
                if (config.sectionId && !SectionObserver.isVisible(config.sectionId)) return;
                
                if (config.interval === 0 || currentTime - config.lastRun >= config.interval) {
                    config.callback(currentTime);
                    config.lastRun = currentTime;
                }
            });
        };
        this.rafId = requestAnimationFrame(tick);
    },
    
    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    },
    
    pause() {
        this.isPageVisible = false;
    },
    
    resume() {
        this.isPageVisible = true;
    }
};

// Legacy cleanup function
function cleanupAnimations() {
    AnimationManager.callbacks.clear();
}

/* ============================================
   LOADER CONTROL
   ============================================ */

function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) {
        window.startMarqueeAnimation?.();
        return;
    }
    
    // Prevent scrolling while loader is active
    document.body.classList.add('loader-active');
    
    const criticalImages = [
        'assets/background_pngs/las-vegas-night-time-neon-lights-casinos-df06d34b7adeabffd877b27a490cc01e_3.png',
        'assets/background_pngs/Stardust_sign_015.png',
        'assets/background_pngs/las-vegas-night-time-neon-lights-casinos-df06d34b7adeabffd877b27a490cc01e.png',
        'assets/background_pngs/flamingoturns75-nvyesterdays-jakobowens.png',
        'assets/background_pngs/photo-1645180804518-5dc3e353e647.png'
    ];
    
    const imagePromises = criticalImages.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
        });
    });
    
    const libraryCheck = new Promise((resolve) => {
        const checkLibraries = () => {
            if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
                resolve();
            } else {
                setTimeout(checkLibraries, 50);
            }
        };
        checkLibraries();
    });
    
    const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500));
    
    Promise.all([...imagePromises, libraryCheck, minDisplayTime])
        .then(() => {
            // #region agent log
            fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'main.js:initLoader',message:'Loader promises resolved, calling hideLoader',data:{criticalImagesCount:criticalImages.length},timestamp:Date.now(),hypothesisId:'H1-H3'})}).catch(()=>{});
            // #endregion
            hideLoader();
        })
        .catch(() => {
            hideLoader();
        });
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    loader.classList.add('exiting');
    
    setTimeout(() => {
        loader.classList.add('hidden');
        
        // Re-enable scrolling
        document.body.classList.remove('loader-active');
        
        // #region agent log
        const bgCutouts = document.querySelectorAll('.bg-cutout');
        const imageLoadStates = Array.from(bgCutouts).map(img => ({
            class: img.className,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            loading: img.loading,
            src: img.src.split('/').pop()
        }));
        fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'main.js:hideLoader',message:'Before startMarqueeAnimation - checking bg-cutout image states',data:{imageCount:bgCutouts.length,imageLoadStates},timestamp:Date.now(),hypothesisId:'H1-H3'})}).catch(()=>{});
        // #endregion
        
        // Try to call startMarqueeAnimation, with retry if not yet defined
        const tryStartMarquee = (attempts = 0) => {
            if (typeof window.startMarqueeAnimation === 'function') {
                window.startMarqueeAnimation();
            } else if (attempts < 10) {
                setTimeout(() => tryStartMarquee(attempts + 1), 100);
            } else {
                // Fallback: manually trigger the animations
                const container = document.getElementById('marquee-3d');
                const hero = document.getElementById('hero');
                if (container) container.classList.add('bounce-in');
                setTimeout(() => {
                    if (hero) hero.classList.add('marquee-ready');
                    // Show scroll indicator after background images animate in (fallback path)
                    setTimeout(() => {
                        const scrollIndicator = document.querySelector('.scroll-indicator');
                        if (scrollIndicator) {
                            scrollIndicator.classList.add('visible');
                        }
                    }, 1800);
                }, 850);
            }
        };
        tryStartMarquee();
        
        setTimeout(() => {
            loader.remove();
        }, 500);
    }, 800);
}

initLoader();

document.addEventListener('DOMContentLoaded', () => {
    // #region agent log
    const bgCutouts = document.querySelectorAll('.bg-cutout');
    bgCutouts.forEach((img, index) => {
        img.addEventListener('load', () => {
            fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'main.js:DOMContentLoaded',message:'bg-cutout image loaded',data:{index,class:img.className,src:img.src.split('/').pop(),naturalWidth:img.naturalWidth,heroHasMarqueeReady:document.getElementById('hero')?.classList.contains('marquee-ready')},timestamp:Date.now(),hypothesisId:'H1-H3'})}).catch(()=>{});
        });
    });
    fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'main.js:DOMContentLoaded',message:'DOMContentLoaded fired',data:{bgCutoutCount:bgCutouts.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    if (!prefersReducedMotion) {
        initMarqueeBulbs();
        initTinseltownBulbs();
        initLetterBoardBulbs();
        if (!isMobile) {
            initCollageSigns();
            initTheaterMarquee();
        }
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
        
        // Observe parent section for visibility
        const section = marqueeBorder.closest('section') || parent;
        if (section) {
            SectionObserver.observe(section, `marquee-section-${borderIndex}`, null, null);
        }
        
        rows.forEach((row, rowIndex) => {
            const isHorizontal = row.classList.contains('top') || row.classList.contains('bottom');
            const count = isHorizontal ? Math.floor(parentWidth / 25) : Math.floor(parentHeight / 25);
            
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
        // Collect bulbs in clockwise order: top (L→R), right (T→B), bottom (R→L), left (B→T)
        const topBulbs = Array.from(border.querySelector('.bulb-row.top')?.querySelectorAll('.bulb') || []);
        const rightBulbs = Array.from(border.querySelector('.bulb-row.right')?.querySelectorAll('.bulb') || []);
        const bottomBulbs = Array.from(border.querySelector('.bulb-row.bottom')?.querySelectorAll('.bulb') || []).reverse();
        const leftBulbs = Array.from(border.querySelector('.bulb-row.left')?.querySelectorAll('.bulb') || []).reverse();
        
        const bulbs = [...topBulbs, ...rightBulbs, ...bottomBulbs, ...leftBulbs];
        if (bulbs.length === 0) return;
        
        let index = borderIndex * 10;
        const chaseLength = isMobile ? 4 : 5;
        const interval = isMobile ? 70 : 50;
        
        // Track previous lit bulbs to minimize DOM changes
        let prevLit = new Set();

        AnimationManager.register(`marquee-${borderIndex}`, () => {
            const newLit = new Set();
            const hotIndex = (index + Math.floor(chaseLength / 2)) % bulbs.length;
            
            for (let i = 0; i < chaseLength; i++) {
                newLit.add((index + i) % bulbs.length);
            }
            
            prevLit.forEach(i => {
                if (!newLit.has(i)) {
                    bulbs[i]?.classList.remove('on', 'hot');
                }
            });
            
            newLit.forEach(i => {
                if (!prevLit.has(i)) {
                    if (i === hotIndex) {
                        bulbs[i]?.classList.add('hot');
                    } else {
                        bulbs[i]?.classList.add('on');
                    }
                }
            });
            
            prevLit = newLit;
            index = (index + 1) % bulbs.length;
        }, interval, `marquee-section-${borderIndex}`);
    });
}

/* ============================================
   THEATER MARQUEE CHASE LIGHTS
   ============================================ */

function initTheaterMarquee() {
    const marqueeFrame = document.querySelector('.marquee-frame');
    if (!marqueeFrame) return;
    
    // Observe theater section
    const section = marqueeFrame.closest('section') || marqueeFrame.closest('.theater-section');
    if (section) {
        SectionObserver.observe(section, 'theater-section', null, null);
    }
    
    const sides = ['top', 'right', 'bottom', 'left'];
    const allBulbs = [];
    
    sides.forEach(side => {
        const container = document.getElementById(`chase-${side}`);
        if (!container) return;
        
        const isHorizontal = side === 'top' || side === 'bottom';
        const count = isHorizontal ? (isMobile ? 12 : 18) : (isMobile ? 5 : 8);
        
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const bulb = document.createElement('div');
            bulb.className = 'bulb';
            fragment.appendChild(bulb);
            allBulbs.push(bulb);
        }
        container.appendChild(fragment);
    });
    
    if (allBulbs.length === 0) return;
    
    let chaseIndex = 0;
    const chaseLength = isMobile ? 6 : 8;
    let prevLit = new Set();
    
    AnimationManager.register('theater-marquee', () => {
        const newLit = new Set();
        for (let i = 0; i < chaseLength; i++) {
            newLit.add((chaseIndex + i) % allBulbs.length);
        }
        
        prevLit.forEach(i => {
            if (!newLit.has(i)) allBulbs[i].classList.add('dim');
        });
        
        newLit.forEach(i => {
            if (!prevLit.has(i)) allBulbs[i].classList.remove('dim');
        });
        
        prevLit = newLit;
        chaseIndex = (chaseIndex + 1) % allBulbs.length;
    }, isMobile ? 70 : 50, 'theater-section');
}

/* ============================================
   TINSELTOWN ARROW MARQUEE BULBS
   ============================================ */

function initTinseltownBulbs() {
    initSingleTinseltown('tinseltown-bulbs');
    initSingleTinseltown('footer-tinseltown-bulbs');
    initHeartBulbs();
}

/**
 * Rebuild the tinseltown arrow bulbs (and restart their chase animation).
 * Used on resize and whenever the sign's dimensions may have changed
 * (e.g. after custom fonts finish loading).
 */
function rebuildTinseltownBulbs() {
    if (prefersReducedMotion) return;
    const tinselContainers = document.querySelectorAll('#tinseltown-bulbs, #footer-tinseltown-bulbs');
    if (tinselContainers.length === 0) return;

    tinselContainers.forEach(container => {
        container.innerHTML = '';
        // Also remove the old chase animation callback for this specific sign
        // (cleanupAnimations on resize handles this; fonts.ready path re-registers fresh)
    });
    initTinseltownBulbs();
}

// Re-place tinseltown bulbs once web fonts finish loading so the chase
// animation traces the correct sign geometry at every breakpoint.
if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        if (prefersReducedMotion) return;
        rebuildTinseltownBulbs();
    }).catch(() => {});
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
    
    // Observe heart section
    const section = heartShape.closest('section');
    const sectionId = `heart-section-${containerId}`;
    if (section) {
        SectionObserver.observe(section, sectionId, null, null);
    }
    
    const width = heartShape.offsetWidth;
    const height = heartShape.offsetHeight;
    const centerX = width / 2;
    const centerY = height * 0.44;
    const bulbs = [];
    
    function isInHeartRing(x, y) {
        const scale = width * 0.36;
        const nx = (x - centerX) / scale;
        const ny = (centerY - y) / scale;
        const val = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        const inHeart = val < 0;
        
        const cutoutCenterY = height * 0.48;
        const cutoutWidth = width * 0.24;
        const cutoutHeight = height * 0.21;
        const dx = (x - centerX) / cutoutWidth;
        const dy = (y - cutoutCenterY) / cutoutHeight;
        const inCutout = (dx * dx + dy * dy) < 1;
        
        return inHeart && !inCutout;
    }
    
    const bulbSize = Math.max(isMobile ? 20 : 16, width * (isMobile ? 0.06 : 0.05));
    const spacing = bulbSize * (isMobile ? 2.2 : 1.7);
    
    const fragment = document.createDocumentFragment();
    for (let y = height * 0.1; y < height * 0.92; y += spacing) {
        for (let x = width * 0.06; x < width * 0.94; x += spacing) {
            if (isInHeartRing(x, y)) {
                const bulb = document.createElement('div');
                bulb.className = 'bulb';
                bulb.style.left = `${x - bulbSize/2}px`;
                bulb.style.top = `${y - bulbSize/2}px`;
                bulbs.push(bulb);
                fragment.appendChild(bulb);
            }
        }
    }
    container.appendChild(fragment);
    
    if (bulbs.length === 0) return;
    
    const interval = isMobile ? 300 : 200;
    const numToToggle = Math.max(1, Math.floor(bulbs.length * 0.04));
    
    AnimationManager.register(`heart-${containerId}`, () => {
        for (let i = 0; i < numToToggle; i++) {
            const idx = Math.floor(Math.random() * bulbs.length);
            const bulb = bulbs[idx];
            bulb.classList.add('dim');
            setTimeout(() => bulb.classList.remove('dim'), 150);
        }
    }, interval, sectionId);
}

function initSingleTinseltown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sign = container.closest('.tinseltown-sign');
    if (!sign) return;
    
    // Unregister any previously running chase animation for this sign so a
    // rebuild (resize/fonts.ready) doesn't double-stack callbacks.
    AnimationManager.unregister(`tinseltown-${containerId}`);
    
    const width = sign.offsetWidth;
    const height = sign.offsetHeight;
    const bulbSpacing = 18;
    const bulbSize = 12;
    const margin = 8; // Distance from the edge of the arrow shape
    
    // Read the arrow tip width from the CSS custom property so bulbs match clip-path
    const tipVar = getComputedStyle(sign).getPropertyValue('--tip-width').trim();
    const tipWidth = parseFloat(tipVar) || 40;
    
    const bulbs = [];
    const fragment = document.createDocumentFragment();
    
    // Clip-path polygon points (in px): (0,0), (width-tip,0), (width,h/2), (width-tip,h), (0,h)
    // Place bulbs along these edges, inset by margin
    
    const bodyRightX = Math.max(width - tipWidth, margin); // corner where arrow begins
    const p1 = { x: margin, y: margin }; // top-left (inset)
    const p2 = { x: bodyRightX - margin, y: margin }; // top-right before arrow (inset)
    const p3 = { x: width - margin - bulbSize, y: height * 0.5 }; // arrow tip (inset)
    const p4 = { x: bodyRightX - margin, y: height - margin - bulbSize }; // bottom-right before arrow (inset)
    const p5 = { x: margin, y: height - margin - bulbSize }; // bottom-left (inset)
    
    // Helper to place bulbs along a line segment with consistent spacing
    function placeBulbsAlongLine(x1, y1, x2, y2, includeStart, includeEnd) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const count = Math.round(len / bulbSpacing);
        if (count === 0) return;
        
        const startIdx = includeStart ? 0 : 1;
        const endIdx = includeEnd ? count : count - 1;
        
        for (let i = startIdx; i <= endIdx; i++) {
            const t = i / count;
            const x = x1 + t * dx;
            const y = y1 + t * dy;
            const bulb = createBulb(x, y);
            bulbs.push(bulb);
            fragment.appendChild(bulb);
        }
    }
    
    // Top edge: p1 to p2 (include start, exclude end - p2 will be included by diagonal)
    placeBulbsAlongLine(p1.x, p1.y, p2.x, p2.y, true, false);
    
    // Upper diagonal: p2 to p3 (include start, exclude end - p3 is the tip)
    placeBulbsAlongLine(p2.x, p2.y, p3.x, p3.y, true, false);
    
    // Arrow tip bulb at p3
    const tipBulb = createBulb(p3.x, p3.y - bulbSize/2);
    bulbs.push(tipBulb);
    fragment.appendChild(tipBulb);
    
    // Lower diagonal: p3 to p4 (exclude start - tip already added, exclude end - p4 will be included by bottom)
    placeBulbsAlongLine(p3.x, p3.y, p4.x, p4.y, false, false);
    
    // Bottom edge: p4 to p5 (include start, exclude end - p5 will be included by left edge)
    placeBulbsAlongLine(p4.x, p4.y, p5.x, p5.y, true, false);
    
    // Left edge: p5 to p1 (include start, exclude end - p1 already included by top)
    placeBulbsAlongLine(p5.x, p5.y, p1.x, p1.y, true, false);
    
    container.appendChild(fragment);
    animateTinseltownBulbs(bulbs, `tinseltown-${containerId}`);
}

function createBulb(x, y) {
    const bulb = document.createElement('div');
    bulb.className = 'bulb';
    bulb.style.left = `${x}px`;
    bulb.style.top = `${y}px`;
    return bulb;
}

function animateTinseltownBulbs(bulbs, id) {
    if (bulbs.length === 0) return;
    if (!id) id = `tinseltown-${Date.now()}`;
    let index = 0;
    const groupSize = 5; // 5 bulbs on
    const gapSize = 5; // 5 bulbs off
    const pattern = groupSize + gapSize; // 10 bulbs per cycle
    const totalBulbs = bulbs.length;
    let prevLit = new Set();
    
    AnimationManager.register(id, () => {
        const newLit = new Set();
        
        // Light every group of 5, skip every 5 (5 on, 5 off pattern)
        for (let i = 0; i < totalBulbs; i++) {
            const pos = (i + index) % pattern;
            if (pos < groupSize) {
                newLit.add(i);
            }
        }
        
        prevLit.forEach(i => {
            if (!newLit.has(i)) bulbs[i]?.classList.remove('lit');
        });
        
        newLit.forEach(i => {
            if (!prevLit.has(i)) bulbs[i]?.classList.add('lit');
        });
        
        prevLit = newLit;
        index = (index - 1 + pattern) % pattern;
    }, isMobile ? 80 : 60);
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
    
    // Observe letterboard section
    const section = sign.closest('section');
    if (section) {
        SectionObserver.observe(section, 'letterboard-section', null, null);
    }
    
    const width = sign.offsetWidth;
    const bulbCount = Math.floor(width / 25);
    
    const topBulbs = [];
    const bottomBulbs = [];
    
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
    
    AnimationManager.register('letterboard', () => {
        on = !on;
        
        topBulbs.forEach((bulb, i) => {
            bulb.classList.toggle('lit', (i % 2 === 0) === on);
        });
        
        bottomBulbs.forEach((bulb, i) => {
            bulb.classList.toggle('lit', (i % 2 === 0) !== on);
        });
    }, 500, 'letterboard-section');
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
            if (scrollIndicator && scrollIndicator.classList.contains('visible')) {
                // Only hide based on scroll if it's already been revealed
                if (window.scrollY > 100) {
                    scrollIndicator.classList.remove('visible');
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
    // #region agent log
    const bgCutouts = document.querySelectorAll('.bg-cutout');
    const imageLoadStates = Array.from(bgCutouts).map(img => ({
        class: img.className,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        computedOpacity: getComputedStyle(img).opacity,
        src: img.src.split('/').pop()
    }));
    fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'main.js:resize',message:'Resize event fired - checking bg-cutout states',data:{windowWidth:window.innerWidth,windowHeight:window.innerHeight,imageCount:bgCutouts.length,imageLoadStates},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (prefersReducedMotion) return;

        // Refresh mobile flag so breakpoint-dependent timings/counts update
        // when the user crosses the 768px breakpoint.
        isMobile = window.innerWidth < 768;

        // Cleanup existing animations before reinitializing
        cleanupAnimations();

        // Rebuild outer marquee bulb borders
        const marqueeBorders = document.querySelectorAll('.marquee-border');
        marqueeBorders.forEach(marqueeBorder => {
            marqueeBorder.querySelectorAll('.bulb-row').forEach(row => {
                row.innerHTML = '';
            });
        });
        if (marqueeBorders.length > 0) {
            initMarqueeBulbs();
        }

        // Rebuild the theater marquee chase lights (each side container
        // gets wiped so counts match the new breakpoint).
        ['top', 'right', 'bottom', 'left'].forEach(side => {
            const c = document.getElementById(`chase-${side}`);
            if (c) c.innerHTML = '';
        });
        if (!isMobile && document.querySelector('.marquee-frame')) {
            initTheaterMarquee();
        }

        // Rebuild heart bulbs (sized to heart shape) - clear old DOM first
        ['heart-bulbs', 'main-heart-bulbs'].forEach(id => {
            const c = document.getElementById(id);
            if (c) c.innerHTML = '';
        });

        // Rebuild the letter board bulbs (bulb count depends on sign width)
        ['letterboard-bulbs-top', 'letterboard-bulbs-bottom'].forEach(id => {
            const c = document.getElementById(id);
            if (c) c.innerHTML = '';
        });
        initLetterBoardBulbs();

        // Redraw tinseltown arrow bulbs (also re-inits heart bulbs via
        // initTinseltownBulbs -> initHeartBulbs) so the chase keeps tracing
        // the new sign size and all bulb animations resume.
        rebuildTinseltownBulbs();
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
    
    if (!footerSection || !cutoutPhoto) return;
}

/* ============================================
   FIREBASE LEADERBOARD SYSTEM
   ============================================ */

const LeaderboardSystem = {
    db: null,
    jacpotRef: null,
    leaderboardRef: null,
    isInitialized: false,
    pendingJackpotWin: false,
    devMode: false,
    currentJacpot: 0,
    pendingLuckyNumber: 0,
    
    init() {
        if (typeof firebase === 'undefined' || !window.firebaseDB) {
            console.warn('Firebase not initialized. Leaderboard will work in offline mode.');
            return;
        }
        
        this.db = window.firebaseDB;
        this.jacpotRef = this.db.ref('jacpot_counter');
        this.leaderboardRef = this.db.ref('leaderboard');
        this.isInitialized = true;
        
        this.subscribeToJacpot();
        this.subscribeToLeaderboard();
        this.initModal();
        this.initRemoveHandler();
    },
    
    initRemoveHandler() {
        const body = document.getElementById('leaderboard-body');
        if (!body) return;
        
        body.addEventListener('click', (e) => {
            const btn = e.target.closest('.lb-remove');
            if (!btn) return;
            if (!this.devMode) return;
            
            e.stopPropagation();
            const key = btn.getAttribute('data-key');
            const initials = btn.getAttribute('data-initials') || '';
            const row = btn.closest('.leaderboard-row');
            
            if (!confirm(`Remove ${initials || 'this entry'} from the leaderboard?`)) return;
            
            this.removeEntry(key, initials, row);
        });
    },
    
    removeEntry(key, initials, row) {
        if (this.isInitialized && key) {
            this.leaderboardRef.child(key).remove();
            return;
        }
        
        // Offline fallback: remove this specific row from the DOM and local state
        const body = document.getElementById('leaderboard-body');
        if (!body) return;
        const target = row || body.querySelector(`[data-initials="${initials}"]`);
        if (target) target.remove();
        
        if (this._localEntries && target) {
            const idx = this._localEntries.findIndex(e => e.initials === initials);
            if (idx >= 0) this._localEntries.splice(idx, 1);
        }
        
        if (!body.querySelector('.data-row')) {
            body.innerHTML = `
                <div class="leaderboard-row empty-row">
                    <span class="lb-empty">No winners yet... pull the lever!</span>
                </div>
            `;
        }
    },
    
    subscribeToJacpot() {
        if (!this.isInitialized) return;
        
        this.jacpotRef.on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            this.currentJacpot = count;
            this.updateJacpotDisplay(count);
        });
    },
    
    subscribeToLeaderboard() {
        if (!this.isInitialized) return;
        
        this.leaderboardRef.orderByChild('luckyNumber').on('value', (snapshot) => {
            const entries = [];
            snapshot.forEach((child) => {
                entries.push({
                    key: child.key,
                    ...child.val()
                });
            });
            entries.sort((a, b) => (b.luckyNumber || 0) - (a.luckyNumber || 0));
            this.updateLeaderboardDisplay(entries);
        });
    },
    
    incrementJacpot() {
        if (!this.isInitialized) {
            const display = document.getElementById('jacpot-number');
            if (display) {
                const current = parseInt(display.textContent.replace(/,/g, '')) || 0;
                this.currentJacpot = current + 1;
                this.updateJacpotDisplay(current + 1);
            }
            return;
        }
        
        this.jacpotRef.transaction((current) => {
            return (current || 0) + 1;
        });
    },
    
    updateJacpotDisplay(count) {
        const display = document.getElementById('jacpot-number');
        if (!display) return;
        
        const formattedCount = count.toLocaleString();
        
        display.classList.add('updating');
        display.textContent = formattedCount;
        
        setTimeout(() => {
            display.classList.remove('updating');
        }, 200);
    },
    
    updateLeaderboardDisplay(entries) {
        const body = document.getElementById('leaderboard-body');
        if (!body) return;
        
        if (entries.length === 0) {
            body.innerHTML = `
                <div class="leaderboard-row empty-row">
                    <span class="lb-empty">No winners yet... pull the lever!</span>
                </div>
            `;
            return;
        }
        
        body.innerHTML = entries.map((entry, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const luckyNumber = entry.luckyNumber ? entry.luckyNumber.toLocaleString() : '—';
            const safeInitials = this.escapeHtml(entry.initials);
            return `
                <div class="leaderboard-row data-row" data-initials="${safeInitials}" data-key="${entry.key || ''}">
                    <span class="lb-rank ${rankClass}">${index + 1}</span>
                    <span class="lb-initials">${safeInitials}</span>
                    <span class="lb-lucky">${luckyNumber}</span>
                    <button type="button" class="lb-remove" data-key="${entry.key || ''}" data-initials="${safeInitials}" aria-label="Remove ${safeInitials}">×</button>
                </div>
            `;
        }).join('');
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    initModal() {
        const modal = document.getElementById('winner-modal');
        const input = document.getElementById('winner-initials');
        const submitBtn = document.getElementById('winner-submit');
        const skipBtn = document.getElementById('winner-skip');
        
        if (!modal || !input || !submitBtn || !skipBtn) return;
        
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.length > 0) {
                this.submitWinner(input.value);
            }
        });
        
        submitBtn.addEventListener('click', () => {
            if (input.value.length > 0) {
                this.submitWinner(input.value);
            }
        });
        
        skipBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
        
        // Escape key always closes the modal as an escape hatch
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hideModal();
            }
        });
    },
    
    showModal() {
        const modal = document.getElementById('winner-modal');
        const input = document.getElementById('winner-initials');
        
        if (!modal) return;
        
        this.pendingJackpotWin = true;
        
        // The <body> has `filter: sepia(...)` which creates a containing
        // block for position:fixed descendants. Portal the modal out to
        // <html> so it truly sticks to the viewport no matter where the
        // user has scrolled.
        if (modal.parentElement !== document.documentElement) {
            document.documentElement.appendChild(modal);
        }
        
        // Prevent page scroll while modal is open (without remounting body).
        this._savedScrollY = window.scrollY || window.pageYOffset || 0;
        document.body.style.overflow = 'hidden';
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Launch a 5-second fireworks show over the modal
        this.launchModalFireworks(5000);
        
        if (input) {
            input.value = '';
            // preventScroll stops browsers from scrolling the page to the input
            setTimeout(() => {
                try {
                    input.focus({ preventScroll: true });
                } catch (_) {
                    input.focus();
                }
                // Restore user's scroll position in case anything tried to jump
                window.scrollTo(0, this._savedScrollY || 0);
            }, 100);
        }
    },
    
    hideModal() {
        const modal = document.getElementById('winner-modal');
        
        if (!modal) return;
        
        this.pendingJackpotWin = false;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        // Clean up any body styles (including legacy scroll-lock styles)
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        
        this.stopModalFireworks();
    },
    
    launchModalFireworks(durationMs = 5000) {
        // Remove any existing fireworks container first
        this.stopModalFireworks();
        
        const container = document.createElement('div');
        container.id = 'modal-fireworks';
        container.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10001;
            overflow: hidden;
        `;
        // Attach to <html> (outside body) so body's filter doesn't create
        // a containing block that offsets our fixed positioning.
        document.documentElement.appendChild(container);
        this._modalFireworksContainer = container;
        
        const colors = ['#ffcc00', '#ff2d7b', '#ff3333', '#00e5cc', '#ffffff', '#ff9500'];
        const particlesPerBurst = 24;
        
        const spawnBurst = () => {
            if (!this._modalFireworksContainer) return;
            
            // Random position in the upper 75% of the viewport
            const cx = 10 + Math.random() * 80; // percent
            const cy = 10 + Math.random() * 65; // percent
            
            for (let i = 0; i < particlesPerBurst; i++) {
                const particle = document.createElement('div');
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = 6 + Math.random() * 6;
                particle.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    border-radius: 50%;
                    left: ${cx}%;
                    top: ${cy}%;
                    box-shadow: 0 0 ${size * 2}px ${color};
                    pointer-events: none;
                `;
                container.appendChild(particle);
                
                const angle = (i / particlesPerBurst) * Math.PI * 2 + Math.random() * 0.3;
                const distance = 80 + Math.random() * 140;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                if (typeof gsap !== 'undefined') {
                    gsap.to(particle, {
                        x: tx,
                        y: ty + 40, // slight gravity drift
                        opacity: 0,
                        scale: 0.2,
                        duration: 1 + Math.random() * 0.6,
                        ease: 'power2.out',
                        onComplete: () => particle.remove()
                    });
                } else {
                    particle.style.transition = 'transform 1.2s ease-out, opacity 1.2s ease-out';
                    requestAnimationFrame(() => {
                        particle.style.transform = `translate(${tx}px, ${ty + 40}px) scale(0.2)`;
                        particle.style.opacity = '0';
                    });
                    setTimeout(() => particle.remove(), 1400);
                }
            }
        };
        
        // Immediate burst, then repeat every ~400ms for the duration
        spawnBurst();
        this._modalFireworksInterval = setInterval(spawnBurst, 400);
        
        // Stop spawning after durationMs; let existing particles finish their animation
        this._modalFireworksTimeout = setTimeout(() => {
            if (this._modalFireworksInterval) {
                clearInterval(this._modalFireworksInterval);
                this._modalFireworksInterval = null;
            }
            // Remove container a bit later so last particles fade out cleanly
            setTimeout(() => {
                if (this._modalFireworksContainer) {
                    this._modalFireworksContainer.remove();
                    this._modalFireworksContainer = null;
                }
            }, 1600);
        }, durationMs);
    },
    
    stopModalFireworks() {
        if (this._modalFireworksInterval) {
            clearInterval(this._modalFireworksInterval);
            this._modalFireworksInterval = null;
        }
        if (this._modalFireworksTimeout) {
            clearTimeout(this._modalFireworksTimeout);
            this._modalFireworksTimeout = null;
        }
        if (this._modalFireworksContainer) {
            this._modalFireworksContainer.remove();
            this._modalFireworksContainer = null;
        }
    },
    
    submitWinner(initials) {
        const cleanInitials = initials.toUpperCase().substring(0, 3);
        // Capture the winning pull count BEFORE it gets reset
        const luckyNumber = this.pendingLuckyNumber || this.currentJacpot || 0;
        this.pendingLuckyNumber = 0;
        
        if (!this.isInitialized) {
            this.addLocalWinner(cleanInitials, luckyNumber);
            this.resetJacpot();
            this.hideModal();
            return;
        }
        
        this.leaderboardRef.push({
            initials: cleanInitials,
            lastWin: Date.now(),
            luckyNumber: luckyNumber
        });
        
        // Reset the jacpot counter to 0 after a win
        this.resetJacpot();
        
        this.hideModal();
        this.highlightEntry(cleanInitials);
    },
    
    addLocalWinner(initials, luckyNumber = 0) {
        const body = document.getElementById('leaderboard-body');
        if (!body) return;
        
        if (!this._localEntries) this._localEntries = [];
        this._localEntries.push({ initials, luckyNumber: luckyNumber || 0 });
        this._localEntries.sort((a, b) => (b.luckyNumber || 0) - (a.luckyNumber || 0));
        
        body.innerHTML = this._localEntries.map((entry, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const luckyDisplay = entry.luckyNumber ? entry.luckyNumber.toLocaleString() : '—';
            const safe = this.escapeHtml(entry.initials);
            return `
                <div class="leaderboard-row data-row" data-initials="${safe}">
                    <span class="lb-rank ${rankClass}">${index + 1}</span>
                    <span class="lb-initials">${safe}</span>
                    <span class="lb-lucky">${luckyDisplay}</span>
                    <button type="button" class="lb-remove" data-key="" data-initials="${safe}" aria-label="Remove ${safe}">×</button>
                </div>
            `;
        }).join('');
        
        this.highlightEntry(initials);
    },
    
    highlightEntry(initials) {
        setTimeout(() => {
            const rows = document.querySelectorAll('.leaderboard-row.data-row');
            rows.forEach(row => {
                const initialsSpan = row.querySelector('.lb-initials');
                if (initialsSpan && initialsSpan.textContent === initials) {
                    row.classList.add('highlight');
                    setTimeout(() => row.classList.remove('highlight'), 2000);
                }
            });
        }, 100);
    },
    
    onJackpotWin() {
        // Capture the winning pull count now, before it gets reset
        this.pendingLuckyNumber = this.currentJacpot || 0;
        this.showModal();
    },
    
    resetJacpot() {
        if (!this.isInitialized) {
            this.updateJacpotDisplay(0);
            return;
        }
        
        this.jacpotRef.set(0);
    },
    
    // Dev mode: force a jackpot win for testing
    forceJackpot() {
        console.log('🎰 DEV MODE: Forcing JAC-POT win!');
        this.incrementJacpot();
        
        // Show jackpot result
        const resultDisplay = document.getElementById('slot-result');
        if (resultDisplay) {
            resultDisplay.textContent = '🎉 JAC-POT! 🎉';
            resultDisplay.className = 'slot-result jackpot';
        }
        
        // Trigger fireworks if available
        if (typeof createSlotFireworks === 'function') {
            createSlotFireworks();
        }
        
        // Show the modal after a short delay
        setTimeout(() => {
            this.onJackpotWin();
        }, 500);
    },
    
    toggleDevMode() {
        this.devMode = !this.devMode;
        console.log(`🎰 Dev mode: ${this.devMode ? 'ON' : 'OFF'}`);
        
        document.body.classList.toggle('dev-mode', this.devMode);
        
        // Show a visual toast notification
        this.showDevToast(this.devMode ? 'DEV MODE: ON (J: Jackpot)' : 'DEV MODE: OFF');
        
        if (this.devMode) {
            console.log('🎰 Press "J" to force a JAC-POT win');
            console.log('🎰 Click the × on a leaderboard row to remove it');
        }
    },
    
    showDevToast(message) {
        // Remove existing toast if any
        const existing = document.getElementById('dev-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.id = 'dev-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            left: 50% !important;
            margin-left: -150px !important;
            width: 300px !important;
            text-align: center !important;
            background: rgba(0, 0, 0, 0.95) !important;
            color: #ffcc00 !important;
            padding: 12px 24px !important;
            border: 2px solid #ffcc00 !important;
            border-radius: 8px !important;
            font-family: monospace !important;
            font-size: 14px !important;
            z-index: 2147483647 !important;
            box-shadow: 0 0 20px rgba(255, 204, 0, 0.5) !important;
            pointer-events: none !important;
        `;
        
        // Append to documentElement (html) to avoid transform issues on body
        document.documentElement.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
};

// Secret dev mode keyboard shortcuts
// Press Shift+D to toggle dev mode, then press J to force a jackpot
document.addEventListener('keydown', (e) => {
    // Shift+D to toggle dev mode
    if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !e.ctrlKey && !e.metaKey) {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        LeaderboardSystem.toggleDevMode();
    }
    
    // Press J to force jackpot (only in dev mode)
    if (LeaderboardSystem.devMode && e.key.toLowerCase() === 'j' && !e.ctrlKey && !e.metaKey) {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        LeaderboardSystem.forceJackpot();
    }
});

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
    
    // Initialize the leaderboard system
    LeaderboardSystem.init();
    
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
        
        // Increment global jacpot counter on every pull
        LeaderboardSystem.incrementJacpot();
        
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
            resultDisplay.textContent = '🎉 JAC-POT! 🎉';
            resultDisplay.className = 'slot-result jackpot';
            createSlotFireworks();
            // Show the winner modal for leaderboard entry
            setTimeout(() => {
                LeaderboardSystem.onJackpotWin();
            }, 1500);
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
