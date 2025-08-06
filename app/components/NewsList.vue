<script setup lang="ts">
import { ExternalLink, RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type {NewsItem} from "@/api";

interface Props {
  news: NewsItem[]
  loading?: boolean
  error?: string | null
  selectedPlatformLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  selectedPlatformLabel: ''
})

const emit = defineEmits<{
  refresh: []
}>()

const handleRefresh = () => {
  emit('refresh')
}

const openNewsLink = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-foreground">新闻列表</h2>
        <p v-if="selectedPlatformLabel" class="text-sm text-muted-foreground">
          {{ selectedPlatformLabel }}
        </p>
      </div>
      <Button
        v-if="selectedPlatformLabel"
        variant="outline"
        size="sm"
        :disabled="loading"
        @click="handleRefresh"
      >
        <RefreshCw :class="['w-4 h-4 mr-1', { 'animate-spin': loading }]" />
        刷新
      </Button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <p class="text-destructive text-sm">{{ error }}</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!selectedPlatformLabel && !loading"
         class="text-center py-12 text-muted-foreground">
      <p>请选择一个新闻平台查看内容</p>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="space-y-3">
      <div v-for="i in 10" :key="i" class="space-y-2">
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-3 w-1/2" />
      </div>
    </div>

    <!-- 新闻列表 -->
    <div v-else-if="news.length > 0" class="space-y-2">
      <div
        v-for="(item, index) in news"
        :key="item.id"
        class="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        @click="openNewsLink(item.url)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {{ (index + 1).toString().padStart(2, '0') }}
              </span>
            </div>
            <h3 class="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-5">
              {{ item.title }}
            </h3>
          </div>
          <ExternalLink class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="text-center py-8 text-muted-foreground">
      <p>暂无新闻数据</p>
    </div>
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
