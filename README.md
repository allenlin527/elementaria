# Elementaria - Lightweight Multiplayer Web Adventure Game

![Elementaria](https://via.placeholder.com/800x200.png?text=Elementaria+-+Element+Magic+Adventure)

## 🌌 Project Overview

Elementaria is a lightweight multiplayer text-based adventure game centered around elemental magic. Built with pure HTML5, CSS3, and vanilla JavaScript, the game focuses on delivering a rich player experience within strict technical constraints. Players explore a world affected by elemental imbalance, develop their affinity with fire, water, air, and earth elements, and collaborate to restore harmony.

### Key Features

- **Lightweight Core Engine**: Initial load under 300KB, with progressive resource loading
- **No-Login Multiplayer**: Seamless multiplayer experience without account creation
- **Element Magic System**: Four-element magic system with visual effects and interaction mechanics
- **Adaptive Experience**: Progressive enhancement based on device capabilities
- **Rich Narrative**: Branching dialogues and dynamic story progression

## 🔧 Technical Architecture

### Core Technical Requirements

- Initial load size: <300KB
- Browser support: Modern browsers (Chrome, Firefox, Safari, Edge)
- No external frameworks or heavy libraries
- Responsive design for desktop and mobile devices
- WebSocket-based multiplayer synchronization

### Key System Modules

1. **ResourceLoadManager**
   - Layered resource loading strategy (CORE, CURRENT_AREA, ADJACENT_AREAS)
   - Dynamic resource prediction and preloading
   - Resource caching and management

2. **TemporaryIdentityManager**
   - Browser fingerprinting for reliable temporary ID generation
   - LocalStorage persistence for consistent identity between sessions
   - Privacy-conscious identity management

3. **DiffSyncSystem**
   - Differential synchronization for minimal network traffic
   - Priority-based sync queue for critical updates
   - Network-adaptive synchronization intervals

4. **ElementalMagicSystem**
   - Four-element magic framework (fire, water, air, earth)
   - Element interactions and combination effects
   - CSS-based visual effects with ThreeJS enhancement

5. **CollaborativeSpellSystem**
   - Multi-player cooperation mechanics
   - Elemental combination casting
   - Synchronized spell effects

6. **DialogueSystem**
   - Conditional branching dialogue trees
   - Variable substitution and context-aware responses
   - NPC relationship tracking

7. **PerformanceMonitor**
   - Device capability detection
   - Dynamic visual effect adjustment
   - Resource usage optimization

## 💻 Development Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v7.0.0 or higher)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-organization/elementaria.git
cd elementaria

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

- `npm start`: Runs the development server on http://localhost:9000
- `npm run build`: Builds production-ready files to the dist/ directory
- `npm run build:analyze`: Builds with bundle analysis for optimization
- `npm test`: Runs test suite
- `npm run lint`: Lints code using ESLint
- `npm run format`: Formats code using Prettier

## 📂 Project Structure

```
elementaria/
├── dist/                  # Compiled files (generated)
├── src/
│   ├── core/              # Core engine components
│   │   ├── engine.js      # Main game engine
│   │   ├── events.js      # Event system
│   │   ├── loader.js      # Resource loading manager
│   │   ├── identity.js    # Temporary identity manager
│   │   └── storage.js     # Local storage manager
│   │
│   ├── ui/                # User interface components
│   │   ├── uiSystem.js    # UI coordination
│   │   └── styles/        # CSS styles
│   │
│   ├── player/            # Player-related systems
│   │   ├── character.js   # Player character system
│   │   └── progression.js # Progression system
│   │
│   ├── magic/             # Elemental magic system
│   │   ├── elements/      # Element definitions
│   │   └── effects/       # Spell effects
│   │
│   ├── world/             # Game world components
│   │   ├── areas/         # Game areas content
│   │   └── state.js       # World state manager
│   │
│   ├── network/           # Multiplayer functionality
│   │   ├── connection.js  # WebSocket connection
│   │   └── sync.js        # State synchronization
│   │
│   ├── utils/             # Utility functions
│   │   └── performance.js # Performance monitoring
│   │
│   └── index.html         # Main HTML entry point
│
├── assets/                # Static assets (pre-build)
│   ├── images/
│   └── data/
│
├── tests/                 # Test files
├── webpack.config.js      # Webpack configuration
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .gitignore
├── package.json
└── README.md              # This file
```

## 🔄 Development Workflow

### Resource Loading Strategy

The game implements a sophisticated resource loading strategy to ensure optimal performance:

1. **Core Layer (~180KB)**: Essential game engine, UI, and basic systems
2. **Current Area Layer (~70-100KB)**: Resources for the player's current location
3. **Adjacent Areas Layer**: Preloaded resources for potentially next visited areas
4. **Visual Enhancement Layer**: Optional ThreeJS effects loaded based on device capability
5. **Audio Layer**: Sound resources loaded at lowest priority

Example implementation for area loading:

```javascript
// Load current area resources
await ResourceLoadManager.loadAreaResources('harmony_village');

// Preload adjacent areas in background
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    ResourceLoadManager.preloadAdjacentAreas('harmony_village');
  });
}
```

### Temporary Identity System

The game uses a browser fingerprinting approach to provide persistent player identity without login:

```javascript
// Generate a temporary ID based on browser characteristics
const browserFeatures = [
  navigator.userAgent,
  screen.width + 'x' + screen.height,
  navigator.language,
  // Other non-sensitive browser characteristics
];

// Create fingerprint hash
const fingerprint = hashCode(browserFeatures.join('|'));

// Combine with timestamp for uniqueness
const tempId = `${fingerprint}_${Date.now().toString(36)}`;
```

### Differential State Synchronization

To minimize network traffic, the game implements differential synchronization:

```javascript
// Only send state changes, not the entire state
function prepareStateUpdate(currentState) {
  if (!lastSentState) {
    lastSentState = deepCopy(currentState);
    return { type: 'full', data: currentState };
  }
  
  // Calculate difference between current and last sent state
  const diff = calculateDiff(lastSentState, currentState);
  
  // Only send if there are changes
  if (Object.keys(diff).length > 0) {
    lastSentState = deepCopy(currentState);
    return { type: 'diff', changes: diff };
  }
  
  return null; // No changes to send
}
```

## 🚀 Performance Optimization

### Initial Load Optimization

- Critical CSS inlined in HTML
- Code splitting and lazy loading for non-critical components
- Aggressive asset optimization (image compression, minification)
- Deferred loading of visual enhancements

### Runtime Performance

- Object pooling for frequent operations
- Efficient DOM manipulation with document fragments
- Limited animation scope with CSS transitions and `will-change`
- Frame rate monitoring and dynamic visual quality adjustment

### Network Optimization

- WebSocket message batching and compression
- Priority-based synchronization queue
- Adaptive sync rate based on network conditions
- Efficient binary message format for state updates

## ⚙️ Deployment

### Build Process

The build process is managed by Webpack with optimization plugins:

```bash
# Create production build
npm run build

# Contents will be in the dist/ directory
```

The build process includes:

- JavaScript and CSS minification
- Asset optimization
- Code splitting
- Bundle analysis

### Deployment Checklist

1. Run full test suite
2. Build production assets
3. Verify load size is under required limits
4. Test on target environments
5. Deploy static assets to CDN
6. Deploy WebSocket server
7. Configure CORS and security headers

## 📅 Development Roadmap

### Current Sprint: Phase 1 (Weeks 1-2)

- Core engine development
- Resource loading system
- Basic UI framework
- Temporary identity system implementation

### Phase 2 (Weeks 3-4)

- Player character and progression systems
- NPC system and dialogue extensions
- Enhanced multiplayer interaction
- Area templates and content framework

### Phase 3 (Weeks 5-6)

- Harmony Village full implementation
- Element magic system complete
- ThreeJS visual enhancements
- Collaborative spell system

### Phase 4 (Weeks 7-8)

- Performance optimization
- Multi-device testing
- Multiplayer feature testing
- Final integration and MVP preparation

## 🧪 Testing Guidelines

### Performance Testing

- Initial load size verification (<300KB)
- FPS monitoring during gameplay
- Memory usage tracking
- Network traffic measurement

### Cross-Device Testing

- Desktop browsers: Chrome, Firefox, Safari, Edge
- Mobile devices: iOS Safari, Android Chrome
- Low-performance device testing
- Variable network condition testing

### Multiplayer Testing

- Connection stability testing
- Synchronization accuracy verification
- Multi-player spell cooperation testing
- Instance management load testing

## 🤝 Contribution Guidelines

### Code Style

- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Document complex algorithms and business logic
- Maintain module encapsulation and single responsibility

### Performance Considerations

- Always consider resource size impact
- Profile performance before and after significant changes
- Test on lower-end devices
- Consider network performance implications

### Pull Request Process

1. Ensure code passes all tests
2. Update documentation as needed
3. Include performance impact assessment
4. Require review from at least one core team member

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🔗 Contact

For any inquiries regarding this project, please contact the project lead at [project-lead@elementaria.com](mailto:project-lead@elementaria.com).

---

Built with ❤️ by the Elementaria Team