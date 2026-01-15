import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // Serve dice-box assets from node_modules in dev mode
    {
      name: 'serve-dice-box-assets',
      apply: 'serve',
      configResolved(config) {
        this.config = config
      },
      configureServer(server) {
        const diceBoxPath = path.resolve(__dirname, 'node_modules/@3d-dice/dice-box')

        return () => {
          server.middlewares.use('/dice-box/', (req, res, next) => {
            const filePath = path.join(diceBoxPath, req.url)

            // Security check: ensure we're serving from dice-box only
            if (!filePath.startsWith(diceBoxPath)) {
              return res.status(403).end('Forbidden')
            }

            // Check if file exists
            if (!fs.existsSync(filePath)) {
              return next()
            }

            // Read and serve the file
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
              return next()
            }

            const content = fs.readFileSync(filePath)

            // Set appropriate MIME type
            const ext = path.extname(filePath).toLowerCase()
            const mimeTypes = {
              '.wasm': 'application/wasm',
              '.js': 'application/javascript',
              '.json': 'application/json',
              '.glb': 'model/gltf-binary',
              '.gltf': 'model/gltf+json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml'
            }

            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
            res.end(content)
          })
        }
      }
    }
  ],
  base: process.env.NODE_ENV === 'production' ? '/4ad-tabs/' : '/',
  server: {
    mimeTypes: {
      '.wasm': 'application/wasm'
    }
  }
})
