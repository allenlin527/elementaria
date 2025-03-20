# Elementaria 遊戲專案設定

## 環境初始化

現在讓我們建立基本的專案環境：

1. **初始化項目**

```bash
# 創建專案目錄
mkdir -p elementaria
cd elementaria

# 初始化git儲存庫
git init

# 初始化npm專案
npm init -y
```

2. **安裝開發依賴**

```bash
# 安裝開發工具
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev html-webpack-plugin mini-css-extract-plugin
npm install --save-dev css-loader style-loader file-loader
npm install --save-dev terser-webpack-plugin css-minimizer-webpack-plugin
npm install --save-dev eslint prettier eslint-config-prettier
npm install --save-dev jest jest-environment-jsdom
```

3. **項目配置文件**

讓我們首先創建 `package.json` 文件：

```json
{
  "name": "elementaria",
  "version": "0.1.0",
  "description": "輕量級多人網頁文字冒險遊戲",
  "private": true,
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production",
    "build:analyze": "webpack --mode production --analyze",
    "test": "jest",
    "lint": "eslint src",
    "format": "prettier --write \"src/**/*.{js,css,html}\""
  },
  "author": "Elementaria Team",
  "license": "UNLICENSED",
  "dependencies": {},
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "html-webpack-plugin": "^5.5.3",
    "mini-css-extract-plugin": "^2.7.6",
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3",
    "file-loader": "^6.2.0",
    "terser-webpack-plugin": "^5.3.9",
    "css-minimizer-webpack-plugin": "^5.0.1",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "eslint-config-prettier": "^9.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

4. **Webpack配置文件** - 建立 `webpack.config.js`：

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/core/engine.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'core/[name].[contenthash].js',
      chunkFilename: 'chunks/[name].[contenthash].js',
      clean: true
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          coreDeps: {
            test: /[\\/]node_modules[\\/]/,
            name: 'core-deps',
            priority: 10,
          },
          visual: {
            test: /[\\/]src[\\/]visual[\\/]/,
            name: 'visual',
            priority: 5,
          },
          areas: {
            test: /[\\/]src[\\/]world[\\/]areas[\\/]/,
            name: (module) => {
              const match = module.context.match(/[\\/]areas[\\/]([\w-]+)/);
              return match ? `area-${match[1]}` : 'areas';
            },
            priority: 5,
          }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            }
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.json$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[hash][ext][query]'
          },
          exclude: /node_modules/
        }
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProduction,
      }),
      isProduction && new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash].css',
        chunkFilename: 'styles/[id].[contenthash].css',
      })
    ].filter(Boolean),
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
      hot: true,
    },
  };
};
```

5. **ESLint配置** - 建立 `.eslintrc.js`：

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
```

6. **Prettier配置** - 建立 `.prettierrc`：

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

7. **建立基本HTML檔案** - `src/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>艾利門特亞 - 元素魔法冒險</title>
  <meta name="description" content="探索元素魔法世界，恢復失衡的和諧">
</head>
<body>
  <div id="game-container">
    <div id="loading-screen">
      <div class="loading-logo">艾利門特亞</div>
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
    </div>
    <div id="game-ui" style="display: none;">
      <div id="dialogue-container"></div>
      <div id="choices-container"></div>
      <div id="player-status"></div>
      <div id="multiplayer-indicator"></div>
    </div>
  </div>
</body>
</html>
```

8. **建立核心引擎入口點** - `src/core/engine.js`：

```javascript
// 引入核心模組
import { EventSystem } from './events';
import { ResourceLoadManager } from './loader';
import { TemporaryIdentityManager } from './identity';
import { StorageManager } from './storage';

// 引入核心樣式
import '../ui/styles/core.css';

/**
 * 艾利門特亞遊戲引擎
 * 負責初始化遊戲系統並協調各模組
 */
class ElementariaEngine {
  constructor() {
    this.initialized = false;
    this.events = null;
    this.resourceManager = null;
    this.identityManager = null;
    this.storageManager = null;
    
    // 初始化配置
    this.config = {
      initialLoadSizeLimit: 300 * 1024, // 300KB
      defaultArea: 'harmony_village',
      wsServerUrl: 'wss://elementaria-server.example.com'
    };
  }
  
