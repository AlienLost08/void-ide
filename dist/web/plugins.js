// VOID IDE - Plugin System
// Allows extending VOID IDE with plugins

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = {
      'beforeInit': [],
      'afterInit': [],
      'beforeRender': [],
      'afterRender': [],
      'onObjectAdded': [],
      'onObjectRemoved': [],
      'onSave': [],
      'onLoad': [],
      'aiPrompt': []
    };
  }

  // Register a plugin
  register(plugin) {
    const { name, version, hooks, init, destroy } = plugin;
    
    this.plugins.set(name, {
      name,
      version,
      enabled: true,
      init,
      destroy,
      hooks: hooks || {}
    });
    
    // Register hooks
    if (hooks) {
      Object.keys(hooks).forEach(hookName => {
        if (this.hooks[hookName]) {
          this.hooks[hookName].push({ plugin: name, handler: hooks[hookName] });
        }
      });
    }
    
    // Initialize plugin
    if (init) {
      init(this);
    }
    
    console.log(`[Plugin] ${name} v${version} loaded`);
  }

  // Unregister a plugin
  unregister(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.destroy) {
      plugin.destroy();
    }
    this.plugins.delete(name);
    console.log(`[Plugin] ${name} unloaded`);
  }

  // Execute a hook
  execute(hookName, ...args) {
    const handlers = this.hooks[hookName] || [];
    handlers.forEach(({ plugin, handler }) => {
      try {
        handler(...args);
      } catch (e) {
        console.error(`[Plugin] Error in ${plugin} hook ${hookName}:`, e);
      }
    });
  }

  // Enable/disable plugin
  toggle(name, enabled) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = enabled;
    }
  }

  // Get all plugins
  getPlugins() {
    return Array.from(this.plugins.values()).map(p => ({
      name: p.name,
      version: p.version,
      enabled: p.enabled
    }));
  }
}

// Plugin API available to plugins
const pluginAPI = {
  // Add menu item
  addMenuItem: (menu, item) => {
    // Implementation in renderer
    window.electronAPI?.execute('plugin:addMenu', { menu, item });
  },

  // Add toolbar button
  addToolbarButton: (button) => {
    // Implementation in renderer
  },

  // Add AI prompt handler
  addAIPrompt: (name, handler) => {
    pluginManager.hooks.aiPrompt.push({ plugin: name, handler });
  },

  // Add new primitive
  addPrimitive: (name, geometry, material) => {
    // Add to primitives list
  },

  // Add export format
  addExportFormat: (format, handler) => {
    // Add to export options
  },

  // Access scene
  getScene: () => scene,
  getCamera: () => camera,
  getRenderer: () => renderer,

  // Add UI panel
  addPanel: (panelConfig) => {
    // Create custom panel
  },

  // Storage for plugin data
  storage: {
    get: (key) => localStorage.getItem(`void_plugin_${key}`),
    set: (key, value) => localStorage.setItem(`void_plugin_${key}`, value),
    remove: (key) => localStorage.removeItem(`void_plugin_${key}`)
  }
};

// Example plugins that come with VOID IDE

// 1. Debug Plugin
const DebugPlugin = {
  name: 'void-debug',
  version: '1.0.0',
  
  init(pm) {
    console.log('[Debug Plugin] Initialized');
    
    // Add debug menu
    pm.execute('afterInit');
  },
  
  hooks: {
    beforeRender: () => {
      // Debug rendering
    },
    onObjectAdded: (obj) => {
      console.log('[Debug] Object added:', obj.userData.name);
    }
  }
};

// 2. Recording Plugin
const RecordingPlugin = {
  name: 'void-recording',
  version: '1.0.0',
  
  init(pm) {
    this.recording = false;
    this.frames = [];
  },
  
  hooks: {
    afterRender: function() {
      if (this.recording) {
        // Capture frame
      }
    }
  },
  
  startRecording() {
    this.recording = true;
  },
  
  stopRecording() {
    this.recording = false;
    return this.frames;
  }
};

// 3. Version Control Plugin
const VersionControlPlugin = {
  name: 'void-vcs',
  version: '1.0.0',
  
  init(pm) {
    this.commits = [];
    this.currentBranch = 'main';
  },
  
  // Git-like version control
  commit(message) {
    const snapshot = {
      id: Date.now().toString(36),
      message,
      timestamp: new Date().toISOString(),
      sceneState: JSON.stringify(sceneObjects.map(o => ({
        name: o.userData.name,
        type: o.userData.type,
        position: o.position.toArray(),
        rotation: o.rotation.toArray(),
        scale: o.scale.toArray()
      })))
    };
    
    this.commits.push(snapshot);
    return snapshot.id;
  },
  
  checkout(commitId) {
    const commit = this.commits.find(c => c.id === commitId);
    if (commit) {
      // Restore scene state
    }
  },
  
  getHistory() {
    return this.commits;
  }
};

// 4. Asset Store Plugin
class AssetStore {
  constructor() {
    this.assets = new Map();
    this.loadedAssets = new Map();
    
    // Built-in asset categories
    this.categories = [
      'characters',
      'environments', 
      'props',
      'sounds',
      'textures',
      'effects'
    ];
  }

  // Add asset to store
  addAsset(asset) {
    const { id, name, category, url, thumbnail, tags } = asset;
    this.assets.set(id, { id, name, category, url, thumbnail, tags });
  }

