<script setup lang="ts">
import {Star} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import type {NewsItem} from "@/api"
import {useFavorites} from '@/composables/useFavorites'
import {toast} from 'vue-sonner'

interface Props {
  item: NewsItem
  index: number
  platform?: string
  platformTitle?: string
  isLast?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [item: NewsItem]
}>()

// 收藏功能
const {isFavorited, toggleFavorite} = useFavorites()

// 获取相对时间显示
const getRelativeTime = (item: NewsItem) => {
  // 如果有时间戳
  if (item.extra?.date) {
    const now = Date.now()
    const itemTime = typeof item.extra.date === 'number' ? item.extra.date : parseInt(item.extra.date)
    const diff = now - itemTime

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`

    // 超过一周显示具体日期
    const date = new Date(itemTime)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
  if (item.extra?.dateStr){
    return item.extra.dateStr
  }
}

// 处理点击
const handleClick = () => {
  emit('item-click', props.item)
}

// 处理收藏
const handleFavorite = (event: Event) => {
  event.stopPropagation()

  const platformKey = props.platform || 'unknown'
  const platformTitle = props.platformTitle || '未知平台'

  const success = toggleFavorite(props.item, platformKey, platformTitle)
  const favorited = isFavorited(props.item)

  if (success) {
    toast(favorited ? '已添加到收藏' : '已从收藏中移除', {
      description: `"${props.item.title.slice(0, 30)}${props.item.title.length > 30 ? '...' : ''}"`,
      duration: 2000,
    })
  }
}
</script>

<template>
  <div class="relative">
    <!-- 时间线连接线 -->
    <div class="absolute left-8 top-6 bottom-0 w-px bg-border opacity-80" v-if="!isLast"></div>

    <div
        class="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
        @click="handleClick"
    >
      <!-- 时间显示 -->
      <div class="flex items-center justify-start w-16 h-4 text-xs text-muted-foreground shrink-0 mt-0.5">
        <span class="text-xs whitespace-nowrap">{{ getRelativeTime(item) }}</span>
      </div>

      <!-- 标题和内容 -->
      <div class="flex-1 min-w-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                        relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50">
                {{ item.title }}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p class="max-w-sm">{{ item.extra?.desc ? item.extra?.desc : item.title }}}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- 额外信息 -->
        <TooltipProvider v-if="item.extra?.hover">
          <Tooltip>
            <TooltipTrigger asChild>
              <p class="text-xs text-muted-foreground mt-0.5 truncate cursor-help">
                {{ item.extra.hover }}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p class="max-w-md">{{ item.extra.hover }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <!-- 收藏按钮 -->
      <Button
          variant="ghost"
          size="sm"
          :class="[
          'w-5 h-5 p-0 transition-opacity shrink-0',
          isFavorited(item) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]"
          @click="handleFavorite"
      >
        <Star
            v-if="isFavorited(item)"
            class="w-3 h-3 text-yellow-500 fill-yellow-500"
        />
        <Star
            v-else
            class="w-3 h-3 text-muted-foreground hover:text-yellow-500"
        />
      </Button>


    </div>
  </div>
</template>
