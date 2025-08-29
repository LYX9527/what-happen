// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},

    // 明确启用SSR
    ssr: true,

    // 客户端水合配置
    nitro: {
        prerender: {
            routes: ['/']
        }
    },

    modules: ['@nuxt/ui', 'shadcn-nuxt'],
    shadcn: {
        /**
         * Prefix for all the imported component
         */
        prefix: '',
        /**
         * Directory that the component lives in.
         * @default "./components/ui"
         */
        componentDir: './components/ui'
    },
    css: ['~/assets/css/tailwind.css', '~/assets/css/base.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    app:{
        head:{
            link:[
                { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://cdn.yltfspace.com/16.png' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://cdn.yltfspace.com/32.png' },
                { rel: 'icon', type: 'image/png', sizes: '64x64', href: 'https://cdn.yltfspace.com/64.png' },
                { rel: 'icon', type: 'image/png', sizes: '256x256', href: 'https://cdn.yltfspace.com/256.png' },
                { rel: 'icon', type: 'image/png', sizes: '512x512', href: 'https://cdn.yltfspace.com/512.png' },
                { rel: 'apple-touch-icon', sizes: '120x120', href: 'https://cdn.yltfspace.com/512.png' },
                { rel: 'apple-touch-icon', sizes: '152x152', href: 'https://cdn.yltfspace.com/512.png' },
                { rel: 'apple-touch-icon', sizes: '167x167', href: 'https://cdn.yltfspace.com/512.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://cdn.yltfspace.com/512.png' },
            ]
        }
    }

})
