<script setup lang="ts">
import { onMounted, ref } from "vue";

const isOnline = ref(false);

onMounted(() => {
  const checkPing = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:10827/api";
    fetch(`${apiUrl}/ping`, { mode: "no-cors" })
      .then(() => {
        console.log("Ping successful");
        isOnline.value = true;
      })
      .catch(() => {
        console.log("Ping failed");
        isOnline.value = false;
      });
  };

  checkPing();
  setInterval(checkPing, 30000); // Check every 30 seconds
});
</script>

<template>
  <div class="flex items-center">
    <button
      rounded
      class="hover:bg-[#81b4c2] text-[#2e3440] font-semibold p-2 rounded-full transition-colors duration-200 leading-none flex items-center justify-center"
    >
      <span v-if="isOnline" class="material-symbols-outlined text-[#a3be8c]">
        android_cell_4_bar
      </span>
      <span v-else class="material-symbols-outlined text-[#ef4444]">
        android_cell_4_bar_off
      </span>
    </button>
  </div>
</template>
