/* ============================================
   3D THEATER MARQUEE - Three.js
   Tinseltown-style swoopy marquee with chase lights
   ============================================ */

(function() {
    const container = document.getElementById('marquee-3d');
    const canvas = document.getElementById('marquee-canvas');
    const hero = document.getElementById('hero');
    
    if (!container || !canvas || typeof THREE === 'undefined') return;
    
    // Start the bounce animation after a brief delay
    setTimeout(() => {
        container.classList.add('bounce-in');
        
        // After marquee bounce completes, trigger background images
        setTimeout(() => {
            if (hero) {
                hero.classList.add('marquee-ready');
            }
        }, 850); // Start images as marquee is settling
    }, 300);
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera with perspective - positioned to show full marquee including top
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.3, 8);
    camera.lookAt(0, -0.3, 0);
    
    // Renderer - optimized settings
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: window.devicePixelRatio < 2, // Only use antialias on lower DPI screens
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5 for performance
    renderer.setClearColor(0x000000, 0);
    
    // Lighting - more dramatic
    const ambientLight = new THREE.AmbientLight(0x442222, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.PointLight(0xff6b9d, 3, 20);
    mainLight.position.set(0, 3, 5);
    scene.add(mainLight);
    
    const backLight = new THREE.PointLight(0xffd700, 2, 15);
    backLight.position.set(0, -2, -3);
    scene.add(backLight);
    
    const sideLight1 = new THREE.PointLight(0xff4444, 1.5, 10);
    sideLight1.position.set(-4, 0, 2);
    scene.add(sideLight1);
    
    const sideLight2 = new THREE.PointLight(0xff4444, 1.5, 10);
    sideLight2.position.set(4, 0, 2);
    scene.add(sideLight2);
    
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
    
    // Bulbs array for chase animation - LOTS of bulbs!
    const bulbs = [];
    const bulbGeometry = new THREE.SphereGeometry(0.09, 12, 12);
    
    // Helper to add bulbs along a curved path
    function addBulbsAlongCurve(points, zPos) {
        points.forEach(p => {
            bulbPositions.push({ x: p.x, y: p.y, z: zPos });
        });
    }
    
    // Bulb positions around the organic frame
    const bulbPositions = [];
    const zFront = 0.3;
    
    // OUTER RING of bulbs - follows the swoopy frame shape
    // Top curve
    for (let t = 0; t <= 1; t += 0.04) {
        const x = -2.9 + t * 5.8;
        const y = 1.1 + Math.sin(t * Math.PI) * 0.15;
        bulbPositions.push({ x, y, z: zFront });
    }
    // Right side curve
    for (let t = 0; t <= 1; t += 0.08) {
        const y = 1.0 - t * 2.0;
        const x = 3.0 + Math.sin(t * Math.PI) * 0.25;
        bulbPositions.push({ x, y, z: zFront });
    }
    // Bottom curve (reverse)
    for (let t = 0; t <= 1; t += 0.04) {
        const x = 2.9 - t * 5.8;
        const y = -1.1 - Math.sin(t * Math.PI) * 0.1;
        bulbPositions.push({ x, y, z: zFront });
    }
    // Left side curve
    for (let t = 0; t <= 1; t += 0.08) {
        const y = -1.0 + t * 2.0;
        const x = -3.0 - Math.sin(t * Math.PI) * 0.25;
        bulbPositions.push({ x, y, z: zFront });
    }
    
    // INNER RING of bulbs (around the text area)
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
    
    // Arrow bulbs - left arrow
    for (let i = 0; i < 5; i++) {
        bulbPositions.push({ x: -3.5 - i * 0.15, y: 0.5 - i * 0.12, z: zFront });
        bulbPositions.push({ x: -3.5 - i * 0.15, y: -0.5 + i * 0.12, z: zFront });
    }
    bulbPositions.push({ x: -4.3, y: 0, z: zFront });
    
    // Arrow bulbs - right arrow
    for (let i = 0; i < 5; i++) {
        bulbPositions.push({ x: 3.5 + i * 0.15, y: 0.5 - i * 0.12, z: zFront });
        bulbPositions.push({ x: 3.5 + i * 0.15, y: -0.5 + i * 0.12, z: zFront });
    }
    bulbPositions.push({ x: 4.3, y: 0, z: zFront });
    
    // Explosion/starburst bulbs at top
    for (let angle = -0.8; angle <= 0.8; angle += 0.2) {
        for (let r = 1.5; r <= 2.2; r += 0.35) {
            const x = Math.sin(angle) * r;
            const y = 1.3 + Math.cos(angle) * r * 0.4;
            bulbPositions.push({ x, y, z: zFront - 0.2 });
        }
    }
    
    // Create all the bulbs - share materials for better performance
    const sharedBulbMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0xffffcc,
        emissiveIntensity: 1.0,
        metalness: 0.0,
        roughness: 0.1
    });
    
    bulbPositions.forEach((pos, i) => {
        // Clone material only for bulbs that need individual animation
        const bulbMaterial = sharedBulbMaterial.clone();
        
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(pos.x, pos.y, pos.z);
        bulb.userData = { index: i, material: bulbMaterial };
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
        
        // Reduce point lights - only every 4th bulb for performance
        if (i % 4 === 0) {
            const bulbLight = new THREE.PointLight(0xffd700, 0.06, 0.5);
            bulbLight.position.copy(bulb.position);
            bulb.userData.light = bulbLight;
            marqueeGroup.add(bulbLight);
        }
    });
    
    // Neon text - "Jac & Ben"
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 1024;
    textCanvas.height = 400;
    
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
    
    // Clean bulb border around the letter board
    const boardBulbOffset = 0.15;
    const topY = boardY + boardHeight/2 + boardBulbOffset;
    const bottomY = boardY - boardHeight/2 - boardBulbOffset;
    const leftX = -boardWidth/2 - boardBulbOffset;
    const rightX = boardWidth/2 + boardBulbOffset;
    
    // Calculate even spacing for top/bottom (horizontal)
    const horizBulbCount = 28;
    const horizSpacing = (rightX - leftX) / (horizBulbCount - 1);
    
    // Calculate even spacing for sides (vertical) 
    const vertBulbCount = 5;
    const vertSpacing = (topY - bottomY) / (vertBulbCount - 1);
    
    // Shared material for board bulbs
    const boardBulbMat = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0xffffaa,
        emissiveIntensity: 0.9,
        metalness: 0.0,
        roughness: 0.1
    });
    
    // Top row
    for (let i = 0; i < horizBulbCount; i++) {
        const x = leftX + i * horizSpacing;
        const bulbMat = boardBulbMat.clone();
        const bulb = new THREE.Mesh(bulbGeometry, bulbMat);
        bulb.position.set(x, topY, 0.15);
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
        bulb.userData = { material: bulbMat };
    }
    
    // Bottom row
    for (let i = 0; i < horizBulbCount; i++) {
        const x = leftX + i * horizSpacing;
        const bulbMat = boardBulbMat.clone();
        const bulb = new THREE.Mesh(bulbGeometry, bulbMat);
        bulb.position.set(x, bottomY, 0.15);
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
        bulb.userData = { material: bulbMat };
    }
    
    // Left side (skip corners - already covered by top/bottom)
    for (let i = 1; i < vertBulbCount - 1; i++) {
        const y = bottomY + i * vertSpacing;
        const bulbMat = boardBulbMat.clone();
        const bulb = new THREE.Mesh(bulbGeometry, bulbMat);
        bulb.position.set(leftX, y, 0.15);
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
        bulb.userData = { material: bulbMat };
    }
    
    // Right side (skip corners - already covered by top/bottom)
    for (let i = 1; i < vertBulbCount - 1; i++) {
        const y = bottomY + i * vertSpacing;
        const bulbMat = boardBulbMat.clone();
        const bulb = new THREE.Mesh(bulbGeometry, bulbMat);
        bulb.position.set(rightX, y, 0.15);
        marqueeGroup.add(bulb);
        bulbs.push(bulb);
        bulb.userData = { material: bulbMat };
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
    
    // Chase light animation - multiple chases for more drama!
    let chaseIndex1 = 0;
    let chaseIndex2 = Math.floor(bulbs.length / 2);
    const chaseLength = 15;
    const chaseSpeed = 35;
    let chaseLastTime = 0;
    
    function animateBulbs(currentTime) {
        if (currentTime - chaseLastTime >= chaseSpeed) {
            chaseLastTime = currentTime;
            
            bulbs.forEach((bulb, i) => {
                const material = bulb.userData.material;
                const light = bulb.userData.light;
                
                const dist1 = (i - chaseIndex1 + bulbs.length) % bulbs.length;
                const dist2 = (i - chaseIndex2 + bulbs.length) % bulbs.length;
                const dist = Math.min(dist1, dist2);
                
                if (dist < chaseLength) {
                    const brightness = 1 - (dist / chaseLength) * 0.6;
                    material.emissiveIntensity = brightness * 1.2;
                    material.color.setHex(0xffffee);
                    material.emissive.setHex(0xffffcc);
                    if (light) light.intensity = brightness * 0.1;
                } else {
                    material.emissiveIntensity = 0.15;
                    material.color.setHex(0x664422);
                    material.emissive.setHex(0x332211);
                    if (light) light.intensity = 0.015;
                }
            });
            
            chaseIndex1 = (chaseIndex1 + 1) % bulbs.length;
            chaseIndex2 = (chaseIndex2 + 1) % bulbs.length;
        }
    }
    
    // Subtle floating animation
    let floatTime = 0;
    let isPageVisible = true;
    
    // Pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
    });
    
    // Combined animation loop - single requestAnimationFrame for all animations
    function animate(currentTime) {
        requestAnimationFrame(animate);
        
        if (!isPageVisible) return;
        
        // Animate bulbs
        animateBulbs(currentTime);
        
        // Gentle floating motion
        floatTime += 0.012;
        marqueeGroup.position.y = 0.5 + Math.sin(floatTime) * 0.03;
        marqueeGroup.rotation.y = Math.sin(floatTime * 0.5) * 0.02;
        
        // Subtle light pulsing
        mainLight.intensity = 3 + Math.sin(floatTime * 2) * 0.5;
        
        renderer.render(scene, camera);
    }
    
    // Start render loop
    requestAnimationFrame(animate);
    
    // Handle resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    
    // Neon flicker effect - using requestAnimationFrame
    let flickerLastTime = 0;
    const flickerInterval = 80;
    
    function animateFlicker(currentTime) {
        if (currentTime - flickerLastTime >= flickerInterval) {
            flickerLastTime = currentTime;
            if (Math.random() > 0.92) {
                textSprite.material.opacity = 0.75;
                setTimeout(() => {
                    textSprite.material.opacity = 1;
                }, 40 + Math.random() * 80);
            }
        }
        requestAnimationFrame(animateFlicker);
    }
    requestAnimationFrame(animateFlicker);
    
})();
