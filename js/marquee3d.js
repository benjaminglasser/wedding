/* ============================================
   3D THEATER MARQUEE - Three.js
   Tinseltown-style swoopy marquee with chase lights
   PERFORMANCE OPTIMIZED
   ============================================ */

(function() {
    const container = document.getElementById('marquee-3d');
    const canvas = document.getElementById('marquee-canvas');
    const hero = document.getElementById('hero');
    
    if (!container || !canvas || typeof THREE === 'undefined') return;
    
    // Performance settings
    const isMobile = window.innerWidth < 768;
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Expose function to start the marquee animation (called after loader exits)
    window.startMarqueeAnimation = function() {
        setTimeout(() => {
            container.classList.add('bounce-in');
            
            setTimeout(() => {
                // #region agent log
                const bgCutouts = document.querySelectorAll('.bg-cutout');
                const imageLoadStates = Array.from(bgCutouts).map(img => ({
                    class: img.className,
                    complete: img.complete,
                    naturalWidth: img.naturalWidth,
                    loading: img.loading,
                    src: img.src.split('/').pop()
                }));
                fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'marquee3d.js:startMarqueeAnimation',message:'About to add marquee-ready class to hero',data:{heroExists:!!hero,imageCount:bgCutouts.length,imageLoadStates},timestamp:Date.now(),hypothesisId:'H1-H2'})}).catch(()=>{});
                // #endregion
                
                if (hero) {
                    hero.classList.add('marquee-ready');
                    
                    // Use GSAP to animate bg-cutout images instead of relying on CSS animations
                    // This fixes browser bugs with CSS animation-fill-mode: forwards on opacity: 0 elements
                    if (typeof gsap !== 'undefined') {
                        const animationConfigs = [
                            { selector: '.bg-cutout.glitter-gulch', from: { x: '150%', rotation: 15, opacity: 0 }, to: { x: 0, rotation: -5, opacity: 1 }, delay: 0.15, duration: 1 },
                            { selector: '.bg-cutout.stardust', from: { x: '-100%', y: '-100%', rotation: -20, opacity: 0 }, to: { x: 0, y: 0, rotation: -2, opacity: 1 }, delay: 0.1, duration: 1 },
                            { selector: '.bg-cutout.vegas-vic', from: { x: '-150%', rotation: -15, opacity: 0 }, to: { x: 0, rotation: 5, opacity: 1 }, delay: 0.25, duration: 1.1 },
                            { selector: '.bg-cutout.flamingo', from: { x: '-100%', y: '100%', rotation: -20, opacity: 0 }, to: { x: 0, y: 0, rotation: 5, opacity: 1 }, delay: 0.35, duration: 1.2 },
                            { selector: '.bg-cutout.golden-nugget', from: { x: '100%', y: '100%', rotation: 20, opacity: 0 }, to: { x: 0, y: 0, rotation: -2, opacity: 1 }, delay: 0.4, duration: 1.1 },
                            { selector: '.bg-cutout.dunes-oasis', from: { y: '150%', rotation: 10, opacity: 0 }, to: { y: 0, rotation: 0, opacity: 1 }, delay: 0.5, duration: 1 },
                            { selector: '.bg-cutout.mint', from: { y: '150%', rotation: 10, opacity: 0 }, to: { y: 0, rotation: 2, opacity: 1 }, delay: 0.55, duration: 1.1 },
                            { selector: '.bg-cutout.casino-marquee', from: { y: '-150%', rotation: -10, opacity: 0 }, to: { y: 0, rotation: -5, opacity: 1 }, delay: 0, duration: 1 },
                            { selector: '.bg-cutout.welcome-vegas', from: { y: '-150%', rotation: -10, opacity: 0 }, to: { y: 0, rotation: 0, opacity: 1 }, delay: 0.05, duration: 1.2 },
                            { selector: '.bg-cutout.union-plaza', from: { x: '100%', y: '-100%', rotation: 20, opacity: 0 }, to: { x: 0, y: 0, rotation: 20, opacity: 1 }, delay: 0.2, duration: 1 }
                        ];
                        
                        animationConfigs.forEach(config => {
                            const el = document.querySelector(config.selector);
                            if (el) {
                                gsap.fromTo(el, config.from, {
                                    ...config.to,
                                    duration: config.duration,
                                    delay: config.delay,
                                    ease: 'elastic.out(1, 0.8)'
                                });
                            }
                        });
                    }
                    
                    // #region agent log
                    fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'marquee3d.js:startMarqueeAnimation',message:'marquee-ready class added, GSAP animations triggered',data:{heroClassList:hero.className,gsapAvailable:typeof gsap !== 'undefined'},timestamp:Date.now(),hypothesisId:'H10'})}).catch(()=>{});
                    // #endregion
                }
                
                // Show scroll indicator after marquee bounce and background images animate in
                setTimeout(() => {
                    const scrollIndicator = document.querySelector('.scroll-indicator');
                    if (scrollIndicator) {
                        scrollIndicator.classList.add('visible');
                    }
                    
                    // Fix for browser animation bug: explicitly set opacity after animations complete
                    // This ensures the final state is painted even if animation-fill-mode: forwards fails
                    const bgCutouts = document.querySelectorAll('.bg-cutout');
                    bgCutouts.forEach(img => {
                        img.style.opacity = '1';
                    });
                    
                    // #region agent log
                    const glitterGulch = document.querySelector('.bg-cutout.glitter-gulch');
                    const glitterRect = glitterGulch ? glitterGulch.getBoundingClientRect() : null;
                    const glitterStyle = glitterGulch ? getComputedStyle(glitterGulch) : null;
                    const imageStatesAfterAnimation = Array.from(bgCutouts).map(img => ({
                        class: img.className,
                        complete: img.complete,
                        naturalWidth: img.naturalWidth,
                        computedOpacity: getComputedStyle(img).opacity,
                        computedTransform: getComputedStyle(img).transform,
                        boundingRect: img.getBoundingClientRect(),
                        src: img.src.split('/').pop()
                    }));
                    fetch('http://127.0.0.1:7480/ingest/c1dab880-4892-4bc3-badc-5419bedb1182',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1874f4'},body:JSON.stringify({sessionId:'1874f4',location:'marquee3d.js:afterAnimations',message:'After animation delay (1800ms) - set opacity explicitly',data:{imageCount:bgCutouts.length,windowWidth:window.innerWidth,windowHeight:window.innerHeight,glitterGulchRect:glitterRect,glitterGulchVisibility:glitterStyle?.visibility,glitterGulchDisplay:glitterStyle?.display,glitterGulchRight:glitterStyle?.right,glitterGulchTop:glitterStyle?.top,imageStatesAfterAnimation},timestamp:Date.now(),hypothesisId:'H9'})}).catch(()=>{});
                    // #endregion
                }, 1800);
            }, 850);
        }, 100);
    };
    
    // If no loader exists, start immediately
    if (!document.getElementById('loader')) {
        window.startMarqueeAnimation();
    }
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera with perspective - positioned to show full marquee including top crown
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.6, 8);
    camera.lookAt(0, 0, 0);
    
    // Renderer - heavily optimized settings
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: !isMobile && window.devicePixelRatio < 2,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    
    // Lighting - reduced for performance
    const ambientLight = new THREE.AmbientLight(0x442222, 0.8);
    scene.add(ambientLight);
    
    const mainLight = new THREE.PointLight(0xff6b9d, 2.5, 20);
    mainLight.position.set(0, 3, 5);
    scene.add(mainLight);
    
    const backLight = new THREE.PointLight(0xffd700, 1.5, 15);
    backLight.position.set(0, -2, -3);
    scene.add(backLight);
    
    // Marquee group (for rotation)
    const marqueeGroup = new THREE.Group();
    scene.add(marqueeGroup);
    
    // Create swoopy organic frame shape (like Tinseltown)
    const frameShape = new THREE.Shape();
    
    // Start bottom left, create organic curved shape
    frameShape.moveTo(-2.8, -1.0);
    // Bottom curve (slight upward bow)
    frameShape.quadraticCurveTo(-1.5, -1.15, 0, -1.1);
    frameShape.quadraticCurveTo(1.5, -1.15, 2.8, -1.0);
    // Right side swoops out
    frameShape.quadraticCurveTo(3.2, -0.5, 3.0, 0);
    frameShape.quadraticCurveTo(3.2, 0.5, 2.8, 1.0);
    // Top curve (slight downward bow for drama)
    frameShape.quadraticCurveTo(1.5, 1.2, 0, 1.15);
    frameShape.quadraticCurveTo(-1.5, 1.2, -2.8, 1.0);
    // Left side swoops
    frameShape.quadraticCurveTo(-3.2, 0.5, -3.0, 0);
    frameShape.quadraticCurveTo(-3.2, -0.5, -2.8, -1.0);
    
    // Inner cutout (organic hole)
    const holePath = new THREE.Path();
    const inset = 0.35;
    holePath.moveTo(-2.4, -0.65);
    holePath.quadraticCurveTo(-1.2, -0.8, 0, -0.75);
    holePath.quadraticCurveTo(1.2, -0.8, 2.4, -0.65);
    holePath.quadraticCurveTo(2.7, -0.3, 2.5, 0);
    holePath.quadraticCurveTo(2.7, 0.3, 2.4, 0.65);
    holePath.quadraticCurveTo(1.2, 0.85, 0, 0.8);
    holePath.quadraticCurveTo(-1.2, 0.85, -2.4, 0.65);
    holePath.quadraticCurveTo(-2.7, 0.3, -2.5, 0);
    holePath.quadraticCurveTo(-2.7, -0.3, -2.4, -0.65);
    frameShape.holes.push(holePath);
    
    const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.08,
        bevelSegments: 3
    };
    
    const frameGeometry = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xaa2020,
        metalness: 0.4,
        roughness: 0.5,
        emissive: 0x440000,
        emissiveIntensity: 0.3
    });
    
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = -0.25;
    marqueeGroup.add(frame);
    
    // Back panel (dark interior) - organic shape
    const backShape = new THREE.Shape();
    backShape.moveTo(-2.4, -0.65);
    backShape.quadraticCurveTo(-1.2, -0.8, 0, -0.75);
    backShape.quadraticCurveTo(1.2, -0.8, 2.4, -0.65);
    backShape.quadraticCurveTo(2.7, -0.3, 2.5, 0);
    backShape.quadraticCurveTo(2.7, 0.3, 2.4, 0.65);
    backShape.quadraticCurveTo(1.2, 0.85, 0, 0.8);
    backShape.quadraticCurveTo(-1.2, 0.85, -2.4, 0.65);
    backShape.quadraticCurveTo(-2.7, 0.3, -2.5, 0);
    backShape.quadraticCurveTo(-2.7, -0.3, -2.4, -0.65);
    
    const backGeometry = new THREE.ShapeGeometry(backShape);
    const backMaterial = new THREE.MeshStandardMaterial({
        color: 0x150505,
        metalness: 0.1,
        roughness: 0.95
    });
    const backPanel = new THREE.Mesh(backGeometry, backMaterial);
    backPanel.position.z = -0.24;
    marqueeGroup.add(backPanel);
    
    // ARROW SHAPES on the sides (explosive/dramatic)
    function createArrow(x, direction) {
        const arrowShape = new THREE.Shape();
        const w = 0.8;
        const h = 1.2;
        
        if (direction > 0) { // Right arrow
            arrowShape.moveTo(0, -h/2);
            arrowShape.lineTo(w, 0);
            arrowShape.lineTo(0, h/2);
            arrowShape.lineTo(0, h/4);
            arrowShape.lineTo(-w/3, h/4);
            arrowShape.lineTo(-w/3, -h/4);
            arrowShape.lineTo(0, -h/4);
        } else { // Left arrow
            arrowShape.moveTo(0, -h/2);
            arrowShape.lineTo(-w, 0);
            arrowShape.lineTo(0, h/2);
            arrowShape.lineTo(0, h/4);
            arrowShape.lineTo(w/3, h/4);
            arrowShape.lineTo(w/3, -h/4);
            arrowShape.lineTo(0, -h/4);
        }
        
        const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
        const arrowMesh = new THREE.Mesh(arrowGeo, frameMaterial);
        arrowMesh.position.set(x, 0, -0.15);
        return arrowMesh;
    }
    
    const leftArrow = createArrow(-3.5, -1);
    const rightArrow = createArrow(3.5, 1);
    marqueeGroup.add(leftArrow);
    marqueeGroup.add(rightArrow);
    
    // Bulbs array for chase animation
    const bulbs = [];
    const bulbGeometry = new THREE.SphereGeometry(0.09, isMobile ? 6 : 8, isMobile ? 6 : 8);
    
    // Bulb positions around the organic frame - FULL DENSITY RESTORED
    const bulbPositions = [];
    const zFront = 0.3;
    
    // OUTER RING of bulbs - follows the swoopy frame shape
    for (let t = 0; t <= 1; t += 0.04) {
        const x = -2.9 + t * 5.8;
        const y = 1.1 + Math.sin(t * Math.PI) * 0.15;
        bulbPositions.push({ x, y, z: zFront });
    }
    for (let t = 0; t <= 1; t += 0.08) {
        const y = 1.0 - t * 2.0;
        const x = 3.0 + Math.sin(t * Math.PI) * 0.25;
        bulbPositions.push({ x, y, z: zFront });
    }
    for (let t = 0; t <= 1; t += 0.04) {
        const x = 2.9 - t * 5.8;
        const y = -1.1 - Math.sin(t * Math.PI) * 0.1;
        bulbPositions.push({ x, y, z: zFront });
    }
    for (let t = 0; t <= 1; t += 0.08) {
        const y = -1.0 + t * 2.0;
        const x = -3.0 - Math.sin(t * Math.PI) * 0.25;
        bulbPositions.push({ x, y, z: zFront });
    }
    
    // INNER RING - full density
    for (let t = 0; t <= 1; t += 0.05) {
        const x = -2.3 + t * 4.6;
        const y = 0.72 + Math.sin(t * Math.PI) * 0.12;
        bulbPositions.push({ x, y, z: zFront });
    }
    for (let t = 0; t <= 1; t += 0.12) {
        const y = 0.65 - t * 1.3;
        const x = 2.55 + Math.sin(t * Math.PI) * 0.15;
        bulbPositions.push({ x, y, z: zFront });
    }
    for (let t = 0; t <= 1; t += 0.05) {
        const x = 2.3 - t * 4.6;
        const y = -0.72 - Math.sin(t * Math.PI) * 0.08;
        bulbPositions.push({ x, y, z: zFront });
    }
    for (let t = 0; t <= 1; t += 0.12) {
        const y = -0.65 + t * 1.3;
        const x = -2.55 - Math.sin(t * Math.PI) * 0.15;
        bulbPositions.push({ x, y, z: zFront });
    }
    
    // LEFT ARROW bulbs - clean outline following arrow shape
    // Arrow at x=-3.5, tip at x=-4.3, height 1.2 (y from -0.6 to 0.6)
    // Top diagonal edge (from base top to tip)
    for (let t = 0; t <= 1; t += 0.2) {
        const x = -3.5 - t * 0.8;
        const y = 0.6 - t * 0.6;
        bulbPositions.push({ x, y, z: zFront });
    }
    // Bottom diagonal edge (from base bottom to tip)
    for (let t = 0; t <= 1; t += 0.2) {
        const x = -3.5 - t * 0.8;
        const y = -0.6 + t * 0.6;
        bulbPositions.push({ x, y, z: zFront });
    }
    // Back vertical edge
    for (let t = 0.2; t <= 0.8; t += 0.2) {
        bulbPositions.push({ x: -3.5, y: 0.6 - t * 1.2, z: zFront });
    }
    
    // RIGHT ARROW bulbs - clean outline following arrow shape
    // Arrow at x=3.5, tip at x=4.3, height 1.2 (y from -0.6 to 0.6)
    // Top diagonal edge (from base top to tip)
    for (let t = 0; t <= 1; t += 0.2) {
        const x = 3.5 + t * 0.8;
        const y = 0.6 - t * 0.6;
        bulbPositions.push({ x, y, z: zFront });
    }
    // Bottom diagonal edge (from base bottom to tip)
    for (let t = 0; t <= 1; t += 0.2) {
        const x = 3.5 + t * 0.8;
        const y = -0.6 + t * 0.6;
        bulbPositions.push({ x, y, z: zFront });
    }
    // Back vertical edge
    for (let t = 0.2; t <= 0.8; t += 0.2) {
        bulbPositions.push({ x: 3.5, y: 0.6 - t * 1.2, z: zFront });
    }
    
    // ============================================
    // TOP ARC CROWN - 3D backing for starburst bulbs
    // ============================================
    const arcShape = new THREE.Shape();
    
    // Create a crown/arc shape that sits above the main marquee
    // Outer arc
    arcShape.moveTo(-2.5, 1.15);
    arcShape.quadraticCurveTo(-1.8, 2.4, 0, 2.6);
    arcShape.quadraticCurveTo(1.8, 2.4, 2.5, 1.15);
    // Inner arc (creates the thickness)
    arcShape.lineTo(2.0, 1.2);
    arcShape.quadraticCurveTo(1.4, 2.0, 0, 2.15);
    arcShape.quadraticCurveTo(-1.4, 2.0, -2.0, 1.2);
    arcShape.lineTo(-2.5, 1.15);
    
    const arcExtrudeSettings = {
        depth: 0.35,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 2
    };
    
    const arcGeometry = new THREE.ExtrudeGeometry(arcShape, arcExtrudeSettings);
    const arcMaterial = new THREE.MeshStandardMaterial({
        color: 0x882020,
        metalness: 0.5,
        roughness: 0.4,
        emissive: 0x330000,
        emissiveIntensity: 0.2
    });
    
    const arcCrown = new THREE.Mesh(arcGeometry, arcMaterial);
    arcCrown.position.z = -0.35;
    marqueeGroup.add(arcCrown);
    
    // Add decorative ribs/rays emanating from center of arc
    const rayCount = 7;
    for (let i = 0; i < rayCount; i++) {
        const angle = -0.7 + (i / (rayCount - 1)) * 1.4;
        const rayShape = new THREE.Shape();
        const rayWidth = 0.08;
        const rayLength = 0.9;
        
        // Create a tapered ray
        rayShape.moveTo(-rayWidth, 0);
        rayShape.lineTo(-rayWidth * 0.3, rayLength);
        rayShape.lineTo(rayWidth * 0.3, rayLength);
        rayShape.lineTo(rayWidth, 0);
        rayShape.lineTo(-rayWidth, 0);
        
        const rayGeo = new THREE.ExtrudeGeometry(rayShape, { 
            depth: 0.15, 
            bevelEnabled: false 
        });
        const rayMesh = new THREE.Mesh(rayGeo, new THREE.MeshStandardMaterial({
            color: 0xcc8800,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x442200,
            emissiveIntensity: 0.3
        }));
        
        // Position at the base of the arc and rotate outward
        rayMesh.position.set(Math.sin(angle) * 0.3, 1.4, -0.2);
        rayMesh.rotation.z = -angle;
        marqueeGroup.add(rayMesh);
    }
    
    // Starburst bulbs at top - following the arc crown edges
    // Helper function to get point on quadratic bezier curve
    function quadraticBezier(t, p0, p1, p2) {
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        return { x, y };
    }
    
    // Outer arc bulbs - follows the outer edge of the crown
    // Left half: (-2.5, 1.15) -> (-1.8, 2.4) -> (0, 2.6)
    // Right half: (0, 2.6) -> (1.8, 2.4) -> (2.5, 1.15)
    const outerLeftP0 = { x: -2.5, y: 1.15 };
    const outerLeftP1 = { x: -1.8, y: 2.4 };
    const outerLeftP2 = { x: 0, y: 2.6 };
    const outerRightP0 = { x: 0, y: 2.6 };
    const outerRightP1 = { x: 1.8, y: 2.4 };
    const outerRightP2 = { x: 2.5, y: 1.15 };
    
    // Place bulbs along outer arc - denser spacing for complete coverage
    // Explicitly include endpoints to avoid floating point gaps
    bulbPositions.push({ x: outerLeftP0.x, y: outerLeftP0.y, z: zFront }); // Left arc start
    for (let t = 0.09; t <= 0.92; t += 0.09) {
        const pt = quadraticBezier(t, outerLeftP0, outerLeftP1, outerLeftP2);
        bulbPositions.push({ x: pt.x, y: pt.y, z: zFront });
    }
    bulbPositions.push({ x: outerLeftP2.x, y: outerLeftP2.y, z: zFront }); // Left arc end (center top)
    for (let t = 0.09; t <= 0.92; t += 0.09) {
        const pt = quadraticBezier(t, outerRightP0, outerRightP1, outerRightP2);
        bulbPositions.push({ x: pt.x, y: pt.y, z: zFront });
    }
    bulbPositions.push({ x: outerRightP2.x, y: outerRightP2.y, z: zFront }); // Right arc end
    
    // Inner arc bulbs - follows the inner edge of the crown
    // Left half: (-2.0, 1.2) -> (-1.4, 2.0) -> (0, 2.15)
    // Right half: (0, 2.15) -> (1.4, 2.0) -> (2.0, 1.2)
    const innerLeftP0 = { x: -2.0, y: 1.2 };
    const innerLeftP1 = { x: -1.4, y: 2.0 };
    const innerLeftP2 = { x: 0, y: 2.15 };
    const innerRightP0 = { x: 0, y: 2.15 };
    const innerRightP1 = { x: 1.4, y: 2.0 };
    const innerRightP2 = { x: 2.0, y: 1.2 };
    
    // Place bulbs along inner arc
    for (let t = 0; t <= 1; t += 0.15) {
        const pt = quadraticBezier(t, innerLeftP0, innerLeftP1, innerLeftP2);
        bulbPositions.push({ x: pt.x, y: pt.y, z: zFront });
    }
    // Add explicit center bulb for inner arc
    bulbPositions.push({ x: innerLeftP2.x, y: innerLeftP2.y, z: zFront });
    for (let t = 0.15; t <= 1; t += 0.15) {
        const pt = quadraticBezier(t, innerRightP0, innerRightP1, innerRightP2);
        bulbPositions.push({ x: pt.x, y: pt.y, z: zFront });
    }
    
    // Shared material - fully opaque bulbs with warm yellow tint
    const litBulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xffeeaa  // Warm cream-yellow when lit
    });
    
    const dimBulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xaa7755  // Warm reddish-brown when off
    });
    
    // Create bulbs with shared geometry - NO individual point lights
    bulbPositions.forEach((pos, i) => {
        const bulb = new THREE.Mesh(bulbGeometry, dimBulbMaterial.clone());
        bulb.position.set(pos.x, pos.y, pos.z);
        bulb.userData = { index: i };
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
    });
    
    // Neon text - "Jac & Ben"
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 1024;
    textCanvas.height = 400;
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ 
        map: textTexture, 
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.scale.set(5, 2, 1);
    textSprite.position.z = 0.2;
    textSprite.position.y = -0.05;
    marqueeGroup.add(textSprite);
    
    function drawNeonText() {
        ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
        
        ctx.font = '160px "Las Enter", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Multiple glow layers for intense neon effect
        ctx.shadowColor = '#ff0066';
        ctx.shadowBlur = 80;
        ctx.fillStyle = '#ff0066';
        ctx.fillText('Jac & Ben!', textCanvas.width/2, textCanvas.height/2);
        
        ctx.shadowBlur = 50;
        ctx.fillStyle = '#ff3388';
        ctx.fillText('Jac & Ben!', textCanvas.width/2, textCanvas.height/2);
        
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ff6699';
        ctx.fillText('Jac & Ben!', textCanvas.width/2, textCanvas.height/2);
        
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffaacc';
        ctx.fillText('Jac & Ben!', textCanvas.width/2, textCanvas.height/2);
        
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Jac & Ben!', textCanvas.width/2, textCanvas.height/2);
        
        textTexture.needsUpdate = true;
    }
    
    // Wait for the Las Enter font to load before drawing text
    // Canvas text doesn't auto-update when fonts load, so we must wait
    document.fonts.ready.then(() => {
        document.fonts.load('160px "Las Enter"').then(() => {
            drawNeonText();
        }).catch(() => {
            drawNeonText();
        });
    });
    
    // ============================================
    // LETTER BOARD - "THE WEDDING OF THE YEAR"
    // ============================================
    const boardWidth = 6.2;
    const boardHeight = 0.9;
    const boardY = -2.0;
    
    // Main board background (cream/white like cinema marquee)
    const boardGeo = new THREE.PlaneGeometry(boardWidth, boardHeight);
    const boardMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        metalness: 0.0,
        roughness: 0.9
    });
    const letterBoard = new THREE.Mesh(boardGeo, boardMat);
    letterBoard.position.set(0, boardY, 0.1);
    marqueeGroup.add(letterBoard);
    
    // Board frame
    const boardFrameShape = new THREE.Shape();
    boardFrameShape.moveTo(-boardWidth/2 - 0.1, -boardHeight/2 - 0.08);
    boardFrameShape.lineTo(boardWidth/2 + 0.1, -boardHeight/2 - 0.08);
    boardFrameShape.lineTo(boardWidth/2 + 0.1, boardHeight/2 + 0.08);
    boardFrameShape.lineTo(-boardWidth/2 - 0.1, boardHeight/2 + 0.08);
    boardFrameShape.lineTo(-boardWidth/2 - 0.1, -boardHeight/2 - 0.08);
    
    const boardHole = new THREE.Path();
    boardHole.moveTo(-boardWidth/2, -boardHeight/2);
    boardHole.lineTo(boardWidth/2, -boardHeight/2);
    boardHole.lineTo(boardWidth/2, boardHeight/2);
    boardHole.lineTo(-boardWidth/2, boardHeight/2);
    boardHole.lineTo(-boardWidth/2, -boardHeight/2);
    boardFrameShape.holes.push(boardHole);
    
    const boardFrameGeo = new THREE.ExtrudeGeometry(boardFrameShape, { depth: 0.15, bevelEnabled: false });
    const boardFrame = new THREE.Mesh(boardFrameGeo, frameMaterial);
    boardFrame.position.set(0, boardY, 0);
    marqueeGroup.add(boardFrame);
    
    // "THE WEDDING OF THE YEAR" text
    const weddingCanvas = document.createElement('canvas');
    const wctx = weddingCanvas.getContext('2d');
    weddingCanvas.width = 1280;
    weddingCanvas.height = 180;
    
    wctx.fillStyle = '#f5f5dc';
    wctx.fillRect(0, 0, weddingCanvas.width, weddingCanvas.height);
    
    wctx.font = 'bold 78px "Vintage Punk", sans-serif';
    wctx.textAlign = 'center';
    wctx.textBaseline = 'middle';
    wctx.fillStyle = '#1a1a1a';
    wctx.fillText('★ THE WEDDING OF THE YEAR ★', weddingCanvas.width/2, weddingCanvas.height/2);
    
    const weddingTexture = new THREE.CanvasTexture(weddingCanvas);
    const weddingMat = new THREE.MeshBasicMaterial({ map: weddingTexture, transparent: false });
    const weddingPlane = new THREE.Mesh(new THREE.PlaneGeometry(boardWidth - 0.1, boardHeight - 0.1), weddingMat);
    weddingPlane.position.set(0, boardY, 0.12);
    marqueeGroup.add(weddingPlane);
    
    // Clean bulb border around the letter board - FULL DENSITY
    const boardBulbOffset = 0.15;
    const topY = boardY + boardHeight/2 + boardBulbOffset;
    const bottomY = boardY - boardHeight/2 - boardBulbOffset;
    const leftX = -boardWidth/2 - boardBulbOffset;
    const rightX = boardWidth/2 + boardBulbOffset;
    
    const horizBulbCount = 28;
    const horizSpacing = (rightX - leftX) / (horizBulbCount - 1);
    const vertBulbCount = 5;
    const vertSpacing = (topY - bottomY) / (vertBulbCount - 1);
    
    // Top row
    for (let i = 0; i < horizBulbCount; i++) {
        const x = leftX + i * horizSpacing;
        const bulb = new THREE.Mesh(bulbGeometry, dimBulbMaterial.clone());
        bulb.position.set(x, topY, 0.15);
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
        bulb.userData = { index: bulbs.length - 1 };
    }
    
    // Bottom row
    for (let i = 0; i < horizBulbCount; i++) {
        const x = leftX + i * horizSpacing;
        const bulb = new THREE.Mesh(bulbGeometry, dimBulbMaterial.clone());
        bulb.position.set(x, bottomY, 0.15);
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
        bulb.userData = { index: bulbs.length - 1 };
    }
    
    // Side bulbs
    for (let i = 1; i < vertBulbCount - 1; i++) {
        const y = bottomY + i * vertSpacing;
        const bulbL = new THREE.Mesh(bulbGeometry, dimBulbMaterial.clone());
        bulbL.position.set(leftX, y, 0.15);
        marqueeGroup.add(bulbL);
        bulbs.push(bulbL);
        bulbL.userData = { index: bulbs.length - 1 };
        
        const bulbR = new THREE.Mesh(bulbGeometry, dimBulbMaterial.clone());
        bulbR.position.set(rightX, y, 0.15);
        marqueeGroup.add(bulbR);
        bulbs.push(bulbR);
        bulbR.userData = { index: bulbs.length - 1 };
    }
    
    // ============================================
    // DATE BOARD - "OCTOBER 10, 2026 ★ LAS VEGAS"
    // ============================================
    const dateY = -3.1;
    const dateWidth = 4.5;
    const dateHeight = 0.6;
    
    // Date board background
    const dateBoardGeo = new THREE.PlaneGeometry(dateWidth, dateHeight);
    const dateBoard = new THREE.Mesh(dateBoardGeo, boardMat);
    dateBoard.position.set(0, dateY, 0.1);
    marqueeGroup.add(dateBoard);
    
    // Date board frame
    const dateFrameShape = new THREE.Shape();
    dateFrameShape.moveTo(-dateWidth/2 - 0.08, -dateHeight/2 - 0.06);
    dateFrameShape.lineTo(dateWidth/2 + 0.08, -dateHeight/2 - 0.06);
    dateFrameShape.lineTo(dateWidth/2 + 0.08, dateHeight/2 + 0.06);
    dateFrameShape.lineTo(-dateWidth/2 - 0.08, dateHeight/2 + 0.06);
    dateFrameShape.lineTo(-dateWidth/2 - 0.08, -dateHeight/2 - 0.06);
    
    const dateHole = new THREE.Path();
    dateHole.moveTo(-dateWidth/2, -dateHeight/2);
    dateHole.lineTo(dateWidth/2, -dateHeight/2);
    dateHole.lineTo(dateWidth/2, dateHeight/2);
    dateHole.lineTo(-dateWidth/2, dateHeight/2);
    dateHole.lineTo(-dateWidth/2, -dateHeight/2);
    dateFrameShape.holes.push(dateHole);
    
    const dateFrameGeo = new THREE.ExtrudeGeometry(dateFrameShape, { depth: 0.12, bevelEnabled: false });
    const dateFrame = new THREE.Mesh(dateFrameGeo, frameMaterial);
    dateFrame.position.set(0, dateY, 0);
    marqueeGroup.add(dateFrame);
    
    // "OCTOBER 10, 2026 ★ LAS VEGAS" text
    const dateCanvas = document.createElement('canvas');
    const dctx = dateCanvas.getContext('2d');
    dateCanvas.width = 900;
    dateCanvas.height = 120;
    
    dctx.fillStyle = '#f5f5dc';
    dctx.fillRect(0, 0, dateCanvas.width, dateCanvas.height);
    
    dctx.font = 'bold 48px "Vintage King", sans-serif';
    dctx.textAlign = 'center';
    dctx.textBaseline = 'middle';
    dctx.fillStyle = '#1a1a1a';
    dctx.fillText('OCTOBER 10, 2026 ★ LAS VEGAS', dateCanvas.width/2, dateCanvas.height/2);
    
    const dateTexture = new THREE.CanvasTexture(dateCanvas);
    const dateMat = new THREE.MeshBasicMaterial({ map: dateTexture, transparent: false });
    const datePlane = new THREE.Mesh(new THREE.PlaneGeometry(dateWidth - 0.08, dateHeight - 0.08), dateMat);
    datePlane.position.set(0, dateY, 0.12);
    marqueeGroup.add(datePlane);
    
    
    
    // Tilt the entire marquee (dramatic Tinseltown angle)
    marqueeGroup.rotation.x = -0.2;
    marqueeGroup.rotation.y = 0;
    marqueeGroup.position.y = 0.5;
    
    // Tinseltown-style alternating chase light animation
    // Pattern: ON-off-ON-off that shifts by 1 each frame, creating traveling alternation
    let chaseStep = 0;
    const chaseSpeed = isMobile ? 200 : 180; // Time between shifts in ms
    let chaseLastTime = 0;
    
    // Pre-create colors for reuse
    const litColor = new THREE.Color(0xffeeaa);  // Warm cream-yellow when lit
    const dimColor = new THREE.Color(0xaa7755);  // Warm reddish-brown when off
    
    // Group bulbs by section for proper chasing within each geometry section
    const sectionBulbs = {};
    bulbs.forEach((bulb, i) => {
        const section = bulb.userData.section || 0;
        if (!sectionBulbs[section]) sectionBulbs[section] = [];
        sectionBulbs[section].push({ bulb, localIndex: sectionBulbs[section].length });
    });
    
    // Section offsets so they don't all sync up exactly
    const sectionOffsets = {
        0: 0,   // Outer ring
        1: 2,   // Inner ring - offset
        2: 0,   // Left arrow
        3: 2,   // Right arrow - offset from left
        4: 0,   // Starburst outer
        5: 2,   // Starburst inner - offset
        6: 1    // Letter board - offset from main marquee
    };
    
    function animateBulbs(currentTime) {
        if (currentTime - chaseLastTime >= chaseSpeed) {
            chaseLastTime = currentTime;
            chaseStep += 1;
            
            // Animate each section independently
            Object.keys(sectionBulbs).forEach(sectionKey => {
                const section = parseInt(sectionKey);
                const bulbsInSection = sectionBulbs[section];
                const offset = sectionOffsets[section] || 0;
                
                bulbsInSection.forEach(({ bulb, localIndex }) => {
                    // Pattern: 2 bulbs on, 2 bulbs off (using modulo 4)
                    // Phase 0,1 = ON, Phase 2,3 = OFF
                    // chaseStep shifts the pattern each frame
                    const phase = (localIndex + chaseStep + offset) % 4;
                    const isLit = phase < 2; // 0,1 are lit; 2,3 are dim
                    
                    if (isLit) {
                        bulb.material.color.copy(litColor);
                    } else {
                        bulb.material.color.copy(dimColor);
                    }
                });
            });
        }
    }
    
    // Animation state
    let floatTime = 0;
    let isPageVisible = true;
    let animationId = null;
    let lastRenderTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    
    // Pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible && !animationId) {
            animationId = requestAnimationFrame(animate);
        }
    });
    
    // Track if marquee is in viewport
    let isInViewport = true;
    const marqueeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isInViewport = entry.isIntersecting;
        });
    }, { rootMargin: '100px', threshold: 0.01 });
    marqueeObserver.observe(container);
    
    // Throttled animation loop
    function animate(currentTime) {
        animationId = requestAnimationFrame(animate);
        
        if (!isPageVisible || !isInViewport) return;
        
        const delta = currentTime - lastRenderTime;
        if (delta < frameInterval) return;
        lastRenderTime = currentTime - (delta % frameInterval);
        
        if (!prefersReducedMotion) {
            animateBulbs(currentTime);
        }
        
        if (!prefersReducedMotion) {
            floatTime += isMobile ? 0.008 : 0.012;
            marqueeGroup.position.y = 0.5 + Math.sin(floatTime) * 0.02;
            marqueeGroup.rotation.y = Math.sin(floatTime * 0.5) * 0.015;
            mainLight.intensity = 2.5 + Math.sin(floatTime * 2) * 0.3;
        }
        
        renderer.render(scene, camera);
    }
    
    animationId = requestAnimationFrame(animate);
    
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }, 150);
    }, { passive: true });
    
    // Neon flicker - simplified, less frequent
    if (!prefersReducedMotion && !isMobile) {
        setInterval(() => {
            if (Math.random() > 0.95 && isPageVisible) {
                textSprite.material.opacity = 0.8;
                setTimeout(() => {
                    textSprite.material.opacity = 1;
                }, 60);
            }
        }, 200);
    }
    
})();
