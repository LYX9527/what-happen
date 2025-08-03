<script setup lang="ts">
import {Star} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@/components/ui/hover-card'
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
const getRankBackgroundClass = (rank: number): string => {
  if (rank === 1) {
    return 'bg-red-500 text-white' // 第一名：红色
  } else if (rank === 2) {
    return 'bg-orange-500 text-white' // 第二名：橙色
  } else if (rank === 3) {
    return 'bg-yellow-500 text-white' // 第三名：黄色
  }
  return 'bg-transparent text-muted-foreground' // 其他：透明
}

// 格式化热度数字
const formatScore = (score: string | number): string => {
  const num = typeof score === 'string' ? parseInt(score) : score
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
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
    <!-- 排名 -->
    <div class="flex items-center justify-center w-5 h-5 text-xs font-bold shrink-0">
      <span
          :class="[
          'w-4 h-4 flex items-center justify-center rounded text-xs font-bold transition-colors',
          getRankBackgroundClass((item.extra?.rank ?? index) + 1)
        ]"
      >
        {{ (item.extra?.rank ?? index) + 1 }}
      </span>
    </div>

    <!-- 标题和剧集信息（包含悬浮卡片） -->
    <div class="flex-1 min-w-0">
      <HoverCard v-if="item.extra?.icon?.url" :open-delay="300" :close-delay="100">
        <HoverCardTrigger as-child>
          <div class="cursor-pointer">
            <!-- 标题和热度（第一行） -->
            <div class="flex items-center gap-2 mb-0.5">
              <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                        relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50 flex-1">
                {{ item.title }} &nbsp;
                <span v-if="item.extra?.score" class="text-xs text-muted-foreground/60 shrink-0">
                {{ item.extra.score }}
              </span>
              </p>

            </div>


          </div>
        </HoverCardTrigger>

        <HoverCardContent class="w-96 p-4" side="right" align="start">
          <div class="flex gap-3">
            <!-- 剧集海报 -->
            <div class="w-24 h-36 bg-muted rounded overflow-hidden shrink-0">
              <img
                  :src="item.extra.icon.url"
                  :alt="item.title"
                  class="w-full h-full object-cover"
              />
            </div>

            <!-- 剧集详情 -->
            <div class="flex-1 min-w-0">
              <!-- 剧集标题 -->
              <h3 class="text-sm font-medium text-foreground mb-2 line-clamp-2">
                {{ item.title }}
              </h3>

              <!-- 热度 -->
              <div v-if="item.extra?.score" class="flex items-center gap-2 mb-2">
                <div class="flex items-center gap-1">
                  <span class="text-orange-500 font-medium">🔥 {{ formatScore(item.extra.score) }}</span>
                  <span class="text-xs text-muted-foreground">热度</span>
                </div>
              </div>

              <!-- 基本信息 -->
              <div v-if="item.extra?.info" class="text-xs text-muted-foreground mb-3 line-clamp-2">
                {{ item.extra.info }}
              </div>

              <!-- 详细描述 -->
              <div v-if="item.extra?.desc" class="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {{ item.extra.desc }}
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <!-- 没有海报时的普通显示 -->
      <div v-else>
        <!-- 标题和热度（第一行） -->
        <div class="flex items-center gap-2 mb-0.5">
          <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                    relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50 flex-1">
            {{ item.title }}
          </p>
          <span v-if="item.extra?.score" class="text-xs text-orange-600 font-medium shrink-0">
            {{ formatScore(item.extra.score) }}
          </span>
        </div>

        <!-- 基本信息（第二行，限制显示） -->
        <div v-if="item.extra?.info" class="text-xs text-muted-foreground line-clamp-1">
          {{ item.extra.info }}
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

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