  /**
   * 初始化遊戲引擎
   */
  async initialize() {
    console.log('艾利門特亞引擎初始化中...');
    
    // 初始化事件系統
    this.events = new EventSystem();
    
    // 初始化存儲管理器
    this.storageManager = new StorageManager();
    this.storageManager.initialize();
    
    // 初始化資源載入管理器
    this.resourceManager = new ResourceLoadManager(this.events);
    
    // 初始化臨時身份管理器
    this.identityManager = new TemporaryIdentityManager(this.storageManager);
    const identity = await this.identityManager.initializeIdentity();
    
    // 載入核心資源
    this.updateLoadingProgress(10, '載入核心系統...');
    await this.resourceManager.loadCoreResources();
    
    // 處理玩家身份
    this.updateLoadingProgress(30, '準備玩家數據...');
    if (identity.isNewPlayer) {
      // 新玩家，將在資源載入後顯示名稱輸入界面
      this.events.trigger('ui:showNameInput');
    } else {
      // 返回玩家，載入上次遊戲狀態
      await this.loadPlayerState(identity);
    }
    
    // 載入當前區域資源
    this.updateLoadingProgress(50, '載入遊戲區域...');
    const initialArea = this.storageManager.getItem('lastArea') || this.config.defaultArea;
    await this.resourceManager.loadAreaResources(initialArea);
    
    // 後續初始化 (UI、連接等)
    await this.initializeSubsystems(initialArea);
    
    this.initialized = true;
    this.updateLoadingProgress(100, '遊戲準備完成!');
    
    // 通知遊戲已準備就緒
    setTimeout(() => {
      this.events.trigger('game:ready');
      this.hideLoadingScreen();
    }, 500);
    
    console.log('艾利門特亞引擎初始化完成');
    return true;
  }
  
  /**
   * 初始化其他子系統
   */
  async initializeSubsystems(initialArea) {
    this.updateLoadingProgress(70, '初始化遊戲系統...');
    
    // 動態引入UI系統
    const { UISystem } = await import('../ui/uiSystem');
    this.ui = new UISystem(this.events);
    this.ui.initialize();
    
    // 動態引入玩家系統
    const { PlayerSystem } = await import('../player/character');
    this.player = new PlayerSystem(this.events, this.identityManager);
    await this.player.initialize();
    
    // 動態引入世界系統
    const { WorldSystem } = await import('../world/state');
    this.world = new WorldSystem(this.events, initialArea);
    await this.world.initialize();
    
    // 動態引入元素魔法系統
    const { ElementalMagicSystem } = await import('../magic/elements/elementSystem');
    this.magicSystem = new ElementalMagicSystem(this.events);
    this.magicSystem.initialize();
    
    // 最後初始化網絡連接 (可選)
    try {
      const { ConnectionManager } = await import('../network/connection');
      this.connection = new ConnectionManager(
        this.events,
        this.config.wsServerUrl,
        this.identityManager
      );
      this.connection.initialize();
    } catch (error) {
      console.warn('網絡連接模塊載入失敗，將以單人模式運行', error);
      this.events.trigger('connection:offline');
    }
    
    this.updateLoadingProgress(90, '正在完成設置...');
    
    // 在空閒時預載相鄰區域資源
    this.scheduleAdjacentAreasPreload(initialArea);
  }
  
  /**
   * 更新載入進度顯示
   */
  updateLoadingProgress(percentage, message) {
    const progressBar = document.querySelector('.loading-progress');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (message) {
      // 創建或更新消息元素
      let messageEl = document.querySelector('.loading-message');
      if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'loading-message';
        loadingScreen.appendChild(messageEl);
      }
      messageEl.textContent = message;
    }
  }
  
  /**
   * 隱藏載入畫面
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const gameUI = document.getElementById('game-ui');
    
    if (loadingScreen && gameUI) {
      loadingScreen.style.opacity = '0';
      gameUI.style.display = 'block';
      
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }
  
  /**
   * 安排預載相鄰區域資源
   */
  scheduleAdjacentAreasPreload(currentArea) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.resourceManager.preloadAdjacentAreas(currentArea);
      });
    } else {
      setTimeout(() => {
        this.resourceManager.preloadAdjacentAreas(currentArea);
      }, 3000);
    }
  }
  
  /**
   * 載入玩家狀態
   */
  async loadPlayerState(identity) {
    // 從本地存儲加載玩家數據
    const playerState = this.storageManager.getItem('playerState');
    if (playerState) {
      this.events.trigger('player:stateLoaded', playerState);
    }
    
    return true;
  }
}

