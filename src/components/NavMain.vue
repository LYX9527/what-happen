<script setup lang="ts">
import {ChevronRight, type LucideIcon} from 'lucide-vue-next'
import { type ComputedRef } from 'vue'
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
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

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
      filter?: string
    }[]
  }[]
}>()

const emit = defineEmits<{
  'item-click': [filter: string]
}>()

// 处理子项点击
const handleSubItemClick = (event: Event, filter?: string) => {
  event.preventDefault()
  if (filter) {
    emit('item-click', filter)
  }
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>平台分类</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible
          v-for="item in items"
          :key="item.title"
          as-child
          :default-open="item.isActive"
          class="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger as-child>
            <SidebarMenuButton :tooltip="item.title">
              <component :is="item.icon" v-if="item.icon"/>
              <span>{{ item.title }}</span>
              <Badge 
                v-if="item.badge && (typeof item.badge === 'string' ? item.badge : item.badge.value)" 
                variant="secondary" 
                class="ml-auto h-5 w-5 rounded-full p-0 text-xs justify-center"
              >
                {{ typeof item.badge === 'string' ? item.badge : item.badge.value }}
              </Badge>
              <ChevronRight
                v-else
                class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                <SidebarMenuSubButton as-child>
                  <a 
                    :href="subItem.url" 
                    @click="handleSubItemClick($event, subItem.filter)"
                  >
                    <span>{{ subItem.title }}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
