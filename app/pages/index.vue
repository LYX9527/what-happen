<script setup lang="ts">
import {reactive, computed, onMounted, ref} from 'vue'
import {
  RefreshCw,
  Globe,
  Github,
  Search,
  Clock
} from 'lucide-vue-next'

import AppSidebar from '@/components/AppSidebar.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import IntegratedTimeline from '@/components/IntegratedTimeline.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {PlatformIcons} from '@/config/icon'

import type {NewsItem} from "@/api"
import {fetchNews as apiFetchNews} from "@/api"
import {getRouteConfig, getPlatformConfigs, getCategoryLabel} from '@/config/platforms'
import type {TimelinePlatform} from "~/components/IntegratedTimeline.vue";

// 获取时间线路由配置
const routeConfig = getRouteConfig('/')!

// 设置页面SEO
useHead({
  title: '今日时事 - 新闻第一线',
  meta: [
    {name: 'description', content: '今日时事为您实时聚合各大平台最新资讯，按时间顺序展示热点新闻动态，包含头条、百度、知乎、V2EX、微博、贴吧、豆瓣、天涯、虎扑、Github、抖音、懂车帝...追踪全网热点、简单高效阅读'},
    {property: 'og:title', content: '今日时事 - 新闻第一线'},
    {property: 'og:description', content: '今日时事为您实时聚合各大平台最新资讯，按时间顺序展示热点新闻动态，包含头条、百度、知乎、V2EX、微博、贴吧、豆瓣、天涯、虎扑、Github、抖音、懂车帝...追踪全网热点、简单高效阅读'},
    {property: "og:url", content: 'https://news.yltfspace.com'},
    {property: "og:type", content: 'website'},
    {name: 'keywords', content: '今日时事,新闻时间线,综合新闻,实时资讯,热点动态,新闻第一线,YltfSpace'}
  ]
})

// 获取平台配置
const platformConfigs = getPlatformConfigs(routeConfig.platforms)

// 平台配置映射（包含分类和颜色）
const timelinePlatformConfigs = computed(() => {
  const categoryColors = {
    '科技': ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-gray-500', 'bg-teal-500', 'bg-yellow-500', 'bg-slate-500', 'bg-emerald-500'],
    '社会': ['bg-red-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-cyan-500'],
    '财经': ['bg-amber-600', 'bg-rose-500'],
    '汽车': ['bg-violet-500'],
    '其他': ['bg-gray-400']
  }

  const categoryCounters = {
    '科技': 0,
    '社会': 0,
    '财经': 0,
    '汽车': 0,
    '其他': 0
  }

  return platformConfigs.map(config => {
    // 根据平台确定分类
    let category = getCategoryLabel(config.platform)

    // 分配颜色
    const colors = categoryColors[category as keyof typeof categoryColors] || categoryColors['其他']
    const colorIndex = categoryCounters[category as keyof typeof categoryCounters] % colors.length
    const color = colors[colorIndex]
    categoryCounters[category as keyof typeof categoryCounters]++

    return {
      key: config.platform,
      title: config.title,
      category,
      color
    } as TimelinePlatform
  })
})


// 全局搜索组件引用
const globalSearchRef = ref()

// 检测是否为Mac平台 - SSR兼容版本
const isMac = computed(() => {
  if (process.server) {
    return false
  }
  try {
    return typeof navigator !== 'undefined' &&
        navigator.platform &&
        navigator.platform.toLowerCase().includes('mac')
  } catch (error) {
    return false
  }
})

// 平台数据状态
interface PlatformData {
  data: NewsItem[]
  loading: boolean
  error: string | null
}

const platformsData = reactive<Record<string, PlatformData>>({})

// 初始化平台数据状态
platformConfigs.forEach(config => {
  platformsData[config.platform] = {
    data: [],
    loading: false,
    error: null
  }
})


// 获取所有平台数据
// SWR + 微批提交：保留旧数据、逐个平台返回即入队，动画帧/16ms 批量落地
const activeRunId = ref<symbol | null>(null)
const pendingUpdates = new Map<string, { data?: NewsItem[]; error?: string | null; loading?: boolean }>()
let flushScheduled = false

const flushNow = () => {
  const runId = activeRunId.value
  flushScheduled = false
  pendingUpdates.forEach((upd, platform) => {
    // 若期间发起了新的刷新，则忽略过期提交
    if (activeRunId.value !== runId) return
    const state = platformsData[platform]
    if (!state) return
    if (upd.data !== undefined) state.data = upd.data
    if (upd.error !== undefined) state.error = upd.error
    if (upd.loading !== undefined) state.loading = upd.loading
    pendingUpdates.delete(platform)
  })
}

const scheduleFlush = () => {
  if (flushScheduled) return
  flushScheduled = true
  if (process.client && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(flushNow)
  } else {
    setTimeout(flushNow, 16)
  }
}

