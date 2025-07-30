<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw, Globe, Star} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Card, CardContent, CardHeader} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {toast} from 'vue-sonner'
import type {NewsItem} from "@/api"
import {useFavorites} from '@/composables/useFavorites'

interface Props {
  title: string
  data: NewsItem[]
  loading?: boolean
  platformIcon?: any
  platform?: string
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  maxItems: 30
})

const emit = defineEmits<{
  'item-click': [item: NewsItem]
  'refresh': []
  'favorite': [item: NewsItem, favorited: boolean]
}>()

// 本地刷新动画状态
const localRefreshing = ref(false)
let refreshTimeout: ReturnType<typeof setTimeout> | null = null

// 收藏功能
const {
  isFavorited,
  toggleFavorite,
  isPlatformFavorited,
  togglePlatformFavorite
} = useFavorites()

// 监听loading状态变化
watch(() => props.loading, (newLoading, oldLoading) => {
  if (newLoading && !oldLoading) {
    localRefreshing.value = true
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
    }
  } else if (!newLoading && oldLoading) {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout)
    }
    refreshTimeout = setTimeout(() => {
      localRefreshing.value = false
    }, 500)
  }
})

// 平台图标映射
const getPlatformIcon = () => {
  if (props.platformIcon) {
    return props.platformIcon
  }
  return Globe
}

// 显示的新闻条目
const displayItems = computed(() => {
  if (props.maxItems && props.maxItems > 0) {
    return props.data.slice(0, props.maxItems)
  }
  return props.data
})

// 趋势图标和颜色
const getTrendIcon = (index: number) => {
  if (index < 5) return TrendingUp
  if (index < 15) return Minus
  return TrendingDown
}

const getTrendColor = (index: number) => {
  if (index < 5) return 'text-green-600 dark:text-green-400'
  if (index < 15) return 'text-muted-foreground'
  return 'text-red-500 dark:text-red-400'
}

// 获取排名样式
const getRankStyle = (index: number) => {
  if (index < 3) return 'text-foreground font-bold text-lg'
  if (index < 10) return 'text-foreground font-medium'
  return 'text-muted-foreground'
}

// 处理事件
const handleItemClick = (item: NewsItem) => {
  emit('item-click', item)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleFavorite = (item: NewsItem, event: Event) => {
  event.stopPropagation()
  
  const platformKey = props.platform || 'unknown'
  const platformTitle = props.title || '未知平台'
  
  const success = toggleFavorite(item, platformKey, platformTitle)
  const favorited = isFavorited(item)
  
  if (success) {
    toast(favorited ? '已添加到收藏' : '已从收藏中移除', {
      description: `"${item.title.slice(0, 30)}${item.title.length > 30 ? '...' : ''}"`,
      duration: 2000,
    })
    
    emit('favorite', item, favorited)
  }
}

const handlePlatformFavorite = (event: Event) => {
  event.stopPropagation()
  
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
</script>

<template>
  <Card class="w-full h-[600px] flex flex-col">
    <!-- 大号卡片标题 -->
    <CardHeader class="pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- 平台图标 -->
          <div class="flex items-center justify-center w-8 h-8 shrink-0">
            <component
              :is="getPlatformIcon()"
              class="w-6 h-6 text-muted-foreground"
            />
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">
              {{ title }}
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              {{ displayItems.length }} 条热门内容
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- 收藏整个平台按钮 -->
          <Button
            variant="outline"
            size="sm"
            @click="handlePlatformFavorite"
            :title="isPlatformFavorited(platform || '') ? '取消收藏平台' : '收藏整个平台'"
            class="gap-2"
          >
            <Star 
              v-if="isPlatformFavorited(platform || '')"
              class="w-4 h-4 text-yellow-500 fill-yellow-500"
            />
            <Star 
              v-else
              class="w-4 h-4 hover:text-yellow-500"
            />
            {{ isPlatformFavorited(platform || '') ? '已收藏' : '收藏平台' }}
          </Button>

          <!-- 刷新按钮 -->
          <Button
            variant="outline"
            size="sm"
            :disabled="loading || localRefreshing"
            @click="handleRefresh"
            class="gap-2"
          >
            <RefreshCw :class="['w-4 h-4 transition-transform duration-300', { 'animate-spin': localRefreshing }]"/>
            刷新
          </Button>
        </div>
      </div>
    </CardHeader>

    <!-- 大号卡片内容 -->
    <CardContent class="flex-1 overflow-hidden p-0">
      <!-- 加载状态 -->
      <div v-if="loading" class="p-6 space-y-4">
        <div v-for="i in 15" :key="i" class="flex items-center gap-4 p-4 rounded-lg border bg-muted/20 animate-pulse">
          <div class="w-8 h-6 bg-muted rounded"></div>
          <div class="flex-1 h-4 bg-muted rounded"></div>
          <div class="w-4 h-4 bg-muted rounded"></div>
        </div>
      </div>

      <!-- 新闻列表 -->
      <ScrollArea v-else-if="displayItems.length > 0" class="h-full">
        <div class="p-6 space-y-2">
          <div
            v-for="(item, index) in displayItems"
            :key="item.id"
            class="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
            @click="handleItemClick(item)"
          >
            <!-- 排名 -->
            <div class="flex items-center justify-center w-8 h-8 shrink-0">
              <span :class="getRankStyle(index)">
                {{ index + 1 }}
              </span>
            </div>

            <!-- 标题 -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-all duration-200 leading-relaxed
                        relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50">
                {{ item.title }}
              </p>
            </div>

            <!-- 收藏按钮 -->
            <Button
              variant="ghost"
              size="sm"
              :class="[
                'w-8 h-8 p-0 transition-opacity shrink-0',
                isFavorited(item) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              ]"
              @click="handleFavorite(item, $event)"
            >
              <Star 
                v-if="isFavorited(item)"
                class="w-4 h-4 text-yellow-500 fill-yellow-500"
              />
              <Star 
                v-else
                class="w-4 h-4 text-muted-foreground hover:text-yellow-500"
              />
            </Button>

            <!-- 趋势指示器 -->
            <div class="flex items-center gap-2 shrink-0">
              <Badge 
                v-if="index < 3" 
                variant="destructive" 
                class="text-xs px-2 py-0.5"
              >
                热门
              </Badge>
              <Badge 
                v-else-if="index < 10" 
                variant="secondary" 
                class="text-xs px-2 py-0.5"
              >
                上升
              </Badge>
              <component
                :is="getTrendIcon(index)"
                :class="['w-4 h-4 shrink-0', getTrendColor(index)]"
              />
            </div>

            <!-- 外部链接图标 -->
            <ExternalLink class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </div>
      </ScrollArea>

      <!-- 空状态 -->
      <div v-else class="flex items-center justify-center h-full text-muted-foreground">
        <div class="text-center">
          <Globe class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p class="text-lg font-medium">暂无数据</p>
          <p class="text-sm mt-1">刷新试试看</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template> 