// VOID IDE - Professional Renderer
console.log('VOID IDE initializing...');

let scene, camera, renderer;
let objects = [];
let currentPanel = 'level';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing VOID IDE...');
  init();
  setupTabs();
});

function init() {
  const canvas = document.getElementById('viewport');
  if (!canvas) return;
  
  const container = canvas.parentElement;
  
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d10);
  scene.fog = new THREE.Fog(0x0d0d10, 30, 150);
  
  // Camera
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(12, 8, 12);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  // Lights
  setupLights();
  
  // Environment
  createEnvironment();
  
  // Objects
  createObjects();
  
  // Controls
  setupControls(canvas);
  
  // Resize
  window.addEventListener('resize', onResize);
  
  // Start
  animate();
  
  log('VOID IDE initialized', 'success');
}

function setupTabs() {
  // Title tabs
  document.querySelectorAll('.title-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.title-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPanel = tab.dataset.panel;
      log(`Switched to ${currentPanel} panel`, 'success');
    });
  });
  
  // Sidebar buttons
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      log(`Mode: ${btn.dataset.mode}`, '');
    });
  });
  
  // Viewport buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Explorer items
  document.querySelectorAll('.explorer-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.explorer-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      const name = item.textContent.trim();
      log(`Selected: ${name}`, '');
    });
  });
}

function setupLights() {
  // Ambient
  const ambient = new THREE.AmbientLight(0x404050, 0.6);
  scene.add(ambient);
  
  // Hemisphere
  const hemi = new THREE.HemisphereLight(0x606080, 0x303040, 0.6);
  scene.add(hemi);
  
  // Main directional
  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(30, 50, 30);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 2048;
  dir.shadow.mapSize.height = 2048;
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 150;
  dir.shadow.camera.left = -30;
  dir.shadow.camera.right = 30;
  dir.shadow.camera.top = 30;
  dir.shadow.camera.bottom = -30;
  scene.add(dir);
  
  // Fill light
  const fill = new THREE.DirectionalLight(0x4080ff, 0.4);
  fill.position.set(-20, 10, -20);
  scene.add(fill);
}

function createEnvironment() {
  // Ground
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x18181f,
    roughness: 0.9,
    metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'Floor';
  scene.add(ground);
  
  // Grid
  const grid = new THREE.GridHelper(100, 50, 0x2a2a38, 0x1a1a25);
  grid.position.y = 0.01;
  scene.add(grid);
  
  // Sky
  const skyGeo = new THREE.SphereGeometry(200, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x0a0a12, side: THREE.BackSide });
  scene.add(new THREE.Mesh(skyGeo, skyMat));
}

function createObjects() {
  const mat1 = new THREE.MeshStandardMaterial({ color: 0x0074d9, roughness: 0.3, metalness: 0.7 });
  const mat2 = new THREE.MeshStandardMaterial({ color: 0x00b894, roughness: 0.3, metalness: 0.7 });
  const mat3 = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.3, metalness: 0.7 });
  const mat4 = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.3, metalness: 0.7 });
  
  // Cube
  const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mat1);
  cube.position.set(0, 1, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.name = 'Cube';
  scene.add(cube);
  objects.push(cube);
  
  // Sphere
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), mat2);
  sphere.position.set(5, 1, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.name = 'Sphere';
  scene.add(sphere);
  objects.push(sphere);
  
  // Cylinder
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3, 32), mat3);
  cyl.position.set(-5, 1.5, 0);
  cyl.castShadow = true;
  cyl.receiveShadow = true;
  cyl.name = 'Cylinder';
  scene.add(cyl);
  objects.push(cyl);
  
  // Cone
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 32), mat4);
  cone.position.set(0, 1.5, 5);
  cone.castShadow = true;
  cone.receiveShadow = true;
  cone.name = 'Cone';
  scene.add(cone);
  objects.push(cone);
}

function setupControls(canvas) {
  let isDragging = false;
  let prevX, prevY;
  let theta = Math.PI / 4;
  let phi = Math.PI / 4;
  let radius = 18;
  const target = new THREE.Vector3(0, 1, 0);
  
  function update() {
    camera.position.x = target.x + radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = target.y + radius * Math.cos(phi);
    camera.position.z = target.z + radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(target);
  }
  
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });
  
  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    theta -= (e.clientX - prevX) * 0.01;
    phi -= (e.clientY - prevY) * 0.01;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    prevX = e.clientX;
    prevY = e.clientY;
    update();
  });
  
  canvas.addEventListener('wheel', (e) => {
    radius += e.deltaY * 0.02;
    radius = Math.max(5, Math.min(50, radius));
    update();
    e.preventDefault();
  });
  
  update();
}

function onResize() {
  const container = document.querySelector('.viewport');
  if (!container || !camera || !renderer) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

let frameCount = 0;
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  
  // Slow rotation
  objects.forEach((obj, i) => {
    if (obj.name !== 'Floor') {
      obj.rotation.y += 0.002 * (i + 1);
    }
  });
  
  renderer.render(scene, camera);
  
  // FPS
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    document.querySelector('.status-right span:nth-child(2)').textContent = `${frameCount} FPS`;
    frameCount = 0;
    lastTime = now;
  }
}

function log(msg, type = '') {
  const content = document.querySelector('.bottom-content');
  if (!content) return;
  const div = document.createElement('div');
  div.className = `log${type ? ' log-' + type : ''}`;
  const time = new Date().toISOString().split('T')[1].slice(0, -1);
  div.textContent = `[${time}] ${msg}`;
  content.appendChild(div);
  content.scrollTop = content.scrollHeight;
}

// Selection
document.addEventListener('click', (e) => {
  if (e.target.closest('.outliner-item')) {
    document.querySelectorAll('.outliner-item').forEach(i => i.classList.remove('selected'));
    e.target.closest('.outliner-item').classList.add('selected');
  }
});

console.log('VOID IDE loaded');
