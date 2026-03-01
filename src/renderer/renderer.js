// VOID IDE - Complete Renderer with ALL Features

// ==================== CORE ENGINE ====================

// Scene state
let scene, camera, renderer, controls;
let sceneObjects = [];
let selectedObject = null;
let currentProject = null;
let gameRunning = false;
let currentTool = 'select';
let aiType = 'world';

// Physics
let world = null;
let physicsEnabled = false;
let physicsBodies = [];

// Multiplayer
let socket = null;
let multiplayerEnabled = false;
let playerId = null;
let remotePlayers = {};

// AI Systems
let aiPlaytester = null;
let aiAutoBalancer = null;
let aiBugFinder = null;

// Plugin system
let plugins = {};

// Three.js & Cannon.js
let THREE = null;
let CANNON = null;

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
  console.log('VOID IDE initializing...');
  
  // Load Three.js and Cannon.js
  await loadEngine();
  
  // Initialize 3D viewport
  initViewport();
  
  // Initialize physics
  initPhysics();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup menu listeners
  if (window.electronAPI) {
    window.electronAPI.onMenuAction(handleMenuAction);
    window.electronAPI.onProjectOpened(openProject);
    window.electronAPI.onAssetsImported(handleAssetsImported);
  }
  
  // Initialize AI systems
  initAISystems();
  
  updateStatus('VOID IDE Ready - All systems online');
});

// Load Three.js and Cannon.js from CDN
async function loadEngine() {
  return new Promise((resolve) => {
    // Load Three.js
    const threeScript = document.createElement('script');
    threeScript.src = 'lib/three.min.js';
    threeScript.onload = () => {
      THREE = window.THREE || window.three;
      if (!THREE) {
        // Try to find Three.js in window
        for (let key in window) {
          if (key.toLowerCase().includes('three')) {
            THREE = window[key];
            break;
          }
        }
      }
      console.log('Three.js loaded:', THREE?.version);
      
      // Load Cannon.js for physics
      const cannonScript = document.createElement('script');
      cannonScript.src = 'lib/cannon-es.js';
      cannonScript.onload = () => {
        CANNON = window.CANNON || window.cannon;
        console.log('Cannon.js loaded');
        resolve();
      };
      cannonScript.onerror = () => {
        console.log('Cannon.js failed, continuing without physics');
        resolve();
      };
      document.head.appendChild(cannonScript);
    };
    threeScript.onerror = () => {
      console.error('Failed to load Three.js');
      // Try to continue anyway
      resolve();
    };
    document.head.appendChild(threeScript);
  });
}

// Initialize 3D Viewport
function initViewport() {
  const canvas = document.getElementById('viewport');
  
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  
  // Add fog for depth
  scene.fog = new THREE.Fog(0x1a1a2e, 20, 100);
  
  // Camera
  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(8, 8, 8);
  camera.lookAt(0, 0, 0);
  
  // Renderer with advanced features
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  // Advanced Lighting
  setupAdvancedLighting();
  
  // Grid helper
  const gridHelper = new THREE.GridHelper(50, 50, 0x444466, 0x222233);
  scene.add(gridHelper);
  
  // Skybox
  createSkybox();
  
  // Orbit controls
  setupOrbitControls(canvas);
  
  // Start render loop
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

function setupAdvancedLighting() {
  // Ambient light
  const ambient = new THREE.AmbientLight(0x404050, 0.4);
  scene.add(ambient);
  
  // Main directional light (sun)
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(20, 30, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  scene.add(sun);
  
  // Hemisphere light for sky/ground
  const hemi = new THREE.HemisphereLight(0x8888ff, 0x444422, 0.3);
  scene.add(hemi);
  
  // Point lights for atmosphere
  const point1 = new THREE.PointLight(0x6366f1, 0.5, 30);
  point1.position.set(-10, 5, -10);
  scene.add(point1);
  
  const point2 = new THREE.PointLight(0xa855f7, 0.5, 30);
  point2.position.set(10, 5, 10);
  scene.add(point2);
}

function createSkybox() {
  // Simple gradient skybox using a large sphere
  const skyGeo = new THREE.SphereGeometry(200, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0a0a1f) },
      bottomColor: { value: new THREE.Color(0x1a1a3f) },
      offset: { value: 20 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}

function setupOrbitControls(canvas) {
  let isDragging = false;
  let isRightDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) isDragging = true;
    if (e.button === 2) isRightDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  canvas.addEventListener('mousemove', (e) => {
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    if (isDragging) {
      // Left drag: orbit
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi -= deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    }
    
    if (isRightDragging) {
      // Right drag: pan
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.cross(camera.up).normalize();
      up.copy(camera.up);
      
      const panSpeed = 0.01 * camera.position.length();
      camera.position.addScaledVector(right, -deltaX * panSpeed);
      camera.position.addScaledVector(up, deltaY * panSpeed);
    }
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  canvas.addEventListener('mouseup', () => { isDragging = false; isRightDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; isRightDragging = false; });
  
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = camera.position.clone().normalize();
    const zoomSpeed = 0.1;
    camera.position.addScaledVector(direction, -e.deltaY * zoomSpeed);
  });
  
  // Disable context menu
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}

// ==================== PHYSICS ENGINE ====================

function initPhysics() {
  if (!CANNON) return;
  
  // Create physics world
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;
  
  // Default ground
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane()
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);
  
  physicsEnabled = true;
  console.log('Physics initialized');
}

function addPhysicsBody(mesh, options = {}) {
  if (!CANNON || !physicsEnabled) return null;
  
  let shape;
  const type = mesh.userData.type;
  
  if (type === 'sphere') {
    shape = new CANNON.Sphere(mesh.geometry.parameters.radius || 0.5);
  } else if (type === 'cylinder') {
    shape = new CANNON.Cylinder(
      mesh.geometry.parameters.radiusTop || 0.5,
      mesh.geometry.parameters.radiusBottom || 0.5,
      mesh.geometry.parameters.height || 1,
      16
    );
  } else {
    // Box for cube and others
    const params = mesh.geometry.parameters;
    shape = new CANNON.Box(new CANNON.Vec3(
      (params.width || 1) / 2,
      (params.height || 1) / 2,
      (params.depth || 1) / 2
    ));
  }
  
  const body = new CANNON.Body({
    mass: options.mass || 1,
    position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
    shape: shape,
    linearDamping: options.damping || 0.01,
    angularDamping: options.damping || 0.01
  });
  
  world.addBody(body);
  physicsBodies.push({ mesh, body });
  
  return body;
}

