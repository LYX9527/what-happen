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
import {
  RefreshCw,
  Globe,
  MessageCircle,
  Search,
  Video,
  Tv,
  Newspaper,
  Github,
  Monitor,
  TrendingUp,
  Users,
  Settings,
  Sparkles,
  Code,
  DollarSign,
  Coffee,
  Gamepad2,
  ShoppingCart,
  Star,
  BookOpen,
  Briefcase,
  Radio,
  Headphones
} from 'lucide-vue-next'
import NewsRankCard from "@/components/NewsRankCard.vue"
import ThemeToggle from "@/components/ThemeToggle.vue"
import {useNews, type NewsItem} from "@/composables/useNews"

import WeiBo from "@/components/icon/weibo.vue"
import Baidu from "@/components/icon/baidu.vue"
import DouYin from "@/components/icon/douyin.vue"
import ThePaper from "@/components/icon/thepaper.vue"
import TouTiao from "@/components/icon/toutiao.vue"
import _36kr from "@/components/icon/_36kr.vue";
import Blbl from "@/components/icon/blbl.vue";
import CankaoXiaoxi from "@/components/icon/cankaoxiaoxi.vue";
import ItHome from "@/components/icon/ithome.vue";
import Jin10 from "@/components/icon/jin10.vue";
import nowcoder from "@/components/icon/nowcoder.vue";
import PcBeta from "@/components/icon/pcbeta_windows.vue";
import Solidot from "@/components/icon/solidot.vue";
import TieBa from "@/components/icon/tieba.vue";
import V2ex from "@/components/icon/v2ex.vue";
import WallStreetCN from "@/components/icon/wallstreetcn.vue";
import Hotstock from "@/components/icon/hotstock.vue";
import Zaobao from "@/components/icon/zaobao.vue";
import Kaopu from "@/components/icon/kaopu.vue";
import Kuaishou from "@/components/icon/kuaishou.vue";
import Zhihu from "@/components/icon/zhihu.vue";
import Coolapk from "@/components/icon/coolapk.vue";
// 使用新闻数据管理
const {fetchPlatforms, fetchNews} = useNews()

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
  coolapk: Coolapk
}

// 热门平台配置
const hotPlatforms = [
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
  {platform: 'guoheboke', title: '果核剥壳'},
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

// 组件挂载时获取数据
onMounted(() => {
  fetchPlatforms()
  fetchAllPlatformsData()
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar/>
    <SidebarInset class="flex flex-col h-screen">
      <!-- 固定的Header -->
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
                <BreadcrumbPage class="text-foreground font-medium">实时热点新闻</BreadcrumbPage>
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
          <ThemeToggle/>
        </div>
      </header>

      <!-- 可滚动的主内容区域 -->
      <div class="flex-1 overflow-hidden bg-muted/20">
        <div class="h-full overflow-y-auto scrollbar-thin p-4">
          <!-- 榜单网格 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <NewsRankCard
                v-for="platform in hotPlatforms"
                :key="platform.platform"
                :title="platform.title"
                :platform="platform.platform"
                :platform-icon="getPlatformIcon(platform.platform)"
                :data="platformsData[platform.platform]?.data || []"
                :loading="platformsData[platform.platform]?.loading || false"
                @item-click="handleCardItemClick"
                @show-more="handleShowMore(platform.platform, platform.title)"
                @refresh="refreshSinglePlatform(platform.platform)"
            />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
