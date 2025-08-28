<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {Expand, Minimize, RefreshCw, Star, TrendingUp} from 'lucide-vue-next'
import type {NewsItem} from '@/api'
import {useFavorites} from '@/composables/useFavorites'
import {toast} from 'vue-sonner'
import TimelineNewsContent from '@/components/TimelineNewsContent.vue'
import FinanceNewsContent from '@/components/FinanceNewsContent.vue'
import dayjs from "dayjs";

// 平台配置接口
export interface TimelinePlatform {
  key: string
  title: string
  category: string
  color: string
}

// Props
interface Props {
  platformsData?: Record<string, {
    data: NewsItem[]
    loading: boolean
    error: string | null
  }>
  platformConfigs?: TimelinePlatform[]
  onNewsClick?: (item: NewsItem) => void
  onRefresh?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  platformsData: () => ({}),
  platformConfigs: () => [],
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

// 手风琴展开状态
const expandedTimeGroups = ref<string[]>([])


// 监听分类变化，重置展开状态
watch(activeCategory, () => {
  expandedTimeGroups.value = []
})


// 处理时间解析
const parseTime = (item: NewsItem): Date => {
  return dayjs(item.extra?.date).toDate()
}

// 格式化显示时间
const formatDisplayTime = (item: NewsItem): string => {
  if (item.extra?.dateStr) {
    return item.extra.dateStr
  }
  const date = parseTime(item)
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

// 统一分桶（仅返回稳定 key）：<60分钟按分钟；<24小时按小时；<7天按天；否则按具体日期
const getGroupBucket = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return dayjs(date).format('YYYY-MM-DD HH:mm')
  }
  if (hours < 24) {
    return dayjs(date).format('YYYY-MM-DD HH')
  }
  if (days < 7) {
    return `days-ago-${days}`
  }
  return `date-${dayjs(date).format('YYYY-MM-DD')}`
}

