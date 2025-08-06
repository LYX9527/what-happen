<script setup lang="ts">
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import AppSidebar from '@/components/AppSidebar.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { Button } from '@/components/ui/button'
import { ExternalLink, Search } from 'lucide-vue-next'

interface Props {
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string, href?: string }>
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumbs: () => []
})

// 全局搜索组件引用
const globalSearchRef = ref()

// 打开全局搜索
const openGlobalSearch = () => {
  if (globalSearchRef.value) {
    globalSearchRef.value.open()
  }
}

// 处理外部链接打开
const openLink = () => {
  if (process.client && typeof window !== 'undefined') {
    window.open('https://github.com/LYX9527/what-happen', '_blank')
  }
}
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="/">
                  首页
                </BreadcrumbLink>
              </BreadcrumbItem>
              <template v-for="(item, index) in breadcrumbs" :key="index">
                <BreadcrumbSeparator class="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink v-if="item.href" :href="item.href">
                    {{ item.label }}
                  </BreadcrumbLink>
                  <BreadcrumbPage v-else>
                    {{ item.label }}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div class="ml-auto px-3">
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="openGlobalSearch"
              class="relative gap-2"
            >
              <Search class="h-4 w-4" />
              <span class="hidden sm:inline">搜索...</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              @click="openLink"
              class="h-8 w-8"
            >
              <ExternalLink class="h-4 w-4" />
              <span class="sr-only">GitHub</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
          <div class="p-6">
            <!-- 页面标题和描述 -->
            <div class="mb-6">
              <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
              <p v-if="description" class="text-muted-foreground mt-2">{{ description }}</p>
            </div>
            
            <!-- 主要内容插槽 -->
            <slot />
          </div>
        </div>
      </div>
    </SidebarInset>
    
    <!-- 全局搜索 -->
    <GlobalSearch 
      ref="globalSearchRef"
      @filter-change="(filter) => $router.push(`/${filter}`)"
    />
  </SidebarProvider>
</template> 