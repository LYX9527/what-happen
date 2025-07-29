import { ref, onMounted, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  // 检查本地存储或系统偏好
  const getInitialMode = (): boolean => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      return stored === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 应用主题
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
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

  // 初始化
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