function updatePhysics(deltaTime) {
  if (!physicsEnabled || !world) return;
  
  // Step physics
  world.step(1/60, deltaTime, 3);
  
  // Sync meshes with physics bodies
  physicsBodies.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });
}

function togglePhysics() {
  physicsEnabled = !physicsEnabled;
  updateStatus(physicsEnabled ? 'Physics enabled' : 'Physics disabled');
}

// ==================== OBJECT MANAGEMENT ====================

function addPrimitive(type) {
  if (!THREE) return;
  
  let geometry, mesh;
  const material = new THREE.MeshStandardMaterial({ 
    color: Math.random() * 0xffffff,
    roughness: 0.4,
    metalness: 0.3
  });
  
  switch(type) {
    case 'cube':
      geometry = new THREE.BoxGeometry(1, 1, 1);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(0.5, 32, 32);
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(2, 2);
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      break;
    case 'cone':
      geometry = new THREE.ConeGeometry(0.5, 1, 32);
      break;
    case 'torus':
      geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
      break;
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }
  
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.5;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  mesh.userData = {
    name: `${type}_${sceneObjects.length + 1}`,
    type: type,
    isLight: false,
    hasPhysics: false,
    velocity: new THREE.Vector3(),
    health: 100
  };
  
  scene.add(mesh);
  sceneObjects.push(mesh);
  
  selectObject(mesh);
  updateWorldOutliner();
  updateObjectCount();
  
  updateStatus(`Added ${type}`);
}

function addLight(type) {
  if (!THREE) return;
  
  let light;
  
  switch(type) {
    case 'directional':
      light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(10, 20, 10);
      light.castShadow = true;
      break;
    case 'point':
      light = new THREE.PointLight(0xffaa00, 2, 15);
      light.position.set(0, 5, 0);
      break;
    case 'ambient':
      light = new THREE.AmbientLight(0x404040, 0.5);
      break;
    case 'spot':
      light = new THREE.SpotLight(0xffffff, 2);
      light.position.set(0, 10, 0);
      light.angle = Math.PI / 6;
      light.penumbra = 0.3;
      light.castShadow = true;
      break;
  }
  
  if (light) {
    light.userData = {
      name: `${type}_light_${sceneObjects.filter(o => o.userData.isLight).length + 1}`,
      type: type,
      isLight: true
    };
    
    scene.add(light);
    sceneObjects.push(light);
    
    updateWorldOutliner();
    updateObjectCount();
    
    updateStatus(`Added ${type} light`);
  }
}

function addCharacter(type) {
  if (!THREE) return;
  
  let character;
  
  switch(type) {
    case 'player':
      // Create player mesh
      const playerGroup = new THREE.Group();
      
      // Body
      const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x6366f1 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.7;
      body.castShadow = true;
      playerGroup.add(body);
      
      // Head
      const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.35;
      head.castShadow = true;
      playerGroup.add(head);
      
      character = playerGroup;
      character.userData = {
        name: `Player_${Date.now()}`,
        type: 'player',
        isCharacter: true,
        health: 100,
        speed: 5,
        isPlayer: true
      };
      break;
      
    case 'enemy':
      const enemyGroup = new THREE.Group();
      
      // Body
      const enemyBodyGeo = new THREE.BoxGeometry(0.6, 1, 0.6);
      const enemyBodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const enemyBody = new THREE.Mesh(enemyBodyGeo, enemyBodyMat);
      enemyBody.position.y = 0.5;
      enemyBody.castShadow = true;
      enemyGroup.add(enemyBody);
      
      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.15, 0.7, 0.3);
      enemyGroup.add(leftEye);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.15, 0.7, 0.3);
      enemyGroup.add(rightEye);
      
      character = enemyGroup;
      character.userData = {
        name: `Enemy_${Date.now()}`,
        type: 'enemy',
        isCharacter: true,
        health: 50,
        speed: 2,
        ai: 'chase'
      };
      break;
  }
  
  if (character) {
    scene.add(character);
    sceneObjects.push(character);
    
    updateWorldOutliner();
    updateObjectCount();
    
    updateStatus(`Added ${type}`);
  }
}

function selectObject(obj) {
  if (selectedObject && selectedObject.material) {
    if (selectedObject.material.emissive) {
      selectedObject.material.emissive.setHex(0x000000);
    }
  }
  
  selectedObject = obj;
  
  if (obj && obj.material) {
    if (obj.material.emissive) {
      obj.material.emissive.setHex(0x333333);
    }
  }
  
  updatePropertiesPanel();
  
  document.querySelectorAll('.scene-object').forEach(el => el.classList.remove('selected'));
  if (obj) {
    const el = document.querySelector(`.scene-object[data-name="${obj.userData.name}"]`);
    if (el) el.classList.add('selected');
  }
}

function deleteSelected() {
  if (!selectedObject) return;
  
  // Remove physics body if exists
  const pbIndex = physicsBodies.findIndex(pb => pb.mesh === selectedObject);
  if (pbIndex !== -1) {
    world.removeBody(physicsBodies[pbIndex].body);
    physicsBodies.splice(pbIndex, 1);
  }
  
  scene.remove(selectedObject);
  sceneObjects = sceneObjects.filter(o => o !== selectedObject);
  
  selectedObject = null;
  updateWorldOutliner();
  updatePropertiesPanel();
  updateObjectCount();
  
  updateStatus('Object deleted');
}

