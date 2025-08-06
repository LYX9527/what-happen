<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type {Platform} from "@/api";

interface Props {
  platforms: Platform[]
  loading?: boolean
  error?: string | null
  selectedPlatform?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  selectedPlatform: ''
})

const emit = defineEmits<{
  'platform-selected': [platform: string, label: string]
}>()

// 扁平化平台列表
const flatPlatforms = computed(() => {
  const result: { platform: string; label: string; parentLabel: string }[] = []

  props.platforms.forEach(platform => {
    platform.list.forEach(subPlatform => {
      result.push({
        platform: subPlatform.platform,
        label: subPlatform.label,
        parentLabel: platform.label
      })
    })
  })

  return result
})

const handlePlatformSelect = (platform: string, label: string) => {
  emit('platform-selected', platform, label)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-foreground">选择新闻平台</h2>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <p class="text-destructive text-sm">{{ error }}</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="space-y-2">
      <Skeleton class="h-8 w-full" />
      <Skeleton class="h-8 w-full" />
      <Skeleton class="h-8 w-full" />
    </div>

    <!-- 平台列表 -->
    <div v-else-if="!error" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Button
        v-for="platform in flatPlatforms"
        :key="platform.platform"
        :variant="selectedPlatform === platform.platform ? 'default' : 'outline'"
        size="sm"
        class="justify-start text-left h-auto py-2 px-3"
        @click="handlePlatformSelect(platform.platform, `${platform.parentLabel} - ${platform.label}`)"
      >
        <div class="flex flex-col items-start">
          <span class="text-xs text-muted-foreground">{{ platform.parentLabel }}</span>
          <span class="font-medium">{{ platform.label }}</span>
        </div>
      </Button>
    </div>
  </div>
</template>
