<script setup lang="ts">
import type {SidebarProps} from '@/components/ui/sidebar'

import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Newspaper,
  TrendingUp,
  Film,
  Monitor
} from 'lucide-vue-next'

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
          title: '热搜榜',
          url: '#',
        },
        {
          title: '科技资讯',
          url: '#',
        },
        {
          title: '财经新闻',
          url: '#',
        },
        {
          title: '社会新闻',
          url: '#',
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
        },
        {
          title: '百度热搜',
          url: '#',
        },
        {
          title: '知乎热榜',
          url: '#',
        },
        {
          title: 'GitHub趋势',
          url: '#',
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
        },
        {
          title: '电视剧榜',
          url: '#',
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
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams"/>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain"/>
    </SidebarContent>
<!--    <SidebarFooter>-->
<!--      <NavUser :user="data.user"/>-->
<!--    </SidebarFooter>-->
    <SidebarRail/>
  </Sidebar>
</template>