// 創建遊戲引擎實例
const gameEngine = new ElementariaEngine();

// DOM加載完成後初始化引擎
document.addEventListener('DOMContentLoaded', () => {
  gameEngine.initialize().catch(error => {
    console.error('遊戲初始化失敗:', error);
    gameEngine.updateLoadingProgress(0, '初始化失敗，請刷新頁面重試');
  });
});

// 導出引擎實例，供其他模塊使用
export default gameEngine;
```

9. **建立事件系統** - `src/core/events.js`：

```javascript
/**
 * 事件系統
 * 負責遊戲內各模組間的通信
 */
export class EventSystem {
  constructor() {
    this.listeners = {};
    this.listenerCount = 0;
  }
  
  /**
   * 註冊事件監聽器
   * @param {string} eventType - 事件類型
   * @param {Function} callback - 回調函數
   * @returns {Object} 訂閱標識，用於取消訂閱
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    
    const listenerId = this.listenerCount++;
    this.listeners[eventType].push({
      id: listenerId,
      callback
    });
    
    // 返回訂閱標識
    return {
      type: eventType,
      id: listenerId
    };
  }
  
  /**
   * 移除事件監聽器
   * @param {Object} subscription - 訂閱標識
   * @returns {boolean} 是否成功移除
   */
  off(subscription) {
    if (!subscription || !this.listeners[subscription.type]) {
      return false;
    }
    
    const index = this.listeners[subscription.type].findIndex(
      listener => listener.id === subscription.id
    );
    
    if (index !== -1) {
      this.listeners[subscription.type].splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * 觸發事件
   * @param {string} eventType - 事件類型
   * @param {*} data - 事件數據
   * @returns {boolean} 是否有監聽器接收到事件
   */
  trigger(eventType, data) {
    if (!this.listeners[eventType] || this.listeners[eventType].length === 0) {
      return false;
    }
    
    // 複製監聽器列表，防止回調中修改列表
    const listeners = [...this.listeners[eventType]];
    
    listeners.forEach(listener => {
      try {
        listener.callback(data);
      } catch (error) {
        console.error(`事件處理錯誤(${eventType}):`, error);
      }
    });
    
    return true;
  }
  
  /**
   * 一次性事件監聽
   * @param {string} eventType - 事件類型
   * @param {Function} callback - 回調函數
   * @returns {Object} 訂閱標識
   */
  once(eventType, callback) {
    const subscription = this.on(eventType, data => {
      callback(data);
      this.off(subscription);
    });
    
    return subscription;
  }
  
  /**
   * 清理所有事件監聽器
   */
  clear() {
    this.listeners = {};
  }
}
```

10. **建立資源載入管理器** - `src/core/loader.js`：

```javascript
/**
 * 資源載入管理器
 * 負責管理遊戲資源的載入、預加載與緩存
 */
export class ResourceLoadManager {
  constructor(eventSystem) {
    this.events = eventSystem;
    this.loadedResources = new Map();
    this.loadingPromises = new Map();
    
    // 資源層級定義
    this.resourceLayers = {
      CORE: 0,           // 核心引擎 (~180KB)
      CURRENT_AREA: 1,   // 當前區域資源
      ADJACENT_AREAS: 2, // 相鄰區域資源
      VISUAL: 3,         // 視覺增強資源
      AUDIO: 4           // 音頻資源
    };
    
    // 資源映射配置
    this.resourceMapping = {
      core: [
        { type: 'js', path: 'core/utils.js' },
        { type: 'css', path: 'ui/styles/core.css' }
      ],
      areas: {
        harmony_village: [
          { type: 'json', path: 'areas/village/main.json' },
          { type: 'json', path: 'areas/village/npcs.json' },
          { type: 'json', path: 'areas/village/dialogues.json' }
        ],
        chaotic_forest: [
          { type: 'json', path: 'areas/forest/main.json' },
          { type: 'json', path: 'areas/forest/npcs.json' },
          { type: 'json', path: 'areas/forest/dialogues.json' }
        ],
        forgotten_temple: [
          { type: 'json', path: 'areas/temple/main.json' },
          { type: 'json', path: 'areas/temple/npcs.json' },
          { type: 'json', path: 'areas/temple/dialogues.json' }
        ]
      },
      adjacent: {
        harmony_village: ['chaotic_forest'],
        chaotic_forest: ['harmony_village', 'forgotten_temple'],
        forgotten_temple: ['chaotic_forest']
      }
    };
  }
  
  /**
   * 載入核心資源
   * @returns {Promise} 載入完成的Promise
   */
  async loadCoreResources() {
    this.events.trigger('resources:loadingStarted', { layer: 'core' });
    
    try {
      const coreResources = this.resourceMapping.core;
      const loadPromises = coreResources.map(resource => 
        this.loadResource(resource.path, this.resourceLayers.CORE)
      );
      
      await Promise.all(loadPromises);
      
      this.events.trigger('resources:loadingCompleted', { 
        layer: 'core',
        resourceCount: coreResources.length
      });
      
      return true;
    } catch (error) {
      this.events.trigger('resources:loadingFailed', { 
        layer: 'core',
        error
      });
      throw error;
    }
  }
  
  /**
   * 載入特定區域資源
   * @param {string} areaId - 區域ID
   * @returns {Promise} 載入完成的Promise
   */
  async loadAreaResources(areaId) {
    this.events.trigger('resources:loadingStarted', { 
      layer: 'area',
      areaId
    });
    
    try {
      const areaResources = this.resourceMapping.areas[areaId];
      if (!areaResources) {
        throw new Error(`未定義的區域資源: ${areaId}`);
      }
      
      const loadPromises = areaResources.map(resource => 
        this.loadResource(resource.path, this.resourceLayers.CURRENT_AREA)
      );
      
      await Promise.all(loadPromises);
      
      this.events.trigger('resources:loadingCompleted', { 
        layer: 'area',
        areaId,
        resourceCount: areaResources.length
      });
      
      return true;
    } catch (error) {
      this.events.trigger('resources:loadingFailed', { 
        layer: 'area',
        areaId,
        error
      });
      throw error;
    }
  }
  
  /**
   * 預載相鄰區域資源
   * @param {string} currentAreaId - 當前區域ID
   */
  preloadAdjacentAreas(currentAreaId) {
    const adjacentAreas = this.resourceMapping.adjacent[currentAreaId] || [];
    
    adjacentAreas.forEach(areaId => {
      // 使用低優先級載入相鄰區域
      this.events.trigger('resources:preloadingStarted', { areaId });
      
      const areaResources = this.resourceMapping.areas[areaId];
      if (!areaResources) return;
      
      // 使用 requestIdleCallback 在瀏覽器空閒時載入
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          areaResources.forEach(resource => {
            this.loadResource(
              resource.path, 
              this.resourceLayers.ADJACENT_AREAS,
              true // 靜默模式，不觸發事件
            );
          });
        });
      } else {
        // 降級方案
        setTimeout(() => {
          areaResources.forEach(resource => {
            this.loadResource(
              resource.path, 
              this.resourceLayers.ADJACENT_AREAS,
              true
            );
          });
        }, 2000);
      }
    });
  }
  
  /**
   * 載入單個資源
   * @param {string} path - 資源路徑
   * @param {number} layer - 資源層級
   * @param {boolean} silent - 是否靜默載入（不觸發事件）
   * @returns {Promise} 載入完成的Promise
   */
  async loadResource(path, layer, silent = false) {
    // 如果已經載入過，直接返回
    if (this.loadedResources.has(path)) {
      return this.loadedResources.get(path);
    }
    
    // 如果正在載入，返回現有Promise
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }
    
    // 根據文件類型選擇載入方法
    const fileExtension = path.split('.').pop().toLowerCase();
    let loadPromise;
    
    switch (fileExtension) {
      case 'js':
        loadPromise = this.loadScript(path);
        break;
      case 'css':
        loadPromise = this.loadStylesheet(path);
        break;
      case 'json':
        loadPromise = this.loadJSON(path);
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        loadPromise = this.loadImage(path);
        break;
      default:
        loadPromise = this.loadFile(path);
    }
    
    // 記錄載入Promise
    this.loadingPromises.set(path, loadPromise);
    
    try {
      // 等待載入完成
      const resource = await loadPromise;
      
      // 更新已載入資源映射
      this.loadedResources.set(path, resource);
      
      // 移除載入Promise記錄
      this.loadingPromises.delete(path);
      
      // 觸發載入完成事件
      if (!silent) {
        this.events.trigger('resource:loaded', { path, layer });
      }
      
      return resource;
    } catch (error) {
      // 移除載入Promise記錄
      this.loadingPromises.delete(path);
      
      // 觸發載入失敗事件
      if (!silent) {
        this.events.trigger('resource:failed', { path, layer, error });
      }
      
      throw error;
    }
  }
  
  /**
   * 載入JavaScript腳本
   * @param {string} path - 腳本路徑
   * @returns {Promise} 載入完成的Promise
   */
  loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = path;
      script.async = true;
      
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`腳本載入失敗: ${path}`));
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * 載入CSS樣式表
   * @param {string} path - 樣式表路徑
   * @returns {Promise} 載入完成的Promise
   */
  loadStylesheet(path) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      
      link.onload = () => resolve(link);
      link.onerror = () => reject(new Error(`樣式表載入失敗: ${path}`));
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * 載入JSON文件
   * @param {string} path - JSON文件路徑
   * @returns {Promise} 載入完成的Promise，解析為JS對象
   */
  async loadJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`JSON載入失敗: ${path} (${response.status})`);
    }
    return response.json();
  }
  
  /**
   * 載入圖片
   * @param {string} path - 圖片路徑
   * @returns {Promise} 載入完成的Promise，解析為Image對象
   */
  loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = path;
      
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`圖片載入失敗: ${path}`));
    });
  }
  
  /**
   * 載入通用文件
   * @param {string} path - 文件路徑
   * @returns {Promise} 載入完成的Promise，解析為ArrayBuffer
   */
  async loadFile(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`文件載入失敗: ${path} (${response.status})`);
    }
    return response.arrayBuffer();
  }
  
  /**
   * 釋放資源
   * @param {string} path - 資源路徑
   * @returns {boolean} 是否成功釋放
   */
  releaseResource(path) {
    if (!this.loadedResources.has(path)) {
      return false;
    }
    
    this.loadedResources.delete(path);
    return true;
  }
  
  /**
   * 釋放特定層級的所有資源
   * @param {number} layer - 資源層級
   */
  releaseLayerResources(layer) {
    // 由於我們沒有直接儲存資源層級信息，此功能需要額外的映射實現
    // 這裡提供一個簡化版本
    if (layer === this.resourceLayers.ADJACENT_AREAS) {
      // 釋放相鄰區域資源
      for (const areaId in this.resourceMapping.areas) {
        // 跳過當前區域
        if (areaId === this.currentArea) continue;
        
        const areaResources = this.resourceMapping.areas[areaId];
        areaResources.forEach(resource => {
          this.releaseResource(resource.path);
        });
      }
    }
  }
}
```

11. **建立臨時身份管理器** - `src/core/identity.js`：

```javascript
/**
 * 臨時身份管理器
 * 負責在無需註冊的情況下提供一致的玩家身份識別
 */
