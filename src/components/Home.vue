<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const tools = [
  {
    name: "Summonses Counter",
    path: "/summonses-counter",
    icon: "/summonses_counter.png",
  },
];

const navigateTo = (path: string) => {
  router.push(path);
};

const getIconPath = (iconPath: string) => {
  // Remove leading slash if present to avoid double slashes with BASE_URL
  const cleanPath = iconPath.startsWith("/") ? iconPath.slice(1) : iconPath;
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};
</script>

<template>
  <div class="min-h-full bg-[#2e3440] p-8 flex items-center justify-center">
    <div class="flex flex-wrap justify-center gap-6 max-w-7xl w-full">
      <div
        v-for="tool in tools"
        :key="tool.name"
        class="w-96 aspect-video border-2 border-[#4c566a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#88c0d0] transition-colors group bg-[#3b4252]"
        @click="navigateTo(tool.path)"
      >
        <div
          class="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg"
        >
          <img
            :src="getIconPath(tool.icon)"
            class="w-16 h-16 object-contain opacity-80"
            alt=""
          />
        </div>
        <span
          class="text-[#d8dee9] text-xl font-medium group-hover:text-[#88c0d0] tracking-wide"
          >{{ tool.name }}</span
        >
      </div>
    </div>
  </div>
</template>
