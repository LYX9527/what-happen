<script setup lang="ts">
import { Star, TrendingUp, TrendingDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
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

// 获取股票涨跌颜色
const getStockColor = (info: string) => {
  if (info.startsWith('-')) {
    return 'text-green-600 dark:text-green-400' // 跌用绿色
  } else if (info.startsWith('+') || /^\d/.test(info)) {
    return 'text-red-600 dark:text-red-400' // 涨用红色
  }
  return 'text-muted-foreground'
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
    <div class="flex items-center justify-center w-5 h-4 text-xs font-mono shrink-0">
      <span
        :class="[
          index < 3 ? 'text-foreground font-medium' : 'text-muted-foreground'
        ]"
      >
        {{ index + 1 }}
      </span>
    </div>

    <!-- 标题和内容 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5">
        <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                  relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50 flex-1">
          {{ item.title }}
        </p>
        <div class="flex items-center gap-1 shrink-0">
          <span :class="['text-xs font-medium', getStockColor(item.extra?.info || '')]">
            {{ item.extra?.info }}
          </span>
          <TrendingUp
            v-if="!item.extra?.info?.startsWith('-')"
            :class="['w-2.5 h-2.5', getStockColor(item.extra?.info || '')]"
          />
          <TrendingDown
            v-else
            :class="['w-2.5 h-2.5', getStockColor(item.extra?.info || '')]"
          />
        </div>
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