const fetchAllPlatformsData = async () => {
  // 运行令牌，用于防止过期请求写回
  const runId = Symbol('fetchAllPlatformsData')
  activeRunId.value = runId

  // 启动阶段：标记 loading，清空错误，但保留旧数据（SWR）
  platformConfigs.forEach(cfg => {
    const s = platformsData[cfg.platform]
    if (s) {
      s.loading = true
      s.error = null
    }
  })

  const requests = platformConfigs.map(cfg => {
    const platform = cfg.platform
    return apiFetchNews(platform)
        .then(val => {
          // 忽略过期的批次
          if (activeRunId.value !== runId) return
          if (Array.isArray(val)) {
            pendingUpdates.set(platform, {data: val, error: null, loading: false})
          } else {
            pendingUpdates.set(platform, {error: '数据格式错误', loading: false})
          }
          scheduleFlush()
        })
        .catch(reason => {
          if (activeRunId.value !== runId) return
          const err = (reason && (reason.message || String(reason))) || '网络请求失败'
          // 失败时仅更新 error 与 loading，保留旧数据避免闪屏
          pendingUpdates.set(platform, {error: err, loading: false})
          scheduleFlush()
        })
  })

  // 等待全部完成，确保尾批也能落地
  await Promise.allSettled(requests)
  if (activeRunId.value === runId) {
    flushNow()
  }
}

// 处理新闻点击
const handleNewsClick = (item: NewsItem) => {
  if (process.client && typeof window !== 'undefined') {
    window.open(item.url, '_blank')
  }
}

// 刷新所有数据
const refreshAllData = () => {
  fetchAllPlatformsData()
}

// 处理外部链接打开 - SSR兼容版本
const openLink = () => {
  if (process.client && typeof window !== 'undefined') {
    window.open('https://github.com/LYX9527/what-happen', '_blank')
  }
}

// 打开全局搜索
const openGlobalSearch = () => {
  if (globalSearchRef.value) {
    globalSearchRef.value.open()
  }
}

// 获取平台图标
const getPlatformIcon = (platform: string) => {
  return PlatformIcons[platform as keyof typeof PlatformIcons] || Globe
}

// 用于全局搜索的虚拟平台列表
const searchPlatforms = ref(platformConfigs.map(config => ({
  platform: config.platform,
  title: config.title
})))

// SSR兼容的数据初始化
onMounted(async () => {
  // 在客户端水合后加载数据
  if (process.client) {
    setTimeout(() => {
      fetchAllPlatformsData()
    }, 100)
  }
})
</script>

<template>
  <UiSidebarProvider>
    <AppSidebar/>
    <!-- 全局搜索组件 -->
    <GlobalSearch
        ref="globalSearchRef"
        :hot-platforms="searchPlatforms"
        :platforms-data="platformsData"
        @filter-change="(filter) => $router.push(`/${filter}`)"
        @news-click="handleNewsClick"
    />
    <UiSidebarInset class="flex flex-col h-screen">
      <!-- 面包屑导航 - 带sticky和backdrop-blur效果 -->
      <header
          class="sticky top-0 z-50 flex h-12 sm:h-16 shrink-0 items-center gap-1.5 sm:gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <UiSidebarTrigger class="-ml-1"/>
          <UiSeparator orientation="vertical" class="mr-2 h-4"/>
          <UiBreadcrumb>
            <UiBreadcrumbList>
              <UiBreadcrumbItem class="hidden md:block">
                <UiBreadcrumbLink href="/" class="text-muted-foreground">首页</UiBreadcrumbLink>
              </UiBreadcrumbItem>

            </UiBreadcrumbList>
          </UiBreadcrumb>
        </div>

        <!-- 右侧按钮区域 - 响应式适配 -->
        <div class="flex items-center gap-1.5 sm:gap-2 ml-auto px-3 sm:px-4">
          <!-- 刷新按钮 - 移动版 -->
          <UiButton
              variant="outline"
              size="icon"
              @click="refreshAllData"
              class="sm:hidden h-8 w-8"
          >
            <RefreshCw class="w-4 h-4"/>
          </UiButton>

          <!-- 搜索按钮 - 桌面版 -->
          <UiButton
              variant="outline"
              size="sm"
              @click="openGlobalSearch"
              class="gap-1 hidden sm:flex h-8"
          >
            <Search class="w-4 h-4"/>
            <span>搜索</span>
            <kbd
                class="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              {{ isMac ? '⌘K' : 'Ctrl+K' }}
            </kbd>
          </UiButton>
          <!-- 搜索按钮 - 移动版 -->
          <UiButton
              variant="outline"
              size="icon"
              @click="openGlobalSearch"
              class="sm:hidden h-8 w-8"
          >
            <Search class="w-4 h-4"/>
          </UiButton>

          <UiButton
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              @click="openLink"
          >
            <Github class="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"/>
          </UiButton>
          <ThemeToggle/>
        </div>
      </header>
      <UiSeparator/>

      <!-- 可滚动的主内容区域 -->
      <div class="flex-1 overflow-hidden bg-muted/20">
        <UiScrollArea class="h-full">
          <div class="p-3 sm:p-4">
            <!-- 顶部说明区域移除，改由下方标题区的大图标承担视觉重点 -->

            <!-- 时间线组件 -->
            <IntegratedTimeline
                :platforms-data="platformsData"
                :platform-configs="timelinePlatformConfigs"
                @news-click="handleNewsClick"
                @refresh="refreshAllData"
            />
          </div>
        </UiScrollArea>
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
