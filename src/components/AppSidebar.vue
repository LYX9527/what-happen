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
  Star, ScanEye
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

interface AppSidebarProps extends SidebarProps {
  currentFilter?: string
  hotPlatforms?: Array<{ platform: string; title: string }>
}

const props = withDefaults(defineProps<AppSidebarProps>(), {
  collapsible: 'icon',
  currentFilter: 'all',
  hotPlatforms: () => []
})

const emit = defineEmits<{
  'filter-change': [filter: string]
}>()

// 收藏功能
const {favoritesCount, newsItemsCount, platformsCount} = useFavorites()

// 总收藏数量（用于显示徽章）
const totalFavoritesCount = computed(() => newsItemsCount.value + platformsCount.value)

// 平台分类映射 - 与dashboard中保持一致
const platformCategories: Record<string, string[]> = {
  hot: ['weibo', 'baidu', 'douyin', 'toutiao', 'zhihu', 'kuaishou'],
  tech: ['github', '_36kr', 'ithome', 'solidot', 'v2ex', 'coolapk', 'juejin', 'sspai', 'csdn'],
  finance: ['gelonghui', 'wallstreetcn_live', 'wallstreetcn_news', 'wallstreetcn_hot', 'hotstock', 'cls_telegraph', 'jqka'],
  social: ['thepaper', 'cankaoxiaoxi', 'zaobao', 'sputniknewscn'],
  github: ['github'],
  weibo: ['weibo'],
  baidu: ['baidu'],
  zhihu: ['zhihu'],
  movies: ['douban'],
  teleplay: ['bd_tv'],
  lol: ['hupu_lol'],
  music: ['kugou', 'qq_music'],
  car: ['dcd_hot', 'dcd_news']
}

// 计算分类平台数量
const getCategoryCount = (filter: string): number => {
  if (filter === 'all') {
    return props.hotPlatforms.length
  }
  const categoryPlatforms = platformCategories[filter] || []
  return props.hotPlatforms.filter(p => categoryPlatforms.includes(p.platform)).length
}

// 生成数量徽章
const generateBadge = (filter: string): string | undefined => {
  const count = getCategoryCount(filter)
  return count > 0 ? count.toString() : "0"
}

const data = computed(() => ({
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
      title: '首页',
      url: '#',
      icon: TrendingUp,
      isActive: true,
      filter: 'timeline',
      items: [
        {
          title: '新闻第一线',
          url: '#',
          filter: 'timeline',
        },
        {
          "title": '内娱动态',
          "url": '#',
        }
      ],
    },
    {
      title: '新闻聚合',
      url: '#',
      icon: Newspaper,
      isActive: false,
      items: [
        {
          title: '全部榜单',
          url: '#',
          filter: 'all',
          badge: generateBadge('all')
        },
        {
          title: '热搜榜',
          url: '#',
          filter: 'hot',
          badge: generateBadge('hot')
        },
        {
          title: '科技资讯',
          url: '#',
          filter: 'tech',
          badge: generateBadge('tech')
        },
        {
          title: '财经新闻',
          url: '#',
          filter: 'finance',
          badge: generateBadge('finance')
        },
        {
          title: '社会新闻',
          url: '#',
          filter: 'social',
          badge: generateBadge('social')
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
          filter: "weibo",
          badge: generateBadge('weibo')
        },
        {
          title: '百度热搜',
          url: '#',
          filter: 'baidu',
          badge: generateBadge('baidu')
        },
        {
          title: '知乎热榜',
          url: '#',
          filter: 'zhihu',
          badge: generateBadge('zhihu')
        },
        {
          title: 'GitHub趋势',
          url: '#',
          filter: 'github',
          badge: generateBadge('github')
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
          filter: "movies",
          badge: generateBadge('movies')
        },
        {
          title: '电视剧榜',
          url: '#',
          filter: "teleplay",
          badge: generateBadge('teleplay')
        },
        {
          title: '综艺榜',
          url: '#',
        },
        {
          title: '音乐榜',
          url: '#',
          filter: "music",
          badge: generateBadge('music')
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
          filter: 'car',
          badge: generateBadge('car')
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
      title: '比赛资讯',
      url: '#',
      icon: ScanEye,
      items: [
        {
          title: '英雄联盟',
          url: '#',
          filter: 'lol',
          badge: generateBadge('lol')
        },
        {
          title: 'NBA',
          url: '#'
        },
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
}))

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
      <NavMain :items="data.navMain" :current-filter="currentFilter" @item-click="handleNavClick"/>
    </SidebarContent>
    <!--    <SidebarFooter>-->
    <!--      <NavUser :user="data.user"/>-->
    <!--    </SidebarFooter>-->
    <SidebarRail/>
  </Sidebar>
</template>
