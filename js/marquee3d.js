/* ============================================
   3D THEATER MARQUEE - Three.js + GLB Model
   Loads hero-marquee.glb with HDRI environment
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
                if (hero) {
                    hero.classList.add('marquee-ready');
                    
                    // Use GSAP to animate bg-cutout images
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
                }
                
                // Show scroll indicator after marquee bounce
                setTimeout(() => {
                    const scrollIndicator = document.querySelector('.scroll-indicator');
                    if (scrollIndicator) {
                        scrollIndicator.classList.add('visible');
                    }
                    
                    const bgCutouts = document.querySelectorAll('.bg-cutout');
                    bgCutouts.forEach(img => {
                        img.style.opacity = '1';
                    });
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
    
    // Camera with perspective
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    // Keep the whole model in view by adjusting camera distance to aspect ratio.
    // Model is scaled so its max dimension is ~11.5 units (see scaling below).
    // We add padding so the logo never touches the edges.
    const MODEL_TARGET_SIZE = 11.5;
    const VIEW_PADDING = 1.18;
    function fitCameraToContainer() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        const aspect = width / height;
        camera.aspect = aspect;
        const fovRad = camera.fov * Math.PI / 180;
        const target = MODEL_TARGET_SIZE * VIEW_PADDING;
        // Distance required to fit vertically and horizontally
        const distV = target / (2 * Math.tan(fovRad / 2));
        const distH = distV / aspect;
        camera.position.z = Math.max(distV, distH);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    // Renderer with physically correct lighting
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.physicallyCorrectLights = false;

    fitCameraToContainer();
    
    // Enable anisotropic filtering for sharper textures
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    
    // Container group for the loaded model
    const marqueeGroup = new THREE.Group();
    scene.add(marqueeGroup);
    
    // Bulbs array for chase animation
    const bulbs = [];
    
    // Neon lines array for chase animation
    const neonLines = [];
    
    // Shared sphere geometry for all bulbs (balanced poly count for smoothness)
    const bulbSegments = isMobile ? 12 : 16;
    const sharedBulbGeometry = new THREE.SphereGeometry(1, bulbSegments, bulbSegments);
    
    // Colors for bulb animation (warm lit / dim) - softer for night scene
    const litColor = new THREE.Color(0xffeedd);
    const dimColor = new THREE.Color(0x442211);
    const litEmissive = new THREE.Color(0xffcc66);
    const dimEmissive = new THREE.Color(0x331100);
    
    // Base material for bulbs
    const baseBulbMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc66,
        emissive: 0xffaa00,
        emissiveIntensity: 1.5,
        roughness: 0.3,
        metalness: 0.1
    });
    
    // Load HDRI environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    const exrLoader = new THREE.EXRLoader();
    exrLoader.load('assets/models/environment.exr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        
        // Use HDRI for reflections/lighting but don't show as background
        scene.environment = envMap;
        
        texture.dispose();
        pmremGenerator.dispose();
        
        console.log('HDRI environment loaded');
    });
    
    // Darker ambient for more contrast with emissive
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.25);
    scene.add(ambientLight);
    
    // Reduced key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(3, 5, 8);
    scene.add(keyLight);
    
    // Fill from left - subtle
    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.15);
    fillLight.position.set(-5, 1, 6);
    scene.add(fillLight);
    
    // Warm rim light for edge definition
    const rimLight = new THREE.PointLight(0xffaa66, 0.25, 25);
    rimLight.position.set(0, -3, -5);
    scene.add(rimLight);
    
    // Load the GLB model
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        'assets/models/hero-marquee.glb',
        function(gltf) {
            const model = gltf.scene;
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Scale to fit nicely in view (target ~11.5 units)
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 11.5 / maxDim;
            model.scale.setScalar(scale);
            
            // Re-center after scaling
            box.setFromObject(model);
            box.getCenter(center);
            model.position.sub(center);
            
            // Add to group
            marqueeGroup.add(model);
            
            // Collect bulb positions and remove original bulb meshes
            const bulbPositions = [];
            const bulbsToRemove = [];
            
            model.traverse(function(child) {
                if (child.isMesh) {
                    // Handle bulb meshes - extract position, mark for removal
                    if (child.name && child.name.startsWith('Bulb')) {
                        // Get world position of the bulb
                        const worldPos = new THREE.Vector3();
                        child.getWorldPosition(worldPos);
                        
                        // Get approximate size from bounding box
                        const bulbBox = new THREE.Box3().setFromObject(child);
                        const bulbSize = bulbBox.getSize(new THREE.Vector3());
                        const radius = Math.max(bulbSize.x, bulbSize.y, bulbSize.z) / 2;
                        
                        bulbPositions.push({ position: worldPos, radius: radius });
                        bulbsToRemove.push(child);
                    } else {
                        // Enhance materials - more dimensional look
                        if (child.material) {
                            // More reflections and smoother surface for depth
                            child.material.envMapIntensity = 0.6;
                            child.material.roughness = 0.5;
                            child.material.metalness = 0.1;
                            
                            // Boost color saturation slightly
                            if (child.material.color) {
                                const hsl = {};
                                child.material.color.getHSL(hsl);
                                hsl.s = Math.min(1.0, hsl.s * 1.15);
                                child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                            }
                            
                            // Make neon materials glow with visible color
                            const matName = (child.material.name || '').toLowerCase();
                            if (matName.includes('neon') || matName === 'light') {
                                // Neon_Silver (J&B text) stays white - no animation
                                if (matName.includes('silver')) {
                                    child.material.emissive = new THREE.Color(0xffffff);
                                    child.material.color = new THREE.Color(0xffffff);
                                    child.material.emissiveIntensity = 2.0;
                                } else if (matName.includes('red')) {
                                    // Red neon - extra saturated
                                    child.material = child.material.clone();
                                    child.material.emissive = new THREE.Color(0xff0000);
                                    child.material.color = new THREE.Color(0xff2020);
                                    child.material.emissiveIntensity = 2.0;
                                    // Store original colors for animation
                                    child.userData.neonColor = new THREE.Color(0xff2020);
                                    child.userData.neonEmissive = new THREE.Color(0xff0000);
                                    neonLines.push(child);
                                } else {
                                    // Other colored neons - saturated glow
                                    child.material = child.material.clone();
                                    if (child.material.color) {
                                        const hsl = {};
                                        child.material.color.getHSL(hsl);
                                        // Max saturation, moderate lightness for neon look
                                        child.material.emissive = new THREE.Color().setHSL(hsl.h, 1.0, 0.5);
                                        // Keep base color saturated
                                        child.material.color.setHSL(hsl.h, 1.0, 0.6);
                                        // Store original colors for animation
                                        child.userData.neonColor = child.material.color.clone();
                                        child.userData.neonEmissive = child.material.emissive.clone();
                                    }
                                    child.material.emissiveIntensity = 2.0;
                                    neonLines.push(child);
                                }
                            }
                            
                            if (child.material.map) {
                                child.material.map.anisotropy = maxAnisotropy;
                            }
                            
                            child.material.needsUpdate = true;
                        }
                    }
                }
            });
            
            // Remove original high-poly bulb meshes from the model
            bulbsToRemove.forEach(bulb => {
                if (bulb.parent) {
                    bulb.parent.remove(bulb);
                }
                if (bulb.geometry) bulb.geometry.dispose();
                if (bulb.material) {
                    if (Array.isArray(bulb.material)) {
                        bulb.material.forEach(m => m.dispose());
                    } else {
                        bulb.material.dispose();
                    }
                }
            });
            
            // Create new low-poly bulbs at the extracted positions
            bulbPositions.forEach((data, i) => {
                const material = baseBulbMaterial.clone();
                const bulb = new THREE.Mesh(sharedBulbGeometry, material);
                
                // Position relative to model (account for model transforms)
                const localPos = data.position.clone();
                model.worldToLocal(localPos);
                bulb.position.copy(localPos);
                
                // Scale smaller than original (0.12x the extracted radius)
                bulb.scale.setScalar(data.radius * 0.12);
                
                model.add(bulb);
                bulbs.push(bulb);
            });
            
            console.log('Replaced', bulbPositions.length, 'high-poly bulbs with low-poly versions');
            console.log('Found', neonLines.length, 'neon line meshes for animation');
            
            // Position the group - rotate to face camera
            marqueeGroup.rotation.x = Math.PI / 2 - 0.15;
            marqueeGroup.position.y = 0.5;
        },
        function(progress) {
            if (progress.total > 0) {
                const percent = (progress.loaded / progress.total * 100).toFixed(0);
                console.log('Loading model:', percent + '%');
            }
        },
        function(error) {
            console.error('Error loading hero-marquee.glb:', error);
        }
    );
    
    // Chase light animation
    let chaseStep = 0;
    const chaseSpeed = isMobile ? 200 : 150;
    let chaseLastTime = 0;
    
    // Neon line chase animation - slower
    let neonChaseStep = 0;
    const neonChaseSpeed = isMobile ? 350 : 300;
    let neonChaseLastTime = 0;
    
    // Bright white for neon "lit" chase state
    const neonWhiteColor = new THREE.Color(0xffffff);
    const neonWhiteEmissive = new THREE.Color(0xffffff);
    // Dark dim for neon "off" state
    const neonDimColor = new THREE.Color(0x111111);
    const neonDimEmissive = new THREE.Color(0x050505);
    
    function animateBulbs(currentTime) {
        if (bulbs.length === 0) return;
        
        if (currentTime - chaseLastTime >= chaseSpeed) {
            chaseLastTime = currentTime;
            chaseStep += 1;
            
            bulbs.forEach((bulb, i) => {
                // Pattern: 2 bulbs on, 2 bulbs off
                const phase = (i + chaseStep) % 4;
                const isLit = phase < 2;
                
                if (bulb.material) {
                    if (isLit) {
                        if (bulb.material.emissive) {
                            bulb.material.emissive.copy(litEmissive);
                            bulb.material.emissiveIntensity = 3.0;
                        }
                        if (bulb.material.color) {
                            bulb.material.color.copy(litColor);
                        }
                    } else {
                        if (bulb.material.emissive) {
                            bulb.material.emissive.copy(dimEmissive);
                            bulb.material.emissiveIntensity = 0.2;
                        }
                        if (bulb.material.color) {
                            bulb.material.color.copy(dimColor);
                        }
                    }
                }
            });
        }
    }
    
    function animateNeonLines(currentTime) {
        if (neonLines.length === 0) return;
        
        if (currentTime - neonChaseLastTime >= neonChaseSpeed) {
            neonChaseLastTime = currentTime;
            neonChaseStep += 1;
            
            neonLines.forEach((line, i) => {
                // Alternating pattern: every other line, with chase wave
                // Use modulo 2 for alternating, chase step shifts which set is "on"
                const isEvenLine = i % 2 === 0;
                const chasePhase = neonChaseStep % 2 === 0;
                const isWhite = isEvenLine === chasePhase;
                
                if (line.material) {
                    if (isWhite) {
                        // Bright white
                        line.material.emissive.copy(neonWhiteEmissive);
                        line.material.color.copy(neonWhiteColor);
                        line.material.emissiveIntensity = 2.5;
                    } else {
                        // Original neon color
                        if (line.userData.neonEmissive) {
                            line.material.emissive.copy(line.userData.neonEmissive);
                        }
                        if (line.userData.neonColor) {
                            line.material.color.copy(line.userData.neonColor);
                        }
                        line.material.emissiveIntensity = 2.0;
                    }
                }
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
    
    // Animation loop
    function animate(currentTime) {
        animationId = requestAnimationFrame(animate);
        
        if (!isPageVisible || !isInViewport) return;
        
        const delta = currentTime - lastRenderTime;
        if (delta < frameInterval) return;
        lastRenderTime = currentTime - (delta % frameInterval);
        
        if (!prefersReducedMotion) {
            animateBulbs(currentTime);
            animateNeonLines(currentTime);
        }
        
        if (!prefersReducedMotion) {
            floatTime += isMobile ? 0.008 : 0.012;
            marqueeGroup.position.y = 0.5 + Math.sin(floatTime) * 0.03;
            marqueeGroup.rotation.y = Math.sin(floatTime * 0.5) * 0.02;
        }
        
        renderer.render(scene, camera);
    }
    
    animationId = requestAnimationFrame(animate);
    
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            fitCameraToContainer();
        }, 150);
    }, { passive: true });
    
})();
