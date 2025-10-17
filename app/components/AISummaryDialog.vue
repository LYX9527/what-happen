<script setup lang="ts">
import {ref, watch} from 'vue'
import {Sparkles, TrendingUp, Hash, Loader2, AlertCircle} from 'lucide-vue-next'
import type {AISummaryData} from '@/types/api'
import {useFetchAISummary} from '@/composables/useApi'
import {getTitle} from "~/config/platforms";

interface Props {
  category: string
  categoryTitle: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const open = defineModel<boolean>('open', {default: false})
const loading = ref(false)
const error = ref<string | null>(null)
const summaryData = ref<AISummaryData | null>(null)

// 监听弹窗打开状态，自动加载数据
watch(open, async (isOpen) => {
  if (isOpen && !summaryData.value) {
    await loadAISummary()
  }
})

// 加载AI总结数据
const loadAISummary = async () => {
  loading.value = true
  error.value = null

  try {
    // 首先尝试从真实API获取数据
    const response = await useFetchAISummary(props.category)
    summaryData.value = response.data
  } catch (err) {
    console.warn('获取AI总结失败，使用模拟数据:', err)
  } finally {
    loading.value = false
  }
}

// 重试加载
const retry = () => {
  summaryData.value = null
  loadAISummary()
}

// 格式化时间
const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '刚刚生成'
  if (minutes < 60) return `${minutes}分钟前生成`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前生成`
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 弹窗标题 -->
      <UiDialogHeader>
        <UiDialogTitle class="flex items-center gap-2 text-xl">
          <Sparkles class="w-5 h-5 text-primary"/>
          <span>{{ categoryTitle }} - AI 智能总结</span>
        </UiDialogTitle>
        <UiDialogDescription v-if="summaryData" class="text-xs text-muted-foreground mt-2">
          {{ formatTime(summaryData.generatedAt) }}
        </UiDialogDescription>
      </UiDialogHeader>

      <!-- 弹窗内容 -->
      <div class="flex-1 overflow-y-auto">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <Loader2 class="w-8 h-8 animate-spin text-primary mb-4"/>
          <p class="text-muted-foreground">正在生成AI总结...</p>
          <p class="text-xs text-muted-foreground mt-2">分析海量数据，提炼精华内容</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
          <AlertCircle class="w-8 h-8 text-destructive mb-4"/>
          <p class="text-muted-foreground mb-4">{{ error }}</p>
          <UiButton @click="retry" variant="outline" size="sm">
            重新加载
          </UiButton>
        </div>

        <!-- 内容展示 -->
        <div v-else-if="summaryData" class="space-y-6">
          <!-- 总体概述 -->
          <div class="flex items-center gap-2 mb-4">
            <Hash class="w-4 h-4 text-primary"/>
            <h3 class="font-medium">总体概述</h3>
          </div>
          <UiCard>

            <UiCardContent>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ summaryData.summary }}
              </p>
            </UiCardContent>
          </UiCard>

          <!-- 热门话题 -->
          <div v-if="summaryData.hotTopics?.length">
            <div class="flex items-center gap-2 mb-4">
              <Hash class="w-4 h-4 text-primary"/>
              <h3 class="font-medium">热门话题</h3>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <UiCard v-for="(topic, index) in summaryData.hotTopics" :key="index"
                      class="hover:shadow-md transition-shadow">
                <UiCardHeader class="pb-3">
                  <UiCardTitle class="text-sm font-medium flex items-start justify-between">
                    <span class="flex-1">{{ topic.topic }}</span>
                    <UiBadge variant="secondary" class="ml-2 shrink-0">
                      热度 {{ (95 - index * 5) }}%
                    </UiBadge>
                  </UiCardTitle>
                </UiCardHeader>
                <UiCardContent>
                  <p class="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {{ topic.description }}
                  </p>
                  <div v-if="topic.relatedPlatforms?.length" class="flex flex-wrap gap-1">
                    <UiBadge
                        v-for="platform in topic.relatedPlatforms"
                        :key="platform"
                        variant="outline"
                        class="text-xs"
                    >
                      {{ getTitle(platform) }}
                    </UiBadge>
                  </div>
                </UiCardContent>
              </UiCard>
            </div>
          </div>

          <!-- 趋势分析 -->
          <div v-if="summaryData.trends?.length">
            <div class="flex items-center gap-2 mb-4">
              <TrendingUp class="w-4 h-4 text-primary"/>
              <h3 class="font-medium">趋势分析</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(trend, index) in summaryData.trends" :key="index" class="flex gap-3">
                <div class="w-1 bg-primary rounded-full shrink-0"/>
                <div class="flex-1">
                  <h4 class="font-medium text-sm mb-1">{{ trend.title }}</h4>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    {{ trend.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类板块 -->
          <div v-if="summaryData.sections?.length" class="space-y-4">
            <UiSeparator/>
            <div v-for="(section, index) in summaryData.sections" :key="index">
              <h3 class="font-medium mb-3">{{ section.title }}</h3>
              <p class="text-sm text-muted-foreground mb-3 leading-relaxed">
                {{ section.content }}
              </p>
              <div v-if="section.platforms?.length" class="flex flex-wrap gap-2">
                <UiBadge
                    v-for="platform in section.platforms"
                    :key="platform"
                    variant="secondary"
                    class="text-xs"
                >
                  {{ getTitle(platform) }}
                </UiBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <UiDialogFooter class="mt-6">
        <div class="flex items-center justify-between w-full">
          <p class="text-xs text-muted-foreground">
            <Sparkles class="w-3 h-3 inline mr-1"/>
            由 AI 智能分析生成
          </p>
          <UiButton @click="open = false" variant="outline">
            关闭
          </UiButton>
        </div>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

</style>
