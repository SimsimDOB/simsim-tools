<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <div class="h-screen flex flex-col bg-[#2e3440] overflow-hidden">
    <Navbar />
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>

<style scoped></style>