export class TemporaryIdentityManager {
  constructor(storageManager) {
    this.storage = storageManager;
    
    // 存儲鍵定義
    this.STORAGE_KEYS = {
      PLAYER_ID: 'elementaria_player_id',
      PLAYER_NAME: 'elementaria_player_name',
      MAIN_ELEMENT: 'elementaria_main_element',
      CREATION_TIME: 'elementaria_creation_time',
      LAST_LOGIN: 'elementaria_last_login'
    };
  }
  
  /**
   * 初始化玩家身份
   * @returns {Object} 玩家身份信息
   */
  async initializeIdentity() {
    // 檢查是否已有存儲的身份
    let playerId = this.storage.getItem(this.STORAGE_KEYS.PLAYER_ID);
    let isNewPlayer = false;
    
    if (!playerId) {
      // 生成新身份
      playerId = await this.generateNewIdentity();
      isNewPlayer = true;
      
      // 存儲新身份
      this.storage.setItem(this.STORAGE_KEYS.PLAYER_ID, playerId);
      this.storage.setItem(this.STORAGE_KEYS.CREATION_TIME, Date.now().toString());
    }
    
    // 更新最後登入時間
    this.storage.setItem(this.STORAGE_KEYS.LAST_LOGIN, Date.now().toString());
    
    return {
      id: playerId,
      name: this.storage.getItem(this.STORAGE_KEYS.PLAYER_NAME) || null,
      mainElement: this.storage.getItem(this.STORAGE_KEYS.MAIN_ELEMENT) || null,
      isNewPlayer: isNewPlayer
    };
  }
  
