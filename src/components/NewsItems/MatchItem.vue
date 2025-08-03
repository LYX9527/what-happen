<script setup lang="ts">
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@/components/ui/hover-card'
import type {MatchItem} from "@/api"
import {useFavorites} from '@/composables/useFavorites'
import {computed} from 'vue'
import {BOT, MID, SUP, TOP, JUN} from "@/components/icon";

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

// 判断是否显示赛后数据
const shouldShowPostMatchData = computed(() => {
  return props.item?.matchStatus === '已结束' && props.item?.totalScore && props.item.totalScore.length >= 2
})

// 获取位置中文名称
const getPositionName = (position: string): string => {
  const positionMap: Record<string, string> = {
    'TOP': '上单',
    'JUN': '打野',
    'MID': '中单',
    'BOT': 'ADC',
    'SUP': '辅助'
  }
  return positionMap[position] || position
}

// 获取位置图标
const getPositionIcon = (position: string): string => {
  const positionIconMap: Record<string, string> = {
    'TOP': TOP,
    'JUN': JUN,
    'MID': MID,
    'BOT': BOT,
    'SUP': SUP
  }
  return positionIconMap[position] || '❓'
}

// 定义位置排序顺序
const positionOrder = ['TOP', 'JUN', 'MID', 'BOT', 'SUP']

// 处理和排序玩家数据
const getSortedPlayerData = computed(() => {
  if (!props.item?.totalScore || props.item.totalScore.length < 2) {
    return []
  }

  const teamA = props.item.totalScore.filter(team => team.teamId == props.item.memberInfos[0].memberId)[0]
  const teamB = props.item.totalScore.filter(team => team.teamId == props.item.memberInfos[1].memberId)[0]

  // 创建位置映射
  const teamAByPosition = teamA.playerInfo.reduce((acc, player) => {
    acc[player.playerLocation] = player
    return acc
  }, {} as Record<string, any>)

  const teamBByPosition = teamB.playerInfo.reduce((acc, player) => {
    acc[player.playerLocation] = player
    return acc
  }, {} as Record<string, any>)

  // 按照指定顺序生成数据
  return positionOrder.map(position => {
    const playerA = teamAByPosition[position]
    const playerB = teamBByPosition[position]
    const scoreA = playerA?.playerScore || '0'
    const scoreB = playerB?.playerScore || '0'
    const scoreColors = getScoreColorClass(scoreA, scoreB)

    return {
      position,
      playerA: playerA || {playerName: '未知', playerScore: '0'},
      playerB: playerB || {playerName: '未知', playerScore: '0'},
      scoreColors
    }
  })
})
const getScoreColorClass = (scoreA: string | number, scoreB: string | number): { teamA: string, teamB: string } => {
  const numScoreA = parseFloat(String(scoreA)) || 0
  const numScoreB = parseFloat(String(scoreB)) || 0

  if (numScoreA > numScoreB) {
    return {
      teamA: 'text-red-500 dark:text-red-400', // 分数高的为红色
      teamB: 'text-muted-foreground' // 分数低的为灰色
    }
  } else if (numScoreB > numScoreA) {
    return {
      teamA: 'text-muted-foreground', // 分数低的为灰色
      teamB: 'text-red-500 dark:text-red-400' // 分数高的为红色
    }
  } else {
    return {
      teamA: 'text-blue-600 dark:text-blue-400', // 分数相等时为蓝色
      teamB: 'text-blue-600 dark:text-blue-400'
    }
  }
}

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
          <HoverCard v-if="shouldShowPostMatchData" :open-delay="300" :close-delay="100">
            <HoverCardTrigger as-child>
              <div class="cursor-pointer">
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
                  <span
                      v-if="item?.matchStatus && item?.matchStatus !== '未开始'"
                      :class="getStatusColor(item.matchStatus)"
                  >
                    {{ item.matchStatus }}
                  </span>

                  <span
                      v-if="item?.matchStartTimeStamp && item?.matchStatus !== '进行中'"
                      :class="[
                      item?.matchStatus === '未开始' ? getStatusColor('即将开始') : 'text-muted-foreground',
                      item?.matchStatus && item?.matchStatus !== '未开始' ? 'ml-1' : ''
                    ]"
                  >
                    {{ formatMatchTime(item.matchStartTimeStamp) }}
                  </span>

                  <span
                      v-if="!item?.matchStartTimeStamp && (!item?.matchStatus || item?.matchStatus === '未开始')"
                      :class="getStatusColor('未开始')"
                  >
                    未开始
                  </span>
                </div>
              </div>
            </HoverCardTrigger>

            <HoverCardContent class="w-86 p-2" side="top" align="center">

              <div class="space-y-2 p-2">
                <div
                    v-for="positionData in getSortedPlayerData"
                    :key="positionData.position"
                    class="grid grid-cols-5 gap-2 items-center text-xs"
                >
                  <!-- TeamA 玩家名 -->
                  <div class="text-left truncate">
                    <span class="text-foreground">{{ positionData.playerA.playerName }}</span>
                  </div>

                  <!-- TeamA 评分 -->
                  <div class="text-right">
                    <span :class="[positionData.scoreColors.teamA, 'font-medium']">
                      {{ positionData.playerA.playerScore }}
                    </span>
                  </div>


                  <!-- 位置图标和名称 -->
                  <div class="flex flex-col items-center">
                    <span class="text-sm">
                      <component
                          class="w-4 h-4"
                          :is="getPositionIcon(positionData.position)"/>
                    </span>
                    <span class="text-[10px] text-muted-foreground">{{ getPositionName(positionData.position) }}</span>
                  </div>

                  <!-- TeamB 评分 -->
                  <div class="text-left">
                    <span :class="[positionData.scoreColors.teamB, 'font-medium']">
                      {{ positionData.playerB.playerScore }}
                    </span>
                  </div>


                  <!-- TeamB 玩家名 -->
                  <div class="text-right truncate">
                    <span class="text-foreground">{{ positionData.playerB.playerName }}</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <!-- 没有赛后数据的普通显示 -->
          <div v-else>
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
              <span
                  v-if="item?.matchStatus && item?.matchStatus !== '未开始'"
                  :class="getStatusColor(item.matchStatus)"
              >
                {{ item.matchStatus }}
              </span>

              <span
                  v-if="item?.matchStartTimeStamp && item?.matchStatus !== '进行中'"
                  :class="[
                  item?.matchStatus === '未开始' ? getStatusColor('即将开始') : 'text-muted-foreground',
                  item?.matchStatus && item?.matchStatus !== '未开始' ? 'ml-1' : ''
                ]"
              >
                {{ formatMatchTime(item.matchStartTimeStamp) }}
              </span>

              <span
                  v-if="!item?.matchStartTimeStamp && (!item?.matchStatus || item?.matchStatus === '未开始')"
                  :class="getStatusColor('未开始')"
              >
                未开始
              </span>
            </div>
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
