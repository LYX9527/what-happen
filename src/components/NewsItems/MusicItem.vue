<script setup lang="ts">
import {computed} from 'vue'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface MusicItem {
  title: string
  extra: {
    time: string
    author: string
    cover: string
  }
}

interface Props {
  item: MusicItem
  index: number
  platform?: string
  platformTitle?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [item: MusicItem]
}>()

// 动态计算歌手名字体大小
const authorFontSize = computed(() => {
  const author = props.item.extra?.author || ''
  const length = author.length

  if (length <= 8) {
    return 'text-xs' // 12px
  } else if (length <= 12) {
    return 'text-[11px]' // 11px
  } else {
    return 'text-[10px]' // 10px
  }
})

// 处理点击
const handleClick = () => {
  emit('item-click', props.item)
}
</script>

<template>
  <div
      class="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
      @click="handleClick"
  >
    <!-- 排名 -->
    <div class="flex items-center justify-center w-5 h-4 text-xs font-mono shrink-0">
      <span
          :class="[
          index < 3 ? 'text-foreground font-medium' : 'text-muted-foreground'
        ]"
      >
        {{ index + 1 }}
      </span>
    </div>

    <!-- 音乐封面 -->
    <div class="w-12 h-12 rounded overflow-hidden shrink-0">
      <img
          v-if="item.extra?.cover"
          :src="item.extra.cover"
          :alt="item.title"
          class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-muted flex items-center justify-center">
        <span class="text-lg text-muted-foreground">🎵</span>
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="flex-1 min-w-0">
      <div class="space-y-0.5">
        <!-- 歌曲名称 -->
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p class="text-xs text-foreground group-hover:text-foreground/80 transition-all duration-200 truncate leading-normal
                      relative group-hover:underline underline-offset-2 decoration-1 decoration-muted-foreground/50">
                {{ item.title }}
              </p>
            </TooltipTrigger>
            <TooltipContent>
                {{ item.title }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- 歌手名称 -->
        <div
            :class="[authorFontSize, 'text-muted-foreground truncate']"
            :title="item.extra?.author"
        >
          {{ item.extra?.author || '未知歌手' }}
        </div>
      </div>
    </div>

    <!-- 时长 -->
    <div class="text-right" v-if="item.extra?.time">
      <span class="text-xs text-muted-foreground font-mono">
        {{ item.extra?.time || '--:--' }}
      </span>
    </div>

  </div>
</template>
