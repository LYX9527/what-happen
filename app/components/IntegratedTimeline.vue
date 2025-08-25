<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {Expand, Minimize, Newspaper, RefreshCw, Star, TrendingUp} from 'lucide-vue-next'
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
const parseTime = (item: NewsItem, platformKey: string): Date => {
  return dayjs(item.extra?.date).toDate()
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
  props.platformConfigs.forEach(platformConfig => {
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
  return activeCategory.value === 'all'
      ? allIntegratedNews.value
      : allIntegratedNews.value.filter(item => item.platformConfig.category === activeCategory.value)
})

// 按时间分组的新闻数据
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
    const displayTime = formatDisplayTime(item.parsedTime)

    // 查找是否已有相同时间的分组
    let existingGroup = groups.find(group => group.displayTime === displayTime)

    if (!existingGroup) {
      existingGroup = {
        timeKey: `${displayTime}-${Date.now()}`,
        displayTime,
        items: []
      }
      groups.push(existingGroup)
    }

    existingGroup.items.push(item)
  })

  return groups
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
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <TrendingUp class="h-4 w-4 text-primary-foreground"/>
          </div>
          <h2 class="text-lg font-semibold">新闻第一线</h2>
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
      <div class="flex items-center gap-1 overflow-x-auto pb-1">
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

          <!-- 空状态 -->
          <div v-else-if="groupedNewsByTime.length === 0" class="text-center py-12">
            <Newspaper class="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
            <h3 class="text-lg font-medium text-muted-foreground mb-2">暂无新闻</h3>
            <p class="text-sm text-muted-foreground">{{ hasErrors ? '加载失败，请尝试刷新' : '等待数据加载中...' }}</p>
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
                  <div class="space-y-1 ml-2 animate-in fade-in duration-200">
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
                  </div>
                </UiAccordionContent>
              </UiAccordionItem>
            </UiAccordion>
          </div>
        </div>
      </UiScrollArea>
    </div>
  </div>
</template>


