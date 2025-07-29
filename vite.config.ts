import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        AutoImport({
            imports: ["vue", "vue-router"],
            dts: 'types/auto-imports.d.ts'
        }),
        Components({
            dts: 'types/components.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@':
                fileURLToPath(new URL('./src', import.meta.url))
        }
        ,
    }
    ,
    server: {
        port: 4040,
    }
})
