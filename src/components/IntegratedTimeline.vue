<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Skeleton} from '@/components/ui/skeleton'
import {
  RefreshCw,
  Star,
  Newspaper,
  TrendingUp
} from 'lucide-vue-next'
import type {NewsItem} from '@/api'
import {useFavorites} from '@/composables/useFavorites'
import {toast} from 'vue-sonner'
import TimelineNewsContent from '@/components/TimelineNewsContent.vue'
import FinanceNewsContent from '@/components/FinanceNewsContent.vue'

// 时间线平台配置
const TIMELINE_PLATFORMS = [
  {key: '_36kr', title: '36氪', category: '科技', color: 'bg-blue-500'},
  {key: 'ithome', title: 'IT之家', category: '科技', color: 'bg-orange-500'},
  {key: 'thepaper', title: '澎湃新闻', category: '社会', color: 'bg-red-500'},
  {key: 'solidot', title: 'Solidot', category: '科技', color: 'bg-green-500'},
  {key: 'v2ex', title: 'V2EX', category: '科技', color: 'bg-gray-500'},
  {key: 'coolapk', title: '酷安', category: '科技', color: 'bg-teal-500'},
  {key: 'cankaoxiaoxi', title: '参考消息', category: '社会', color: 'bg-purple-500'},
  {key: 'zaobao', title: '联合早报', category: '社会', color: 'bg-indigo-500'},
  {key: 'sputniknewscn', title: '俄罗斯卫星通讯社', category: '社会', color: 'bg-pink-500'},
  {key: 'tieba', title: '百度贴吧', category: '社会', color: 'bg-cyan-500'},
  {key: 'kaopu', title: '靠谱', category: '科技', color: 'bg-yellow-500'},
  {key: 'jin10', title: '金十数据', category: '财经', color: 'bg-amber-600'},
  {key: 'pcbeta_windows', title: '远景论坛', category: '科技', color: 'bg-slate-500'},
  {key: 'nowcoder', title: '牛客网', category: '科技', color: 'bg-emerald-500'},
  {key: 'jqka', title: '同花顺', category: '财经', color: 'bg-rose-500'},
  {key: 'dcd_news', title: '懂车帝资讯', category: '汽车', color: 'bg-violet-500'},
]

// Props
interface Props {
  platformsData?: Record<string, {
    data: NewsItem[]
    loading: boolean
    error: string | null
  }>
  onNewsClick?: (item: NewsItem) => void
  onRefresh?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  platformsData: () => ({}),
})

const emit = defineEmits<{
  'news-click': [item: NewsItem]
  'refresh': []
}>()

// 收藏功能
const {isFavorited, toggleFavorite} = useFavorites()

// 筛选状态
const activeCategory = ref<string>('all')
const categories = ['all', '科技', '社会', '财经', '汽车']

// 获取平台配置
const getPlatformConfig = (platformKey: string) => {
  return TIMELINE_PLATFORMS.find(p => p.key === platformKey) || {
    key: platformKey,
    title: platformKey,
    category: '其他',
    color: 'bg-gray-400'
  }
}

// 处理时间解析
const parseTime = (item: NewsItem, platformKey: string): Date => {

  // 如果有时间字符串，尝试解析
  if (item.extra?.time) {
    const timeStr = item.extra.time

    // 处理相对时间格式
    if (timeStr.includes('小时前')) {
      const hours = parseInt(timeStr.match(/(\d+)小时前/)?.[1] || '0')
      return new Date(Date.now() - hours * 60 * 60 * 1000)
    }
    if (timeStr.includes('分钟前')) {
      const minutes = parseInt(timeStr.match(/(\d+)分钟前/)?.[1] || '0')
      return new Date(Date.now() - minutes * 60 * 1000)
    }
    if (timeStr.includes('天前')) {
      const days = parseInt(timeStr.match(/(\d+)天前/)?.[1] || '0')
      return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    }

    // 尝试直接解析时间
    const parsed = new Date(timeStr)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }

  // 如果都没有，使用当前时间减去一个随机偏移
  const randomOffset = Math.floor(Math.random() * 24 * 60 * 60 * 1000) // 24小时内随机
  return new Date(Date.now() - randomOffset)
}

// 格式化显示时间
const formatDisplayTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 获取所有未筛选的新闻数据（用于统计）
const allIntegratedNews = computed(() => {
  const allNews: Array<NewsItem & {
    platformKey: string
    platformConfig: any
    parsedTime: Date
  }> = []

  // 收集所有时间线平台的新闻
  TIMELINE_PLATFORMS.forEach(platformConfig => {
    const platformData = props.platformsData[platformConfig.key]
    if (platformData?.data && Array.isArray(platformData.data)) {
      platformData.data.forEach(item => {
        allNews.push({
          ...item,
          platformKey: platformConfig.key,
          platformConfig,
          parsedTime: parseTime(item, platformConfig.key)
        })
      })
    }
  })

  // 按时间排序（最新的在前）
  allNews.sort((a, b) => b.parsedTime.getTime() - a.parsedTime.getTime())

  return allNews
})

// 整合并排序所有时间线新闻（用于显示）
const integratedNews = computed(() => {
  // 根据分类筛选
  if (activeCategory.value === 'all') {
    return allIntegratedNews.value
  }

  return allIntegratedNews.value.filter(item => item.platformConfig.category === activeCategory.value)
})

// 加载状态
const isLoading = computed(() => {
  return TIMELINE_PLATFORMS.some(platform =>
      props.platformsData[platform.key]?.loading
  )
})

