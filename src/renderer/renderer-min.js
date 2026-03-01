// VOID IDE - Minimal Renderer with Canvas 2D fallback
console.log('VOID IDE starting...');

let scene, camera, renderer;
let useWebGL = false;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, checking Three.js...');
  
  // Check for Three.js
  if (window.THREE) {
    console.log('Three.js found:', THREE.VERSION);
    initWithThreeJS();
  } else {
    console.log('Three.js not found, using Canvas 2D fallback');
    initWithCanvas2D();
  }
});

function initWithThreeJS() {
  const canvas = document.getElementById('viewport');
  
  try {
    // Try to create WebGL context
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      console.log('WebGL not available, falling back to Canvas 2D');
      initWithCanvas2D();
      return;
    }
    
    // Test if WebGL actually works
    const testShader = gl.createShader(gl.VERTEX_SHADER);
    if (!testShader) {
      console.log('WebGL shader creation failed, using Canvas 2D');
      initWithCanvas2D();
      return;
    }
    
    useWebGL = true;
    init(canvas);
  } catch (e) {
    console.log('WebGL error:', e.message);
    initWithCanvas2D();
  }
}

function initWithCanvas2D() {
  const canvas = document.getElementById('viewport');
  
  // Set to Canvas 2D
  canvas.setAttribute('data-renderer', 'canvas2d');
  
  // Create canvas context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.getElementById('viewport').innerHTML = 
      '<div style="color:red;padding:20px;">ERROR: Canvas 2D not supported!</div>';
    return;
  }
  
  // Set initial size
  const container = canvas.parentElement;
  canvas.width = container.clientWidth || 800;
  canvas.height = container.clientHeight || 600;
  
  // Draw initial scene
  drawCanvasScene(ctx, canvas.width, canvas.height);
  
  // Add resize handler
  window.addEventListener('resize', () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawCanvasScene(ctx, canvas.width, canvas.height);
  });
  
  updateStatus('VOID IDE Ready - Canvas 2D Mode (GPU unavailable)');
  console.log('VOID IDE running in Canvas 2D mode');
}

function drawCanvasScene(ctx, width, height) {
  // Clear
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = '#444466';
  ctx.lineWidth = 1;
  
  const gridSize = 40;
  const offsetX = (width / 2) % gridSize;
  const offsetY = (height / 2) % gridSize;
  
  for (let x = offsetX; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = offsetY; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Draw center axes
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width/2, 0);
  ctx.lineTo(width/2, height);
  ctx.moveTo(0, height/2);
  ctx.lineTo(width, height/2);
  ctx.stroke();
  
  // Draw a cube (pseudo-3D)
  const cx = width / 2;
  const cy = height / 2;
  const size = 60;
  
  // Front face
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(cx - size/2, cy - size/2, size, size);
  
  // Top face (trapezoid for 3D effect)
  ctx.fillStyle = '#818cf8';
  ctx.beginPath();
  ctx.moveTo(cx - size/2, cy - size/2);
  ctx.lineTo(cx + size/2, cy - size/2);
  ctx.lineTo(cx + size/3, cy - size/2 - size/3);
  ctx.lineTo(cx - size/3, cy - size/2 - size/3);
  ctx.closePath();
  ctx.fill();
  
  // Right face
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.moveTo(cx + size/2, cy - size/2);
  ctx.lineTo(cx + size/2, cy + size/2);
  ctx.lineTo(cx + size/3, cy + size/2 - size/3);
  ctx.lineTo(cx + size/3, cy - size/2 - size/3);
  ctx.closePath();
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - size/2, cy - size/2, size, size);
  
  // Draw "3D" label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VOID IDE', cx, cy + size);
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('Canvas 2D Mode', cx, cy + size + 25);
}

function init(canvas) {
  console.log('Initializing with WebGL...');
  
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  
  // Camera
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 600;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height);
  console.log('WebGL renderer created');
  
  // Lights
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));
  
  // Ground grid
  const grid = new THREE.GridHelper(20, 20, 0x444466, 0x222233);
  scene.add(grid);
  
  // Add a cube
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x6366f1 });
  const cube = new THREE.Mesh(geo, mat);
  cube.position.y = 0.5;
  scene.add(cube);
  
  console.log('Scene setup complete, starting loop');
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
  
  // Resize handler
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  
  updateStatus('VOID IDE Ready - 3D Viewport Active!');
  console.log('VOID IDE WebGL mode complete!');
}

function updateStatus(msg) {
  const status = document.getElementById('statusMessage');
  if (status) status.textContent = msg;
}
