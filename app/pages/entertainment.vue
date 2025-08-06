<script setup lang="ts">
import {reactive, computed, onMounted, ref, watch} from 'vue'
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'
import {ScrollArea} from '@/components/ui/scroll-area'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {Separator} from '@/components/ui/separator'
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
import {Button} from '@/components/ui/button'
import {PlatformIcons} from '@/config/icon'

import type {NewsItem} from "@/api"
import {fetchNews as apiFetchNews} from "@/api"
import {getRouteConfig, getPlatformConfigs} from '@/config/platforms'

const routeConfig = getRouteConfig('/entertainment')!
useHead({
  title: routeConfig.title,
  meta: [
    {name: 'description', content: routeConfig.description},
    {property: 'og:title', content: routeConfig.title},
    {property: 'og:description', content: routeConfig.description},
    {name: 'keywords', content: '娱乐新闻,娱乐资讯,影视资讯,明星动态'}
  ]
})

const platformConfigs = getPlatformConfigs(routeConfig.platforms)
const {newsItems, platforms} = useFavorites()
const globalSearchRef = ref()

const isMac = computed(() => {
  if (process.server) return false
  try {
    return typeof navigator !== 'undefined' && navigator.platform && navigator.platform.toLowerCase().includes('mac')
  } catch (error) {
    return false
  }
})

const defaultPlatforms = platformConfigs.map(config => ({
  platform: config.platform,
  title: config.title
}))

const entertainmentPlatforms = ref([...defaultPlatforms])

const platformsData = reactive<Record<string, {
  data: NewsItem[]
  loading: boolean
  error: string | null
}>>({})

entertainmentPlatforms.value.forEach(platform => {
  platformsData[platform.platform] = {
    data: [],
    loading: false,
    error: null
  }
})

const ensurePlatformState = (platform: string) => {
  if (!platformsData[platform]) {
    platformsData[platform] = {data: [], loading: false, error: null}
  }
}

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

const fetchAllPlatformsData = async () => {
  const promises = entertainmentPlatforms.value.map(p => fetchPlatformData(p.platform))
  await Promise.allSettled(promises)
}

const refreshAllData = () => fetchAllPlatformsData()
const refreshSinglePlatform = (platform: string) => fetchPlatformData(platform)

const handleCardItemClick = (item: NewsItem) => {
  if (process.client && typeof window !== 'undefined') {
    window.open(item.url, '_blank')
  }
}


const openLink = () => {
  if (process.client && typeof window !== 'undefined') {
    window.open('https://github.com/LYX9527/what-happen', '_blank')
  }
}

const openGlobalSearch = () => {
  if (globalSearchRef.value) {
    globalSearchRef.value.open()
  }
}

const getPlatformIcon = (platform: string) => {
  return PlatformIcons[platform as keyof typeof PlatformIcons] || Globe
}

onMounted(async () => {
  if (process.client) {
    setTimeout(() => fetchAllPlatformsData(), 100)
  }
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar/>
    <GlobalSearch
        ref="globalSearchRef"
        :hot-platforms="entertainmentPlatforms"
        :platforms-data="platformsData"
        @filter-change="(filter) => $router.push(`/${filter}`)"
        @news-click="handleCardItemClick"
    />
    <SidebarInset class="flex flex-col h-screen">
      <header
          class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1"/>
          <Separator orientation="vertical" class="mr-2 h-4"/>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="/" class="text-muted-foreground">首页</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block"/>
              <BreadcrumbItem>
                <BreadcrumbPage class="text-foreground font-medium">{{ routeConfig.title }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div class="flex items-center gap-2 ml-auto px-4">
          <Button
              variant="outline"
              size="sm"
              @click="refreshAllData"
              class="gap-1 hidden sm:flex h-8"
          >
            <RefreshCw class="w-4 h-4"/>
            刷新全部
          </Button>
          <Button
              variant="outline"
              size="icon"
              @click="refreshAllData"
              class="sm:hidden h-8 w-8"
          >
            <RefreshCw class="w-4 h-4"/>
          </Button>

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

      <div class="flex-1 overflow-hidden bg-muted/20">
        <ScrollArea class="h-full">
          <div class="p-4">
            <div class="mb-6">
              <h1 class="text-3xl font-bold tracking-tight">{{ routeConfig.title }}</h1>
              <p class="text-muted-foreground mt-2">{{ routeConfig.description }}</p>
            </div>

            <div class="flex items-center justify-between mb-6">
              <p class="text-sm text-muted-foreground">
                共 {{ entertainmentPlatforms.length }} 个娱乐平台
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <NewsRankCard
                  v-for="platform in entertainmentPlatforms"
                  :key="`grid-card-${platform.platform}`"
                  :title="platform.title"
                  :platform="platform.platform"
                  :platform-icon="getPlatformIcon(platform.platform)"
                  :data="platformsData[platform.platform]?.data || []"
                  :loading="platformsData[platform.platform]?.loading || false"
                  :is-favorited="platforms.some(p => p.platform === platform.platform)"
                  :show-drag-handle="false"
                  @item-click="handleCardItemClick"
                  @refresh="refreshSinglePlatform(platform.platform)"
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