  /**
   * 生成新的身份識別
   * @returns {string} 玩家識別ID
   */
  async generateNewIdentity() {
    // 收集瀏覽器特徵
    const browserFeatures = await this.collectBrowserFeatures();
    
    // 計算指紋雜湊
    const fingerprint = this.hashCode(browserFeatures.join('|'));
    
    // 添加時間戳和隨機元素增加唯一性
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    
    return `${fingerprint}_${timestamp}_${randomSuffix}`;
  }
  
  /**
   * 收集瀏覽器特徵信息
   * @returns {Array} 特徵信息陣列
   */
  async collectBrowserFeatures() {
    const features = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
      navigator.deviceMemory,
      navigator.platform
    ];
    
    // 添加Canvas指紋
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        features.push(gl.getParameter(gl.VENDOR));
        features.push(gl.getParameter(gl.RENDERER));
      }
    } catch (e) {
      // Canvas指紋獲取失敗，忽略錯誤
    }
    
    return features.filter(Boolean); // 過濾掉undefined或null值
  }
  
  /**
   * 簡單雜湊函數
   * @param {string} str - 待雜湊字符串
   * @returns {string} 雜湊結果
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // 轉為32位整數
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }
  
  /**
   * 更新玩家資料
   * @param {string} name - 玩家名稱
   * @param {string} mainElement - 主元素類型
   * @returns {Object} 更新後的玩家信息
   */
  updatePlayerInfo(name, mainElement) {
    this.storage.setItem(this.STORAGE_KEYS.PLAYER_NAME, name);
    this.storage.setItem(this.STORAGE_KEYS.MAIN_ELEMENT, mainElement);
    
    return {
      id: this.storage.getItem(this.STORAGE_KEYS.PLAYER_ID),
      name,
      mainElement,
      isNewPlayer: false
    };
  }
  
  /**
   * 驗證身份是否有效
   * @returns {boolean} 身份是否有效
   */
  validateIdentity() {
    const playerId = this.storage.getItem(this.STORAGE_KEYS.PLAYER_ID);
    if (!playerId) return false;
    
    // 檢查創建時間是否存在
    const creationTime = parseInt(this.storage.getItem(this.STORAGE_KEYS.CREATION_TIME) || '0');
    if (!creationTime) return false;
    
    // 其他驗證邏輯可以在這裡添加
    
    return true;
  }
}
```

12. **建立本地存儲管理器** - `src/core/storage.js`：

```javascript
/**
 * 本地存儲管理器
 * 負責管理遊戲數據的持久化存儲
 */
