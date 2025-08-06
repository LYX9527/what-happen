<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleDarkMode"
    class="relative"
  >
    <Sun 
      :class="[
        'h-4 w-4 rotate-0 scale-100 transition-all',
        isDark && '-rotate-90 scale-0'
      ]"
    />
    <Moon 
      :class="[
        'absolute h-4 w-4 rotate-90 scale-0 transition-all',
        isDark && 'rotate-0 scale-100'
      ]"
    />
    <span class="sr-only">切换主题</span>
  </Button>
</template> 