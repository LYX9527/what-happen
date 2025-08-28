<script setup lang="ts">

import {type Component, ref} from 'vue'

type TeamItem = {
  name: string
  // 允许传入图标组件或图片路径字符串（如 png/svg）
  logo: Component | string
  plan?: string
}

const props = defineProps<{
  teams: TeamItem[]
}>()

const activeTeam = ref(props.teams[0])

const isStringLogo = (logo: TeamItem['logo']): logo is string => typeof logo === 'string'
</script>

<template>
  <UiSidebarMenu>
    <UiSidebarMenuItem>
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiSidebarMenuButton
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <img v-if="isStringLogo(activeTeam!!.logo)" :src="activeTeam!!.logo" alt="logo"
                 class="size-10 object-contain"/>
            <div v-else
                 class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <component :is="activeTeam!!.logo" class="size-4"/>
            </div>
            <div class="grid flex-1 ml-5 text-left text-sm leading-tight">
              <span class="truncate font-zt text-[20px] font-semibold">
                {{ activeTeam!!.name }}
              </span>
              <span v-if="activeTeam!!.plan" class="truncate text-xs">{{ activeTeam!!.plan }}</span>
            </div>
          </UiSidebarMenuButton>
        </UiDropdownMenuTrigger>
      </UiDropdownMenu>
    </UiSidebarMenuItem>
  </UiSidebarMenu>
</template>
<style>
@font-face {
  font-family: 'Zt';
  src: url('~/assets/fonts/zt.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Pmzd';
  src: url('~/assets/fonts/pmzd.ttf') format('truetype');
  font-display: swap;
}

.font-zt {
  font-family: 'Pmzd', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}
</style>
