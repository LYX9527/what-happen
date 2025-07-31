<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {RefreshCw, Globe, Star} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {ScrollArea} from '@/components/ui/scroll-area'
import {toast} from 'vue-sonner'
import type {NewsItem} from "@/api"
import {useFavorites} from '@/composables/useFavorites'
import {GitHubNewsItem, StockNewsItem, NormalNewsItem, getNewsItemComponent} from '@/components/NewsItems'

interface Props {
  title: string
  data: NewsItem[]
  loading?: boolean
  showMore?: boolean
  platformIcon?: any // 平台图标组件
  platform?: string // 平台标识，用于默认图标
  maxItems?: number // 最大显示条数，超出时显示滚动条
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showMore: true,
  maxItems: 20
})

const emit = defineEmits<{
  'show-more': []
  'item-click': [item: NewsItem]
  'refresh': []
  'favorite': [item: NewsItem, favorited: boolean]
}>()

// 本地刷新动画状态，确保动画平滑完成
const localRefreshing = ref(false)
let refreshTimeout: ReturnType<typeof setTimeout> | null = null

// 收藏功能
const {
  isPlatformFavorited,
  togglePlatformFavorite
} = useFavorites()

// 监听loading状态变化
watch(() => props.loading, (newLoading, oldLoading) => {
  if (newLoading && !oldLoading) {
    // 开始加载时，立即显示动画
    localRefreshing.value = true
    // 清除之前的定时器
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
    }
  } else if (!newLoading && oldLoading) {
    // 加载完成时，延迟停止动画，确保至少完成一圈旋转
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
    }
    refreshTimeout = setTimeout(() => {
      localRefreshing.value = false
    }, 500) // 500ms确保动画平滑完成
  }
})

// 平台图标映射
const getPlatformIcon = () => {
  if (props.platformIcon) {
    return props.platformIcon
  }

  // 如果没有传入图标，使用默认的地球图标
  return Globe
}

// 根据平台获取对应的新闻项组件
const newsItemComponent = computed(() => {
  const componentName = getNewsItemComponent(props.platform || 'normal')
  switch (componentName) {
    case 'GitHubNewsItem':
      return GitHubNewsItem
    case 'StockNewsItem':
      return StockNewsItem
    default:
      return NormalNewsItem
  }
})

const handleItemClick = (item: NewsItem) => {
  emit('item-click', item)
}

const handleShowMore = () => {
  emit('show-more')
}

const handleRefresh = () => {
  emit('refresh')
}

// 处理收藏整个平台
const handlePlatformFavorite = (event: Event) => {
  event.stopPropagation() // 阻止事件冒泡

  const platformKey = props.platform || 'unknown'
  const platformTitle = props.title || '未知平台'

  const success = togglePlatformFavorite(platformKey, platformTitle)
  const favorited = isPlatformFavorited(platformKey)

  if (success) {
    toast(favorited ? '已收藏整个平台' : '已取消收藏平台', {
      description: `"${platformTitle}"`,
      duration: 2000,
    })
  }
}

// 根据maxItems限制显示条数，超出时可以滚动查看
const displayItems = computed(() => {
  if (props.maxItems && props.maxItems > 0) {
    return props.data.slice(0, props.maxItems)
  }
  return props.data // 如果maxItems为0或负数，则显示全部
})
</script>

<template>
  <div class="bg-card border rounded-lg flex flex-col h-[400px]">
    <!-- 卡片标题 - 固定高度 -->
    <div class="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
      <div class="flex items-center gap-2">
        <!-- 平台图标 -->
        <div class="flex items-center justify-center w-4 h-4 shrink-0">
          <component
              :is="getPlatformIcon()"
              class="w-3.5 h-3.5 text-muted-foreground"
          />
        </div>
        <h3 class="font-medium text-sm text-foreground">
          {{ title }}
        </h3>
      </div>

      <div class="flex items-center gap-1">
        <!-- 收藏整个平台按钮 -->
        <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
            @click="handlePlatformFavorite"
            :title="isPlatformFavorited(platform || '') ? '取消收藏平台' : '收藏整个平台'"
        >
          <Star
              v-if="isPlatformFavorited(platform || '')"
              class="w-3 h-3 text-yellow-500 fill-yellow-500"
          />
          <Star
              v-else
              class="w-3 h-3 hover:text-yellow-500"
          />
        </Button>

        <!-- 单个刷新按钮 -->
        <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
            :disabled="loading || localRefreshing"
            @click="handleRefresh"
        >
          <RefreshCw :class="['w-3 h-3 transition-transform duration-300', { 'animate-spin': localRefreshing }]"/>
        </Button>
      </div>
    </div>

    <!-- 内容区域 - 可滚动 -->
    <div class="flex-1 overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading" class="p-1.5 space-y-1">
        <div v-for="i in Math.min(props.maxItems || 20, 15)" :key="i" class="flex items-center gap-2 px-2 py-1.5">
          <div class="w-4 h-2.5 bg-muted animate-pulse rounded"></div>
          <div class="flex-1 h-2.5 bg-muted animate-pulse rounded"></div>
          <div class="w-2.5 h-2.5 bg-muted animate-pulse rounded"></div>
        </div>
      </div>

      <!-- 榜单列表 -->
      <ScrollArea v-else-if="displayItems.length > 0" class="h-full">
        <div class="p-1.5 space-y-0.5">
          <component
            v-for="(item, index) in displayItems"
            :key="item.id"
            :is="newsItemComponent"
            :item="item"
            :index="index"
            :platform="platform"
            :platform-title="title"
            @item-click="handleItemClick"
          />
        </div>
      </ScrollArea>

      <!-- 空状态 -->
      <div v-else class="flex items-center justify-center h-full text-muted-foreground">
        <p class="text-sm">暂无数据</p>
      </div>
    </div>
  </div>
</template>