export class StorageManager {
  constructor() {
    this.namespace = 'elementaria_';
    this.isAvailable = this.checkStorageAvailability();
    
    // 存儲類別
    this.storageCategories = {
      CORE: 'core',       // 核心玩家數據
      PROGRESS: 'prog',   // 遊戲進度
      SETTINGS: 'set',    // 用戶設置
      CACHE: 'cache',     // 臨時緩存
      SOCIAL: 'soc'       // 社交數據
    };
  }
  
  /**
   * 初始化存儲管理器
   */
  initialize() {
    if (!this.isAvailable) {
      console.warn('本地存儲不可用，遊戲進度將無法保存');
    }
    
    // 清理過期緩存數據
    this.cleanupExpiredItems();
  }
  
  /**
   * 檢查存儲可用性
   * @returns {boolean} 存儲是否可用
   */
  checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * 設置存儲項目
   * @param {string} key - 項目鍵名
   * @param {*} value - 項目值
   * @param {string} category - 存儲類別
   * @param {number} [expiry] - 過期時間（毫秒），可選
   * @returns {boolean} 是否設置成功
   */
  setItem(key, value, category = this.storageCategories.CORE, expiry = null) {
    if (!this.isAvailable) return false;
    
    try {
      const fullKey = this.namespace + (category ? category + '_' : '') + key;
      const item = {
        value: value,
        timestamp: Date.now()
      };
      
      // 如果設置了過期時間，添加到item中
      if (expiry) {
        item.expiry = Date.now() + expiry;
      }
      
      localStorage.setItem(fullKey, JSON.stringify(item));
      return true;
    } catch (e) {
      console.error('存儲項目設置失敗:', e);
      
      // 如果是存儲配額錯誤，嘗試清理空間
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        this.cleanupStorage();
        
        // 重試一次
        try {
          const fullKey = this.namespace + (category ? category + '_' : '') + key;
          localStorage.setItem(fullKey, JSON.stringify({
            value: value,
            timestamp: Date.now()
          }));
          return true;
        } catch (retryError) {
          console.error('存儲項目設置重試失敗:', retryError);
          return false;
        }
      }
      
      return false;
    }
  }
  
  /**
   * 獲取存儲項目
   * @param {string} key - 項目鍵名
   * @param {string} category - 存儲類別
   * @param {*} defaultValue - 默認值
   * @returns {*} 項目值或默認值
   */
  getItem(key, category = this.storageCategories.CORE, defaultValue = null) {
    if (!this.isAvailable) return defaultValue;
    
    try {
      const fullKey = this.namespace + (category ? category + '_' : '') + key;
      const itemStr = localStorage.getItem(fullKey);
      
      if (!itemStr) return defaultValue;
      
      const item = JSON.parse(itemStr);
      
      // 檢查項目是否過期
      if (item.expiry && item.expiry < Date.now()) {
        localStorage.removeItem(fullKey);
        return defaultValue;
      }
      
      return item.value;
    } catch (e) {
      console.error('存儲項目獲取失敗:', e);
      return defaultValue;
    }
  }
  
  /**
   * 移除存儲項目
   * @param {string} key - 項目鍵名
   * @param {string} category - 存儲類別
   * @returns {boolean} 是否移除成功
   */
  removeItem(key, category = this.storageCategories.CORE) {
    if (!this.isAvailable) return false;
    
    try {
      const fullKey = this.namespace + (category ? category + '_' : '') + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.error('存儲項目移除失敗:', e);
      return false;
    }
  }
  
  /**
   * 清理特定類別的存儲項目
   * @param {string} category - 存儲類別
   * @returns {boolean} 是否清理成功
   */
  clearCategory(category) {
    if (!this.isAvailable) return false;
    
    try {
      const prefix = this.namespace + category + '_';
      
      // 獲取所有符合前綴的鍵
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // 移除項目
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return true;
    } catch (e) {
      console.error('類別清理失敗:', e);
      return false;
    }
  }
  
  /**
   * 清理過期項目
   */
  cleanupExpiredItems() {
    if (!this.isAvailable) return;
    
    try {
      const now = Date.now();
      const keysToRemove = [];
      
      // 檢查所有項目
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // 只處理屬於我們命名空間的項目
        if (!key.startsWith(this.namespace)) continue;
        
        try {
          const itemStr = localStorage.getItem(key);
          if (!itemStr) continue;
          
          const item = JSON.parse(itemStr);
          
          // 檢查是否過期
          if (item.expiry && item.expiry < now) {
            keysToRemove.push(key);
          }
        } catch (parseError) {
          // 解析錯誤，可能是已損壞的項目，也將其移除
          keysToRemove.push(key);
        }
      }
      
      // 移除過期項目
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
    } catch (e) {
      console.error('過期項目清理失敗:', e);
    }
  }
  
  /**
   * 清理儲存空間
   * 當配額滿時調用，嘗試釋放空間
   */
  cleanupStorage() {
    // 首先清理所有緩存數據
    this.clearCategory(this.storageCategories.CACHE);
    
    // 檢查並清理超過一個月的過期數據
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    try {
      // 尋找並清理舊數據
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // 只處理屬於我們命名空間的項目
        if (!key.startsWith(this.namespace)) continue;
        
        try {
          const itemStr = localStorage.getItem(key);
          if (!itemStr) continue;
          
          const item = JSON.parse(itemStr);
          
          // 檢查時間戳是否太舊
          if (item.timestamp && item.timestamp < oneMonthAgo) {
            localStorage.removeItem(key);
          }
        } catch (parseError) {
          // 解析錯誤，移除損壞項目
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('儲存空間清理失敗:', e);
    }
  }
}
```

13. **建立核心CSS樣式** - `src/ui/styles/core.css`：

```css
/* 基礎重設 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans TC', sans-serif;
  background-color: #1a1a2e;
  color: #e6e6e6;
  line-height: 1.6;
  overflow: hidden;
}

/* 遊戲容器 */
#game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 載入畫面 */
#loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #0f0f1b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.5s ease;
}

