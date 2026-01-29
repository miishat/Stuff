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
                theme_color: '#0B0F19',
                icons: [
                    {
                        src: 'icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ],
                start_url: '/',
                display: 'standalone',
                background_color: '#0B0F19'
            }
        })
    ],
    base: './',
})
