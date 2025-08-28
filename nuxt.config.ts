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
    css: ['~/assets/css/tailwind.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    app:{
        head:{
            link:[
                {
                    rel: 'icon',
                    type: 'image/png',
                    href: '/512.png'
                },
            ]
        }
    }

})
