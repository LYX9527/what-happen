<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Newspaper,
  TrendingUp,
  Globe,
  Tv,
  Car,
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
import NavProjects from "@/components/NavProjects.vue";
import NavUser from "@/components/NavUser.vue";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '新闻聚合中心',
      logo: GalleryVerticalEnd,
      plan: '专业版',
    },
    {
      name: '热点追踪',
      logo: AudioWaveform,
      plan: '标准版',
    },
    {
      name: '趋势分析',
      logo: Command,
      plan: '基础版',
    },
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
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
