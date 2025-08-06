<script setup lang="ts">
import {computed, ref} from 'vue'
import dayjs from 'dayjs'
import {
  Globe,
  Github,
  Search,
  Heart,
  Trash2,
  ExternalLink,
  Star
} from 'lucide-vue-next'

import AppSidebar from '@/components/AppSidebar.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {useFavorites} from '@/composables/useFavorites'
import {PlatformIcons} from '@/config/icon'
import {getRouteConfig} from '@/config/platforms'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "~/components/ui/alert-dialog";

// 获取路由配置
const routeConfig = getRouteConfig('/favorites-news')!

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
const {newsItems, clearFavorites, removeFromFavorites} = useFavorites()

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

// 处理新闻点击
const handleNewsClick = (item: any) => {
  if (process.client && typeof window !== 'undefined') {
    window.open(item.url, '_blank')
  }
}

// 处理取消收藏
const handleRemoveFavorite = (item: any) => {
  removeFromFavorites(item)
}

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

// 格式化时间
const formatDate = (dateString: string | number) => {
  const date = dayjs(dateString).toDate()
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

// 用于全局搜索的虚拟平台列表
const searchPlatforms = ref([])
</script>

<template>
  <UiSidebarProvider>
    <AppSidebar/>
    <!-- 全局搜索组件 -->
    <GlobalSearch
        ref="globalSearchRef"
        :hot-platforms="searchPlatforms"
        :platforms-data="{}"
        @filter-change="(filter) => $router.push(`/${filter}`)"
        @news-click="handleNewsClick"
    />
    <!-- 清空收藏确认对话框 -->
    <AlertDialog v-model:open="showClearAllDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认清空所有收藏</AlertDialogTitle>
          <AlertDialogDescription>
            这个操作不可撤销。您确定要清空所有已收藏的新闻吗？清空后您需要重新收藏感兴趣的新闻。
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

    <UiSidebarInset class="flex flex-col h-screen">
      <!-- 面包屑导航 - 带sticky和backdrop-blur效果 -->
      <header
          class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <UiSidebarTrigger class="-ml-1"/>
          <Separator orientation="vertical" class="mr-2 h-4"/>
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
          <!-- 清空按钮 - 桌面版 -->
          <UiButton
              v-if="newsItems.length > 0"
              variant="destructive"
              size="sm"
              @click="handleClearAll"
              class="gap-1 hidden sm:flex h-8"
          >
            <Trash2 class="w-4 h-4"/>
            清空全部
          </UiButton>
          <!-- 清空按钮 - 移动版 -->
          <UiButton
              v-if="newsItems.length > 0"
              variant="destructive"
              size="icon"
              @click="handleClearAll"
              class="sm:hidden h-8 w-8"
          >
            <Trash2 class="w-4 h-4"/>
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
            <!-- 页面标题 -->
            <div class="mb-6">
              <div class="flex items-center gap-2 ml-5">
                <Heart class="h-6 w-6 text-red-500 fill-red-500"/>
                <h1 class="text-3xl font-bold tracking-tight">{{ routeConfig.title }}</h1>
              </div>
              <p class="text-muted-foreground mt-2 ml-5">{{ routeConfig.description }}</p>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center justify-between mb-6 ml-5">
              <p class="text-sm text-muted-foreground">
                共收藏了 {{ newsItems.length }} 条新闻
              </p>
            </div>

            <!-- 收藏内容 - 列表样式 -->
            <div v-if="newsItems.length > 0" class="space-y-2">
              <div
                  v-for="(item, index) in newsItems"
                  :key="`${item.platform}-${item.id}`"
                  class="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                  @click="handleNewsClick(item)"
                  :title="item.title"
              >
                <!-- 序号 -->
                <div
                    class="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground shrink-0">
                  {{ index + 1 }}
                </div>

                <!-- 平台图标 -->
                <component
                    :is="getPlatformIcon(item.platform)"
                    class="w-5 h-5 text-muted-foreground shrink-0"
                />

                <!-- 内容 -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground group-hover:text-foreground/80 truncate">
                    {{ item.title }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    来自: {{ item.platformTitle }} · {{ formatDate(item.addedAt) }}
                  </p>
                </div>

                <!-- 操作按钮 -->
                <div class="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <!-- 取消收藏 -->
                  <UiButton
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                      @click.stop="handleRemoveFavorite(item)"
                      title="取消收藏"
                  >
                    <Star class="h-4 w-4 text-yellow-500 fill-yellow-500"/>
                  </UiButton>

                  <!-- 外部链接图标 -->
                  <ExternalLink class="w-4 h-4 text-muted-foreground"/>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="text-center py-12">
              <div class="text-muted-foreground">
                <Heart class="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p class="text-lg font-medium">还没有收藏的新闻</p>
                <p class="text-sm mb-4">在浏览新闻时点击收藏按钮来收藏感兴趣的内容</p>
                <UiButton variant="outline" @click="$router.push('/')">
                  去首页看看
                </UiButton>
              </div>
            </div>
          </div>
        </UiScrollArea>
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
