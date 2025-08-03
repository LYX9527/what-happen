<script setup lang="ts">
import type {SidebarProps} from '@/components/ui/sidebar'
import {computed} from 'vue'

import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Newspaper,
  TrendingUp,
  Film,
  Monitor,
  Star
} from 'lucide-vue-next'

import {useFavorites} from '@/composables/useFavorites'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import TeamSwitcher from "@/components/TeamSwitcher.vue";
import NavMain from "@/components/NavMain.vue";
import NavUser from "@/components/NavUser.vue";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

const emit = defineEmits<{
  'filter-change': [filter: string]
}>()

// 收藏功能
const {favoritesCount, newsItemsCount, platformsCount} = useFavorites()

// 总收藏数量（用于显示徽章）
const totalFavoritesCount = computed(() => newsItemsCount.value + platformsCount.value)

const data = {
  user: {
    name: '倚栏听风',
    email: 'https://github.com/LYX9527',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '新闻聚合中心',
      logo: GalleryVerticalEnd,
      plan: '专业版',
    }
  ],
  navMain: [
    {
      title: '新闻聚合',
      url: '#',
      icon: Newspaper,
      isActive: true,
      items: [
        {
          title: '全部榜单',
          url: '#',
          filter: 'all'
        },
        {
          title: '热搜榜',
          url: '#',
          filter: 'hot'
        },
        {
          title: '科技资讯',
          url: '#',
          filter: 'tech'
        },
        {
          title: '财经新闻',
          url: '#',
          filter: 'finance'
        },
        {
          title: '社会新闻',
          url: '#',
          filter: 'social'
        },
      ],
    },
    {
      title: '趋势榜单',
      url: '#',
      icon: TrendingUp,
      items: [
        {
          title: '微博热搜',
          url: '#',
          filter: "weibo"
        },
        {
          title: '百度热搜',
          url: '#',
          filter: 'baidu'
        },
        {
          title: '知乎热榜',
          url: '#',
          filter: 'zhihu'
        },
        {
          title: 'GitHub趋势',
          url: '#',
          filter: 'github'
        },
      ],
    },
    {
      title: '娱乐资讯',
      url: '#',
      icon: Film,
      items: [
        {
          title: '电影榜',
          url: '#',
          filter: "movies"
        },
        {
          title: '电视剧榜',
          url: '#',
          filter: "teleplay"
        },
        {
          title: '综艺榜',
          url: '#',
        },
        {
          title: '明星动态',
          url: '#',
        },
      ],
    },
    {
      title: '专题频道',
      url: '#',
      icon: Monitor,
      items: [
        {
          title: '汽车榜',
          url: '#',
        },
        {
          title: '科技前沿',
          url: '#',
        },
        {
          title: '游戏资讯',
          url: '#',
        },
        {
          title: '体育新闻',
          url: '#',
        },
      ],
    },
    {
      title: '热门平台',
      url: '#',
      icon: TrendingUp,
      items: [
        {
          title: '微博热搜',
          url: '#',
          filter: 'weibo'
        },
        {
          title: '百度热搜',
          url: '#',
          filter: 'baidu'
        },
        {
          title: 'GitHub趋势',
          url: '#',
          filter: 'github'
        },
        {
          title: '知乎热榜',
          url: '#',
          filter: 'zhihu'
        }
      ],
    },
    {
      title: '我的收藏',
      url: '#',
      icon: Star,
      badge: computed(() => totalFavoritesCount.value > 0 ? totalFavoritesCount.value.toString() : undefined),
      items: [
        {
          title: '收藏的新闻',
          url: '#',
          filter: 'favorites-news',
          badge: computed(() => newsItemsCount.value > 0 ? newsItemsCount.value.toString() : undefined)
        },
        {
          title: '收藏的平台',
          url: '#',
          filter: 'favorites-platforms',
          badge: computed(() => platformsCount.value > 0 ? platformsCount.value.toString() : undefined)
        }
      ],
    },
  ],
}

// 处理导航点击
const handleNavClick = (filter: string) => {
  emit('filter-change', filter)
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams"/>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" @item-click="handleNavClick"/>
    </SidebarContent>
    <!--    <SidebarFooter>-->
    <!--      <NavUser :user="data.user"/>-->
    <!--    </SidebarFooter>-->
    <SidebarRail/>
  </Sidebar>
</template>
