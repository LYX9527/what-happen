<script setup lang="ts">
import { computed } from 'vue'
import NewsRankCard from '@/components/NewsRankCard.vue'
import { useFavorites } from '@/composables/useFavorites'
import type { NewsItem } from '@/api'
import type { PlatformConfig } from '@/config/platforms'
import { VueDraggable } from 'vue-draggable-plus'
import { RefreshCw, Newspaper } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface PlatformData {
  platform: string
  title: string
  data: NewsItem[]
  loading: boolean
  error: string | null
}

interface Props {
  platformsData: Record<string, PlatformData>
  platformConfigs: PlatformConfig[]
  enableDrag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enableDrag: false
})

const emit = defineEmits<{
  'refresh': [platform: string]
  'refresh-all': []
  'platform-order-change': [platforms: PlatformConfig[]]
}>()

// 使用收藏功能
const { platforms: favoritePlatforms } = useFavorites()

// 当前平台列表（支持拖拽排序）
const currentPlatforms = ref([...props.platformConfigs])

// 监听props变化更新本地状态
watch(() => props.platformConfigs, (newConfigs) => {
  currentPlatforms.value = [...newConfigs]
}, { deep: true })

// 处理卡片点击
const handleCardItemClick = (item: NewsItem) => {
  if (process.client && typeof window !== 'undefined') {
    window.open(item.url, '_blank')
  }
}

// 处理显示更多
const handleShowMore = (platform: string, title: string) => {
  console.log(`显示更多: ${title}`)
  // 可以实现跳转到单独的平台页面
}

// 处理刷新
const handleRefresh = (platform: string) => {
  emit('refresh', platform)
}

// 处理刷新所有
const handleRefreshAll = () => {
  emit('refresh-all')
}

// 拖拽排序处理
const onDragEnd = () => {
  emit('platform-order-change', currentPlatforms.value)
}

// 获取平台数据
const getPlatformData = (platform: string) => {
  return props.platformsData[platform] || {
    platform,
    title: platform,
    data: [],
    loading: false,
    error: null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 操作栏 -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        共 {{ platformConfigs.length }} 个平台
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="handleRefreshAll"
          class="gap-2"
        >
          <RefreshCw class="h-4 w-4" />
          刷新全部
        </Button>
      </div>
    </div>

    <!-- 新闻卡片网格 -->
    <div v-if="enableDrag" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <VueDraggable
        v-model="currentPlatforms"
        @end="onDragEnd"
        class="contents"
        :animation="200"
        ghost-class="opacity-50"
      >
        <div
          v-for="platformConfig in currentPlatforms"
          :key="platformConfig.platform"
          class="cursor-move"
        >
          <NewsRankCard
            :platform="platformConfig.platform"
            :title="platformConfig.title"
            :data="getPlatformData(platformConfig.platform).data"
            :loading="getPlatformData(platformConfig.platform).loading"
            :error="getPlatformData(platformConfig.platform).error"
            :is-favorited="favoritePlatforms.some(p => p.platform === platformConfig.platform)"
            @item-click="handleCardItemClick"
            @show-more="handleShowMore"
            @refresh="handleRefresh"
          />
        </div>
      </VueDraggable>
    </div>

    <!-- 静态网格（不可拖拽） -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NewsRankCard
        v-for="platformConfig in platformConfigs"
        :key="platformConfig.platform"
        :platform="platformConfig.platform"
        :title="platformConfig.title"
        :data="getPlatformData(platformConfig.platform).data"
        :loading="getPlatformData(platformConfig.platform).loading"
        :error="getPlatformData(platformConfig.platform).error"
        :is-favorited="favoritePlatforms.some(p => p.platform === platformConfig.platform)"
        @item-click="handleCardItemClick"
        @show-more="handleShowMore"
        @refresh="handleRefresh"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="platformConfigs.length === 0" class="text-center py-12">
      <div class="text-muted-foreground">
        <Newspaper class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium">暂无数据</p>
        <p class="text-sm">请稍后再试或刷新页面</p>
      </div>
    </div>
  </div>
</template> 