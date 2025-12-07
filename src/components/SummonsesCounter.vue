<script setup lang="ts">
import { ref } from "vue";
import { useSummonsesCount } from "@/composables/useSummonsesCount";

interface FileRecord {
  file: File;
  count: number;
  removed_count: number;
  removed_pages: string;
}

const { countSummonses } = useSummonsesCount();

const isLoading = ref(false);
const fileRecords = ref<FileRecord[]>([]);
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
        fileRecords.value.push({
          file: file!,
          count: 0,
          removed_count: 0,
          removed_pages: "",
        });
      }
    }
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleCountSummonses = () => {
  if (fileRecords.value.length === 0) return;

  isLoading.value = true;

  const files = fileRecords.value.map((record) => record.file);

  countSummonses(files)
    .then((response) => {
      totalSummonses.value = response.total_count;
      console.log(response);

      response.details.forEach((detail: any) => {
        const file = fileRecords.value.find(
          (f) => f.file.name === detail.filename
        );
        if (file) {
          file.count = detail.count;
          file.removed_count = detail.removed_count;
          file.removed_pages = detail.removed_pages;
        }
      });
    })
    .catch((error) => {
      console.error("Error counting summonses:", error);
      alert("An error occurred while counting summonses.");
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const handleResetSummonses = () => {
  fileRecords.value = [];
  totalSummonses.value = 0;
};

const removeFile = (index: number) => {
  fileRecords.value.splice(index, 1);
};
</script>

<template>
  <div
    class="min-h-screen bg-[#2e3440] text-[#d8dee9] font-['MakoP'] flex items-center justify-center p-8"
  >
    <div class="w-full max-w-4xl flex flex-col gap-6">
      <!-- Header -->
      <header class="text-center">
        <h1 class="text-3xl font-bold text-[#88c0d0] tracking-wide">
          Sim Summonses Counter
        </h1>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col gap-4">
        <!-- Drop Zone / Table Container -->
        <div
          class="bg-[#3b4252] border-2 border-[#4c566a] border-dashed rounded-lg overflow-hidden min-h-[400px] flex flex-col relative transition-colors duration-200 hover:border-[#88c0d0]"
          @drop="onDrop"
          @dragover="onDragOver"
        >
          <!-- Empty State -->
          <div
            v-if="fileRecords.length === 0"
            class="absolute inset-0 flex flex-col items-center justify-center text-[#eceff4] pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 mb-4 text-[#4c566a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="text-lg font-medium">Drag and drop PDF files here</p>
          </div>

          <!-- Table -->
          <div v-else class="flex-1 overflow-auto custom-scrollbar">
            <table class="w-full border-collapse text-left">
              <thead class="sticky top-0 z-10">
                <tr class="bg-[#4c566a] text-[#eceff4]">
                  <th class="p-3 font-bold w-full">File Name</th>
                  <th class="p-3 font-bold text-center w-24">Count</th>
                  <th class="p-3 font-bold text-center w-24">Removed</th>
                  <th class="p-3 font-bold text-center w-32">Removed Pages</th>
                  <th class="p-3 font-bold text-center w-16"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#4c566a]">
                <tr
                  v-for="(fileRecord, index) in fileRecords"
                  :key="index"
                  class="hover:bg-[#434c5e] transition-colors"
                >
                  <td
                    class="p-3 truncate max-w-xs"
                    :title="fileRecord.file.name"
                  >
                    {{ fileRecord.file.name }}
                  </td>
                  <td
                    class="p-3 text-center font-mono text-[#88c0d0] font-bold"
                  >
                    {{ fileRecord.count || "-" }}
                  </td>
                  <td
                    class="p-3 text-center font-mono text-[#bf616a] font-bold"
                  >
                    {{ fileRecord.removed_count || "-" }}
                  </td>
                  <td
                    class="p-3 text-center font-mono text-[#d08770] font-bold break-all"
                  >
                    {{
                      fileRecord.removed_pages ? fileRecord.removed_pages : "-"
                    }}
                  </td>
                  <td class="p-3 text-center">
                    <button
                      class="text-[#bf616a] hover:text-[#d08770] hover:bg-[#2e3440] p-1.5 rounded transition-colors"
                      @click="removeFile(index)"
                      title="Remove file"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex flex-col items-center gap-6 mt-2">
          <div class="flex gap-4">
            <button
              class="bg-[#88c0d0] text-[#2e3440] font-bold py-2 px-6 rounded-md shadow-md hover:bg-[#81a1c1] active:bg-[#5e81ac] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleCountSummonses"
              :disabled="isLoading || fileRecords.length === 0"
            >
              {{ isLoading ? "Counting..." : "Count Summonses" }}
            </button>
            <button
              class="bg-[#4c566a] text-[#eceff4] font-bold py-2 px-6 rounded-md shadow-md hover:bg-[#434c5e] active:bg-[#3b4252] transition-colors"
              @click="handleResetSummonses"
            >
              Reset
            </button>
          </div>

          <div class="text-center">
            <p
              class="text-[#88c0d0] text-lg font-medium uppercase tracking-wider mb-1"
            >
              Total Summonses
            </p>
            <p class="text-5xl font-bold text-[#eceff4]">
              {{ totalSummonses }}
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "MakoP";
  src: url("/fonts/MakoP.ttf") format("truetype");
}

/* Custom Scrollbar for Webkit */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #2e3440;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #88c0d0;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #81a1c1;
}
</style>
