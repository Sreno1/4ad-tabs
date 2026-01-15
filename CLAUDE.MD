# Four Against Darkness - Development Guide

This is a Vite + React application for the "Four Against Darkness" solo tabletop game companion app.

## Running Locally

### Prerequisites
- **Node.js** version 18 or higher
- **npm** (comes with Node.js)

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

   The development server includes:
   - Hot Module Replacement (HMR) - changes appear instantly
   - Fast refresh for React components
   - Detailed error messages in the browser

3. **Build for production** (optional)
   ```bash
   npm run build
   ```

   This creates an optimized production build in the `dist/` directory.

4. **Preview production build** (optional)
   ```bash
   npm run preview
   ```

   This serves the production build locally to test before deployment.

## Project Structure

```
4ad-tabs/
├── src/              # Source code
│   ├── components/   # React components
│   ├── App.jsx       # Main application component
│   └── main.jsx      # Application entry point
├── public/           # Static assets
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── package.json      # Project dependencies and scripts
```

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **PostCSS & Autoprefixer** - CSS processing

## Development Tips

- The app is mobile-first, so test responsive designs
- React DevTools browser extension is recommended for debugging
- Changes to `.jsx` files will hot-reload automatically
- Changes to Tailwind classes require the dev server to rebuild (very fast)
- Check the browser console for any errors or warnings

## Deployment

This project is configured to deploy to GitHub Pages automatically via GitHub Actions when pushing to the repository.

## Need Help?

- Vite docs: https://vitejs.dev
- React docs: https://react.dev
- Tailwind CSS docs: https://tailwindcss.com
