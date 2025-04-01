import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        proxy: {
            '/': {
                target: 'ws://localhost:8080', // Go ws backend
                ws: true,
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
