<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft, Wifi, WifiOff } from 'lucide-vue-next'
import { gsap } from 'gsap'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

// 动画元素引用
const containerRef = ref<HTMLElement>()
const notFoundRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()
const descriptionRef = ref<HTMLElement>()
const buttonsRef = ref<HTMLElement>()
const floatingElementsRef = ref<HTMLElement[]>([])

// 浮动元素状态
const isConnected = ref(navigator.onLine)

// 生成随机位置的数组
const floatingPositions = Array.from({ length: 8 }, () => ({
  left: Math.random() * 80 + 10,
  top: Math.random() * 80 + 10,
  size: ['w-4 h-4', 'w-5 h-5', 'w-6 h-6'][Math.floor(Math.random() * 3)]
}))

// 监听网络状态
const updateConnectionStatus = () => {
  isConnected.value = navigator.onLine
}

onMounted(() => {
  // 监听网络状态变化
  window.addEventListener('online', updateConnectionStatus)
  window.addEventListener('offline', updateConnectionStatus)

  // 页面进入动画
  const tl = gsap.timeline()

  // 404文字动画
  tl.fromTo(notFoundRef.value,
      {
        scale: 0,
        rotation: -180,
        opacity: 0
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
      }
  )

      // 标题动画
      .fromTo(titleRef.value,
          {
            y: 50,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out"
          },
          "-=0.5"
      )

      // 描述文字动画
      .fromTo(descriptionRef.value,
          {
            y: 30,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
          },
          "-=0.4"
      )

      // 按钮动画
      .fromTo(buttonsRef.value?.children || [],
          {
            y: 20,
            opacity: 0,
            scale: 0.9
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
          },
          "-=0.3"
      )

  // 浮动图标动画
  if (floatingElementsRef.value.length > 0) {
    floatingElementsRef.value.forEach((el, index) => {
      gsap.set(el, {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5
      })

      gsap.to(el, {
        y: "+=20",
        duration: 2 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.2
      })

      gsap.to(el, {
        rotation: "+=360",
        duration: 10 + Math.random() * 10,
        repeat: -1,
        ease: "none"
      })
    })
  }

  // 404数字的持续轻微摆动
  gsap.to(notFoundRef.value, {
    rotation: 2,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  })
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('online', updateConnectionStatus)
  window.removeEventListener('offline', updateConnectionStatus)
})

// 导航方法
const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const openSearch = () => {
  // 直接回到首页，让用户使用首页的搜索功能
  router.push('/')
}
</script>

<template>
  <div ref="containerRef" class="min-h-screen bg-background text-foreground flex flex-col overflow-hidden relative">
    <!-- 主题切换按钮 -->
    <div class="absolute top-4 right-4 z-10">
      <ThemeToggle />
    </div>

    <!-- 浮动装饰元素 -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
          v-for="(position, i) in floatingPositions"
          :key="i"
          ref="floatingElementsRef"
          class="absolute text-muted-foreground/20 dark:text-muted-foreground/10"
          :style="{
          left: position.left + '%',
          top: position.top + '%'
        }"
      >
        <component
            :is="isConnected ? Wifi : WifiOff"
            :class="position.size"
        />
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="flex-1 flex items-center justify-center px-4">
      <div class="text-center max-w-md mx-auto space-y-8">
        <!-- 404 数字 -->
        <div ref="notFoundRef" class="relative">
          <h1 class="text-8xl md:text-9xl font-bold text-primary/20 dark:text-primary/30 select-none">
            404
          </h1>
          <div class="absolute inset-0 text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <!-- 添加发光效果 -->
          <div class="absolute inset-0 text-8xl md:text-9xl font-bold text-primary/10 dark:text-primary/20 blur-sm scale-110">
            404
          </div>
        </div>

        <!-- 标题 -->
        <div ref="titleRef" class="space-y-2">
          <h2 class="text-2xl md:text-3xl font-semibold text-foreground">
            页面走丢了
          </h2>
          <div class="flex items-center justify-center gap-2 text-muted-foreground">
            <component :is="isConnected ? Wifi : WifiOff" class="w-4 h-4" />
            <span class="text-sm">
              {{ isConnected ? '网络连接正常' : '网络连接异常' }}
            </span>
          </div>
        </div>

        <!-- 描述 -->
        <p ref="descriptionRef" class="text-muted-foreground leading-relaxed">
          抱歉，您访问的页面不存在或已被移动。<br>
          让我们帮您回到正轨吧！
        </p>

        <!-- 操作按钮 -->
        <div ref="buttonsRef" class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
              @click="goHome"
              class="gap-2 min-w-[120px]"
              size="lg"
          >
            <Home class="w-4 h-4" />
            返回首页
          </Button>

          <Button
              @click="goBack"
              variant="outline"
              class="gap-2 min-w-[120px]"
              size="lg"
          >
            <ArrowLeft class="w-4 h-4" />
            返回上页
          </Button>

          <Button
              @click="openSearch"
              variant="ghost"
              class="gap-2 min-w-[120px]"
              size="lg"
          >
            <Search class="w-4 h-4" />
            搜索内容
          </Button>
        </div>

        <!-- 提示信息 -->
        <div class="text-xs text-muted-foreground/70 space-y-1">
          <p>如果问题持续出现，请检查URL是否正确</p>
          <p>或联系我们获得帮助</p>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2 opacity-50"></div>
  </div>
</template>

<style scoped>
/* 自定义动画类 */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 确保渐变文字在各种主题下都显示正确 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}
</style>
