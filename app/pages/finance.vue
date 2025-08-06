<script setup lang="ts">
import { reactive, computed, onMounted, ref, watch } from 'vue'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  RefreshCw,
  Globe,
  Github,
  Search
} from 'lucide-vue-next'

import AppSidebar from '@/components/AppSidebar.vue'
import NewsRankCard from '@/components/NewsRankCard.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useFavorites } from '@/composables/useFavorites'
import { Button } from '@/components/ui/button'
import { PlatformIcons } from '@/config/icon.ts'

import type { NewsItem } from "@/api"
import { fetchNews as apiFetchNews } from "@/api"
import { getRouteConfig, getPlatformConfigs } from '@/config/platforms'

// 获取路由配置
const routeConfig = getRouteConfig('/finance')!

// 设置页面SEO
useHead({
  title: routeConfig.title,
  meta: [
    { name: 'description', content: routeConfig.description },
    { property: 'og:title', content: routeConfig.title },
    { property: 'og:description', content: routeConfig.description },
    { name: 'keywords', content: '财经新闻,金融资讯,股市动态,经济资讯' }
  ]
})

// 获取平台配置
const platformConfigs = getPlatformConfigs(routeConfig.platforms)

// 使用收藏功能
const { newsItems, platforms } = useFavorites()

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

// 默认平台列表
const defaultPlatforms = platformConfigs.map(config => ({
  platform: config.platform,
  title: config.title
}))

const financePlatforms = ref([...defaultPlatforms])

// 各平台数据状态
const platformsData = reactive<Record<string, {
  data: NewsItem[]
  loading: boolean
  error: string | null
}>>({})

// 初始化平台数据状态
financePlatforms.value.forEach(platform => {
  platformsData[platform.platform] = {
    data: [],
    loading: false,
    error: null
  }
})

// 确保平台数据状态存在
const ensurePlatformState = (platform: string) => {
  if (!platformsData[platform]) {
    platformsData[platform] = {
      data: [],
      loading: false,
      error: null
    }
  }
}

// 获取单个平台数据
const fetchPlatformData = async (platform: string) => {
  if (!platform) return

  ensurePlatformState(platform)
  const state = platformsData[platform]

  if (!state) return

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

// 获取所有财经平台数据
const fetchAllPlatformsData = async () => {
  const promises = financePlatforms.value.map(p => fetchPlatformData(p.platform))
  const results = await Promise.allSettled(promises)

  // 记录失败的平台
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`平台 ${financePlatforms.value[index].platform} 数据获取失败:`, result.reason)
    }
  })
}

// 刷新所有数据
const refreshAllData = () => {
  fetchAllPlatformsData()
}

// 刷新单个平台数据
const refreshSinglePlatform = (platform: string) => {
  fetchPlatformData(platform)
}

// 处理卡片点击 - SSR兼容版本
const handleCardItemClick = (item: NewsItem) => {
  if (process.client && typeof window !== 'undefined') {
    window.open(item.url, '_blank')
  }
}

// 处理显示更多
const handleShowMore = (platform: string, title: string) => {
  console.log(`显示更多: ${title}`)
  // 这里可以跳转到详细页面或打开模态框
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
  <SidebarProvider>
    <AppSidebar />
    <!-- 全局搜索组件 -->
    <GlobalSearch
        ref="globalSearchRef"
        :hot-platforms="financePlatforms"
        :platforms-data="platformsData"
        @filter-change="(filter) => $router.push(`/${filter}`)"
        @news-click="handleCardItemClick"
    />
    <SidebarInset class="flex flex-col h-screen">
      <!-- 面包屑导航 - 带sticky和backdrop-blur效果 -->
      <header
          class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1"/>
          <Separator orientation="vertical" class="mr-2 h-4"/>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="/" class="text-muted-foreground">
                  首页
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block"/>
              <BreadcrumbItem>
                <BreadcrumbPage class="text-foreground font-medium">{{ routeConfig.title }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <!-- 右侧按钮区域 - 响应式适配 -->
        <div class="flex items-center gap-2 ml-auto px-4">
          <!-- 刷新按钮 - 桌面版 -->
          <Button
              variant="outline"
              size="sm"
              @click="refreshAllData"
              class="gap-1 hidden sm:flex h-8"
          >
            <RefreshCw class="w-4 h-4"/>
            刷新全部
          </Button>
          <!-- 刷新按钮 - 移动版 -->
          <Button
              variant="outline"
              size="icon"
              @click="refreshAllData"
              class="sm:hidden h-8 w-8"
          >
            <RefreshCw class="w-4 h-4"/>
          </Button>

          <!-- 搜索按钮 - 桌面版 -->
          <Button
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
          </Button>
          <!-- 搜索按钮 - 移动版 -->
          <Button
              variant="outline"
              size="icon"
              @click="openGlobalSearch"
              class="sm:hidden h-8 w-8"
          >
            <Search class="w-4 h-4"/>
          </Button>

          <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              @click="openLink"
          >
            <Github class="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"/>
          </Button>
          <ThemeToggle/>
        </div>
      </header>
      <Separator/>

      <!-- 可滚动的主内容区域 -->
      <div class="flex-1 overflow-hidden bg-muted/20">
        <ScrollArea class="h-full">
          <div class="p-4">
            <!-- 页面标题 -->
            <div class="mb-6">
              <h1 class="text-3xl font-bold tracking-tight">{{ routeConfig.title }}</h1>
              <p class="text-muted-foreground mt-2">{{ routeConfig.description }}</p>
            </div>
            
            <!-- 操作栏 -->
            <div class="flex items-center justify-between mb-6">
              <p class="text-sm text-muted-foreground">
                共 {{ financePlatforms.length }} 个财经平台
              </p>
            </div>

            <!-- 新闻卡片网格 - 响应式网格布局 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <NewsRankCard
                  v-for="platform in financePlatforms"
                  :key="`grid-card-${platform.platform}`"
                  :title="platform.title"
                  :platform="platform.platform"
                  :platform-icon="getPlatformIcon(platform.platform)"
                  :data="platformsData[platform.platform]?.data || []"
                  :loading="platformsData[platform.platform]?.loading || false"
                  :is-favorited="platforms.some(p => p.platform === platform.platform)"
                  :show-drag-handle="false"
                  @item-click="handleCardItemClick"
                  @show-more="handleShowMore(platform.platform, platform.title)"
                  @refresh="refreshSinglePlatform(platform.platform)"
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template> 