<script setup lang="ts">
import {reactive, computed, onMounted, ref} from 'vue'
import {VueDraggable} from 'vue-draggable-plus'
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
import {useFavorites} from '@/composables/useFavorites'
import {PlatformIcons} from '@/config/icon'

import type {NewsItem} from "@/api"
import {fetchNews as apiFetchNews} from "@/api"
import {getRouteConfig, getPlatformConfigs} from '@/config/platforms'

// 获取路由配置
const routeConfig = getRouteConfig('/hot')!

// 设置页面SEO
useHead({
  title: routeConfig.title + " | 今日时事",
  meta: [
    {name: 'description', content: routeConfig.description},
    {property: 'og:title', content: routeConfig.title},
    {property: 'og:description', content: routeConfig.description},
    {property: "og:url", content: 'https://news.yltfspace.com' + routeConfig.path},
    {name: 'keywords', content: '热门新闻,热点新闻,新闻排行,新闻聚合,今日热点,新闻第一线,微博热搜,知乎热榜,抖音热搜,快手热搜'}
  ]
})

// 获取平台配置
const platformConfigs = getPlatformConfigs(routeConfig.platforms)

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

// 默认平台列表
const defaultPlatforms = platformConfigs.map(config => ({
  platform: config.platform,
  title: config.title
}))

// 加载已保存的排序 - SSR兼容版本
const loadSavedOrder = () => {
  if (process.server) {
    return [...defaultPlatforms]
  }

  try {
    const saved = localStorage.getItem('platform-orders-hot')
    if (saved) {
      const savedOrder = JSON.parse(saved) as string[]
      const reorderedPlatforms = [] as Array<{
        platform: string
        title: string
      }>

      const remaining = [...defaultPlatforms]

      savedOrder.forEach(platformKey => {
        const index = remaining.findIndex(p => p.platform === platformKey)
        if (index !== -1) {
          reorderedPlatforms.push(remaining[index]!)
          remaining.splice(index, 1)
        }
      })

      return [...reorderedPlatforms, ...remaining]
    }
  } catch (error) {
    console.error('加载排序失败:', error)
  }
  return [...defaultPlatforms]
}

// 保存排序 - SSR兼容版本
const saveOrder = (platforms: typeof defaultPlatforms) => {
  if (process.client) {
    try {
      const order = platforms.map(p => p.platform)
      localStorage.setItem('platform-orders-hot', JSON.stringify(order))
    } catch (error) {
      console.error('保存排序失败:', error)
    }
  }
}

const hotPlatforms = ref(loadSavedOrder())

// 各平台数据状态
const platformsData = reactive<Record<string, {
  data: NewsItem[]
  loading: boolean
  error: string | null
}>>({})

// 初始化平台数据状态
hotPlatforms.value.forEach(platform => {
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
const fetchPlatformData = async (platform: string, timestamp?: number) => {
  if (!platform) return

  ensurePlatformState(platform)
  const state = platformsData[platform]

  if (!state) return

  state.loading = true
  state.error = null

  try {
    const result = await apiFetchNews(platform,timestamp)
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

// 获取所有热门平台数据
const fetchAllPlatformsData = async () => {
  const promises = hotPlatforms.value.map(p => fetchPlatformData(p.platform))
  await Promise.allSettled(promises)
}

// 刷新所有数据
const refreshAllData = () => {
  fetchAllPlatformsData()
}

// 刷新单个平台数据
const refreshSinglePlatform = (platform: string) => {
  fetchPlatformData(platform, new Date().getTime())
}

// 处理卡片点击 - SSR兼容版本
const handleCardItemClick = (item: NewsItem) => {
  if (process.client && typeof window !== 'undefined') {
    window.open(item.url, '_blank')
  }
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

// 拖拽排序处理
const onDragEnd = () => {
  console.log(`热搜榜平台排序已更新:`, hotPlatforms.value.map(p => p.title))
  // 保存当前排序
  saveOrder(hotPlatforms.value)
}

// SSR兼容的数据初始化
onMounted(async () => {
  // 在客户端水合后加载数据
  if (process.client) {
    await fetchAllPlatformsData()
  }
})
</script>

<template>
  <UiSidebarProvider>
    <AppSidebar/>
    <!-- 全局搜索组件 -->
    <GlobalSearch
        ref="globalSearchRef"
        :hot-platforms="hotPlatforms"
        :platforms-data="platformsData"
        @filter-change="(filter) => $router.push(`/${filter}`)"
        @news-click="handleCardItemClick"
    />
    <UiSidebarInset class="flex flex-col h-screen">
      <!-- 面包屑导航 - 带sticky和backdrop-blur效果 -->
      <header
          class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <UiSidebarTrigger class="-ml-1"/>
          <UiSeparator orientation="vertical" class="mr-2 h-4"/>
          <UiBreadcrumb>
            <UiBreadcrumbList>
              <UiBreadcrumbItem class="hidden md:block">
                <UiBreadcrumbLink href="/" class="text-muted-foreground">
                  首页
                </UiBreadcrumbLink>
              </UiBreadcrumbItem>
              <UiBreadcrumbSeparator class="hidden md:block"/>
              <UiBreadcrumbItem>
                <UiBreadcrumbPage class="text-foreground font-medium">{{ routeConfig.title }}</UiBreadcrumbPage>
              </UiBreadcrumbItem>
            </UiBreadcrumbList>
          </UiBreadcrumb>
        </div>

        <!-- 右侧按钮区域 - 响应式适配 -->
        <div class="flex items-center gap-2 ml-auto px-4">
          <!-- 刷新按钮 - 桌面版 -->
          <UiButton
              variant="outline"
              size="sm"
              @click="refreshAllData"
              class="gap-1 hidden sm:flex h-8"
          >
            <RefreshCw class="w-4 h-4"/>
            刷新全部
          </UiButton>
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
              {{ isMac ? '⌘ K' : 'Ctrl+K' }}
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
          <div class="p-4">
            <!-- 页面标题 -->
            <div class="mb-6">
              <h1 class="text-3xl font-bold tracking-tight ml-5">{{ routeConfig.title }}</h1>
              <p class="text-muted-foreground mt-2 ml-5">{{ routeConfig.description }}</p>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center justify-between mb-6 ml-5">
              <p class="text-sm text-muted-foreground">
                共 {{ hotPlatforms.length }} 个平台，支持拖拽排序
              </p>
            </div>

            <!-- 新闻卡片网格 - 响应式网格布局 -->
            <VueDraggable
                v-model="hotPlatforms"
                :animation="200"
                handle=".drag-handle"
                ghostClass="opacity-50"
                chosenClass="scale-105"
                @end="onDragEnd"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
            >
              <NewsRankCard
                  v-for="platform in hotPlatforms"
                  :key="`grid-card-${platform.platform}`"
                  :title="platform.title"
                  :platform="platform.platform"
                  :platform-icon="getPlatformIcon(platform.platform)"
                  :data="platformsData[platform.platform]?.data || []"
                  :loading="platformsData[platform.platform]?.loading || false"
                  :is-favorited="platforms.some(p => p.platform === platform.platform)"
                  :show-drag-handle="true"
                  @item-click="handleCardItemClick"
                  @refresh="refreshSinglePlatform(platform.platform)"
              />
            </VueDraggable>
          </div>
        </UiScrollArea>
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
