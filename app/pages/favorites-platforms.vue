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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  RefreshCw,
  Globe,
  Github,
  Search,
  Bookmark,
  Trash2
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
import {getRouteConfig} from '@/config/platforms'

// 获取路由配置
const routeConfig = getRouteConfig('/favorites-platforms')!

// 设置页面SEO
useHead({
  title: routeConfig.title,
  meta: [
    {name: 'description', content: routeConfig.description},
    {property: 'og:title', content: routeConfig.title},
    {property: 'og:description', content: routeConfig.description}
  ]
})

// 使用收藏功能
const {platforms, clearFavorites} = useFavorites()

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
const platformsData = reactive<Record<string, {
  data: NewsItem[]
  loading: boolean
  error: string | null
}>>({})

// 获取单个平台数据
const fetchPlatformData = async (platform: string) => {
  if (!platform || !platformsData[platform]) return

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

// 刷新所有平台数据
const refreshAllData = () => {
  platforms.value.forEach(platform => {
    fetchPlatformData(platform.platform)
  })
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
const searchPlatforms = ref([])

// Alert Dialog 状态控制
const showClearAllDialog = ref(false)

// 清空全部收藏 - 打开确认对话框
const handleClearAll = () => {
  showClearAllDialog.value = true
}

// 确认清空全部收藏
const confirmClearAll = () => {
  clearFavorites()
  showClearAllDialog.value = false
}

// 在组件挂载后监听收藏平台变化
onMounted(() => {
  // 初始化当前收藏平台的数据状态
  platforms.value.forEach(platform => {
    if (!platformsData[platform.platform]) {
      platformsData[platform.platform] = {
        data: [],
        loading: false,
        error: null
      }
      // 获取该平台的数据
      fetchPlatformData(platform.platform)
    }
  })

  // 监听收藏平台变化，动态获取数据
  watch(() => platforms.value, (newPlatforms) => {
    newPlatforms.forEach(platform => {
      if (!platformsData[platform.platform]) {
        platformsData[platform.platform] = {
          data: [],
          loading: false,
          error: null
        }
        // 获取该平台的数据
        fetchPlatformData(platform.platform)
      }
    })
  }, {deep: true})
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar/>
    <!-- 全局搜索组件 -->
    <GlobalSearch
        ref="globalSearchRef"
        :hot-platforms="searchPlatforms"
        :platforms-data="platformsData"
        @filter-change="(filter) => $router.push(`/${filter}`)"
        @news-click="handleCardItemClick"
    />

    <!-- 清空收藏确认对话框 -->
    <AlertDialog v-model:open="showClearAllDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认清空所有收藏</AlertDialogTitle>
          <AlertDialogDescription>
            这个操作不可撤销。您确定要清空所有已收藏的平台吗？清空后您需要重新收藏感兴趣的平台。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showClearAllDialog = false">取消</AlertDialogCancel>
          <AlertDialogAction @click="confirmClearAll" class="bg-destructive hover:bg-destructive/90">
            确认清空
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
              v-if="platforms.length > 0"
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
              v-if="platforms.length > 0"
              variant="outline"
              size="icon"
              @click="refreshAllData"
              class="sm:hidden h-8 w-8"
          >
            <RefreshCw class="w-4 h-4"/>
          </Button>

          <!-- 清空按钮 - 桌面版 -->
          <Button
              v-if="platforms.length > 0"
              variant="destructive"
              size="sm"
              @click="handleClearAll"
              class="gap-1 hidden sm:flex h-8"
          >
            <Trash2 class="w-4 h-4"/>
            清空全部
          </Button>
          <!-- 清空按钮 - 移动版 -->
          <Button
              v-if="platforms.length > 0"
              variant="destructive"
              size="icon"
              @click="handleClearAll"
              class="sm:hidden h-8 w-8"
          >
            <Trash2 class="w-4 h-4"/>
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
              <div class="flex items-center gap-2">
                <Bookmark class="h-6 w-6 text-blue-500"/>
                <h1 class="text-3xl font-bold tracking-tight">{{ routeConfig.title }}</h1>
              </div>
              <p class="text-muted-foreground mt-2">{{ routeConfig.description }}</p>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center justify-between mb-6">
              <p class="text-sm text-muted-foreground">
                共收藏了 {{ platforms.length }} 个平台
              </p>
            </div>

            <!-- 收藏平台网格 -->
            <div v-if="platforms.length > 0"
                 class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <NewsRankCard
                  v-for="platform in platforms"
                  :key="`favorite-platform-${platform.platform}`"
                  :title="platform.platformTitle"
                  :platform="platform.platform"
                  :platform-icon="getPlatformIcon(platform.platform)"
                  :data="platformsData[platform.platform]?.data || []"
                  :loading="platformsData[platform.platform]?.loading || false"
                  :is-favorited="true"
                  :show-drag-handle="false"
                  @item-click="handleCardItemClick"
                  @refresh="refreshSinglePlatform(platform.platform)"
              >
              </NewsRankCard>
            </div>

            <!-- 空状态 -->
            <div v-else class="text-center py-12">
              <div class="text-muted-foreground">
                <Bookmark class="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p class="text-lg font-medium">还没有收藏的平台</p>
                <p class="text-sm mb-4">在浏览各个平台时点击收藏按钮来收藏感兴趣的平台</p>
                <Button variant="outline" @click="$router.push('/')">
                  去首页看看
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
