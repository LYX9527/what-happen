<script setup lang="ts">
import {TrendingUp, TrendingDown, Minus} from 'lucide-vue-next'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import type {NewsItem} from '@/api'

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

const handleClick = () => {
  emit('item-click', props.item)
}

const getColorByPercent = (percent?: string) => {
  if (!percent) return 'text-muted-foreground'
  if (percent.trim().startsWith('-')) return 'text-green-600 dark:text-green-400'
  if (percent.trim().startsWith('+') || /^\d/.test(percent.trim())) return 'text-red-600 dark:text-red-400'
  return 'text-muted-foreground'
}

const getIconByPercent = (percent?: string) => {
  if (!percent) return Minus
  if (percent.trim().startsWith('-')) return TrendingDown
  if (percent.trim().startsWith('+') || /^\d/.test(percent.trim())) return TrendingUp
  return Minus
}

const badgeBase = 'px-1.5 py-0.5 rounded text-[10px] leading-none'

// 格式化市值：自动转化为 万/亿/万亿，保留最多两位小数并去除多余的 0
const formatMarketCap = (value?: string | number) => {
  if (value == null) return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)

  const abs = Math.abs(num)
  const units = [
    {base: 1e12, suffix: '万亿'},
    {base: 1e8, suffix: '亿'},
    {base: 1e4, suffix: '万'},
  ]
  for (const u of units) {
    if (abs >= u.base) {
      const v = (num / u.base).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1')
      return `${v}${u.suffix}`
    }
  }
  // 小于 1 万，直接返回千分位
  return Intl.NumberFormat('zh-CN').format(num)
}
</script>

<template>
  <div
      class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
      @click="handleClick"
  >
    <!-- 排名 -->
    <div class="flex items-center justify-center w-5 h-4 text-xs font-mono shrink-0">
      <span :class="[ index < 3 ? 'text-foreground font-medium' : 'text-muted-foreground' ]">
        {{ index + 1 }}
      </span>
    </div>

    <!-- 标题和数据 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50 flex-1">
                {{ item.title }}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p class="max-w-sm">{{ item.title }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div class="flex items-center gap-1 shrink-0">
          <!-- 当前价 -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span class="bg-muted/60 text-foreground" :class="badgeBase"> {{ item.extra?.current }}</span>
              </TooltipTrigger>
              <TooltipContent>当前价</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <!-- 涨跌额 -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span :class="[badgeBase, getColorByPercent(item.extra?.percent)]">{{ item.extra?.change }}</span>
              </TooltipTrigger>
              <TooltipContent>涨跌额</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <!-- 涨跌幅 -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span :class="[badgeBase, getColorByPercent(item.extra?.percent)]">{{ item.extra?.percent }}%</span>
              </TooltipTrigger>
              <TooltipContent>涨跌幅</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <!-- 图标 -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <component :is="getIconByPercent(item.extra?.percent)"
                           :class="['w-2.5 h-2.5', getColorByPercent(item.extra?.percent)]"/>
              </TooltipTrigger>
              <TooltipContent>趋势</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div class="mt-0.5 text-[10px] text-muted-foreground">
        市值<span class="ml-1 underline-offset-2 decoration-muted-foreground/50">{{
          formatMarketCap(item.extra?.market_capital)
        }}</span>
      </div>
    </div>
  </div>
</template>