.loading-logo {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4da6ff;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(77, 166, 255, 0.7);
}

.loading-bar {
  width: 300px;
  height: 10px;
  background-color: #2a2a48;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.loading-progress {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #4da6ff, #a64dff);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.loading-message {
  font-size: 0.9rem;
  color: #a2a2c2;
  margin-top: 0.5rem;
}

/* 遊戲UI */
#game-ui {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

#dialogue-container {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  background-color: rgba(26, 26, 46, 0.9);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #3a3a5e;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

#choices-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.choice-button {
  background-color: #2d2d4d;
  border: 1px solid #4a4a7a;
  border-radius: 4px;
  padding: 0.7rem 1rem;
  color: #e6e6e6;
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;
}

.choice-button:hover {
  background-color: #3d3d6d;
  border-color: #6a6a9a;
}

#player-status {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(26, 26, 46, 0.8);
  border-radius: 4px;
  border: 1px solid #3a3a5e;
}

#multiplayer-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(26, 26, 46, 0.8);
  border-radius: 4px;
  border: 1px solid #3a3a5e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 元素顏色主題 */
.element-fire {
  color: #ff7b5c;
  border-color: #ff7b5c;
}

.element-water {
  color: #5cc0ff;
  border-color: #5cc0ff;
}

.element-air {
  color: #a8ffdb;
  border-color: #a8ffdb;
}

