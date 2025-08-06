<script setup lang="ts">
import {TrendingUp, TrendingDown} from 'lucide-vue-next'
import type {NewsItem} from '@/api'

// Props
interface Props {
  item: NewsItem
  platformConfig: {
    key: string
    title: string
    category: string
    color: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'click': [item: NewsItem]
}>()

// 处理点击事件
const handleClick = () => {
  emit('click', props.item)
}

// 提取财经相关信息
const getFinanceInfo = (item: NewsItem) => {
  const info = item.extra?.info || ''
  const isPositive = !info.startsWith('-') && (info.includes('+') || info.includes('涨'))
  const isNegative = info.startsWith('-') || info.includes('跌')

  return {
    info,
    isPositive,
    isNegative,
    hasInfo: !!info
  }
}

const financeInfo = getFinanceInfo(props.item)
</script>

<template>
  <div class="flex-1 min-w-0" @click="handleClick">
    <!-- 平台标签 -->
    <div class="flex items-center gap-2 mb-1">
      <UiBadge
          variant="outline"
          class="text-xs px-1.5 py-0 h-5 flex items-center gap-1"
      >
        {{ platformConfig.title }}
      </UiBadge>
      <UiBadge
          variant="secondary"
          class="text-xs px-1.5 py-0 h-5"
      >
        {{ platformConfig.category }}
      </UiBadge>
    </div>

    <!-- 新闻标题和财经信息 -->
    <div class="flex items-start justify-between gap-2">
      <UiTooltipProvider>
        <UiTooltip>
          <UiTooltipTrigger asChild>
            <h3 class="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 leading-relaxed flex-1">
              {{ item.title }}
            </h3>
          </UiTooltipTrigger>
          <UiTooltipContent>
            <p class="max-w-sm">{{ item.title }}</p>
          </UiTooltipContent>
        </UiTooltip>
      </UiTooltipProvider>

      <!-- 财经数据 -->
      <div v-if="financeInfo.hasInfo" class="flex items-center gap-1 flex-shrink-0">
        <span
            :class="[
            'text-xs font-medium flex items-center gap-0.5',
            financeInfo.isPositive ? 'text-green-600 dark:text-green-400' :
            financeInfo.isNegative ? 'text-red-600 dark:text-red-400' :
            'text-muted-foreground'
          ]"
        >
          <TrendingUp
              v-if="financeInfo.isPositive"
              class="w-3 h-3"
          />
          <TrendingDown
              v-else-if="financeInfo.isNegative"
              class="w-3 h-3"
          />
          {{ financeInfo.info }}
        </span>
      </div>
    </div>

    <!-- 额外信息 -->
    <div v-if="item.extra?.hover || item.extra?.desc" class="mt-1">
      <UiTooltipProvider v-if="item.extra?.hover">
        <UiTooltip>
          <UiTooltipTrigger asChild>
            <p class="text-xs text-muted-foreground line-clamp-1">
              {{ item.extra.hover || item.extra.desc }}
            </p>
          </UiTooltipTrigger>
          <UiTooltipContent>
            <p class="max-w-md">{{ item.extra.hover }}</p>
          </UiTooltipContent>
        </UiTooltip>
      </UiTooltipProvider>
      <p v-else class="text-xs text-muted-foreground line-clamp-1">
        {{ item.extra.desc }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
