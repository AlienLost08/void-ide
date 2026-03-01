// VOID IDE - Minimal Renderer for Testing
console.log('VOID IDE minimal renderer loading...');

let scene, camera, renderer;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, checking Three.js...');
  
  if (!window.THREE) {
    console.error('THREE not found!');
    document.getElementById('viewport').innerHTML = '<div style="color:red;padding:20px;">ERROR: Three.js not loaded!</div>';
    return;
  }
  
  console.log('Three.js version:', THREE.VERSION);
  
  init();
});

function init() {
  const canvas = document.getElementById('viewport');
  console.log('Canvas found, initializing...');
  
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
  console.log('Renderer created');
  
  // Light
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
  
  // Update status
  const status = document.getElementById('statusMessage');
  if (status) status.textContent = 'VOID IDE Ready - 3D Viewport Active!';
  
  console.log('VOID IDE minimal mode complete!');
}
