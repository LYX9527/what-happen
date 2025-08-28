<script setup lang="ts">
import type {SidebarProps} from '@/components/ui/sidebar'
import {computed} from 'vue'

import {
  Home,
  TrendingUp,
  Cpu,
  DollarSign,
  Globe,
  Music,
  Trophy,
  Car,
  Clock,
  Heart,
  Bookmark,
  Star
} from 'lucide-vue-next'

import {useFavorites} from '@/composables/useFavorites'
import {NAVIGATION_ITEMS, ROUTE_CONFIGS} from '@/config/platforms'

import TeamSwitcher from "@/components/TeamSwitcher.vue";
import NavMain from "@/components/NavMain.vue";
import logoPng from '@/assets/512.png'

interface AppSidebarProps extends SidebarProps {
  // 使用新的路由结构，不需要额外props
}

const props = withDefaults(defineProps<AppSidebarProps>(), {
  collapsible: 'icon'
})

// 收藏功能
const {newsItemsCount, platformsCount} = useFavorites()


// 获取路径对应的平台数量
const getPlatformCount = (path: string): number => {
  const routeKey = path === '/' ? 'index' : path.replace('/', '')
  const routeConfig = ROUTE_CONFIGS[routeKey]
  return routeConfig?.platforms?.length || 0
}

// 图标映射
const iconMap = {
  'Home': Home,
  'TrendingUp': TrendingUp,
  'Cpu': Cpu,
  'DollarSign': DollarSign,
  'Globe': Globe,
  'Music': Music,
  'Trophy': Trophy,
  'Car': Car,
  'Clock': Clock,
  'Heart': Heart,
  'Bookmark': Bookmark,
  'Star': Star
}

const data = computed(() => ({
  user: {
    name: '倚栏听风',
    email: 'https://github.com/LYX9527',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '今 日 时 事',
      logo: logoPng,
    }
  ],
  navMain: NAVIGATION_ITEMS.map(item => {
    const baseItem = {
      title: item.title,
      url: item.path,
      icon: iconMap[item.icon as keyof typeof iconMap] || Home,
      isActive: false,
      items: []
    }

    // 为收藏相关项目添加徽章 - SSR 兼容版本
    if (item.path === '/favorites-news') {
      return {
        ...baseItem,
        badge: computed(() => {
          // 在服务端渲染时始终返回 undefined 以避免 hydration 不匹配
          if (process.server) return undefined
          return newsItemsCount.value > 0 ? newsItemsCount.value.toString() : undefined
        })
      }
    }

    if (item.path === '/favorites-platforms') {
      return {
        ...baseItem,
        badge: computed(() => {
          // 在服务端渲染时始终返回 undefined 以避免 hydration 不匹配
          if (process.server) return undefined
          return platformsCount.value > 0 ? platformsCount.value.toString() : undefined
        })
      }
    }

    // 为除了首页和收藏页面外的其他类目添加平台数量徽章
    if (item.path !== '/' && !item.path.startsWith('/favorites')) {
      const platformCount = getPlatformCount(item.path)
      return {
        ...baseItem,
        badge: computed(() => platformCount > 0 ? platformCount.toString() : undefined)
      }
    }

    return baseItem
  })
}))
</script>

<template>
  <UiSidebar v-bind="props">
    <UiSidebarHeader>
      <TeamSwitcher :teams="data.teams"/>
    </UiSidebarHeader>
    <UiSidebarContent>
      <NavMain :items="data.navMain"/>
    </UiSidebarContent>
    <UiSidebarRail/>
  </UiSidebar>
</template>