  // Get assets by category
  getByCategory(category) {
    return Array.from(this.assets.values()).filter(a => a.category === category);
  }

  // Search assets
  search(query) {
    const q = query.toLowerCase();
    return Array.from(this.assets.values()).filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  // Load asset
  async loadAsset(id) {
    if (this.loadedAssets.has(id)) {
      return this.loadedAssets.get(id);
    }
    
    const asset = this.assets.get(id);
    if (!asset) return null;
    
    // Load based on type
    // This would integrate with Three.js loaders
    console.log('[AssetStore] Loading:', asset.name);
    
    this.loadedAssets.set(id, asset);
    return asset;
  }

  // Get popular assets
  getPopular() {
    return Array.from(this.assets.values()).slice(0, 10);
  }

  // Initialize with sample assets
  initSampleAssets() {
    // Characters
    this.addAsset({
      id: 'char_knight',
      name: 'Knight',
      category: 'characters',
      url: '/assets/characters/knight.glb',
      thumbnail: '🛡️',
      tags: ['medieval', 'warrior', 'human']
    });
    
    this.addAsset({
      id: 'char_wizard',
      name: 'Wizard',
      category: 'characters',
      url: '/assets/characters/wizard.glb',
      thumbnail: '🧙',
      tags: ['magic', 'medieval', 'human']
    });
    
    // Environments
    this.addAsset({
      id: 'env_forest',
      name: 'Forest',
      category: 'environments',
      url: '/assets/environments/forest.glb',
      thumbnail: '🌲',
      tags: ['nature', 'outdoor']
    });
    
    this.addAsset({
      id: 'env_castle',
      name: 'Castle',
      category: 'environments',
      url: '/assets/environments/castle.glb',
      thumbnail: '🏰',
      tags: ['medieval', 'building']
    });
    
    // Props
    this.addAsset({
      id: 'prop_chest',
      name: 'Treasure Chest',
      category: 'props',
      url: '/assets/props/chest.glb',
      thumbnail: '💰',
      tags: ['treasure', 'storage']
    });
    
    this.addAsset({
      id: 'prop_sword',
      name: 'Sword',
      category: 'props',
      url: '/assets/props/sword.glb',
      thumbnail: '⚔️',
      tags: ['weapon', 'medieval']
    });
    
    // Sounds
    this.addAsset({
      id: 'snd_explosion',
      name: 'Explosion',
      category: 'sounds',
      url: '/assets/sounds/explosion.mp3',
      thumbnail: '💥',
      tags: ['effect', 'impact']
    });
    
    this.addAsset({
      id: 'snd_jump',
      name: 'Jump',
      category: 'sounds',
      url: '/assets/sounds/jump.mp3',
      thumbnail: '⬆️',
      tags: ['effect', 'movement']
    });
    
    console.log('[AssetStore] Sample assets loaded');
  }
}

// 5. Team Collaboration Plugin
class CollaborationManager {
  constructor() {
    this.users = new Map();
    this.cursors = new Map();
    this.changes = [];
    this.userColors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', 
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ];
  }

  // Connect to collaboration server
  async connect(serverUrl, roomId, username) {
    this.roomId = roomId;
    this.username = username;
    this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
    
    // In production, this would connect to a WebSocket server
    console.log(`[Collab] Connected to room: ${roomId} as ${username}`);
    
    // Add self to users
    this.users.set(this.userId, {
      id: this.userId,
      name: username,
      color: this.userColors[this.users.size % this.userColors.length],
      cursor: { x: 0, y: 0 },
      selectedObject: null
    });
    
    return true;
  }

  // Disconnect
  disconnect() {
    this.users.clear();
    this.cursors.clear();
    console.log('[Collab] Disconnected');
  }

  // Broadcast change
  broadcastChange(type, data) {
    const change = {
      type,
      data,
      userId: this.userId,
      timestamp: Date.now()
    };
    
    this.changes.push(change);
    
    // In production, send via WebSocket
    console.log('[Collab] Change broadcasted:', type);
  }

  // Update cursor position
  updateCursor(x, y) {
    const user = this.users.get(this.userId);
    if (user) {
      user.cursor = { x, y };
      this.broadcastChange('cursor', { x, y });
    }
  }

  // Select object (collaborative)
  selectObject(objectId) {
    const user = this.users.get(this.userId);
    if (user) {
      user.selectedObject = objectId;
      this.broadcastChange('select', { objectId });
    }
  }

  // Get active users
  getUsers() {
    return Array.from(this.users.values());
  }

  // Get user color
  getUserColor(userId) {
    const user = this.users.get(userId);
    return user ? user.color : '#888888';
  }

  // Show user cursors in 3D view
  renderCursors() {
    // This would render other users' cursors in the 3D viewport
  }
}

// Initialize plugins
const pluginManager = new PluginManager();
const assetStore = new AssetStore();
const collaborationManager = new CollaborationManager();

// Register built-in plugins
pluginManager.register(DebugPlugin);
pluginManager.register(RecordingPlugin);
pluginManager.register(VersionControlPlugin);

// Initialize asset store with samples
assetStore.initSampleAssets();

// Export for global access
window.voidIDE = {
  plugins: pluginManager,
  assetStore: assetStore,
  collaboration: collaborationManager,
  pluginAPI: pluginAPI
};

console.log('[VOID IDE] Plugin System loaded');
