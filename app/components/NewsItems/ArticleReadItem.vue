<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { NewsItem } from "@/api"
import { useFavorites } from '@/composables/useFavorites'
import { toast } from 'vue-sonner'

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
const { isFavorited, toggleFavorite } = useFavorites()

// 格式化数字显示
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
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
    class="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
    @click="handleClick"
  >
    <!-- 序号 -->
    <div class="flex items-center justify-center w-5 h-4 text-xs font-mono shrink-0">
      <span
        :class="[
          index < 3 ? 'text-foreground font-medium' : 'text-muted-foreground'
        ]"
      >
        {{ index + 1 }}
      </span>
    </div>

    <!-- 标题和统计信息 -->
    <div class="flex-1 min-w-0">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                      relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50 mb-1">
              {{ item.title }}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p class="max-w-sm">{{ item.extra?.desc ? item.extra?.desc : item.title }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- 统计信息行 -->
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <!-- 浏览量 -->
        <span v-if="item.extra?.view">
          {{ formatNumber(item.extra.view) }} 浏览
        </span>

        <!-- 分隔符 -->
        <span v-if="item.extra?.view && (item.extra?.like || item.extra?.collect)" class="text-muted-foreground/50">
          ·
        </span>

        <!-- 互动数 -->
        <span v-if="item.extra?.like">
          {{ formatNumber(item.extra.like) }} 互动
        </span>

        <!-- 分隔符 -->
        <span v-if="item.extra?.like && item.extra?.collect" class="text-muted-foreground/50">
          ·
        </span>

        <!-- 收藏数 -->
        <span v-if="item.extra?.collect">
          {{ formatNumber(item.extra.collect) }} 收藏
        </span>
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
