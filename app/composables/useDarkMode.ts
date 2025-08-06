import { ref, onMounted, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  // 检查本地存储或系统偏好 - SSR兼容版本
  const getInitialMode = (): boolean => {
    // 在服务端渲染时，默认返回false (浅色模式)
    if (process.server) {
      return false
    }
    
    try {
      const stored = localStorage.getItem('theme')
      if (stored) {
        return stored === 'dark'
      }
      // 检查系统偏好
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    } catch (error) {
      console.warn('获取主题偏好失败:', error)
    }
    
    return false
  }

  // 应用主题 - SSR兼容版本
  const applyTheme = (dark: boolean) => {
    // 只在客户端执行DOM操作
    if (process.client) {
      try {
        if (dark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light')
      } catch (error) {
        console.warn('应用主题失败:', error)
      }
    }
  }

  // 切换主题
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  // 设置主题
  const setDarkMode = (dark: boolean) => {
    isDark.value = dark
  }

  // 监听主题变化
  watch(isDark, applyTheme, { immediate: false })

  // 初始化 - 只在客户端执行
  onMounted(() => {
    isDark.value = getInitialMode()
    applyTheme(isDark.value)
  })

  return {
    isDark,
    toggleDarkMode,
    setDarkMode
  }
} 