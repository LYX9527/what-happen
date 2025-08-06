<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Globe,
  Newspaper,
  TrendingUp,
  Clock
} from 'lucide-vue-next'
import type { NewsItem } from '@/api'

// Props
interface Props {
  hotPlatforms?: Array<{ platform: string; title: string }>
  platformsData?: Record<string, {
    data: NewsItem[]
    loading: boolean
    error: string | null
  }>
  onFilterChange?: (filter: string) => void
  onNewsClick?: (item: NewsItem) => void
}

const props = withDefaults(defineProps<Props>(), {
  hotPlatforms: () => [],
  platformsData: () => ({}),
})

// Emits
const emit = defineEmits<{
  'filter-change': [filter: string]
  'news-click': [item: NewsItem]
}>()

const router = useRouter()

// 搜索框状态
const open = ref(false)
const search = ref('')

// 搜索结果状态
const selectedIndex = ref(0)

// 检测是否为Mac平台 - SSR兼容版本
const isMac = computed(() => {
  // 服务端渲染时默认返回false
  if (process.server) {
    return false
  }
  try {
    return typeof navigator !== 'undefined' && 
           navigator.platform && 
           navigator.platform.toLowerCase().includes('mac')
  } catch (error) {
    return false
  }
})

// 平台分类映射
const platformCategories: Record<string, string> = {
  weibo: '热搜榜',
  baidu: '热搜榜',
  douyin: '热搜榜',
  toutiao: '热搜榜',
  zhihu: '热搜榜',
  kuaishou: '热搜榜',
  github: '科技资讯',
  '_36kr': '科技资讯',
  ithome: '科技资讯',
  solidot: '科技资讯',
  v2ex: '科技资讯',
  coolapk: '科技资讯',
  juejin: '科技资讯',
  sspai: '科技资讯',
  csdn: '科技资讯',
  gelonghui: '财经新闻',
  wallstreetcn_live: '财经新闻',
  wallstreetcn_news: '财经新闻',
  wallstreetcn_hot: '财经新闻',
  hotstock: '财经新闻',
  cls_telegraph: '财经新闻',
  jqka: '财经新闻',
  thepaper: '社会新闻',
  cankaoxiaoxi: '社会新闻',
  zaobao: '社会新闻',
  sputniknewscn: '社会新闻',
  douban: '娱乐资讯',
  bd_tv: '娱乐资讯',
  kugou: '娱乐资讯',
  qq_music: '娱乐资讯',
  hupu_lol: '比赛资讯',
  dcd_hot: '专题频道',
  dcd_news: '专题频道'
}

// 搜索平台
const searchedPlatforms = computed(() => {
  if (!search.value) return []
  
  return props.hotPlatforms
    .filter(platform => 
      platform.title.toLowerCase().includes(search.value.toLowerCase()) ||
      platform.platform.toLowerCase().includes(search.value.toLowerCase())
    )
    .slice(0, 8)
    .map(platform => ({
      ...platform,
      type: 'platform' as const,
      category: platformCategories[platform.platform] || '其他'
    }))
})

// 搜索新闻
const searchedNews = computed(() => {
  if (!search.value || search.value.length < 2) return []
  
  const results: Array<NewsItem & { type: 'news'; platformTitle: string }> = []
  const query = search.value.toLowerCase()
  
  // 遍历所有平台的新闻数据
  Object.entries(props.platformsData).forEach(([platformKey, platformState]) => {
    if (!platformState.data || platformState.data.length === 0) return
    
    const platform = props.hotPlatforms.find(p => p.platform === platformKey)
    if (!platform) return
    
    // 搜索该平台的新闻
    const matchedNews = platformState.data
      .filter(item => item.title.toLowerCase().includes(query))
      .slice(0, 3) // 每个平台最多3条
      .map(item => ({
        ...item,
        type: 'news' as const,
        platformTitle: platform.title
      }))
    
    results.push(...matchedNews)
  })
  
  return results.slice(0, 10) // 总共最多10条新闻
})

// 所有搜索结果
const searchResults = computed(() => {
  return [
    ...searchedPlatforms.value,
    ...searchedNews.value
  ]
})

