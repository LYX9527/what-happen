<script setup lang="ts">
import { Star, ExternalLink } from 'lucide-vue-next'
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                        relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50 flex-1">
                {{ item.title }}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p class="max-w-sm">{{ item.title }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div class="flex items-center gap-1 shrink-0">
          <Star class="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
          <span class="text-xs text-muted-foreground">{{ item.extra?.info?.replace('✰ ', '') }}</span>
        </div>
      </div>
      <TooltipProvider v-if="item.extra?.hover">
        <Tooltip>
          <TooltipTrigger asChild>
            <p class="text-xs text-muted-foreground mt-0.5 truncate cursor-help">
              {{ item.extra?.hover }}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p class="max-w-md">{{ item.extra?.hover }}</p>
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

    <!-- 右侧指示器 -->
    <div class="shrink-0">
      <ExternalLink class="w-2.5 h-2.5 text-muted-foreground opacity-50" />
    </div>
  </div>
</template> 