.element-earth {
  color: #daa45c;
  border-color: #daa45c;
}

/* 元素光點效果 */
.element-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  pointer-events: none;
  will-change: transform, opacity;
}

.element-particle.fire {
  background: radial-gradient(circle at 30% 30%, #ffff00, #ff8c00, #ff4500);
  box-shadow: 0 0 6px 2px rgba(255, 69, 0, 0.6);
  animation: fire-particle 2s ease-out infinite;
}

.element-particle.water {
  background: radial-gradient(circle at 30% 30%, #bef7ff, #7ad9f5, #0080ff);
  box-shadow: 0 0 6px 2px rgba(0, 128, 255, 0.4);
  animation: water-particle 3s ease-in-out infinite;
}

.element-particle.air {
  background: radial-gradient(circle at 30% 30%, #ffffff, #e6f7ff, #c0e6ff);
  box-shadow: 0 0 6px 2px rgba(192, 230, 255, 0.4);
  animation: air-particle 2.5s ease-in-out infinite;
}

.element-particle.earth {
  background: radial-gradient(circle at 30% 30%, #d1af6e, #a67c52, #754c29);
  box-shadow: 0 0 6px 2px rgba(117, 76, 41, 0.4);
  animation: earth-particle 4s ease-in-out infinite;
}

/* 元素粒子動畫 */
@keyframes fire-particle {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-40px) scale(0.4);
    opacity: 0;
  }
}

@keyframes water-particle {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-10px) translateX(10px) scale(1.1);
    opacity: 0.6;
  }
  100% {
    transform: translateY(0) translateX(20px) scale(0.8);
    opacity: 0;
  }
}

@keyframes air-particle {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.7;
  }
  33% {
    transform: translateY(-15px) translateX(15px) scale(1.1);
    opacity: 0.9;
  }
  66% {
    transform: translateY(-5px) translateX(25px) scale(0.9);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-20px) translateX(10px) scale(0.7);
    opacity: 0;
  }
}

@keyframes earth-particle {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(10px) scale(1.1);
    opacity: 0.6;
  }
  100% {
    transform: translateY(0) scale(0.7);
    opacity: 0;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .loading-logo {
    font-size: 2rem;
  }
  
  .loading-bar {
    width: 80%;
    max-width: 300px;
  }
  
  #dialogue-container {
    width: 95%;
    bottom: 1rem;
    padding: 1rem;
  }
}
```

## 核心文件建立完成

上述初始化已建立了主要的專案結構和核心模組。這些檔案提供了艾利門特亞遊戲的基礎架構，包括：

1. **資源載入系統**：實現分層載入策略，確保核心功能在300KB內初始化
2. **臨時玩家識別**：無需註冊即可提供一致的玩家身份
3. **事件驅動架構**：確保系統模組間松耦合交互
4. **本地存儲管理**：有效管理遊戲狀態和玩家進度

### 後續開發建議

接下來的開發步驟：

1. **實現四元素魔法系統**，包括元素親和力計算和視覺效果
2. **建立WebSocket連接架構**，實現多人互動與同步
3. **完成對話系統**與NPC互動機制
4. **實現和諧村區域**作為首個完整遊戲區域

這個專案結構設計旨在實現高效率的資源管理，同時提供豐富的遊戲體驗。通過模塊化設計，我們可以確保代碼的可維護性和可擴展性，同時優化載入性能以符合即時進入的需求。