<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
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
import {VueDraggable} from 'vue-draggable-plus'
import {
  RefreshCw,
  Globe,
  Github,
  DollarSign,
  Coffee,
  Radio,
  Star,
  ExternalLink
} from 'lucide-vue-next'
import {
  WeiBo
  , Baidu, DouYin, ThePaper, TouTiao, _36kr, Blbl, CankaoXiaoxi,
  ItHome, Jin10, nowcoder, PcBeta, Solidot,
  TieBa, V2ex, WallStreetCN, Hotstock, Zaobao, Kaopu, Kuaishou, Zhihu,
  Coolapk, Hupu, Juejin
} from "@/components/icon";
import AppSidebar from '@/components/AppSidebar.vue'
import NewsRankCard from '@/components/NewsRankCard.vue'
import {useFavorites} from '@/composables/useFavorites'

import type {NewsItem} from "@/api"
import {fetchNews as apiFetchNews, fetchPlatforms} from "@/api"
import {Button} from "@/components/ui/button";

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
  weibo: WeiBo,
  baidu: Baidu,
  douyin: DouYin,
  thepaper: ThePaper,
  github: Github,
  toutiao: TouTiao,
  '_36kr': _36kr,
  b_hot_search: Blbl,
  b_hot_video: Blbl,
  b_rank: Blbl,
  cankaoxiaoxi: CankaoXiaoxi,
  gelonghui: DollarSign,
  guoheboke: Coffee,
  ithome: ItHome,
  jin10: Jin10,
  nowcoder: nowcoder,
  pcbeta_windows: PcBeta,
  solidot: Solidot,
  sputniknewscn: Radio,
  tieba: TieBa,
  v2ex: V2ex,
  wallstreetcn_live: WallStreetCN,
  wallstreetcn_news: WallStreetCN,
  wallstreetcn_hot: WallStreetCN,
  hotstock: Hotstock,
  zaobao: Zaobao,
  cls_telegraph: DollarSign,
  kaopu: Kaopu,
  kuaishou: Kuaishou,
  zhihu: Zhihu,
  coolapk: Coolapk,
  hupu: Hupu,
  juejin: Juejin
}

// 热门平台列表 - 使用 ref 以支持拖拽排序
const defaultPlatforms = [
  {platform: 'weibo', title: '微博热搜'},
  {platform: 'baidu', title: '百度热搜'},
  {platform: 'douyin', title: '抖音热搜'},
  {platform: 'thepaper', title: '澎湃新闻'},
  {platform: 'github', title: 'GitHub趋势'},
  {platform: 'toutiao', title: '今日头条'},
  {platform: '_36kr', title: '36氪'},
  {platform: 'b_hot_search', title: '哔哩哔哩热搜'},
  {platform: 'b_hot_video', title: '哔哩哔哩视频'},
  {platform: 'b_rank', title: '哔哩哔哩排行榜'},
  {platform: 'cankaoxiaoxi', title: '参考消息'},
  {platform: 'gelonghui', title: '格隆汇'},
  // {platform: 'guoheboke', title: '果核剥壳'},
  {platform: 'ithome', title: 'IT之家'},
  {platform: 'jin10', title: '金十数据'},
  {platform: 'nowcoder', title: '牛客网'},
  {platform: 'pcbeta_windows', title: '远景论坛Windows'},
  {platform: 'solidot', title: '奇客Solidot'},
  {platform: 'sputniknewscn', title: '俄罗斯卫星通讯社'},
  {platform: 'tieba', title: '百度贴吧'},
  {platform: 'v2ex', title: 'V2EX'},
  {platform: 'wallstreetcn_live', title: '华尔街见闻直播'},
  {platform: 'wallstreetcn_news', title: '华尔街见闻新闻'},
  {platform: 'wallstreetcn_hot', title: '华尔街见闻热榜'},
  {platform: 'hotstock', title: '雪球热股'},
  {platform: 'zaobao', title: '联合早报'},
  {platform: 'cls_telegraph', title: '财联社'},
  {platform: 'kaopu', title: '靠谱'},
  {platform: 'kuaishou', title: '快手热搜'},
  {platform: 'zhihu', title: '知乎'},
  {platform: 'coolapk', title: '酷安'},
  {platform: 'hupu', title: '虎扑'},
  {platform: 'juejin', title: '稀土掘金'},
]

// 加载已保存的排序
const loadSavedOrder = (filter: string) => {
  try {
    const savedOrders = localStorage.getItem('platform-orders')
    if (savedOrders) {
      const orders = JSON.parse(savedOrders)
      if (orders[filter]) {
        // 根据保存的顺序重新排列平台
        const orderedPlatforms = []
        const remainingPlatforms = [...defaultPlatforms]

        // 按保存的顺序添加平台
        orders[filter].forEach((platformId: string) => {
          const platform = remainingPlatforms.find(p => p.platform === platformId)
          if (platform) {
            orderedPlatforms.push(platform)
            const index = remainingPlatforms.indexOf(platform)
            remainingPlatforms.splice(index, 1)
          }
        })

        // 添加剩余的平台（新增的平台）
        orderedPlatforms.push(...remainingPlatforms)

        return orderedPlatforms
      }
    }
  } catch (error) {
    console.error('加载排序失败:', error)
  }
  return [...defaultPlatforms]
}

// 保存排序
const saveOrder = (filter: string, platforms: typeof defaultPlatforms) => {
  try {
    const savedOrders = localStorage.getItem('platform-orders')
    const orders = savedOrders ? JSON.parse(savedOrders) : {}
    orders[filter] = platforms.map(p => p.platform)
    localStorage.setItem('platform-orders', JSON.stringify(orders))
  } catch (error) {
    console.error('保存排序失败:', error)
  }
}

const hotPlatforms = ref(loadSavedOrder(currentFilter.value))

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

// 处理外部链接打开
const openLink = () => {
  window.open('https://github.com/LYX9527/what-happen', '_blank');
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

// 监听筛选条件变化，加载对应的排序
watch(currentFilter, (newFilter) => {
  const savedOrder = loadSavedOrder(newFilter)
  hotPlatforms.value = savedOrder
}, {immediate: false})

// 拖拽排序处理
const onDragEnd = () => {
  const currentFilterValue = currentFilter.value
  console.log(`${currentFilterValue} 平台排序已更新:`, hotPlatforms.value.map(p => p.title))

  // 保存当前筛选条件下的排序
  saveOrder(currentFilterValue, hotPlatforms.value)
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
      <header
          class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1"/>
          <Separator orientation="vertical" class="mr-2 h-4"/>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#" class="text-muted-foreground">
                  新闻聚合平台
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block"/>
              <BreadcrumbItem>
                <BreadcrumbPage class="text-foreground font-medium">{{ getFilterTitle(currentFilter) }}</BreadcrumbPage>
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
                        :key="`favorite-platform-${platform.platform}`"
                        :title="platform.platformTitle || '未知平台'"
                        :platform="platform.platform"
                        :platform-icon="getPlatformIcon(platform.platform)"
                        :data="platformsData[platform.platform]?.data || []"
                        :loading="platformsData[platform.platform]?.loading || false"
                        :show-more="true"
                        :show-drag-handle="false"
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
                      :show-drag-handle="false"
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
                handle=".drag-handle"
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
                  :show-drag-handle="true"
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
</template>
