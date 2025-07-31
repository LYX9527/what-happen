<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {ExternalLink, Star, Globe} from 'lucide-vue-next'
import {useRoute, useRouter} from 'vue-router'
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from '@/components/ui/breadcrumb'
import {Separator} from '@/components/ui/separator'
import {Toaster} from '@/components/ui/sonner'
import {VueDraggable} from 'vue-draggable-plus'

import AppSidebar from '@/components/AppSidebar.vue'
import NewsRankCard from '@/components/NewsRankCard.vue'
import {useFavorites} from '@/composables/useFavorites'

import type {NewsItem} from "@/api"
import {fetchNews as apiFetchNews, fetchPlatforms} from "@/api"

// 使用收藏功能
const {newsItems, platforms} = useFavorites()

// 路由相关
const route = useRoute()
const router = useRouter()

// 当前筛选条件
const validFilters = ['all', 'hot', 'tech', 'finance', 'social', 'favorites', 'favorites-news', 'favorites-platforms', 'weibo', 'baidu', 'github', 'zhihu']

const getValidFilter = (filter: string): string => {
  return validFilters.includes(filter) ? filter : 'all'
}

const currentFilter = ref(getValidFilter(route.query.filter as string))

// 平台图标映射
const platformIcons = {
  weibo: Globe,
  baidu: Globe,
  zhihu: Globe,
  douyin: Globe,
  toutiao: Globe,
  kuaishou: Globe,
  github: Globe,
  _36kr: Globe,
  ithome: Globe,
  solidot: Globe,
  v2ex: Globe,
  coolapk: Globe,
  gelonghui: Globe,
  wallstreetcn_live: Globe,
  wallstreetcn_news: Globe,
  wallstreetcn_hot: Globe,
  hotstock: Globe,
  cls_telegraph: Globe,
  thepaper: Globe,
  cankaoxiaoxi: Globe,
  zaobao: Globe,
  sputniknewscn: Globe,
}

// 热门平台列表 - 使用 ref 以支持拖拽排序
const hotPlatforms = ref([
  {platform: 'weibo', title: '微博热搜'},
  {platform: 'baidu', title: '百度热搜'},
  {platform: 'zhihu', title: '知乎热榜'},
  {platform: 'douyin', title: '抖音热点'},
  {platform: 'toutiao', title: '今日头条'},
  {platform: 'kuaishou', title: '快手热榜'},
  {platform: 'github', title: 'GitHub趋势'},
  {platform: '_36kr', title: '36氪'},
  {platform: 'ithome', title: 'IT之家'},
  {platform: 'solidot', title: 'Solidot'},
  {platform: 'v2ex', title: 'V2EX'},
  {platform: 'coolapk', title: '酷安'},
  {platform: 'gelonghui', title: '格隆汇'},
  {platform: 'wallstreetcn_live', title: '华尔街见闻实时'},
  {platform: 'wallstreetcn_news', title: '华尔街见闻新闻'},
  {platform: 'wallstreetcn_hot', title: '华尔街见闻热榜'},
  {platform: 'hotstock', title: '热股榜'},
  {platform: 'cls_telegraph', title: '财联社电报'},
  {platform: 'thepaper', title: '澎湃新闻'},
  {platform: 'cankaoxiaoxi', title: '参考消息'},
  {platform: 'zaobao', title: '联合早报'},
  {platform: 'sputniknewscn', title: '俄罗斯卫星通讯社'},
])

// 平台分类映射
const platformCategories: Record<string, string[]> = {
  hot: ['weibo', 'baidu', 'douyin', 'toutiao', 'zhihu', 'kuaishou'],
  tech: ['github', '_36kr', 'ithome', 'solidot', 'v2ex', 'coolapk'],
  finance: ['gelonghui', 'wallstreetcn_live', 'wallstreetcn_news', 'wallstreetcn_hot', 'hotstock', 'cls_telegraph'],
  social: ['thepaper', 'cankaoxiaoxi', 'zaobao', 'sputniknewscn'],
  github: ['github'],
  weibo: ['weibo'],
  baidu: ['baidu'],
  zhihu: ['zhihu'],
}

// 根据筛选条件过滤平台
const filteredPlatforms = computed(() => {
  if (currentFilter.value === 'all') {
    return hotPlatforms.value
  }

  if (currentFilter.value === 'favorites' ||
      currentFilter.value === 'favorites-news' ||
      currentFilter.value === 'favorites-platforms') {
    return [] // 收藏页面不显示普通平台
  }

  const categoryPlatforms = platformCategories[currentFilter.value] || []
  return hotPlatforms.value.filter(p => categoryPlatforms.includes(p.platform));
})

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

