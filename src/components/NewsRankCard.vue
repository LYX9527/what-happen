<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { NewsItem } from '@/composables/useNews'

interface Props {
  title: string
  data: NewsItem[]
  loading?: boolean
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
  showMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  color: 'red',
  showMore: true
})

const emit = defineEmits<{
  'show-more': []
  'item-click': [item: NewsItem]
}>()

// 颜色配置
const colorClasses = computed(() => {
  const colors = {
    red: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800/30',
      icon: 'text-red-500',
      title: 'text-red-600 dark:text-red-400',
      button: 'text-red-500 hover:text-red-600'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800/30',
      icon: 'text-blue-500',
      title: 'text-blue-600 dark:text-blue-400',
      button: 'text-blue-500 hover:text-blue-600'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800/30',
      icon: 'text-green-500',
      title: 'text-green-600 dark:text-green-400',
      button: 'text-green-500 hover:text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-800/30',
      icon: 'text-yellow-500',
      title: 'text-yellow-600 dark:text-yellow-400',
      button: 'text-yellow-500 hover:text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-purple-200 dark:border-purple-800/30',
      icon: 'text-purple-500',
      title: 'text-purple-600 dark:text-purple-400',
      button: 'text-purple-500 hover:text-purple-600'
    }
  }
  return colors[props.color]
})

// 模拟趋势数据（实际项目中应该从API获取）
const getTrendIcon = (index: number) => {
  // 前3名通常是上升的
  if (index < 3) return TrendingUp
  // 中间的保持不变
  if (index < 6) return Minus
  // 后面的下降
  return TrendingDown
}

const getTrendColor = (index: number) => {
  if (index < 3) return 'text-red-500'
  if (index < 6) return 'text-gray-400'
  return 'text-green-500'
}

const handleItemClick = (item: NewsItem) => {
  emit('item-click', item)
}

const handleShowMore = () => {
  emit('show-more')
}

// 只显示前6项
const displayItems = computed(() => props.data.slice(0, 6))
</script>

<template>
  <div 
    :class="[
      'rounded-xl border-2 p-4 transition-all hover:shadow-lg',
      colorClasses.bg,
      colorClasses.border
    ]"
  >
    <!-- 卡片标题 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div :class="['w-3 h-3 rounded-full', colorClasses.icon.replace('text-', 'bg-')]"></div>
        <h3 :class="['font-bold text-lg', colorClasses.title]">
          {{ title }}
        </h3>
      </div>
      
      <Button 
        v-if="showMore"
        variant="ghost" 
        size="sm"
        :class="colorClasses.button"
        @click="handleShowMore"
      >
        更多
        <ExternalLink class="w-3 h-3 ml-1" />
      </Button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="flex items-center gap-3">
        <div class="w-6 h-4 bg-muted animate-pulse rounded"></div>
        <div class="flex-1 h-4 bg-muted animate-pulse rounded"></div>
        <div class="w-4 h-4 bg-muted animate-pulse rounded"></div>
      </div>
    </div>

    <!-- 榜单列表 -->
    <div v-else class="space-y-2">
      <div
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        @click="handleItemClick(item)"
      >
        <!-- 排名 -->
        <div class="flex items-center justify-center w-8 h-6 rounded text-sm font-bold">
          <span 
            :class="[
              index < 3 ? 'text-red-500 font-bold' : 'text-muted-foreground',
              'font-mono text-xs'
            ]"
          >
            {{ index + 1 }}
          </span>
        </div>

        <!-- 标题 -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {{ item.title }}
          </p>
        </div>

        <!-- 趋势图标 -->
        <component 
          :is="getTrendIcon(index)"
          :class="['w-4 h-4', getTrendColor(index)]"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && displayItems.length === 0" class="text-center py-8 text-muted-foreground">
      <p class="text-sm">暂无数据</p>
    </div>
  </div>
</template> 