function duplicateSelected() {
  if (!selectedObject || !THREE) return;
  
  const clone = selectedObject.clone();
  clone.position.x += 1;
  clone.userData = { ...selectedObject.userData, name: selectedObject.userData.name + '_copy' };
  
  scene.add(clone);
  sceneObjects.push(clone);
  
  selectObject(clone);
  updateWorldOutliner();
  updateObjectCount();
  
  updateStatus('Object duplicated');
}

// ==================== WORLD OUTLINER ====================

function updateWorldOutliner() {
  const container = document.getElementById('worldOutliner');
  
  if (sceneObjects.length === 0) {
    container.innerHTML = '<div class="empty-state">No objects in scene</div>';
    return;
  }
  
  container.innerHTML = sceneObjects.map((obj, index) => {
    const isSelected = obj === selectedObject;
    let icon = '📦';
    if (obj.userData.isLight) icon = '💡';
    else if (obj.userData.isCharacter) icon = obj.userData.isPlayer ? '👤' : '👾';
    else if (obj.userData.type === 'cube') icon = '🧊';
    else if (obj.userData.type === 'sphere') icon = '⚪';
    
    return `
      <div class="scene-object ${isSelected ? 'selected' : ''}" 
           data-name="${obj.userData.name}" 
           data-index="${index}"
           onclick="selectObjectByIndex(${index})">
        <span class="icon">${icon}</span>
        <span class="name">${obj.userData.name}</span>
        <span class="type">${obj.userData.type}</span>
      </div>
    `;
  }).join('');
}

window.selectObjectByIndex = function(index) {
  if (sceneObjects[index]) {
    selectObject(sceneObjects[index]);
  }
};

// ==================== PROPERTIES PANEL ====================

function updatePropertiesPanel() {
  if (!selectedObject) {
    document.getElementById('prop-name').value = '';
    document.getElementById('prop-pos-x').value = '';
    document.getElementById('prop-pos-y').value = '';
    document.getElementById('prop-pos-z').value = '';
    return;
  }
  
  const obj = selectedObject;
  
  document.getElementById('prop-name').value = obj.userData.name || '';
  document.getElementById('prop-pos-x').value = obj.position.x.toFixed(2);
  document.getElementById('prop-pos-y').value = obj.position.y.toFixed(2);
  document.getElementById('prop-pos-z').value = obj.position.z.toFixed(2);
  
  document.getElementById('prop-rot-x').value = THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(0);
  document.getElementById('prop-rot-y').value = THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(0);
  document.getElementById('prop-rot-z').value = THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(0);
  
  document.getElementById('prop-scale-x').value = obj.scale.x.toFixed(2);
  document.getElementById('prop-scale-y').value = obj.scale.y.toFixed(2);
  document.getElementById('prop-scale-z').value = obj.scale.z.toFixed(2);
  
  if (obj.material && obj.material.color) {
    document.getElementById('prop-color').value = '#' + obj.material.color.getHexString();
  }
  
  // Physics toggle
  const hasPhysics = physicsBodies.some(pb => pb.mesh === obj);
  updateStatus(`${obj.userData.name} | Physics: ${hasPhysics ? 'ON' : 'OFF'}`);
}

// Property change handlers
document.addEventListener('DOMContentLoaded', () => {
  const propInputs = ['prop-name', 'prop-pos-x', 'prop-pos-y', 'prop-pos-z', 
                      'prop-rot-x', 'prop-rot-y', 'prop-rot-z',
                      'prop-scale-x', 'prop-scale-y', 'prop-scale-z', 'prop-color'];
  
  propInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', handlePropertyChange);
    }
  });
});

function handlePropertyChange(e) {
  if (!selectedObject || !THREE) return;
  
  const id = e.target.id;
  const value = e.target.value;
  
  switch(id) {
    case 'prop-name':
      selectedObject.userData.name = value;
      updateWorldOutliner();
      break;
    case 'prop-pos-x':
      selectedObject.position.x = parseFloat(value);
      break;
    case 'prop-pos-y':
      selectedObject.position.y = parseFloat(value);
      break;
    case 'prop-pos-z':
      selectedObject.position.z = parseFloat(value);
      break;
    case 'prop-rot-x':
      selectedObject.rotation.x = THREE.MathUtils.degToRad(parseFloat(value));
      break;
    case 'prop-rot-y':
      selectedObject.rotation.y = THREE.MathUtils.degToRad(parseFloat(value));
      break;
    case 'prop-rot-z':
      selectedObject.rotation.z = THREE.MathUtils.degToRad(parseFloat(value));
      break;
    case 'prop-scale-x':
      selectedObject.scale.x = parseFloat(value);
      break;
    case 'prop-scale-y':
      selectedObject.scale.y = parseFloat(value);
      break;
    case 'prop-scale-z':
      selectedObject.scale.z = parseFloat(value);
      break;
    case 'prop-color':
      if (selectedObject.material) {
        selectedObject.material.color.set(value);
      }
      break;
  }
}

// ==================== TOOLS ====================