// 获取所有热门平台数据
const fetchAllPlatformsData = async () => {
  const promises = hotPlatforms.value.map(p => fetchPlatformData(p.platform))
  const results = await Promise.allSettled(promises)

  // 记录失败的平台
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`平台 ${hotPlatforms.value[index].platform} 数据获取失败:`, result.reason)
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

// 处理卡片点击
const handleCardItemClick = (item: NewsItem) => {
  window.open(item.url, '_blank')
}

// 处理显示更多
const handleShowMore = (platform: string, title: string) => {
  console.log(`显示更多: ${title}`)
  // 这里可以跳转到详细页面或打开模态框
}

// 获取平台图标
const getPlatformIcon = (platform: string) => {
  return platformIcons[platform as keyof typeof platformIcons] || Globe
}

// 获取筛选标题
const getFilterTitle = (filter: string) => {
  const filterTitles: Record<string, string> = {
    all: '全部榜单',
    hot: '热搜榜',
    tech: '科技资讯',
    finance: '财经新闻',
    social: '社会新闻',
    favorites: '我的收藏',
    'favorites-news': '收藏的新闻',
    'favorites-platforms': '收藏的平台',
    weibo: '微博热搜',
    baidu: '百度热搜',
    github: 'GitHub趋势',
    zhihu: '知乎热榜'
  }
  return filterTitles[filter] || '全部榜单'
}

// 处理筛选变化
const handleFilterChange = (filter: string) => {
  currentFilter.value = filter

  // 更新URL参数
  router.push({
    query: {
      ...route.query,
      filter: filter === 'all' ? undefined : filter // 如果是 'all' 则移除参数
    }
  })
}

// 监听路由参数变化
watch(() => route.query.filter, (newFilter) => {
  const filterValue = getValidFilter(newFilter as string)
  if (currentFilter.value !== filterValue) {
    currentFilter.value = filterValue
  }
})

// 监听收藏平台，自动加载数据
watch(() => platforms.value, (newPlatforms) => {
  // 当有收藏的平台时，检查是否需要加载数据
  newPlatforms.forEach(platform => {
    if (!platform?.platform) return

    ensurePlatformState(platform.platform)
    const state = platformsData[platform.platform]

    // 如果没有数据且不在加载中，则加载数据
    if (state && state.data.length === 0 && !state.loading && !state.error) {
      fetchPlatformData(platform.platform)
    }
  })
}, {immediate: true, deep: true})

