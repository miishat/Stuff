import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Stuff - Task Manager',
                short_name: 'Stuff',
                description: 'Offline capable task manager',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff'
            }
        })
    ],
    base: './',
})
