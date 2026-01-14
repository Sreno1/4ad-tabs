# Four Against Darkness - Digital Companion

A digital companion app for the "Four Against Darkness" solo dungeon-crawling tabletop game. This mobile-first web app helps you manage your adventuring party, generate dungeons, handle combat, and track your progress.

## 🎮 Features

- **Party Management**: Create up to 4 heroes from 8 character classes (Warrior, Cleric, Rogue, Wizard, Barbarian, Halfling, Dwarf, Elf)
- **Dungeon Generation**: Automatically generate rooms using d66 tile rolls and 2d6 content rolls
- **Combat System**: Quick attack and defense resolution with visual feedback
- **Adventure Log**: Track all your dungeon events and decisions
- **Built-in Dice Roller**: d6, 2d6, and d66 rolls at your fingertips

## 🚀 Live Demo

Once deployed, your app will be available at:
`https://sreno1.github.io/4ad-tabs/`

## 🛠️ Development

### Prerequisites
- Node.js 18+ and npm

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

### Making Changes

1. Edit files in the `src/` directory
2. The development server will hot-reload your changes
3. Commit and push to automatically deploy to GitHub Pages

## 📦 Deployment

This project uses GitHub Actions to automatically deploy to GitHub Pages when you push to the `main` branch or any `claude/**` branch.

### First-Time Setup

To enable GitHub Pages for this repository:

1. Go to your repository settings on GitHub
2. Navigate to **Pages** (under "Code and automation")
3. Under **Build and deployment**:
   - Source: Select "GitHub Actions"
4. The next push will automatically deploy your app!

## 📱 How to Use

1. **Party Tab**: Add heroes to your party, manage their levels and health, track gold
2. **Dungeon Tab**: Generate new rooms, search for secrets, view dungeon history
3. **Combat Tab**: Set foe level and resolve attacks/defenses with dice rolls
4. **Log Tab**: Review your adventure history and reset when needed

## 🎲 Game Mechanics

- Characters gain abilities based on their class and level (max level 5)
- Combat uses d6 rolls + level modifiers
- Dungeon rooms are generated using classic d66 tables
- Track minor encounters (max 10) and major foes to trigger the final boss

## 🔧 Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- GitHub Pages (hosting)

---

Happy adventuring! 🗡️ 🛡️ 🐉
