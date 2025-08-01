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
    class="flex items-start gap-3 px-2 py-2 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
    @click="handleClick"
  >
    <!-- 序号 -->
    <div class="flex items-center justify-center w-5 h-4 text-xs font-mono shrink-0 mt-1">
      <span
        :class="[
          index < 3 ? 'text-foreground font-medium' : 'text-muted-foreground'
        ]"
      >
        {{ index + 1 }}
      </span>
    </div>

    <!-- 缩略图 -->
    <div class="relative shrink-0">
      <TooltipProvider v-if="item.extra?.thumbnail?.hover">
        <Tooltip>
          <TooltipTrigger asChild>
            <div class="w-20 h-12 bg-muted rounded overflow-hidden cursor-help">
              <img
                v-if="item.extra?.thumbnail?.url"
                :src="item.extra.thumbnail.url"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div
                v-else
                class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs"
              >
                视频
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p class="max-w-sm">{{ item.extra.thumbnail.hover }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <!-- 无hover效果时的缩略图 -->
      <div v-else class="w-20 h-12 bg-muted rounded overflow-hidden">
        <img
          v-if="item.extra?.thumbnail?.url"
          :src="item.extra.thumbnail.url"
          :alt="item.title"
          class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div
          v-else
          class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs"
        >
          视频
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 min-w-0 flex flex-col">
      <!-- 标题 -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 
                      relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50
                      line-clamp-2 leading-relaxed mb-1">
              {{ item.title }}
            </h3>
          </TooltipTrigger>
          <TooltipContent>
            <p class="max-w-sm">{{ item.title }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <!-- 视频信息 -->
      <div v-if="item.extra?.video?.info" class="text-xs text-muted-foreground">
        {{ item.extra.video.info }}
      </div>
    </div>

    <!-- 收藏按钮 -->
    <Button
      variant="ghost"
      size="sm"
      :class="[
        'w-5 h-5 p-0 transition-opacity shrink-0 mt-1',
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 