// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},

    // 明确启用SSR
    ssr: true,

    // 运行时配置
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:10010'
        }
    },

    // 客户端水合配置
    nitro: {
        prerender: {
            routes: ['/']
        }
    },

    modules: ['@nuxt/ui', 'shadcn-nuxt'],
    shadcn: {
        prefix: '',
        componentDir: './components/ui'
    },
    css: ['~/assets/css/tailwind.css', '~/assets/css/base.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    app: {
        head: {
            htmlAttrs: {
                lang: "zh-CN"
            },
            meta: [
                {
                    property: "og:site:name",
                    content: "今日时事"
                }
            ],
            script: [
                {
                    type: "application/ld+json",
                    textContent: `{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "今日时事",
  "url": "https://news.yltfspace.com",
  "alternateName":["今日新闻","新闻","时事","热点","今日热点","今日新闻热点","最新新闻","最新时事","最新热点"],
  "description": "每日更新全球最新鲜、最有趣的新闻资讯，涵盖科技、娱乐、体育、国际等多个领域，让你轻松掌握世界动态。",
  "inLanguage": "zh-CN",
  "keywords": "新闻, 时事, 热点, 今日新闻, 今日时事, 最新新闻, 最新时事, 最新热点",
  "publisher": {
    "@type": "Person",
    "name": "Yltf",
    "url": "https://blog.yltfspace.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cdn.yltfspace.com/512.png"
    }
  }
}`
                }
            ],
            link: [
                {rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://cdn.yltfspace.com/16.png'},
                {rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://cdn.yltfspace.com/32.png'},
                {rel: 'icon', type: 'image/png', sizes: '64x64', href: 'https://cdn.yltfspace.com/64.png'},
                {rel: 'icon', type: 'image/png', sizes: '256x256', href: 'https://cdn.yltfspace.com/256.png'},
                {rel: 'icon', type: 'image/png', sizes: '512x512', href: 'https://cdn.yltfspace.com/512.png'},
                {rel: 'apple-touch-icon', sizes: '120x120', href: 'https://cdn.yltfspace.com/512.png'},
                {rel: 'apple-touch-icon', sizes: '152x152', href: 'https://cdn.yltfspace.com/512.png'},
                {rel: 'apple-touch-icon', sizes: '167x167', href: 'https://cdn.yltfspace.com/512.png'},
                {rel: 'apple-touch-icon', sizes: '180x180', href: 'https://cdn.yltfspace.com/512.png'},
            ]
        }
    }

})