// 快捷键监听
const handleKeydown = (e: KeyboardEvent) => {
  // Cmd+K (Mac) 或 Ctrl+K (Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    open.value = true
  }
  // ESC 关闭
  if (e.key === 'Escape') {
    open.value = false
  }
}

// 处理选择项目
const handleSelect = (item: any) => {
  if (item.type === 'platform') {
    // 跳转到平台筛选
    const filterMap: Record<string, string> = {
      weibo: 'weibo',
      baidu: 'baidu',
      github: 'github',
      zhihu: 'zhihu'
    }
    
    const filter = filterMap[item.platform] || 'all'
    emit('filter-change', filter)
    
    // 更新URL
    router.push({
      query: { filter: filter === 'all' ? undefined : filter }
    })
  } else if (item.type === 'news') {
    // 打开新闻链接
    emit('news-click', item)
    if (process.client && typeof window !== 'undefined') {
      window.open(item.url, '_blank')
    }
  }
  
  open.value = false
  search.value = ''
}

// 处理对话框状态变化
const handleOpenChange = (isOpen: boolean) => {
  open.value = isOpen
  if (!isOpen) {
    search.value = ''
    selectedIndex.value = 0
  }
}

// 生命周期 - SSR兼容版本
onMounted(() => {
  if (process.client && typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (process.client && typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// 暴露打开方法
defineExpose({
  open: () => { open.value = true }
})
</script>

<template>
  <CommandDialog :open="open" @update:open="handleOpenChange">
    <CommandInput 
      v-model="search"
      placeholder="搜索平台或新闻..." 
      class="h-12"
    />
    <CommandList>
      <CommandEmpty>
        <div class="py-6 text-center text-sm text-muted-foreground">
          <Search class="mx-auto h-8 w-8 mb-2 opacity-50" />
          未找到相关结果
        </div>
      </CommandEmpty>
      
      <!-- 平台搜索结果 -->
      <CommandGroup v-if="searchedPlatforms.length > 0" heading="平台">
        <CommandItem
          v-for="platform in searchedPlatforms"
          :key="`platform-${platform.platform}`"
          :value="`platform-${platform.platform}`"
          @select="handleSelect(platform)"
          class="flex items-center gap-3 px-4 py-3"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Globe class="h-4 w-4" />
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ platform.title }}</span>
              <Badge variant="secondary" class="text-xs">
                {{ platform.category }}
              </Badge>
            </div>
            <span class="text-xs text-muted-foreground">{{ platform.platform }}</span>
          </div>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CommandItem>
      </CommandGroup>

      <CommandSeparator v-if="searchedPlatforms.length > 0 && searchedNews.length > 0" />
      
      <!-- 新闻搜索结果 -->
      <CommandGroup v-if="searchedNews.length > 0" heading="新闻">
        <CommandItem
          v-for="news in searchedNews"
          :key="`news-${news.id}`"
          :value="`news-${news.id}`"
          @select="handleSelect(news)"
          class="flex items-center gap-3 px-4 py-3"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Newspaper class="h-4 w-4" />
          </div>
          <div class="flex flex-col gap-1 flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm line-clamp-1">{{ news.title }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{{ news.platformTitle }}</span>
              <span v-if="news.extra?.time" class="flex items-center gap-1">
                <Clock class="h-3 w-3" />
                {{ news.extra.time }}
              </span>
            </div>
          </div>
        </CommandItem>
      </CommandGroup>
      
      <!-- 快捷键提示 -->
      <div v-if="!search" class="px-4 py-6 text-center text-sm text-muted-foreground">
        <div class="mb-3">
          <Search class="mx-auto h-8 w-8 mb-2 opacity-50" />
          开始输入以搜索平台或新闻
        </div>
        <div class="text-xs">
                     <kbd class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
             <span class="text-xs">{{ isMac ? '⌘K' : 'Ctrl+K' }}</span>
           </kbd>
          快速搜索
        </div>
      </div>
    </CommandList>
  </CommandDialog>
</template>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
</style> 