<script setup lang="ts">
import {ChevronRight, type LucideIcon} from 'lucide-vue-next'
import {type ComputedRef} from 'vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar'
import {Badge} from '@/components/ui/badge'

defineProps<{
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: ComputedRef<string | undefined> | string
    items?: {
      title: string
      url: string
      badge?: ComputedRef<string | undefined> | string
    }[]
  }[]
}>()

const route = useRoute()
const { state } = useSidebar()

// 检查项目是否为当前路由
const isItemActive = (url: string) => {
  return route.path === url
}

// 检查是否收起状态
const isCollapsed = computed(() => state.value === 'collapsed')
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in items" :key="item.title">
        <SidebarMenuButton
          as-child
          :tooltip="item.title"
          :is-active="isItemActive(item.url)"
        >
          <NuxtLink
            :to="item.url"
            :class="[
              'flex items-center w-full',
              isCollapsed ? 'justify-center' : 'justify-between'
            ]"
          >
            <div class="flex items-center gap-2">
              <component :is="item.icon" v-if="item.icon" class="h-4 w-4 shrink-0" />
              <span v-if="!isCollapsed">{{ item.title }}</span>
            </div>
            <Badge
              v-if="item.badge && (typeof item.badge === 'string' ? item.badge : item.badge.value) && !isCollapsed"
              :variant="isItemActive(item.url) ? 'default' : 'secondary'"
              class="ml-auto h-5 w-5 rounded-full p-0 text-xs justify-center shrink-0"
            >
              {{ typeof item.badge === 'string' ? item.badge : item.badge.value }}
            </Badge>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
