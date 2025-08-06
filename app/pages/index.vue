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
import {useFavorites} from '@/composables/useFavorites'
import {PlatformIcons} from '@/config/icon'

import type {NewsItem} from "@/api"
import {fetchNews as apiFetchNews} from "@/api"
import {getRouteConfig, getPlatformConfigs} from '@/config/platforms'
import type {TimelinePlatform} from "~/components/IntegratedTimeline.vue";

// 获取时间线路由配置
const routeConfig = getRouteConfig('/timeline')!

// 设置页面SEO
useHead({
  title: '新闻聚合 - 实时新闻时间线',
  meta: [
    {name: 'description', content: '实时聚合各大平台最新资讯，按时间顺序展示热点新闻动态'},
    {property: 'og:title', content: '新闻聚合 - 实时新闻时间线'},
    {property: 'og:description', content: '实时聚合各大平台最新资讯，按时间顺序展示热点新闻动态'},
    {name: 'keywords', content: '新闻时间线,综合新闻,实时资讯,热点动态'}
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
    let category = '其他'
    if (['_36kr', 'ithome', 'solidot', 'v2ex', 'coolapk', 'juejin', 'sspai', 'csdn', 'nowcoder', 'pcbeta_windows', '_51cto', 'kaopu'].includes(config.platform)) {
      category = '科技'
    } else if (['thepaper', 'cankaoxiaoxi', 'zaobao', 'sputniknewscn', 'tieba'].includes(config.platform)) {
      category = '社会'
    } else if (['jin10', 'jqka', 'gelonghui', 'wallstreetcn_live', 'wallstreetcn_news', 'wallstreetcn_hot', 'hotstock', 'cls_telegraph'].includes(config.platform)) {
      category = '财经'
    } else if (['dcd_hot', 'dcd_news'].includes(config.platform)) {
      category = '汽车'
    }

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

// 使用收藏功能
const {platforms} = useFavorites()

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

// 获取单个平台数据
const fetchPlatformData = async (platform: string) => {
  if (!platformsData[platform]) return

  const state = platformsData[platform]
  state.loading = true
  state.error = null

  try {
    const result = await apiFetchNews(platform)
    if (result && Array.isArray(result)) {
      state.data = result
    } else {
      state.data = []
      state.error = '数据格式错误'
    }
  } catch (err: any) {
    state.error = err.message || '网络请求失败'
    state.data = []
    console.error(`获取${platform}数据失败:`, err)
  } finally {
    state.loading = false
  }
}

// 获取所有平台数据
const fetchAllPlatformsData = async () => {
  const promises = platformConfigs.map(config => fetchPlatformData(config.platform))
  await Promise.allSettled(promises)
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
          class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <UiSidebarTrigger class="-ml-1"/>
          <Separator orientation="vertical" class="mr-2 h-4"/>
          <UiBreadcrumb>
            <UiBreadcrumbList>
              <UiBreadcrumbItem>
                <UiBreadcrumbPage class="text-foreground font-medium">新闻第一线</UiBreadcrumbPage>
              </UiBreadcrumbItem>
            </UiBreadcrumbList>
          </UiBreadcrumb>
        </div>

        <!-- 右侧按钮区域 - 响应式适配 -->
        <div class="flex items-center gap-2 ml-auto px-4">
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
      <Separator/>

      <!-- 可滚动的主内容区域 -->
      <div class="flex-1 overflow-hidden bg-muted/20">
        <UiScrollArea class="h-full">
          <div class="p-4">
            <!-- 页面说明 -->
            <div class="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-2 mb-2">
                <Clock class="h-5 w-5 text-blue-600"/>
                <h2 class="font-medium text-blue-900 dark:text-blue-100">实时新闻时间线</h2>
              </div>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                按时间顺序展示各大平台的最新资讯，让您第一时间了解热点动态
              </p>
            </div>

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