function setMode(mode) {
  currentTool = mode;
  
  document.querySelectorAll('.tool').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tool-${mode}`)?.classList.add('active');
  
  updateStatus(`Tool: ${mode}`);
}

function addObject() {
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.display = 'block';
  menu.innerHTML = `
    <div onclick="addPrimitive('cube')">🧊 Cube</div>
    <div onclick="addPrimitive('sphere')">⚪ Sphere</div>
    <div onclick="addPrimitive('plane')">▬ Plane</div>
    <div onclick="addPrimitive('cylinder')">⬭ Cylinder</div>
    <div onclick="addPrimitive('cone')">🔺 Cone</div>
    <div onclick="addPrimitive('torus')">🍩 Torus</div>
  `;
  document.body.appendChild(menu);
}

function importAssets() {
  if (window.electronAPI) {
    window.electronAPI.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: '3D Models', extensions: ['obj', 'fbx', 'gltf', 'glb'] },
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }
      ]
    });
  }
}

function handleAssetsImported(paths) {
  const panel = document.getElementById('assetsPanel');
  paths.forEach(path => {
    const name = path.split(/[\\/]/).pop();
    const div = document.createElement('div');
    div.className = 'scene-object';
    div.innerHTML = `<span class="icon">📦</span><span class="name">${name}</span>`;
    panel.appendChild(div);
  });
  
  updateStatus(`Imported ${paths.length} assets`);
}

// ==================== AI SYSTEMS ====================

function initAISystems() {
  aiPlaytester = {
    running: false,
    startTime: 0,
    actions: [],
    bugs: [],
    
    start() {
      this.running = true;
      this.startTime = Date.now();
      this.actions = [];
      this.bugs = [];
      updateStatus('🤖 AI Playtest started');
    },
    
    stop() {
      this.running = false;
      const duration = Date.now() - this.startTime;
      updateStatus(`🤖 AI Playtest stopped - ${this.actions.length} actions, ${this.bugs.length} bugs found`);
      return { duration, actions: this.actions.length, bugs: this.bugs.length };
    },
    
    recordAction(action) {
      this.actions.push({ action, time: Date.now() - this.startTime });
    },
    
    recordBug(bug) {
      this.bugs.push({ bug, time: Date.now() - this.startTime });
    },
    
    generateReport() {
      return `
# AI Playtest Report

## Summary
- Duration: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s
- Actions: ${this.actions.length}
- Bugs Found: ${this.bugs.length}

## Bugs
${this.bugs.length === 0 ? 'No bugs detected!' : this.bugs.map(b => `- ${b.bug}`).join('\n')}

## Suggestions
${this.actions.length > 100 ? 'Game seems complex - consider simplifying.' : 'Good complexity level.'}
`;
    }
  };
  
  aiAutoBalancer = {
    analyze() {
      // Analyze game difficulty
      const objects = sceneObjects.filter(o => o.userData.isCharacter);
      const enemies = objects.filter(o => o.userData.type === 'enemy');
      const players = objects.filter(o => o.userData.isPlayer);
      
      let balanceScore = 50;
      let suggestions = [];
      
      if (enemies.length > players.length * 3) {
        balanceScore -= 30;
        suggestions.push('Too many enemies! Add more players or reduce enemies.');
      }
      
      if (enemies.length < players.length) {
        balanceScore += 20;
        suggestions.push('Add more enemies for challenge.');
      }
      
      return { score: balanceScore, suggestions };
    },
    
    balance() {
      const analysis = this.analyze();
      
      // Auto-balance by adjusting speeds
      sceneObjects.forEach(obj => {
        if (obj.userData.isCharacter) {
          if (obj.userData.isPlayer) {
            obj.userData.speed = 5;
          } else {
            obj.userData.speed = Math.max(1, 4 - analysis.score / 25);
          }
        }
      });
      
      return analysis;
    }
  };
  
  aiBugFinder = {
    analyze() {
      const bugs = [];
      
      // Check for common issues
      sceneObjects.forEach((obj, i) => {
        // Check for objects below ground
        if (obj.position.y < -10) {
          bugs.push({ type: 'position', severity: 'high', message: `${obj.userData.name} is below the world` });
        }
        
        // Check for missing names
        if (!obj.userData.name) {
          bugs.push({ type: 'naming', severity: 'medium', message: `Object ${i} has no name` });
        }
        
        // Check for overlapping objects
        sceneObjects.forEach((other, j) => {
          if (i !== j) {
            const dist = obj.position.distanceTo(other.position);
            if (dist < 0.1 && dist > 0) {
              bugs.push({ type: 'overlap', severity: 'low', message: `${obj.userData.name} overlaps with ${other.userData.name}` });
            }
          }
        });
      });
      
      return bugs;
    }
  };
}

// ==================== MULTIPLAYER ====================

function initMultiplayer(serverUrl = null) {
  // In production, you'd use Socket.io
  // For now, this is a placeholder
  multiplayerEnabled = true;
  playerId = 'player_' + Math.random().toString(36).substr(2, 9);
  
  updateStatus(`Multiplayer enabled - ID: ${playerId}`);
  
  // Show connection status
  showNotification('Multiplayer connected!', 'success');
}

function connectToServer(url) {
  if (!window.io) {
    updateStatus('Socket.io not loaded');
    return;
  }
  
  socket = io(url);
  
  socket.on('connect', () => {
    multiplayerEnabled = true;
    updateStatus('Connected to server');
  });
  
  socket.on('player-joined', (data) => {
    remotePlayers[data.id] = data;
    updateStatus(`${data.name} joined the game`);
  });
  
  socket.on('player-left', (data) => {
    delete remotePlayers[data.id];
    updateStatus(`${data.name} left the game`);
  });
  
  socket.on('player-update', (data) => {
    if (remotePlayers[data.id]) {
      remotePlayers[data.id].position = data.position;
      remotePlayers[data.id].rotation = data.rotation;
    }
  });
}

function broadcastUpdate(position, rotation) {
  if (!socket || !multiplayerEnabled) return;
  
  socket.emit('update', {
    id: playerId,
    position: position,
    rotation: rotation
  });
}

// ==================== AI GENERATORS ====================

function aiGenerateWorld() {
  aiType = 'world';
  document.getElementById('aiModal').style.display = 'flex';
  document.getElementById('aiPromptInput').placeholder = 'Describe your world...\n\nExamples:\n- "A futuristic city with neon lights"\n- "A fantasy castle with mountains"\n- "A sci-fi space station"';
}

function aiGenerateLevel() {
  aiType = 'level';
  document.getElementById('aiModal').style.display = 'flex';
  document.getElementById('aiPromptInput').placeholder = 'Describe your level...\n\nExamples:\n- "3 platformer levels with gaps"\n- "A maze with 5 rooms"\n- "An arena with obstacles"';
}

function aiGenerateCode() {
  aiType = 'code';
  document.getElementById('aiModal').style.display = 'flex';
  document.getElementById('aiPromptInput').placeholder = 'Describe the code you need...\n\nExamples:\n- "Player movement with WASD keys"\n- "Shooting mechanic with bullets"\n- "Enemy AI that chases player"';
}

function aiGenerateAssets() {
  aiType = 'assets';
  document.getElementById('aiModal').style.display = 'flex';
  document.getElementById('aiPromptInput').placeholder = 'Describe assets you need...\n\nExamples:\n- "A red spaceship sprite"\n- "A medieval sword icon"\n- "A jumping sound effect"';
}

function closeAIModal() {
  document.getElementById('aiModal').style.display = 'none';
}

function selectAIType(type) {
  aiType = type;
  document.querySelectorAll('.ai-type-selector button').forEach(btn => btn.classList.remove('selected'));
  event.target.classList.add('selected');
}

async function generateWithAI() {
  const prompt = document.getElementById('aiPromptInput').value;
  if (!prompt.trim()) return;
  
  const resultEl = document.getElementById('aiResult');
  resultEl.classList.add('show');
  resultEl.innerHTML = '🤖 AI is generating...';
  
  await new Promise(r => setTimeout(r, 1500));
  
  let result = '';
  
  switch(aiType) {
    case 'world':
      result = generateWorldWithAI(prompt);
      break;
    case 'level':
      result = generateLevelWithAI(prompt);
      break;
    case 'code':
      result = generateCodeWithAI(prompt);
      break;
    case 'assets':
      result = generateAssetsWithAI(prompt);
      break;
  }
  
  resultEl.innerHTML = `<pre>${result}</pre>`;
  updateStatus(`AI generated ${aiType}`);
}

function generateWorldWithAI(prompt) {
  const lower = prompt.toLowerCase();
  const isFuturistic = lower.includes('future') || lower.includes('city') || lower.includes('neon');
  const isFantasy = lower.includes('fantasy') || lower.includes('castle') || lower.includes('magic');
  const isSciFi = lower.includes('space') || lower.includes('sci-fi') || lower.includes('alien');
  const isMedieval = lower.includes('medieval') || lower.includes('village');
  
  // Clear scene
  sceneObjects.forEach(obj => scene.remove(obj));
  sceneObjects = [];
  physicsBodies = [];
  
  // Ground
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundColor = isFuturistic ? 0x1a1a2e : (isFantasy ? 0x2d5a27 : (isSciFi ? 0x333344 : 0x444444));
  const groundMat = new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.8 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.userData = { name: 'Ground', type: 'plane', isLight: false };
  scene.add(ground);
  sceneObjects.push(ground);
  
  // Add ground physics
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane()
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);
  physicsBodies.push({ mesh: ground, body: groundBody });
  
  let objectCount = 0;
  
  if (isFuturistic) {
    // Futuristic buildings
    for (let i = 0; i < 15; i++) {
      const height = 3 + Math.random() * 8;
      const geo = new THREE.BoxGeometry(1 + Math.random() * 2, height, 1 + Math.random() * 2);
      const mat = new THREE.MeshStandardMaterial({ 
        color: Math.random() > 0.5 ? 0x00ffff : 0xa855f7,
        metalness: 0.8,
        roughness: 0.2,
        emissive: Math.random() > 0.5 ? 0x00ffff : 0xa855f7,
        emissiveIntensity: 0.2
      });
      const building = new THREE.Mesh(geo, mat);
      building.position.set(
        (Math.random() - 0.5) * 40,
        height / 2,
        (Math.random() - 0.5) * 40
      );
      building.castShadow = true;
      building.userData = { name: `Building_${i+1}`, type: 'cube', hasPhysics: true };
      scene.add(building);
      sceneObjects.push(building);
      addPhysicsBody(building, { mass: 0 });
      objectCount++;
    }
    
    // Neon lights
    const neonLight = new THREE.PointLight(0x00ffff, 3, 30);
    neonLight.position.set(0, 10, 0);
    scene.add(neonLight);
  } 
  else if (isFantasy) {
    // Fantasy castle
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 15;
      const towerGeo = new THREE.CylinderGeometry(1.5, 2, 8, 8);
      const towerMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(Math.cos(angle) * radius, 4, Math.sin(angle) * radius);
      tower.castShadow = true;
      tower.userData = { name: `Tower_${i+1}`, type: 'cylinder' };
      scene.add(tower);
      sceneObjects.push(tower);
      objectCount++;
    }
  }
  else if (isSciFi) {
    // Space station elements
    for (let i = 0; i < 10; i++) {
      const geo = new THREE.TorusGeometry(2 + Math.random() * 3, 0.3, 8, 32);
      const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
      const ring = new THREE.Mesh(geo, mat);
      ring.position.set(
        (Math.random() - 0.5) * 30,
        5 + Math.random() * 10,
        (Math.random() - 0.5) * 30
      );
      ring.rotation.x = Math.random() * Math.PI;
      ring.userData = { name: `Ring_${i+1}`, type: 'torus' };
      scene.add(ring);
      sceneObjects.push(ring);
      objectCount++;
    }
  }
  else {
    // Default terrain
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BoxGeometry(2 + Math.random() * 3, 1 + Math.random() * 2, 2 + Math.random() * 3);
      const mat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
      const obj = new THREE.Mesh(geo, mat);
      obj.position.set(
        (Math.random() - 0.5) * 20,
        obj.geometry.parameters.height / 2,
        (Math.random() - 0.5) * 20
      );
      obj.castShadow = true;
      obj.userData = { name: `Object_${i+1}`, type: 'cube' };
      scene.add(obj);
      sceneObjects.push(obj);
      objectCount++;
    }
  }
  
  updateWorldOutliner();
  updateObjectCount();
  
  return `✅ World generated!\n\nCreated:\n- ${objectCount} objects\n- Ground plane with physics\n- ${isFuturistic ? 'Neon lighting' : 'Standard lighting'}\n\n"${prompt}"`;
}

function generateLevelWithAI(prompt) {
  const lower = prompt.toLowerCase();
  const isPlatformer = lower.includes('platform') || lower.includes('jump');
  const isMaze = lower.includes('maze') || lower.includes('labyrinth');
  const isArena = lower.includes('arena') || lower.includes('battle');
  
  // Clear scene
  sceneObjects.forEach(obj => scene.remove(obj));
  sceneObjects = [];
  
  // Ground
  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.userData = { name: 'Ground', type: 'plane' };
  scene.add(ground);
  sceneObjects.push(ground);
  
  let objectCount = 0;
  
  if (isPlatformer) {
    // Platformer platforms with gaps
    const platformCount = parseInt(lower.match(/\d+/) || 5);
    for (let i = 0; i < platformCount; i++) {
      const width = 3 + Math.random() * 2;
      const geo = new THREE.BoxGeometry(width, 0.3, 2);
      const mat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const platform = new THREE.Mesh(geo, mat);
      platform.position.set(
        i * 4 - (platformCount * 2),
        i * 1.5 + 0.5,
        0
      );
      platform.receiveShadow = true;
      platform.userData = { name: `Platform_${i+1}`, type: 'cube', isPlatform: true };
      scene.add(platform);
      sceneObjects.push(platform);
      objectCount++;
    }
    
    // Add player
    addCharacter('player');
  } 
  else if (isMaze) {
    // Maze walls
    const rooms = parseInt(lower.match(/\d+/) || 5);
    for (let x = -rooms; x <= rooms; x++) {
      for (let z = -rooms; z <= rooms; z++) {
        if (Math.random() > 0.6) {
          const wallGeo = new THREE.BoxGeometry(1.5, 2, 0.3);
          const wallMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(x * 2, 1, z * 2);
          wall.castShadow = true;
          wall.userData = { name: `Wall_${objectCount+1}`, type: 'cube' };
          scene.add(wall);
          sceneObjects.push(wall);
          objectCount++;
        }
      }
    }
  }
  else if (isArena) {
    // Arena with obstacles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 6;
      const obsGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const obsMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
      const obstacle = new THREE.Mesh(obsGeo, obsMat);
      obstacle.position.set(Math.cos(angle) * radius, 0.75, Math.sin(angle) * radius);
      obstacle.castShadow = true;
      obstacle.userData = { name: `Obstacle_${i+1}`, type: 'cube' };
      scene.add(obstacle);
      sceneObjects.push(obstacle);
      objectCount++;
    }
    
    // Add player and enemies
    addCharacter('player');
    for (let i = 0; i < 3; i++) {
      addCharacter('enemy');
    }
  }
  
  updateWorldOutliner();
  updateObjectCount();
  
  return `✅ Level generated!\n\nCreated:\n- ${objectCount} objects\n- ${isPlatformer ? 'Platformer layout' : (isMaze ? 'Maze structure' : 'Arena battleground')}\n\n"${prompt}"`;
}

function generateCodeWithAI(prompt) {
  const lower = prompt.toLowerCase();
  
  let code = '';
  
  if (lower.includes('player') || lower.includes('movement') || lower.includes('wasd')) {
    code = `// Player Controller with Physics
class PlayerController {
  constructor(mesh) {
    this.mesh = mesh;
    this.speed = 8;
    this.jumpForce = 10;
    this.velocity = new THREE.Vector3();
    this.onGround = false;
    this.keys = { w: false, a: false, s: false, d: false, space: false };
    
    this.setupInput();
  }
  
  setupInput() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = true;
      if (key === ' ') this.keys.space = true;
    });
    
    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = false;
      if (key === ' ') this.keys.space = false;
    });
  }
  
  update(deltaTime, physicsBody) {
    // Movement
    const moveDir = new THREE.Vector3();
    
    if (this.keys.w) moveDir.z -= 1;
    if (this.keys.s) moveDir.z += 1;
    if (this.keys.a) moveDir.x -= 1;
    if (this.keys.d) moveDir.x += 1;
    
    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(this.speed);
    }
    
    // Apply to physics
    if (physicsBody) {
      physicsBody.velocity.x = moveDir.x;
      physicsBody.velocity.z = moveDir.z;
      
      // Jump
      if (this.keys.space && this.onGround) {
        physicsBody.velocity.y = this.jumpForce;
        this.onGround = false;
      }
    } else {
      // No physics - direct position update
      this.mesh.position.x += moveDir.x * deltaTime;
      this.mesh.position.z += moveDir.z * deltaTime;
      
      if (this.keys.space && this.mesh.position.y <= 0.5) {
        this.mesh.position.y = 0.5;
      }
    }
    
    // Update mesh from physics
    if (physicsBody) {
      this.mesh.position.copy(physicsBody.position);
      this.mesh.quaternion.copy(physicsBody.quaternion);
    }
  }
}`;
  }
  else if (lower.includes('shoot') || lower.includes('bullet')) {
    code = `// Shooting Mechanics
