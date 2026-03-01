// VOID IDE - Web Build Script
const fs = require('fs');
const path = require('path');

const buildWeb = async () => {
  console.log('🌐 Building VOID IDE for Web...');

  const outputDir = path.join(__dirname, '..', 'dist', 'web');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy source files
  const srcDir = path.join(__dirname, '..', 'src', 'renderer');

  // Read index.html and make it standalone
  let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

  // Modify for web build
  html = html.replace(/<script src="renderer\.js"><\/script>/,
    `<script src="renderer.js"></script>
    <script src="plugins.js"></script>`);

  // Add standalone CSS
  html = html.replace('href="styles.css"', 'href="void-ide.css"');

  fs.writeFileSync(path.join(outputDir, 'index.html'), html);

  // Copy JS files
  fs.copyFileSync(
    path.join(srcDir, 'renderer-pro.js'),
    path.join(outputDir, 'renderer-pro.js')
  );

  fs.copyFileSync(
    path.join(srcDir, 'renderer-unreal.js'),
    path.join(outputDir, 'renderer-unreal.js')
  );

  fs.copyFileSync(
    path.join(srcDir, 'renderer-unreal.js'),
    path.join(outputDir, 'renderer-unreal.js')
  );

  fs.copyFileSync(
    path.join(srcDir, 'renderer-min.js'),
    path.join(outputDir, 'renderer-min.js')
  );

  fs.copyFileSync(
    path.join(srcDir, 'plugins.js'),
    path.join(outputDir, 'plugins.js')
  );

  // Copy and rename CSS
  fs.copyFileSync(
    path.join(srcDir, 'styles.css'),
    path.join(outputDir, 'void-ide.css')
  );

  // Copy Three.js and Cannon.js libraries
  const libDir = path.join(srcDir, 'lib');
  const outputLibDir = path.join(outputDir, 'lib');
  if (!fs.existsSync(outputLibDir)) {
    fs.mkdirSync(outputLibDir, { recursive: true });
  }
  if (fs.existsSync(path.join(libDir, 'three.min.js'))) {
    fs.copyFileSync(path.join(libDir, 'three.min.js'), path.join(outputLibDir, 'three.min.js'));
  }
  if (fs.existsSync(path.join(libDir, 'cannon-es.js'))) {
    fs.copyFileSync(path.join(libDir, 'cannon-es.js'), path.join(outputLibDir, 'cannon-es.js'));
  }
  console.log('✅ Copied lib files');

  // Create standalone game runner HTML
  const gameRunner = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOID Game</title>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.min.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background: #0a0a0f; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script>
    // VOID Game Runtime
    // Your game code will be inserted here

    // Default game loop
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x404040));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    // Add your objects here

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'game-template.html'), gameRunner);

  // Create service worker for offline support
  const serviceWorker = `
const CACHE_NAME = 'void-ide-v1';
const ASSETS = [
  './',
  './index.html',
  './renderer.js',
  './plugins.js',
  './void-ide.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
`;

  fs.writeFileSync(path.join(outputDir, 'sw.js'), serviceWorker);

  // Create manifest.json for PWA
  const manifest = {
    name: "VOID IDE",
    short_name: "VOID",
    description: "AI-Powered Game Engine",
    start_url: "./index.html",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#6366f1",
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>",
        sizes: "192x192",
        type: "image/svg+xml"
      }
    ]
  };

  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('✅ Web build complete!');
  console.log('📁 Output:', outputDir);
  console.log('');
  console.log('To test locally:');
  console.log('  npx serve dist/web');
  console.log('');
  console.log('To deploy:');
  console.log('  - GitHub Pages');
  console.log('  - Netlify');
  console.log('  - Vercel');
};

buildWeb().catch(console.error);