// 拖拽排序处理
const onDragEnd = () => {
  console.log('平台排序已更新:', hotPlatforms.value.map(p => p.title))
  // 这里可以保存排序到本地存储或后端
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAllPlatformsData()

  // 如果URL参数无效，重定向到有效URL
  const urlFilter = route.query.filter as string
  const validFilter = getValidFilter(urlFilter)

  if (urlFilter && urlFilter !== validFilter) {
    router.replace({
      query: {
        ...route.query,
        filter: validFilter === 'all' ? undefined : validFilter
      }
    })
  }
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar @filter-change="handleFilterChange"/>
    <SidebarInset class="flex flex-col h-screen">
      <!-- 面包屑导航 -->
      <header class="flex h-16 shrink-0 items-center gap-2 px-4">
        <div class="flex items-center gap-2 text-sm">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#">
                  新闻聚合中心
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block"/>
              <BreadcrumbItem>
                <BreadcrumbPage>{{ getFilterTitle(currentFilter) }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Separator/>

      <!-- 可滚动的主内容区域 -->
      <div class="flex-1 overflow-hidden bg-muted/20">
        <ScrollArea class="h-full">
          <div class="p-4">
            <!-- 收藏页面 -->
            <div v-if="currentFilter === 'favorites' ||
                       currentFilter === 'favorites-news' ||
                       currentFilter === 'favorites-platforms'">
              <!-- 空状态 -->
              <div class="text-center py-8" v-if="newsItems.length === 0 && platforms.length === 0">
                <Star class="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <h3 class="text-lg font-medium text-muted-foreground mb-2">暂无收藏</h3>
                <p class="text-sm text-muted-foreground">点击平台卡片标题右侧的星星图标收藏整个平台</p>
                <p class="text-sm text-muted-foreground">或点击新闻条目右侧的星星图标收藏单条新闻</p>
              </div>

              <!-- 显示所有收藏内容 (favorites) -->
              <div v-else-if="currentFilter === 'favorites'" class="space-y-8">
                <!-- 收藏的新闻 -->
                <div v-if="newsItems.length > 0">
                  <div class="flex items-center gap-2 mb-4">
                    <Star class="w-5 h-5 text-yellow-500 fill-yellow-500"/>
                    <h2 class="text-lg font-semibold text-foreground">收藏的新闻</h2>
                    <span class="text-sm text-muted-foreground">({{ newsItems.length }})</span>
                  </div>

                  <div class="grid grid-cols-1 gap-3">
                    <div
                        v-for="item in newsItems"
                        :key="`${item.platform}-${item.id}`"
                        class="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                        @click="handleCardItemClick(item)"
                        :title="item.title"
                    >
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
                          来自: {{ item.platformTitle }} · {{ new Date(item.addedAt).toLocaleDateString() }}
                        </p>
                      </div>

                      <!-- 外部链接图标 -->
                      <ExternalLink
                          class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                    </div>
                  </div>
                </div>

                <!-- 收藏的平台 -->
                <div v-if="platforms.length > 0">
                  <div class="flex items-center gap-2 mb-4">
                    <Star class="w-5 h-5 text-yellow-500 fill-yellow-500"/>
                    <h2 class="text-lg font-semibold text-foreground">收藏的平台</h2>
                    <span class="text-sm text-muted-foreground">({{ platforms.length }})</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    <NewsRankCard
                        v-for="platform in platforms"
                        v-if="platform?.platform"
                        :key="`favorite-platform-${platform.platform}`"
                        :title="platform.platformTitle || '未知平台'"
                        :platform="platform.platform"
                        :platform-icon="getPlatformIcon(platform.platform)"
                        :data="platformsData[platform.platform]?.data || []"
                        :loading="platformsData[platform.platform]?.loading || false"
                        :show-more="true"
                        @item-click="handleCardItemClick"
                        @show-more="handleShowMore(platform.platform, platform.platformTitle || '未知平台')"
                        @refresh="refreshSinglePlatform(platform.platform)"
                    />
                  </div>
                </div>
              </div>

              <!-- 只显示收藏的新闻 (favorites-news) -->
              <div v-else-if="currentFilter === 'favorites-news'">
                <div v-if="newsItems.length === 0" class="text-center py-8">
                  <Star class="w-8 h-8 mx-auto text-muted-foreground mb-4"/>
                  <p class="text-muted-foreground">暂无收藏的新闻</p>
                  <p class="text-sm text-muted-foreground mt-1">点击新闻条目右侧的星星图标收藏单条新闻</p>
                </div>

                <div v-else class="grid grid-cols-1 gap-3">
                  <div
                      v-for="item in newsItems"
                      :key="`${item.platform}-${item.id}`"
                      class="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                      @click="handleCardItemClick(item)"
                      :title="item.title"
                  >
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
                        来自: {{ item.platformTitle }} · {{ new Date(item.addedAt).toLocaleDateString() }}
                      </p>
                    </div>

                    <!-- 外部链接图标 -->
                    <ExternalLink
                        class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                  </div>
                </div>
              </div>

              <!-- 只显示收藏的平台 (favorites-platforms) -->
              <div v-else-if="currentFilter === 'favorites-platforms'">
                <div v-if="platforms.length === 0" class="text-center py-8">
                  <Star class="w-8 h-8 mx-auto text-muted-foreground mb-4"/>
                  <p class="text-muted-foreground">暂无收藏的平台</p>
                  <p class="text-sm text-muted-foreground mt-1">点击平台卡片标题右侧的星星图标收藏整个平台</p>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  <NewsRankCard
                      v-for="platform in platforms"
                      :key="`favorite-platform-${platform.platform}`"
                      :title="platform.platformTitle || '未知平台'"
                      :platform="platform.platform"
                      :platform-icon="getPlatformIcon(platform.platform)"
                      :data="platformsData[platform.platform]?.data || []"
                      :loading="platformsData[platform.platform]?.loading || false"
                      :show-more="true"
                      @item-click="handleCardItemClick"
                      @show-more="handleShowMore(platform.platform, platform.platformTitle || '未知平台')"
                      @refresh="refreshSinglePlatform(platform.platform)"
                  />
                </div>
              </div>
            </div>

            <!-- 普通榜单网格 - 支持拖拽排序 -->
            <VueDraggable
                v-else
                v-model="hotPlatforms"
                :animation="200"
                ghostClass="opacity-50"
                chosenClass="scale-105"
                @end="onDragEnd"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                :key="`grid-view-${currentFilter}`"
            >
              <NewsRankCard
                  v-for="platform in filteredPlatforms"
                  :key="`grid-card-${platform.platform}-${currentFilter}`"
                  :title="platform.title"
                  :platform="platform.platform"
                  :platform-icon="getPlatformIcon(platform.platform)"
                  :data="platformsData[platform.platform]?.data || []"
                  :loading="platformsData[platform.platform]?.loading || false"
                  @item-click="handleCardItemClick"
                  @show-more="handleShowMore(platform.platform, platform.title)"
                  @refresh="refreshSinglePlatform(platform.platform)"
              />
            </VueDraggable>
          </div>
        </ScrollArea>
      </div>
    </SidebarInset>
  </SidebarProvider>
  <Toaster/>
</template>