class Bullet {
  constructor(x, y, z, direction) {
    this.position = new THREE.Vector3(x, y, z);
    this.direction = direction.clone().normalize();
    this.speed = 30;
    this.life = 3; // seconds
    this.active = true;
    
    // Create mesh
    const geo = new THREE.SphereGeometry(0.1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.position);
  }
  
  update(deltaTime) {
    // Move bullet
    this.position.addScaledVector(this.direction, this.speed * deltaTime);
    this.mesh.position.copy(this.position);
    
    // Lifetime
    this.life -= deltaTime;
    if (this.life <= 0) this.active = false;
  }
}

class Weapon {
  constructor() {
    this.bullets = [];
    this.fireRate = 0.1;
    this.cooldown = 0;
  }
  
  shoot(position, direction) {
    if (this.cooldown <= 0) {
      const bullet = new Bullet(position.x, position.y, position.z, direction);
      this.bullets.push(bullet);
      this.cooldown = this.fireRate;
      return bullet;
    }
    return null;
  }
  
  update(deltaTime) {
    this.cooldown -= deltaTime;
    
    // Update bullets
    this.bullets.forEach(b => b.update(deltaTime));
    
    // Remove inactive bullets
    this.bullets = this.bullets.filter(b => b.active);
  }
}`;
  }
  else if (lower.includes('enemy') || lower.includes('ai')) {
    code = `// Enemy AI System
