<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw, Globe } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type {NewsItem} from "@/api";

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
}>()

// 本地刷新动画状态，确保动画平滑完成
const localRefreshing = ref(false)
let refreshTimeout: ReturnType<typeof setTimeout> | null = null

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

// 模拟趋势数据
const getTrendIcon = (index: number) => {
  if (index < 3) return TrendingUp
  if (index < 6) return Minus
  return TrendingDown
}

const getTrendColor = (index: number) => {
  if (index < 3) return 'text-green-600 dark:text-green-400'
  if (index < 6) return 'text-muted-foreground'
  return 'text-red-500 dark:text-red-400'
}

const handleItemClick = (item: NewsItem) => {
  emit('item-click', item)
}

const handleShowMore = () => {
  emit('show-more')
}

const handleRefresh = () => {
  emit('refresh')
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
        <!-- 单个刷新按钮 -->
        <Button
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
          :disabled="loading || localRefreshing"
          @click="handleRefresh"
        >
          <RefreshCw :class="['w-3 h-3 transition-transform duration-300', { 'animate-spin': localRefreshing }]" />
        </Button>

        <!-- 更多按钮 -->
        <Button
          v-if="showMore"
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
          @click="handleShowMore"
        >
          更多
          <ExternalLink class="w-2.5 h-2.5 ml-1" />
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
          <div
            v-for="(item, index) in displayItems"
            :key="item.id"
            class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
            @click="handleItemClick(item)"
          >
            <!-- 排名 -->
            <div class="flex items-center justify-center w-5 h-4 text-xs font-mono shrink-0">
              <span
                :class="[
                  index < 3 ? 'text-foreground font-medium' : 'text-muted-foreground'
                ]"
              >
                {{ index + 1 }}
              </span>
            </div>

            <!-- 标题 -->
            <div class="flex-1 min-w-0">
              <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                        relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50">
                {{ item.title }}
              </p>
            </div>

            <!-- 趋势图标 -->
            <component
              :is="getTrendIcon(index)"
              :class="['w-2.5 h-2.5 shrink-0 opacity-50', getTrendColor(index)]"
            />
          </div>
        </div>
      </ScrollArea>

      <!-- 空状态 -->
      <div v-else class="flex items-center justify-center h-full text-muted-foreground">
        <p class="text-sm">暂无数据</p>
      </div>
    </div>
  </div>
</template>

