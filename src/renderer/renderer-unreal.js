// VOID IDE - Unreal Engine-Class Renderer
console.log('VOID IDE Unreal Renderer initializing...');

let scene, camera, renderer, controls;
let selectedObject = null;
let objects = [];
let currentEditor = 'level';

// Editor panels - hide/show based on mode
const editorPanels = {
  level: null,      // Main level editor - shows viewport
  material: null,   // Material editor panel
  blueprint: null,  // Blueprint editor panel  
  sequencer: null, // Sequencer timeline
  landscape: null  // Landscape editor
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing VOID IDE...');
  
  if (!window.THREE) {
    console.error('Three.js not loaded!');
    return;
  }
  
  console.log('Three.js version:', THREE.VERSION);
  
  initViewport();
  setupEditorTabs();
  setupEventListeners();
  log('VOID IDE initialized successfully', 'success');
});

function initViewport() {
  const canvas = document.getElementById('viewport');
  if (!canvas) {
    console.error('Viewport canvas not found!');
    return;
  }
  
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 50, 500);
  
  // Camera
  const container = canvas.parentElement;
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    console.log('WebGL renderer created successfully');
  } catch (e) {
    console.error('WebGL error:', e);
    return;
  }
  
  // Lighting - Unreal style
  setupLighting();
  
  // Environment
  createEnvironment();
  
  // Add demo objects
  createDemoObjects();
  
  // Orbit Controls
  setupOrbitControls(canvas);
  
  // Handle resize
  window.addEventListener('resize', onWindowResize);
  
  // Start render loop
  animate();
  
  console.log('VOID IDE viewport initialized');
}

function setupLighting() {
  // Ambient light - brighter
  const ambient = new THREE.AmbientLight(0x606080, 0.8);
  scene.add(ambient);
  
  // Directional light (sun) - brighter
  const directional = new THREE.DirectionalLight(0xffffff, 2);
  directional.position.set(50, 100, 50);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 500;
  directional.shadow.camera.left = -50;
  directional.shadow.camera.right = 50;
  directional.shadow.camera.top = 50;
  directional.shadow.camera.bottom = -50;
  scene.add(directional);
  
  // Hemisphere light for better ambient
  const hemi = new THREE.HemisphereLight(0xffffff, 0x606060, 0.8);
  scene.add(hemi);
}

function createEnvironment() {
  // Ground plane - lighter gray
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a35,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'Ground';
  scene.add(ground);
  objects.push(ground);
  
  // Grid helper - brighter
  const grid = new THREE.GridHelper(200, 100, 0x444455, 0x333344);
  grid.position.y = 0.01;
  scene.add(grid);
  
  // Sky sphere
  const skyGeo = new THREE.SphereGeometry(400, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a2e,
    side: THREE.BackSide
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}

function createDemoObjects() {
  // Cube - bright blue
  const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
  const cubeMat = new THREE.MeshStandardMaterial({ 
    color: 0x00aaff,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x002244,
    emissiveIntensity: 0.3
  });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.set(0, 1, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.name = 'Cube_01';
  cube.userData.type = 'StaticMesh';
  scene.add(cube);
  objects.push(cube);
  
  // Sphere - bright green
  const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ff88,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x002211,
    emissiveIntensity: 0.3
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(5, 1, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.name = 'Sphere_01';
  sphere.userData.type = 'StaticMesh';
  scene.add(sphere);
  objects.push(sphere);
  
  // Cylinder - bright red
  const cylGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
  const cylMat = new THREE.MeshStandardMaterial({ 
    color: 0xff4466,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x220011,
    emissiveIntensity: 0.3
  });
  const cylinder = new THREE.Mesh(cylGeo, cylMat);
  cylinder.position.set(-5, 1.5, 0);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  cylinder.name = 'Cylinder_01';
  cylinder.userData.type = 'StaticMesh';
  scene.add(cylinder);
  objects.push(cylinder);
  
  // Cone - bright yellow
  const coneGeo = new THREE.ConeGeometry(1.5, 3, 32);
  const coneMat = new THREE.MeshStandardMaterial({ 
    color: 0xffaa00,
    roughness: 0.2,
    metalness: 0.7,
    emissive: 0x221100,
    emissiveIntensity: 0.3
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(0, 1.5, 5);
  cone.castShadow = true;
  cone.receiveShadow = true;
  cone.name = 'Cone_01';
  cone.userData.type = 'StaticMesh';
  scene.add(cone);
  objects.push(cone);
  
  // Torus - purple
  const torusGeo = new THREE.TorusGeometry(1, 0.4, 16, 48);
  const torusMat = new THREE.MeshStandardMaterial({ 
    color: 0xaa44ff,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x110022,
    emissiveIntensity: 0.3
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(-5, 1.2, 5);
  torus.castShadow = true;
  torus.receiveShadow = true;
  torus.name = 'Torus_01';
  torus.userData.type = 'StaticMesh';
  scene.add(torus);
  objects.push(torus);
}

function setupOrbitControls(canvas) {
  // Simple orbit controls implementation
  let isMouseDown = false;
  let mouseX = 0, mouseY = 0;
  let theta = Math.PI / 4;
  let phi = Math.PI / 4;
  let radius = 20;
  
  const target = new THREE.Vector3(0, 0, 0);
  
  function updateCamera() {
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(target);
  }
  
  canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    
    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;
    
    theta -= deltaX * 0.01;
    phi -= deltaY * 0.01;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    
    updateCamera();
    
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  canvas.addEventListener('wheel', (e) => {
    radius += e.deltaY * 0.02;
    radius = Math.max(2, Math.min(100, radius));
    updateCamera();
    e.preventDefault();
  });
  
  updateCamera();
}

function onWindowResize() {
  const container = document.querySelector('.viewport-container');
  if (!container || !camera || !renderer) return;
  
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  // Rotate objects slightly for visual effect
  objects.forEach((obj, i) => {
    if (obj.name !== 'Ground') {
      // obj.rotation.y += 0.001 * (i + 1);
    }
  });
  
  renderer.render(scene, camera);
  
  // Update FPS counter
  updateStatus();
}

function setupEventListeners() {
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      log(`Switched to ${btn.title} mode`);
    });
  });
  
  // Asset selection
  document.querySelectorAll('.asset-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.asset-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
  
  // Outliner selection
  document.querySelectorAll('.outliner-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.outliner-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      
      // Update details panel
      const name = item.textContent.trim();
      updateDetailsPanel(name);
    });
  });
  
  // Viewport toolbar
  document.querySelectorAll('.viewport-toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viewport-toolbar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Toolbar buttons
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.title === 'Play') {
        log('Starting game...', 'info');
      } else if (btn.title === 'Stop') {
        log('Stopping game...', 'info');
      }
    });
  });
}

