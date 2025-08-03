<script setup lang="ts">
import {Star} from 'lucide-vue-next'
import {Button} from '@/components/ui/button'
import type {MatchItem} from "@/api"
import {useFavorites} from '@/composables/useFavorites'
import {toast} from 'vue-sonner'
import { computed } from 'vue'

interface Props {
  item: MatchItem
  index: number
  platform?: string
  platformTitle?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [item: MatchItem]
}>()

// 收藏功能
const {isFavorited, toggleFavorite} = useFavorites()

// 动态计算比赛名称字体大小
const matchNameFontSize = computed(() => {
  const matchName = props.item.matchName || props.item.title || ''
  const length = matchName.length
  
  // 根据文字长度动态调整字体大小
  if (length <= 8) {
    return 'text-xs' // 12px
  } else if (length <= 12) {
    return 'text-[11px]' // 11px
  } else if (length <= 16) {
    return 'text-[10px]' // 10px
  } else {
    return 'text-[9px]' // 9px
  }
})

// 动态计算状态文字字体大小
const statusFontSize = computed(() => {
  // 获取最长的状态文字
  const statusText = props.item?.matchStatus || '未开始'
  const timeText = props.item?.matchStartTimeStamp ? formatMatchTime(props.item.matchStartTimeStamp) : ''
  
  // 计算显示文字的总长度
  const totalLength = statusText.length + timeText.length
  
  // 根据总长度动态调整字体大小
  if (totalLength <= 6) {
    return 'text-xs' // 12px
  } else if (totalLength <= 10) {
    return 'text-[11px]' // 11px
  } else if (totalLength <= 14) {
    return 'text-[10px]' // 10px
  } else {
    return 'text-[9px]' // 9px
  }
})

// 格式化时间显示
const formatMatchTime = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp))
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  
  if (diffMs > 0) {
    // 未来时间
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}小时${diffMins}分钟后`
    } else {
      return `${diffMins}分钟后`
    }
  } else {
    // 过去时间或当前
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
}

// 获取比赛状态颜色
const getStatusColor = (status: string): string => {
  switch (status) {
    case '进行中':
      return 'text-red-500'
    case '即将开始':
      return 'text-blue-500'
    case '已结束':
      return 'text-muted-foreground'
    default:
      return 'text-muted-foreground'
  }
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
    class="flex items-center gap-2 px-2 py-2 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
    @click="handleClick"
  >
    <!-- 比赛内容 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-3">
        <!-- 左侧队伍 -->
        <div class="flex items-center gap-2 flex-1">
          <div class="w-6 h-6 rounded overflow-hidden shrink-0">
            <img
              v-if="item.memberInfos?.[0]?.memberLogo"
              :src="item.memberInfos[0].memberLogo"
              :alt="item.memberInfos[0].memberName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-muted flex items-center justify-center">
              <span class="text-xs text-muted-foreground">🏆</span>
            </div>
          </div>
          <span class="text-xs font-medium text-foreground truncate">
            {{ item.memberInfos?.[0]?.memberName || 'TBD' }}
          </span>
        </div>

        <!-- 中间比赛信息 -->
        <div class="text-center min-w-0 flex-1">
          <!-- 比赛名称和状态 -->
          <div 
            :class="[matchNameFontSize, 'text-muted-foreground mb-0.5 whitespace-nowrap']"
          >
            {{ item.matchName || item.title }}
          </div>
          
          <!-- 比分 -->
          <div class="text-sm font-bold text-foreground">
            <span>{{ item?.memberInfos?.[0]?.memberBaseScore || '0' }}</span>
            <span class="mx-2">-</span>
            <span>{{ item?.memberInfos?.[1]?.memberBaseScore || '0' }}</span>
          </div>
          
          <!-- 状态和时间 -->
          <div :class="[statusFontSize, 'mt-0.5']">
            <!-- 非未开始状态显示状态文字 -->
            <span 
              v-if="item?.matchStatus && item?.matchStatus !== '未开始'" 
              :class="getStatusColor(item.matchStatus)"
            >
              {{ item.matchStatus }}
            </span>
            
            <!-- 有预定时间且不是进行中状态时显示时间信息 -->
            <span 
              v-if="item?.matchStartTimeStamp && item?.matchStatus !== '进行中'" 
              :class="[
                item?.matchStatus === '未开始' ? getStatusColor('即将开始') : 'text-muted-foreground',
                item?.matchStatus && item?.matchStatus !== '未开始' ? 'ml-1' : ''
              ]"
            >
              {{ formatMatchTime(item.matchStartTimeStamp) }}
            </span>
            
            <!-- 没有时间信息且状态为未开始时显示默认文字 -->
            <span 
              v-if="!item?.matchStartTimeStamp && (!item?.matchStatus || item?.matchStatus === '未开始')"
              :class="getStatusColor('未开始')"
            >
              未开始
            </span>
          </div>
        </div>

        <!-- 右侧队伍 -->
        <div class="flex items-center gap-2 flex-1 justify-end">
          <span class="text-xs font-medium text-foreground truncate">
            {{ item?.memberInfos?.[1]?.memberName || 'TBD' }}
          </span>
          <div class="w-6 h-6 rounded overflow-hidden shrink-0">
            <img
              v-if="item?.memberInfos?.[1]?.memberLogo"
              :src="item.memberInfos[1].memberLogo"
              :alt="item.memberInfos[1].memberName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-muted flex items-center justify-center">
              <span class="text-xs text-muted-foreground">🏆</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
