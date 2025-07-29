<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar.vue";
import Dashboard from "@/pages/dashboard/index.vue";
</script>

<template>
  <Dashboard></Dashboard>
<!--  <SidebarProvider>-->
<!--    <AppSidebar />-->
<!--    <main>-->
<!--      <SidebarTrigger />-->
<!--      <slot />-->
<!--    </main>-->
<!--  </SidebarProvider>-->
</template>