// 错误状态
const hasErrors = computed(() => {
  return TIMELINE_PLATFORMS.some(platform =>
      props.platformsData[platform.key]?.error
  )
})

// 各分类的数量（基于所有新闻，不受筛选影响）
const categoryStats = computed(() => {
  const stats: Record<string, number> = {all: 0}

  allIntegratedNews.value.forEach(item => {
    stats.all++
    const category = item.platformConfig.category
    stats[category] = (stats[category] || 0) + 1
  })

  return stats
})

// 处理新闻点击
const handleNewsClick = (item: NewsItem) => {
  emit('news-click', item)
}

// 处理收藏
const handleFavorite = (event: Event, item: NewsItem & { platformKey: string, platformConfig: any }) => {
  event.stopPropagation()

  const success = toggleFavorite(item, item.platformKey, item.platformConfig.title)
  const favorited = isFavorited(item)

  if (success) {
    toast(favorited ? '已添加到收藏' : '已从收藏中移除', {
      description: `"${item.title.slice(0, 30)}${item.title.length > 30 ? '...' : ''}"`,
      duration: 2000,
    })
  }
}

// 处理刷新
const handleRefresh = () => {
  emit('refresh')
}

// 根据平台类型选择对应的内容组件
const getNewsContentComponent = (platformConfig: any) => {
  // 财经类新闻使用特殊组件
  if (platformConfig.category === '财经') {
    return FinanceNewsContent
  }

  // 特定财经平台
  const financeKeys = ['jin10', 'jqka', 'wallstreetcn_live', 'wallstreetcn_news', 'wallstreetcn_hot', 'hotstock', 'cls_telegraph', 'gelonghui']
  if (financeKeys.includes(platformConfig.key)) {
    return FinanceNewsContent
  }

  // 其他平台使用通用组件
  return TimelineNewsContent
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 头部控制栏 -->
    <div
        class="flex-shrink-0 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <TrendingUp class="h-4 w-4 text-primary-foreground"/>
          </div>
          <h2 class="text-lg font-semibold">新闻第一线</h2>
          <Badge variant="secondary" class="text-xs">
            {{ categoryStats.all }} 条
          </Badge>
        </div>

        <Button
            variant="outline"
            size="sm"
            @click="handleRefresh"
            :disabled="isLoading"
            class="gap-1.5"
        >
          <RefreshCw :class="['w-3.5 h-3.5', isLoading && 'animate-spin']"/>
          刷新
        </Button>
      </div>

      <!-- 分类筛选 -->
      <div class="flex items-center gap-1 overflow-x-auto pb-1">
        <Button
            v-for="category in categories"
            :key="category"
            :variant="activeCategory === category ? 'default' : 'ghost'"
            size="sm"
            @click="activeCategory = category"
            class="flex-shrink-0 h-7 text-xs"
        >
          {{ category === 'all' ? '全部' : category }}
          <Badge
              v-if="categoryStats[category]"
              variant="secondary"
              class="ml-1.5 h-4 text-xs px-1"
          >
            {{ categoryStats[category] }}
          </Badge>
        </Button>
      </div>
    </div>

    <!-- 时间线内容 -->
    <div class="flex-1 overflow-hidden">
      <ScrollArea class="h-full">
        <div class="px-4 py-2">
          <!-- 加载状态 -->
          <div v-if="isLoading && integratedNews.length === 0" class="space-y-3">
            <div v-for="i in 8" :key="i" class="flex items-start gap-3 py-2">
              <Skeleton class="w-12 h-4 rounded"/>
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-3/4"/>
                <Skeleton class="h-3 w-1/2"/>
              </div>
              <Skeleton class="w-16 h-4 rounded-full"/>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="integratedNews.length === 0" class="text-center py-12">
            <Newspaper class="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
            <h3 class="text-lg font-medium text-muted-foreground mb-2">暂无新闻</h3>
            <p class="text-sm text-muted-foreground">{{ hasErrors ? '加载失败，请尝试刷新' : '等待数据加载中...' }}</p>
          </div>

          <!-- 时间线列表 -->
          <div v-else class="space-y-1">
            <div
                v-for="(item, index) in integratedNews"
                :key="`${item.platformKey}-${item.id}`"
                class="relative group"
            >
              <!-- 时间线连接线 -->
              <div
                  v-if="index < integratedNews.length - 1"
                  class="absolute left-6 top-8 bottom-0 w-px bg-border/60"
              ></div>

              <div
                  class="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <!-- 时间和平台标识 -->
                <div class="flex flex-col items-center gap-1 w-12 flex-shrink-0">
                  <div class="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {{ formatDisplayTime(item.parsedTime) }}
                  </div>
                  <div :class="['w-3 h-3 rounded-full flex-shrink-0', item.platformConfig.color]"></div>
                </div>

                <!-- 新闻内容 -->
                <component
                    :is="getNewsContentComponent(item.platformConfig)"
                    :item="item"
                    :platform-config="item.platformConfig"
                    @click="handleNewsClick"
                />

                <!-- 操作按钮 -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                      variant="ghost"
                      size="sm"
                      :class="[
                      'w-7 h-7 p-0',
                      isFavorited(item) ? 'text-yellow-500' : 'text-muted-foreground'
                    ]"
                      @click="handleFavorite($event, item)"
                  >
                    <Star class="w-3.5 h-3.5" :fill="isFavorited(item) ? 'currentColor' : 'none'"/>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </div>
</template>