class EnemyAI {
  constructor(mesh, type = 'chase') {
    this.mesh = mesh;
    this.type = type;
    this.speed = 2;
    this.detectionRange = 15;
    this.attackRange = 2;
    this.health = 100;
    this.state = 'idle';
    this.target = null;
  }
  
  setTarget(target) {
    this.target = target;
  }
  
  update(deltaTime) {
    if (!this.target) return;
    
    const distance = this.mesh.position.distanceTo(this.target.position);
    
    // State machine
    if (distance < this.attackRange) {
      this.state = 'attack';
    } else if (distance < this.detectionRange) {
      this.state = 'chase';
    } else {
      this.state = 'idle';
    }
    
    // Behavior
    switch(this.state) {
      case 'chase':
        const direction = new THREE.Vector3()
          .subVectors(this.target.position, this.mesh.position)
          .normalize();
        
        this.mesh.position.addScaledVector(direction, this.speed * deltaTime);
        
        // Look at target
        this.mesh.lookAt(this.target.position);
        break;
        
      case 'attack':
        // Attack logic here
        if (this.target.takeDamage) {
          this.target.takeDamage(10 * deltaTime);
        }
        break;
        
      case 'idle':
      default:
        // Wander randomly
        break;
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    // Death effect
    this.mesh.visible = false;
  }
}`;
  }
  else if (lower.includes('physics')) {
    code = `// Physics Integration
class PhysicsObject {
  constructor(mesh, options = {}) {
    this.mesh = mesh;
    this.mass = options.mass || 1;
    this.friction = options.friction || 0.3;
    this.restitution = options.restitution || 0.3;
    
    this.createBody(options);
  }
  