function updateDetailsPanel(objectName) {
  // Update transform values based on selection
  log(`Selected: ${objectName}`);
}

function log(message, type = 'info') {
  const consoleDiv = document.querySelector('.bottom-panel-content');
  if (!consoleDiv) return;
  
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const time = new Date().toISOString();
  const ms = time.split('.')[1].slice(0, 3);
  entry.textContent = `[${time.split('T')[0]}-${time.split('T')[1].split(':').join(':')}:${ms}] ${message}`;
  
  consoleDiv.appendChild(entry);
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

let frameCount = 0;
let lastTime = performance.now();

function updateStatus() {
  frameCount++;
  const now = performance.now();
  
  if (now - lastTime >= 1000) {
    const fps = frameCount;
    frameCount = 0;
    lastTime = now;
    
    const fpsEl = document.querySelector('.status-item:last-child');
    if (fpsEl) {
      fpsEl.textContent = `FPS: ${fps}`;
    }
  }
}

// Expose functions for external use
window.voidIDE = {
  scene,
  camera,
  renderer,
  addObject: (type) => {
    log(`Adding ${type}...`);
  },
  log,
  switchEditor
};

function switchEditor(editor) {
  currentEditor = editor;
  log(`Switching to ${editor} editor...`, 'info');
  
  // Update menu bar active state
  document.querySelectorAll('.menu-bar-item').forEach(item => {
    item.classList.remove('active');
    if (item.textContent.toLowerCase() === editor) {
      item.classList.add('active');
    }
  });
  
  // Show/hide panels based on editor mode
  const viewport = document.querySelector('.viewport-container');
  const leftPanel = document.querySelector('.left-panel');
  const rightPanel = document.querySelector('.right-panel');
  const bottomPanel = document.querySelector('.bottom-panel');
  
  // For now, just update status to show which editor is active
  const statusText = document.querySelector('.status-left .status-item:nth-child(3)');
  if (statusText) {
    const editorNames = {
      level: 'Level Editor',
      material: 'Material Editor',
      blueprint: 'Blueprint Editor',
      sequencer: 'Sequencer',
      landscape: 'Landscape'
    };
    statusText.textContent = `${editorNames[editor]} Active`;
  }
  
  log(`Editor: ${editor} mode`, 'success');
}

console.log('VOID IDE Unreal Renderer loaded');
