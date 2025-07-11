import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import icons from './public/logos/icons.ts';

export default defineConfig(({ mode }) => {
    const res = {
        root: "./demo",
        plugins: [
            vue(),
        ],
        optimizeDeps: {
            include: [],
        },
        build: {},
    }

    return res;
})