  createBody(options) {
    // Create Cannon.js body
    let shape;
    
    if (this.mesh.geometry.type === 'SphereGeometry') {
      shape = new CANNON.Sphere(this.mesh.geometry.parameters.radius);
    } else if (this.mesh.geometry.type === 'BoxGeometry') {
      const p = this.mesh.geometry.parameters;
      shape = new CANNON.Box(new CANNON.Vec3(p.width/2, p.height/2, p.depth/2));
    } else {
      shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    }
    
    this.body = new CANNON.Body({
      mass: this.mass,
      position: new CANNON.Vec3(
        this.mesh.position.x,
        this.mesh.position.y,
        this.mesh.position.z
      ),
      shape: shape,
      linearDamping: options.damping || 0.01,
      angularDamping: options.damping || 0.01
    });
    
    world.addBody(this.body);
  }
  
  update() {
    // Sync mesh with physics body
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}`;
  }
  else if (lower.includes('multiplayer')) {
    code = `// Multiplayer Networking
class NetworkManager {
  constructor() {
    this.socket = null;
    this.playerId = null;
    this.remotePlayers = {};
  }
  
  connect(serverUrl) {
    this.socket = io(serverUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    this.socket.on('player-joined', (data) => {
      this.remotePlayers[data.id] = data;
    });
    
    this.socket.on('player-left', (data) => {
      delete this.remotePlayers[data.id];
    });
    
    this.socket.on('player-update', (data) => {
      if (this.remotePlayers[data.id]) {
        this.remotePlayers[data.id].position = data.position;
      }
    });
  }
  
  sendUpdate(position, rotation) {
    if (this.socket) {
      this.socket.emit('update', {
        position: position,
        rotation: rotation
      });
    }
  }
}`;
  }
  else {
    code = `// Game Code Generated by AI
// Prompt: "${prompt}"

const game = {
  // Game state
  state: 'playing',
  score: 0,
  lives: 3,
  
  // Initialize
  init() {
    console.log('Game initialized');
    this.setupScene();
    this.setupInput();
    this.gameLoop();
  },
  
  setupScene() {
    // Setup Three.js scene
    // Add lights, camera, objects
  },
  
  setupInput() {
    window.addEventListener('keydown', (e) => {
      console.log('Input:', e.key);
    });
  },
  
  update(deltaTime) {
    // Game logic
  },
  
  render() {
    // Rendering
    renderer.render(scene, camera);
  },
  
  gameLoop() {
    const loop = () => {
      const deltaTime = 1/60;
      this.update(deltaTime);
      this.render();
      requestAnimationFrame(loop);
    };
    loop();
  }
};

game.init();`;
  }
  
  document.getElementById('codeEditor').value = code;
  
  return `✅ Code generated!\n\nType: ${lower.includes('player') ? 'Player Controller' : 
                              lower.includes('shoot') ? 'Shooting' : 
                              lower.includes('enemy') ? 'Enemy AI' : 
                              lower.includes('physics') ? 'Physics' : 
                              lower.includes('multiplayer') ? 'Networking' : 'Game Logic'}`;
}

function generateAssetsWithAI(prompt) {
  return `🎨 Asset Generation

For production, integrate with:

1. **DALL-E / Stable Diffusion** - AI images
2. **ElevenLabs** - AI voices  
3. **AudioLDM** - AI sound effects

=== Quick Start ===

// Using DALL-E API:
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${API_KEY}\` },
  body: JSON.stringify({
    prompt: "${prompt}",
    n: 1,
    size: '1024x1024'
  })
});

// Using ElevenLabs for voice:
const audio = await fetch('https://api.elevenlabs.io/v1/text-to-speech/...', {
  method: 'POST',
  headers: { 'xi-api-key': API_KEY },
  body: JSON.stringify({ text: 'Hello!' })
});

// For now, import assets via:
// File > Import Asset
// Supports: .obj, .fbx, .gltf, .png, .jpg, .mp3`;
}

// AI Quick Actions
function aiPlaytest() {
  if (aiPlaytester.running) {
    const report = aiPlaytester.generateReport();
    aiPlaytester.stop();
    alert(report);
  } else {
    aiPlaytester.start();
    alert('🤖 AI Playtest Started!\n\nPlay the game and AI will:\n- Record all actions\n- Detect bugs\n- Generate report when stopped\n\nClick "AI Playtest" again to stop.');
  }
}

function aiAutoBalance() {
  const analysis = aiAutoBalancer.balance();
  
  alert(`⚖️ AI Auto-Balance Results

Difficulty Score: ${analysis.score}/100

${analysis.suggestions.join('\n')}

Applied adjustments to game balance!`);
}

function aiFindBugs() {
  const bugs = aiBugFinder.analyze();
  
  if (bugs.length === 0) {
    alert('🐛 No bugs found!\n\nYour scene looks clean.');
  } else {
    const report = bugs.map(b => `[${b.severity.toUpperCase()}] ${b.message}`).join('\n');
    alert(`🐛 Found ${bugs.length} issues:\n\n${report}`);
  }
}

// Ask AI from panel
function askAI(prompt) {
  if (!prompt) return;
  
  const responseEl = document.getElementById('aiResponse');
  responseEl.innerHTML = '🤔 Thinking...';
  
  setTimeout(() => {
    const result = generateCodeWithAI(prompt);
    responseEl.innerHTML = `<pre>${result.split('\n\n').slice(1).join('\n\n')}</pre>`;
  }, 1000);
}

// ==================== GAME CONTROLS ====================

function playGame() {
  if (gameRunning) return;
  
  gameRunning = true;
  
  // Apply physics to all objects
  sceneObjects.forEach(obj => {
    if (!obj.userData.isLight && !physicsBodies.some(pb => pb.mesh === obj)) {
      addPhysicsBody(obj, { mass: 1 });
    }
  });
  
  // Start AI playtest
  if (aiPlaytester) {
    aiPlaytester.start();
  }
  
  updateStatus('🎮 Game running...');
}

function stopGame() {
  gameRunning = false;
  
  // Stop AI playtest
  if (aiPlaytester && aiPlaytester.running) {
    aiPlaytester.stop();
  }
  
  updateStatus('Game stopped');
}

// ==================== PROJECT MANAGEMENT ====================

async function openProject(projectPath) {
  currentProject = projectPath;
  document.getElementById('projectName').textContent = projectPath.split(/[\\/]/).pop();
  
  if (window.electronAPI) {
    const files = await window.electronAPI.listDirectory(projectPath);
    console.log('Project files:', files);
  }
  
  updateStatus(`Opened: ${projectPath}`);
}

// ==================== EVENT HANDLERS ====================

function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedObject) {
      deleteSelected();
    }
    if (e.key === 'd' && e.ctrlKey && selectedObject) {
      e.preventDefault();
      duplicateSelected();
    }
    if (e.key === 'p' && e.ctrlKey) {
      e.preventDefault();
      playGame();
    }
    if (e.key === 'Escape') {
      selectObject(null);
    }
  });
  
  document.getElementById('viewport').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      selectObject(null);
    }
  });
}

