<script setup lang="ts">
import {Star, TrendingUp, TrendingDown, Minus} from 'lucide-vue-next'
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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [item: NewsItem]
}>()

// 收藏功能
const {isFavorited, toggleFavorite} = useFavorites()

// 获取排名背景样式
const getRankBackgroundClass = (index: number): string => {
  if (index === 0) {
    return 'bg-red-500 text-white' // 第一名：红色
  } else if (index === 1) {
    return 'bg-orange-500 text-white' // 第二名：橙色
  } else if (index === 2) {
    return 'bg-yellow-500 text-white' // 第三名：黄色
  }
  return 'bg-transparent text-muted-foreground' // 其他：透明
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
  <div
      class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
      @click="handleClick"
  >
    <!-- 排名 -->
    <div class="flex items-center justify-center w-5 h-5 text-xs font-bold shrink-0">
      <span
          :class="[
          'w-4 h-4 flex items-center justify-center rounded text-xs font-bold transition-colors',
          getRankBackgroundClass(index)
        ]"
      >
        {{ index + 1 }}
      </span>
    </div>

    <!-- 标题和内容 -->
    <div class="flex-1 min-w-0 flex items-center gap-1.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div class="flex items-center gap-1.5 flex-1 min-w-0">
              <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                        relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50">
                {{ item.title }}
              </p>
              <!-- 热度显示 -->
              <span v-if="item.extra?.num" class="text-xs text-muted-foreground/60 shrink-0">
                {{ item.extra.num }}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p class="max-w-sm">{{ item.title }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- 热搜图标 -->
      <div v-if="item.extra?.icon?.url" class="flex items-center shrink-0">
        <!-- 如果是图片图标 -->
        <img
            v-if="item.extra.icon.url"
            :src="item.extra.icon.url"
            :style="{ transform: `scale(${item.extra.icon.scale || 1})` }"
            class="w-4 h-4 object-contain"
            alt="热搜图标"
        />
        <!-- 如果是文字图标（兼容旧格式） -->
        <span v-else class="text-xs">{{ item.extra.icon }}</span>
      </div>
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
</template>
