<script setup lang="ts">
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
  showCategory?: boolean
  titleClass?: string
  extraClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showCategory: true,
  titleClass: 'text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 leading-relaxed',
  extraClass: 'text-xs text-muted-foreground line-clamp-1'
})

const emit = defineEmits<{
  'click': [item: NewsItem]
}>()

// 处理点击事件
const handleClick = () => {
  emit('click', props.item)
}
</script>

<template>
  <div class="flex-1 min-w-0" @click="handleClick">
    <!-- 平台和分类标签 -->
    <div class="flex items-center gap-2 mb-1">
      <UiBadge
          variant="outline"
          class="text-xs px-1.5 py-0 h-5"
      >
        {{ platformConfig.title }}
      </UiBadge>
      <UiBadge
          v-if="showCategory"
          variant="secondary"
          class="text-xs px-1.5 py-0 h-5"
      >
        {{ platformConfig.category }}
      </UiBadge>
    </div>

    <!-- 新闻标题 -->
    <TooltipProvider>
      <UiTooltip>
        <TooltipTrigger asChild>
          <h3 :class="titleClass">
            {{ item.title }}
          </h3>
        </TooltipTrigger>
        <TooltipContent>
          <p class="max-w-sm">{{ item.title }}</p>
        </TooltipContent>
      </UiTooltip>
    </TooltipProvider>

    <!-- 额外信息 -->
    <div v-if="item.extra?.hover || item.extra?.desc" class="mt-1">
      <TooltipProvider v-if="item.extra?.hover">
        <UiTooltip>
          <TooltipTrigger asChild>
            <p :class="extraClass">
              {{ item.extra.hover || item.extra.desc }}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p class="max-w-md">{{ item.extra.hover }}</p>
          </TooltipContent>
        </UiTooltip>
      </TooltipProvider>
      <p v-else :class="extraClass">
        {{ item.extra.desc }}
      </p>
    </div>

    <!-- 其他新闻信息（如果有的话） -->
    <div v-if="item.extra?.info" class="mt-1">
      <span class="text-xs text-muted-foreground/70">
        {{ item.extra.info }}
      </span>
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