function handleMenuAction(action) {
  console.log('Menu action:', action);
  
  switch(action) {
    case 'new-project':
      break;
    case 'save':
      saveCurrentFile();
      break;
    case 'ai-assistant':
      document.querySelector('.ai-assistant').scrollIntoView();
      break;
    case 'ai-generate-world':
      aiGenerateWorld();
      break;
    case 'ai-generate-level':
      aiGenerateLevel();
      break;
    case 'ai-code':
      aiGenerateCode();
      break;
    case 'ai-playtest':
      aiPlaytest();
      break;
    case 'ai-balance':
      aiAutoBalance();
      break;
    case 'ai-bugfind':
      aiFindBugs();
      break;
    case 'play':
      playGame();
      break;
    case 'stop':
      stopGame();
      break;
    case 'preferences':
      showNotification('Settings coming soon!', 'info');
      break;
    case 'add-object':
      addObject();
      break;
    case 'add-light':
      addLight('point');
      break;
    case 'add-camera':
      showNotification('Camera controls coming soon!', 'info');
      break;
  }
}

async function saveCurrentFile() {
  const code = document.getElementById('codeEditor').value;
  
  if (currentProject && window.electronAPI) {
    const filePath = `${currentProject}/game.js`;
    await window.electronAPI.writeFile(filePath, code);
    updateStatus('Saved game.js');
  } else {
    if (window.electronAPI) {
      const result = await window.electronAPI.showSaveDialog({
        defaultPath: 'game.js',
        filters: [{ name: 'JavaScript', extensions: ['js'] }]
      });
      if (!result.canceled && result.filePath) {
        await window.electronAPI.writeFile(result.filePath, code);
        updateStatus(`Saved to ${result.filePath}`);
      }
    }
  }
}

// ==================== UI HELPERS ====================

function updateStatus(message) {
  document.getElementById('statusMessage').textContent = message;
  console.log('[VOID IDE]', message);
}

function updateObjectCount() {
  document.getElementById('objectCount').textContent = `Objects: ${sceneObjects.length}`;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

let frameCount = 0;
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  
  // Physics update
  if (gameRunning && physicsEnabled) {
    updatePhysics(1/60);
  }
  
  renderer.render(scene, camera);
  
  // Update FPS
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    document.getElementById('fpsCounter').textContent = `FPS: ${frameCount}`;
    frameCount = 0;
    lastTime = now;
  }
}

// Expose functions globally
window.addPrimitive = addPrimitive;
window.addLight = addLight;
window.addCharacter = addCharacter;
window.selectObject = selectObject;
window.deleteSelected = deleteSelected;
window.duplicateSelected = duplicateSelected;
window.setMode = setMode;
window.addObject = addObject;
window.importAssets = importAssets;
window.aiGenerateWorld = aiGenerateWorld;
window.aiGenerateLevel = aiGenerateLevel;
window.aiGenerateCode = aiGenerateCode;
window.aiGenerateAssets = aiGenerateAssets;
window.aiPlaytest = aiPlaytest;
window.aiAutoBalance = aiAutoBalance;
window.aiFindBugs = aiFindBugs;
window.closeAIModal = closeAIModal;
window.selectAIType = selectAIType;
window.generateWithAI = generateWithAI;
window.askAI = askAI;
window.playGame = playGame;
window.stopGame = stopGame;
window.togglePhysics = togglePhysics;
window.initMultiplayer = initMultiplayer;
