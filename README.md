# 🚀 VOID IDE

**AI-Powered Game Engine** - Build games with the power of AI

![Electron](https://img.shields.io/badge/Electron-28+-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160-orange)
![Physics](https://img.shields.io/badge/Cannon.js-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ⚡ What is VOID IDE?

VOID IDE is a revolutionary game development environment where **AI does everything**:

- 🌍 **AI World Generation** - Describe a world, AI builds it
- 📐 **AI Level Design** - Create levels with prompts  
- 💻 **AI Code Writing** - Get game code instantly
- 🎨 **AI Assets** - Generate sprites, textures, sounds
- 🎮 **AI Playtesting** - Auto-test your games
- ⚖️ **AI Auto-Balance** - Perfect difficulty every time
- 🐛 **AI Bug Finding** - Automatic debugging

---

## ✅ COMPLETE Roadmap

### Core Engine
| Feature | Status |
|---------|--------|
| 3D Viewport (Three.js) | ✅ |
| Physics Engine (Cannon.js) | ✅ |
| Scene Outliner | ✅ |
| Properties Panel | ✅ |
| Transform Tools | ✅ |
| Primitives (6 types) | ✅ |
| Lighting (4 types) | ✅ |
| Advanced Materials | ✅ |
| Shadows & Fog | ✅ |
| Skybox | ✅ |

### AI Features
| Feature | Status |
|---------|--------|
| AI World Generator | ✅ |
| AI Level Generator | ✅ |
| AI Code Assistant | ✅ |
| AI Playtester | ✅ |
| AI Auto-Balancer | ✅ |
| AI Bug Finder | ✅ |
| Asset Generation Guide | ✅ |

### Characters & Multiplayer
| Feature | Status |
|---------|--------|
| Player Character | ✅ |
| Enemy Characters | ✅ |
| Player Controller Code | ✅ |
| Enemy AI Code | ✅ |
| Multiplayer Ready | ✅ |

### Build Targets
| Target | Status |
|--------|--------|
| Desktop (Windows/Mac/Linux) | ✅ |
| Web (HTML5) | ✅ |
| Mobile (Android/iOS) | ✅ |

### Plugin System
| Feature | Status |
|---------|--------|
| Plugin Manager | ✅ |
| Debug Plugin | ✅ |
| Recording Plugin | ✅ |
| Version Control Plugin | ✅ |
| Asset Store | ✅ |
| Team Collaboration | ✅ |

---

## 🤖 AI Capabilities

### World Generation
```
"A futuristic city with neon lights"
"A fantasy castle with mountains"  
"A sci-fi space station"
```

### Level Design
```
"5 platformer levels with gaps"
"A maze with 8 rooms"
"An arena battleground"
```

### Code Generation
```
"Player movement with WASD and jump"
"Shooting mechanic with bullets"
"Enemy AI that chases player"
"Physics-based movement"
"Multiplayer networking"
```

---

## 🚀 Installation

```bash
# Clone
git clone https://github.com/AlienLost08/void-ide.git
cd void-ide

# Install
npm install

# Run
npm run dev

# Build for Desktop
npm run build

# Build for Web
npm run build:web

# Build for Mobile
npm run build:mobile
```

---

## 📖 Usage

### 1. AI World Generation
1. Click **🤖 AI TOOLS** → **Generate World**
2. Describe your world
3. AI builds everything!

### 2. AI Level Design
1. Click **Generate Level**
2. Describe the level type
3. Platforms, mazes, arenas - done!

### 3. AI Code Writing
1. Click **Write Code** or use quick prompts
2. Describe what you need
3. Player controllers, enemy AI, physics - instant!

### 4. Test & Balance
1. Press **F5** or click Play
2. Use **AI Playtest** to auto-test
3. Use **AI Auto-Balance** for perfect difficulty
4. Use **AI Find Bugs** to catch issues

### 5. Build & Export
- Build for Desktop (exe)
- Build for Web (HTML5)
- Build for Mobile (Android/iOS)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+N | New Project |
| Ctrl+O | Open Project |
| Ctrl+S | Save |
| Ctrl+G | AI Generate World |
| Ctrl+P | Play Game |
| F1 | AI Assistant |
| F5 | Play |
| Shift+F5 | Stop |
| Delete | Delete Object |
| Ctrl+D | Duplicate |
| Escape | Deselect |

---

## 🔌 Plugin System

VOID IDE supports plugins to extend functionality:

### Built-in Plugins
- **Debug Plugin** - Debug tools and logging
- **Recording Plugin** - Record gameplay
- **Version Control** - Git-like version history
- **Asset Store** - Built-in asset library
- **Collaboration** - Team working together

### Creating Plugins
```javascript
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init(pm) {
    // Initialize plugin
  },
  hooks: {
    beforeRender: () => { /* code */ },
    onObjectAdded: (obj) => { /* code */ }
  }
};

voidIDE.plugins.register(myPlugin);
```

---

## 📱 Mobile Build

VOID IDE can build to mobile using Capacitor:

```bash
# Build web first
npm run build:web

# Then build mobile
npm run build:mobile

# This creates:
# - Android Studio project
# - Xcode project
# - Capacitor config
```

---

## 👥 Team Collaboration

Built-in collaboration features:
- Real-time cursor sharing
- Object locking
- Change synchronization
- User presence indicators

---

## 🏗️ Tech Stack

- **Electron** - Desktop framework
- **Three.js** - 3D rendering
- **Cannon.js** - Physics engine
- **Socket.io** - Multiplayer
- **Capacitor** - Mobile builds

---

## 📦 Project Structure

```
void-ide/
├── src/
│   ├── main/
│   │   ├── main.js    # Electron main process
│   │   └── preload.js # Context bridge
│   └── renderer/
│       ├── index.html   # UI
│       ├── styles.css   # Dark theme
│       ├── renderer.js  # Core engine
│       └── plugins.js   # Plugin system
├── scripts/
│   ├── build-web.js    # Web build
│   └── build-mobile.js # Mobile build
├── package.json
└── README.md
```

---

## 🌟 All Features Complete!

- ✅ Core 3D Engine
- ✅ Physics
- ✅ AI World Generation
- ✅ AI Level Generation  
- ✅ AI Code Generation
- ✅ AI Playtester
- ✅ AI Auto-Balancer
- ✅ AI Bug Finder
- ✅ Characters
- ✅ Multiplayer Ready
- ✅ Plugin System
- ✅ Asset Store
- ✅ Team Collaboration
- ✅ Web Build
- ✅ Mobile Build

---

## 🤝 Contributing

Open source! Help build VOID IDE:

1. Fork the repo
2. Make changes
3. Submit a PR

---

## 📜 License

MIT License

---

**VOID IDE** - *Game development, reimagined.*

Built with ❤️ by Void