// 根据分组 key 动态计算显示文案，避免旧分组长时间停留为“刚刚”
const formatGroupDisplayFromKey = (key: string): string => {
  const now = new Date()
  // 天数桶
  if (key.startsWith('days-ago-')) {
    const n = parseInt(key.slice('days-ago-'.length), 10)
    if (!isNaN(n)) return `${n}天前`
  }
  // 具体日期
  if (key.startsWith('date-')) {
    const d = dayjs(key.slice(5), 'YYYY-MM-DD').toDate()
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
  // 分钟桶
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(key)) {
    const d = dayjs(key, 'YYYY-MM-DD HH:mm').toDate()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
  // 小时桶
  if (/^\d{4}-\d{2}-\d{2} \d{2}$/.test(key)) {
    const d = dayjs(key, 'YYYY-MM-DD HH').toDate()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
  return key
}

// 解析分组 key 为具体 Date（用于兜底格式化）
const parseGroupKeyToDate = (key: string): Date | null => {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(key)) return dayjs(key, 'YYYY-MM-DD HH:mm').toDate()
  if (/^\d{4}-\d{2}-\d{2} \d{2}$/.test(key)) return dayjs(key, 'YYYY-MM-DD HH').toDate()
  if (key.startsWith('date-')) return dayjs(key.slice(5), 'YYYY-MM-DD').toDate()
  if (key.startsWith('days-ago-')) {
    const n = parseInt(key.slice('days-ago-'.length), 10)
    if (!isNaN(n)) return dayjs().subtract(n, 'day').toDate()
  }
  return null
}

// 不返回“刚刚”的相对时间文案（最小为 1 分钟前），用于去重时的兜底
const formatGroupDisplayNoJustNow = (key: string): string => {
  const d = parseGroupKeyToDate(key)
  if (!d) return key
  const now = new Date()
  const diff = Math.max(0, now.getTime() - d.getTime())
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (minutes < 60) return `${Math.max(1, minutes)}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 获取所有未筛选的新闻数据（用于统计）
const allIntegratedNews = computed(() => {
  const allNews: Array<NewsItem & {
    platformKey: string
    platformConfig: any
    parsedTime: Date
  }> = []

  // 收集所有时间线平台的新闻
  props.platformConfigs.forEach(platformConfig => {
    const platformData = props.platformsData[platformConfig.key]
    if (platformData?.data && Array.isArray(platformData.data)) {
      platformData.data.forEach(item => {
        allNews.push({
          ...item,
          platformKey: platformConfig.key,
          platformConfig,
          parsedTime: parseTime(item)
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
  return activeCategory.value === 'all'
      ? allIntegratedNews.value
      : allIntegratedNews.value.filter(item => item.platformConfig.category === activeCategory.value)
})

// 按时间分组的新闻数据（使用稳定的分钟桶作为分组 key，避免抖动）
const groupedNewsByTime = computed(() => {
  const groups: Array<{
    timeKey: string
    displayTime: string
    items: Array<NewsItem & {
      platformKey: string
      platformConfig: any
      parsedTime: Date
    }>
  }> = []

  integratedNews.value.forEach(item => {
    const bucketKey = getGroupBucket(item.parsedTime)

    // 查找是否已有相同桶的分组
    let existingGroup = groups.find(group => group.timeKey === bucketKey)

    if (!existingGroup) {
      existingGroup = {
        timeKey: bucketKey,
        displayTime: formatGroupDisplayFromKey(bucketKey),
        items: []
      }
      groups.push(existingGroup)
    }

    existingGroup.items.push(item)
  })

  // 合并同名分组：同一个 displayTime 只保留一个，合并其 items
  const mergedMap = new Map<string, typeof groups[number]>()
  const mergedOrder: string[] = []
  groups.forEach(group => {
    const key = group.displayTime
    const exist = mergedMap.get(key)
    if (!exist) {
      mergedMap.set(key, { ...group, items: [...group.items] })
      mergedOrder.push(key)
    } else {
      exist.items.push(...group.items)
    }
  })

  return mergedOrder.map(k => mergedMap.get(k)!)
})
// 初始化展开前3个时间组
watch(groupedNewsByTime, (newGroups, oldGroups) => {
  // 如果是初次加载或分类切换导致的数据变化
  if (newGroups.length > 0 && (!oldGroups || newGroups.length !== oldGroups.length || newGroups[0]?.timeKey !== oldGroups[0]?.timeKey)) {
    expandedTimeGroups.value = newGroups.slice(0, 10).map(g => g.timeKey)
  }
}, {immediate: true})

// 加载状态
const isLoading = computed(() => {
  return props.platformConfigs.some(platform =>
      props.platformsData[platform.key]?.loading
  )
})

// 全局刷新提示（非阻塞）：加载开始显示，结束后更新为已完成
const LOADING_TOAST_ID = 'global-refresh'
watch(isLoading, (val) => {
  if (!process.client) return
  if (val) {
    toast.loading('正在刷新数据…', { id: LOADING_TOAST_ID })
  } else {
    // 刷新完成后更新该条 toast
    toast.success('数据已更新', { id: LOADING_TOAST_ID, duration: 1500 })
  }
})

// 错误状态
const hasErrors = computed(() => {
  return props.platformConfigs.some(platform =>
      props.platformsData[platform.key]?.error
  )
})

// 各分类的数量（基于所有新闻，不受筛选影响）
const categoryStats = computed(() => {
  const stats: Record<string, number> = {all: 0}

  allIntegratedNews.value.forEach(item => {
    stats.all!!++
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

// 全部展开/收起
const toggleAllTimeGroups = () => {
  if (expandedTimeGroups.value.length === groupedNewsByTime.value.length) {
    // 如果全部展开，则全部收起
    expandedTimeGroups.value = []
  } else {
    // 否则全部展开
    expandedTimeGroups.value = groupedNewsByTime.value.map(g => g.timeKey)
  }
}

// 判断是否全部展开
const isAllExpanded = computed(() => {
  return expandedTimeGroups.value.length === groupedNewsByTime.value.length && groupedNewsByTime.value.length > 0
})

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
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <div class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md bg-primary">
            <TrendingUp class="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground"/>
          </div>
          <h2 class="text-lg sm:text-xl font-semibold">新闻第一线</h2>
        </div>

        <div class="flex items-center gap-2">
          <!-- 展开/收起按钮 - 桌面版 -->
          <UiButton
              variant="outline"
              size="sm"
              @click="toggleAllTimeGroups"
              :disabled="groupedNewsByTime.length === 0"
              class="gap-1.5 hidden sm:flex h-8"
          >
            <component :is="isAllExpanded ? Minimize : Expand" class="w-3.5 h-3.5"/>
            {{ isAllExpanded ? '全部收起' : '全部展开' }}
          </UiButton>
          <!-- 展开/收起按钮 - 移动版 -->
          <UiButton
              variant="outline"
              size="icon"
              @click="toggleAllTimeGroups"
              :disabled="groupedNewsByTime.length === 0"
              class="sm:hidden h-8 w-8"
          >
            <component :is="isAllExpanded ? Minimize : Expand" class="w-3.5 h-3.5"/>
          </UiButton>

          <!-- 刷新按钮 - 桌面版 -->
          <UiButton
              variant="outline"
              size="sm"
              @click="handleRefresh"
              :disabled="isLoading"
              class="gap-1.5 hidden sm:flex h-8"
          >
            <RefreshCw :class="['w-3.5 h-3.5', isLoading && 'animate-spin']"/>
            刷新
          </UiButton>
          <!-- 刷新按钮 - 移动版 -->
          <UiButton
              variant="outline"
              size="icon"
              @click="handleRefresh"
              :disabled="isLoading"
              class="sm:hidden h-8 w-8"
          >
            <RefreshCw :class="['w-3.5 h-3.5', isLoading && 'animate-spin']"/>
          </UiButton>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="flex items-center gap-1 overflow-x-auto pb-2">
        <UiButton
            v-for="category in categories"
            :key="category"
            :variant="activeCategory === category ? 'default' : 'ghost'"
            size="sm"
            @click="activeCategory = category"
            class="flex-shrink-0 h-7 text-xs"
        >
          {{ category === 'all' ? '全部' : category }}
          <UiBadge
              v-if="categoryStats[category]"
              variant="secondary"
              class="ml-1.5 h-4 text-xs px-1"
          >
            {{ categoryStats[category] }}
          </UiBadge>
        </UiButton>
      </div>
    </div>

    <!-- 时间线内容 -->
    <div class="flex-1 overflow-hidden">
      <UiScrollArea class="h-full">
        <div class=" py-2">
          <!-- 加载状态 -->
          <div v-if="isLoading && groupedNewsByTime.length === 0" class="space-y-3">
            <div v-for="i in 8" :key="i" class="flex items-start gap-3 py-2">
              <UiSkeleton class="w-12 h-4 rounded"/>
              <div class="flex-1 space-y-2">
                <UiSkeleton class="h-4 w-3/4"/>
                <UiSkeleton class="h-3 w-1/2"/>
              </div>
              <UiSkeleton class="w-16 h-4 rounded-full"/>
            </div>
          </div>

          <!-- 时间线分组列表 -->
          <div v-else>
            <UiAccordion
                type="multiple"
                v-model="expandedTimeGroups"
                class="space-y-4"
            >
              <UiAccordionItem
                  v-for="(timeGroup, groupIndex) in groupedNewsByTime"
                  :key="timeGroup.timeKey"
                  :value="timeGroup.timeKey"
                  class="border rounded-lg bg-card"
              >
                <!-- 时间标签 (可点击展开/收起) -->
                <UiAccordionTrigger class="px-4 py-3 hover:no-underline group">
                  <div class="flex items-center gap-3 w-full">
                    <div class="flex items-center justify-center">
                      <div
                          class="text-sm font-medium text-foreground bg-primary/10 border rounded-full px-3 py-1 whitespace-nowrap group-hover:bg-primary/20 transition-colors">
                        {{ timeGroup.displayTime }}
                      </div>
                    </div>

                    <!-- 平台来源预览 -->
                    <div class="flex items-center gap-1 flex-1 min-w-0">
                      <div class="flex -space-x-1 overflow-hidden">
                        <div
                            v-for="(platform, index) in [...new Set(timeGroup.items.map(item => item.platformConfig))].slice(0, 5)"
                            :key="platform.key"
                            :class="['w-4 h-4 rounded-full border border-background flex-shrink-0', platform.color]"
                            :title="platform.title"
                        ></div>
                        <div
                            v-if="[...new Set(timeGroup.items.map(item => item.platformConfig.key))].length > 5"
                            class="w-4 h-4 rounded-full bg-muted border border-background flex items-center justify-center text-xs text-muted-foreground"
                            :title="`还有 ${[...new Set(timeGroup.items.map(item => item.platformConfig.key))].length - 5} 个平台`"
                        >
                          +
                        </div>
                      </div>
                      <div class="flex-1 h-px bg-border/50 ml-2"></div>
                    </div>

                    <div class="flex items-center gap-2 flex-shrink-0">
                      <UiBadge variant="secondary" class="text-xs">
                        {{ timeGroup.items.length }} 条
                      </UiBadge>
                    </div>
                  </div>
                </UiAccordionTrigger>

                <!-- 该时间段的新闻列表 -->
                <UiAccordionContent class="px-4 pb-4 pt-0">
                  <TransitionGroup name="news" tag="div" class="space-y-1 ml-2">
                    <div
                        v-for="(item, itemIndex) in timeGroup.items"
                        :key="`${item.platformKey}-${item.id}`"
                        class="relative group"
                    >
                      <!-- 时间线连接线 -->
                      <div
                          v-if="itemIndex < timeGroup.items.length - 1"
                          class="absolute left-3 top-8 bottom-0 w-px bg-border/40"
                      ></div>

                      <div
                          class="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <!-- 平台标识圆点 -->
                        <div class="flex items-center justify-center w-6 flex-shrink-0 pt-1">
                          <div :class="['w-2 h-2 rounded-full flex-shrink-0', item.platformConfig.color]"></div>
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
                          <UiButton
                              variant="ghost"
                              size="sm"
                              :class="[
                              'w-7 h-7 p-0',
                              isFavorited(item) ? 'text-yellow-500' : 'text-muted-foreground'
                            ]"
                              @click="handleFavorite($event, item)"
                          >
                            <Star class="w-3.5 h-3.5" :fill="isFavorited(item) ? 'currentColor' : 'none'"/>
                          </UiButton>
                        </div>
                      </div>
                    </div>
                  </TransitionGroup>
                </UiAccordionContent>
              </UiAccordionItem>
            </UiAccordion>
          </div>
        </div>
      </UiScrollArea>
    </div>
  </div>
</template>

<style scoped>
/* 新闻条目插入/移除过渡动画 */
.news-enter-from, .news-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.985);
}
.news-enter-active, .news-leave-active {
  transition: opacity 450ms ease-in-out,
              transform 450ms ease-in-out;
}
.news-move {
  transition: transform 450ms ease-in-out;
}
</style>


