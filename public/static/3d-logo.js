// 宅建BOOST v9.0.0 - 3D Interactive Logo with Image Texture
class TakkenBoost3DLogo {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cube = null;
        this.isRotating = true;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 3;
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Create cube with image texture
        this.createCubeWithLogo();
        
        // Add lights
        this.addLights();
        
        // Add event listeners
        this.addEventListeners();
        
        // Start animation
        this.animate();
    }
    
    createCubeWithLogo() {
        // Create geometry
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        
        // Create canvas for texture
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text and logo
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw main text
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText('宅建', canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText('BOOST', canvas.width / 2, canvas.height / 2 + 20);
        
        // Draw version badge
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('v9.0.0', canvas.width / 2, canvas.height / 2 + 80);
        
        // Draw decorative elements
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 200, 0, Math.PI * 2);
        ctx.stroke();
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Create materials array (one for each face)
        const materials = [];
        for (let i = 0; i < 6; i++) {
            // Clone canvas for each face with slight variations
            const faceCanvas = document.createElement('canvas');
            const faceCtx = faceCanvas.getContext('2d');
            faceCanvas.width = 512;
            faceCanvas.height = 512;
            
            // Create gradient with slight variation
            const faceGradient = faceCtx.createLinearGradient(
                0, 0, 
                faceCanvas.width, faceCanvas.height
            );
            const hueShift = i * 10;
            faceGradient.addColorStop(0, this.adjustHue('#667eea', hueShift));
            faceGradient.addColorStop(1, this.adjustHue('#764ba2', hueShift));
            faceCtx.fillStyle = faceGradient;
            faceCtx.fillRect(0, 0, faceCanvas.width, faceCanvas.height);
            
            // Add content
            faceCtx.fillStyle = 'white';
            faceCtx.font = 'bold 80px Arial';
            faceCtx.textAlign = 'center';
            faceCtx.textBaseline = 'middle';
            faceCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            faceCtx.shadowBlur = 10;
            
            // Different content for different faces
            if (i === 0 || i === 1) {
                // Front and back
                faceCtx.fillText('宅建', faceCanvas.width / 2, faceCanvas.height / 2 - 60);
                faceCtx.fillText('BOOST', faceCanvas.width / 2, faceCanvas.height / 2 + 20);
                faceCtx.font = 'bold 30px Arial';
                faceCtx.fillStyle = '#FFD700';
                faceCtx.fillText('v9.0.0', faceCanvas.width / 2, faceCanvas.height / 2 + 80);
            } else if (i === 2 || i === 3) {
                // Top and bottom
                faceCtx.font = 'bold 120px Arial';
                faceCtx.fillText('宅', faceCanvas.width / 2, faceCanvas.height / 2 - 40);
                faceCtx.fillText('建', faceCanvas.width / 2, faceCanvas.height / 2 + 60);
            } else {
                // Left and right
                faceCtx.font = 'bold 60px Arial';
                faceCtx.fillText('TAKKEN', faceCanvas.width / 2, faceCanvas.height / 2 - 40);
                faceCtx.fillText('BOOST', faceCanvas.width / 2, faceCanvas.height / 2 + 40);
                faceCtx.font = 'bold 30px Arial';
                faceCtx.fillStyle = '#FFD700';
                faceCtx.fillText('Ultimate', faceCanvas.width / 2, faceCanvas.height / 2 + 100);
            }
            
            // Add decorative border
            faceCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            faceCtx.lineWidth = 5;
            faceCtx.strokeRect(20, 20, faceCanvas.width - 40, faceCanvas.height - 40);
            
            const faceTexture = new THREE.CanvasTexture(faceCanvas);
            materials.push(new THREE.MeshPhongMaterial({ 
                map: faceTexture,
                specular: 0x222222,
                shininess: 100
            }));
        }
        
        // Create mesh
        this.cube = new THREE.Mesh(geometry, materials);
        
        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.cube.add(glowMesh);
        
        // Add to scene
        this.scene.add(this.cube);
    }
    
    adjustHue(color, degrees) {
        // Simple hue adjustment for color variation
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Apply simple hue shift
        const shifted_r = Math.min(255, r + degrees);
        const shifted_g = Math.min(255, g - degrees / 2);
        const shifted_b = Math.min(255, b + degrees / 3);
        
        return `#${shifted_r.toString(16).padStart(2, '0')}${shifted_g.toString(16).padStart(2, '0')}${shifted_b.toString(16).padStart(2, '0')}`;
    }
    
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x667eea, 0.5);
        pointLight1.position.set(-5, 5, 5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x764ba2, 0.5);
        pointLight2.position.set(5, -5, 5);
        this.scene.add(pointLight2);
    }
    
    addEventListeners() {
        // Mouse interaction
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });
        
        // Click to toggle rotation
        this.container.addEventListener('click', () => {
            this.isRotating = !this.isRotating;
            
            // Add click animation
            anime({
                targets: this.cube.scale,
                x: [1, 1.2, 1],
                y: [1, 1.2, 1],
                z: [1, 1.2, 1],
                duration: 600,
                easing: 'easeOutElastic(1, 0.5)'
            });
        });
        
        // Hover effects
        this.container.addEventListener('mouseenter', () => {
            anime({
                targets: this.cube.rotation,
                x: this.cube.rotation.x + Math.PI / 4,
                duration: 500,
                easing: 'easeOutCubic'
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.cube) {
            // Auto rotation
            if (this.isRotating) {
                this.cube.rotation.x += 0.005;
                this.cube.rotation.y += 0.01;
            }
            
            // Mouse interaction
            const targetRotationX = this.mouseY * 0.5;
            const targetRotationY = this.mouseX * 0.5;
            
            this.cube.rotation.x += (targetRotationX - this.cube.rotation.x) * 0.05;
            this.cube.rotation.y += (targetRotationY - this.cube.rotation.y) * 0.05;
            
            // Floating animation
            this.cube.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Public methods
    startRotation() {
        this.isRotating = true;
    }
    
    stopRotation() {
        this.isRotating = false;
    }
    
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        // Initialize 3D logo if container exists
        const logoContainer = document.getElementById('logo-3d-container');
        if (logoContainer) {
            window.takkenBoost3DLogo = new TakkenBoost3DLogo('logo-3d-container');
        }
    }
});