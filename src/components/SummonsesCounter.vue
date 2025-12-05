<script setup lang="ts">
import { ref } from "vue";

interface PdfFile {
  name: string;
  count: number | null;
  deleted: boolean;
}

const files = ref<PdfFile[]>([]);
const totalSummonses = ref(0);

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files) {
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const file = event.dataTransfer.files[i];
      if (
        file!.type === "application/pdf" ||
        file!.name.toLowerCase().endsWith(".pdf")
      ) {
        files.value.push({
          name: file!.name,
          count: null,
          deleted: false,
        });
      }
    }
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const countSummonses = () => {
  // Placeholder logic for counting summonses
  // In a real web app, this would likely involve parsing the PDF in the browser (e.g. pdf.js) or sending it to a backend.
  // For now, we'll just simulate a count.
  let total = 0;
  files.value.forEach((file) => {
    if (!file.deleted) {
      // Mock count for demonstration
      const mockCount = Math.floor(Math.random() * 10) + 1;
      file.count = mockCount;
      total += mockCount;
    }
  });
  totalSummonses.value = total;
};

const resetSummonses = () => {
  files.value = [];
  totalSummonses.value = 0;
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
  // Recalculate total if needed, or just let the next count update it.
  // If we want live update:
  // totalSummonses.value = files.value.reduce((acc, curr) => acc + (curr.count || 0), 0)
};
</script>

<template>
  <div
    class="bg-[#2e3440] text-[#d8dee9] font-['MakoP'] text-sm flex flex-col h-full min-h-[600px] w-full max-w-[800px] mx-auto p-5 box-border"
  >
    <div class="text-center mb-5">
      <h1 class="text-[28px] font-bold text-[#88c0d0] m-0">
        Sim Summonses Counter
      </h1>
    </div>

    <div class="flex-1 flex flex-col mb-5">
      <div
        class="flex-1 bg-[#3b4252] border border-[#4c566a] rounded-[5px] overflow-auto min-h-[300px]"
        @drop="onDrop"
        @dragover="onDragOver"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th
                class="bg-[#4c566a] p-1.5 text-[#eceff4] font-bold text-left sticky top-0 w-auto"
              >
                File
              </th>
              <th
                class="bg-[#4c566a] p-1.5 text-[#eceff4] font-bold text-left sticky top-0 w-[75px] text-center"
              >
                Count
              </th>
              <th
                class="bg-[#4c566a] p-1.5 text-[#eceff4] font-bold text-left sticky top-0 w-[75px] text-center"
              >
                Deleted
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="files.length === 0">
              <td
                colspan="3"
                class="text-center p-5 text-[#6fa0b0] p-1.5 border-b border-[#4c566a]"
              >
                Drag and drop PDF files here
              </td>
            </tr>
            <tr v-for="(file, index) in files" :key="index">
              <td class="p-1.5 border-b border-[#4c566a]">{{ file.name }}</td>
              <td class="text-center p-1.5 border-b border-[#4c566a]">
                {{ file.count !== null ? file.count : "-" }}
              </td>
              <td class="text-center p-1.5 border-b border-[#4c566a]">
                <button
                  class="bg-transparent text-[#bf616a] px-1.5 py-0.5 hover:bg-[#4c566a] border-none rounded-md font-bold cursor-pointer font-['MakoP'] text-sm"
                  @click="removeFile(index)"
                >
                  X
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col gap-[15px]">
      <div class="flex justify-center gap-[10px]">
        <button
          class="bg-[#88c0d0] border-none rounded-md px-3 py-2 text-[#2e3440] font-bold cursor-pointer font-['MakoP'] text-sm hover:bg-[#81a1c1] active:bg-[#5e81ac]"
          @click="countSummonses"
        >
          Count
        </button>
        <button
          class="bg-[#88c0d0] border-none rounded-md px-3 py-2 text-[#2e3440] font-bold cursor-pointer font-['MakoP'] text-sm hover:bg-[#81a1c1] active:bg-[#5e81ac]"
          @click="resetSummonses"
        >
          Reset
        </button>
      </div>
      <div class="text-center text-2xl font-bold text-[#88c0d0]">
        Total Summonses: {{ totalSummonses }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "MakoP";
  src: url("/fonts/MakoP.ttf") format("truetype");
}
</style>
