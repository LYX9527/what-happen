<script lang="ts">
export const description = '新闻聚合查看界面 - 实时获取各大平台热点新闻'
export const iframeHeight = '800px'
export const containerClass = 'w-full h-full'
</script>

<script setup lang="ts">
import {onMounted, ref, reactive} from 'vue'
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar.vue"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {Button} from "@/components/ui/button"
import {RefreshCw} from 'lucide-vue-next'
import NewsRankCard from "@/components/NewsRankCard.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import {useNews, type NewsItem} from "@/composables/useNews"

// 使用新闻数据管理
const {fetchPlatforms, fetchNews} = useNews()

// 热门平台配置
const hotPlatforms = [
  {platform: 'weibo', title: '微博热搜', color: 'red' as const},
  {platform: 'thepaper', title: '澎湃新闻', color: 'blue' as const},
  {platform: 'baidu', title: '百度热搜', color: 'green' as const},
  {platform: 'douyin', title: '抖音热搜', color: 'purple' as const},
  {platform: 'github', title: 'GitHub趋势', color: 'yellow' as const},
  {platform: 'toutiao', title: '今日头条', color: 'red' as const},
]

// 各平台数据状态
const platformsData = reactive<Record<string, {
  data: NewsItem[]
  loading: boolean
  error: string | null
}>>({})

// 初始化平台数据状态
hotPlatforms.forEach(platform => {
  platformsData[platform.platform] = {
    data: [],
    loading: false,
    error: null
  }
})

// 获取单个平台数据
const fetchPlatformData = async (platform: string) => {
  const state = platformsData[platform]
  if (!state) return

  state.loading = true
  state.error = null

  try {
    const response = await fetch(`http://localhost:10010/news?platform=${platform}`)
    const result = await response.json()

    if (result.code === 200) {
      state.data = result.data
    } else {
      state.error = result.msg || '获取数据失败'
    }
  } catch (err) {
    state.error = '网络请求失败'
    console.error(`获取${platform}数据失败:`, err)
  } finally {
    state.loading = false
  }
}

// 获取所有热门平台数据
const fetchAllPlatformsData = async () => {
  const promises = hotPlatforms.map(p => fetchPlatformData(p.platform))
  await Promise.all(promises)
}

// 刷新所有数据
const refreshAllData = () => {
  fetchAllPlatformsData()
}

// 处理卡片点击
const handleCardItemClick = (item: NewsItem) => {
  window.open(item.url, '_blank')
}

// 处理显示更多
const handleShowMore = (platform: string, title: string) => {
  console.log(`显示更多: ${title}`)
  // 这里可以跳转到详细页面或打开模态框
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPlatforms()
  fetchAllPlatformsData()
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar/>
    <SidebarInset>
      <header
          class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1"/>
          <Separator orientation="vertical" class="mr-2 h-4"/>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#">
                  新闻聚合平台
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block"/>
              <BreadcrumbItem>
                <BreadcrumbPage>实时热点新闻</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <!-- 右侧按钮区域 -->
        <div class="flex items-center gap-2 ml-auto px-4">
          <Button
              variant="outline"
              size="sm"
              @click="refreshAllData"
              class="gap-1 hidden sm:flex"
          >
            <RefreshCw class="w-4 h-4"/>
            刷新全部
          </Button>
          <Button
              variant="outline"
              size="icon"
              @click="refreshAllData"
              class="sm:hidden"
          >
            <RefreshCw class="w-4 h-4"/>
          </Button>
          <ThemeToggle/>
        </div>
      </header>

      <div class="flex-1 overflow-auto">
        <div class="container mx-auto p-4 sm:p-6">
          <!-- 页面标题 -->
          <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-foreground mb-2">实时热点新闻聚合</h1>
            <p class="text-muted-foreground">汇聚全网热门资讯，掌握最新动态</p>
          </div>

          <!-- 榜单网格 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6">
            <NewsRankCard
                v-for="platform in hotPlatforms"
                :key="platform.platform"
                :title="platform.title"
                :color="platform.color"
                :data="platformsData[platform.platform]?.data || []"
                :loading="platformsData[platform.platform]?.loading || false"
                @item-click="handleCardItemClick"
                @show-more="handleShowMore(platform.platform, platform.title)"
            />
          </div>

          <!-- 底部提示 -->
          <div class="mt-12 text-center text-sm text-muted-foreground">
            <p>数据每5分钟自动更新，点击新闻标题可跳转到原始链接</p>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
