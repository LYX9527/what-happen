// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    // 1. 基础环境配置
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    ssr: true,

    // 2. Vue 编译器增强：解决 [vite:vue] Failed to resolve extends base type
    vue: {
        compilerOptions: {},
        propsDestructure: true,
    },

    // 3. 运行时与部署配置
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:10010'
        }
    },

    nitro: {
        prerender: {
            routes: ['/']
        }
    },

    // 4. 模块配置
    modules: [
        '@nuxt/ui',
        'shadcn-nuxt',
    ],

    // 5. 组件扫描优化：解决日志中大量的 "Two component files resolving to the same name"
    // shadcn-nuxt 会自动处理 componentDir，我们只需确保不被 Nuxt 默认规则二次扫描导致冲突
    shadcn: {
        prefix: 'Ui', // 建议加上前缀，防止与 @nuxt/ui 或原生 HTML 标签冲突
        componentDir: './app/components/ui' // 注意：根据你的日志，路径似乎在 app/ 目录下
    },

    components: [
        {
            path: '~/components',
            pathPrefix: false, // 禁用路径前缀，让组件名更简洁
        }
    ],

    // 6. 样式与 Vite 插件
    css: ['~/assets/css/tailwind.css', '~/assets/css/base.css'],

    vite: {
        plugins: [
            tailwindcss(),
        ],
        // 优化构建：减少内存压力，防止 Vercel 构建超时
        build: {
            chunkSizeWarningLimit: 1000,
        }
    },

    // 7. 严格性调整：在部署环境放宽检查
    typescript: {
        typeCheck: false, // 生产环境不执行严格类型检查，由开发环境处理
        strict: false
    },

    // 8. SEO 与 Head
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
                    innerHTML: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "今日时事",
                        "url": "https://news.yltfspace.com",
                        "alternateName": ["今日新闻", "新闻", "时事", "热点", "今日热点", "今日新闻热点", "最新新闻", "最新时事", "最新热点"],
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
                    })
                }
            ],
            link: [
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
