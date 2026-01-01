<script setup lang="ts">
import { ref } from "vue";
import { usePdfMerge } from "@/composables/usePdfMerge";

interface FileItem {
  id: string;
  file: File;
}

const { mergePdfs } = usePdfMerge();

const fileItems = ref<FileItem[]>([]);
const outputFilename = ref("merged.pdf");
const isUploading = ref(false);
const isDragging = ref(false);
const draggedItemIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const downloadUrl = ref<string | null>(null);
const validExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".heic", ".heif"];

const onDragStart = (event: DragEvent, index: number) => {
  draggedItemIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
  }
};

const onDragEnd = () => {
  draggedItemIndex.value = null;
  dragOverIndex.value = null;
};

const onDragOverItem = (index: number) => {
  if (draggedItemIndex.value !== null && draggedItemIndex.value !== index) {
    dragOverIndex.value = index;
  }

  if (draggedItemIndex.value === index) {
    dragOverIndex.value = null;
  }
};

const onDropReorder = (index: number) => {
  dragOverIndex.value = null;
  if (draggedItemIndex.value !== null) {
    const draggedIndex = draggedItemIndex.value;
    const item = fileItems.value[draggedIndex]!;
    fileItems.value.splice(draggedIndex, 1);
    fileItems.value.splice(index, 0, item);
    draggedItemIndex.value = null;
  }
};

const handleFiles = (fileList: FileList) => {
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const fileName = file!.name.toLowerCase();
    if (validExtensions.some((ext) => fileName.endsWith(ext))) {
      fileItems.value.push({
        id: Math.random().toString(36).substring(7),
        file: file!,
      });
    }
  }
};

const onDragOver = (_e: DragEvent) => {
  if (draggedItemIndex.value === null) {
    isDragging.value = true;
  }
};

const onDragLeave = (_e: DragEvent) => {
  isDragging.value = false;
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (draggedItemIndex.value === null && e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files);
  }
};

const removeFile = (index: number) => {
  fileItems.value.splice(index, 1);
};

const moveUp = (index: number) => {
  if (index > 0) {
    const temp = fileItems.value[index]!;
    fileItems.value[index] = fileItems.value[index - 1]!;
    fileItems.value[index - 1] = temp;
  }
};

const moveDown = (index: number) => {
  if (index < fileItems.value.length - 1) {
    const temp = fileItems.value[index]!;
    fileItems.value[index] = fileItems.value[index + 1]!;
    fileItems.value[index + 1] = temp;
  }
};

const clearFiles = () => {
  fileItems.value = [];
  outputFilename.value = "merged.pdf";
};

const merge_files = async () => {
  if (fileItems.value.length === 0) return;

  isUploading.value = true;

  const files = fileItems.value.map((item) => item.file);

  // Ensure filename ends with .pdf
  let filename = outputFilename.value;
  if (!filename.toLowerCase().endsWith(".pdf")) {
    filename += ".pdf";
  }

  mergePdfs(files)
    .then((response) => {
      if (downloadUrl.value) {
        window.URL.revokeObjectURL(downloadUrl.value);
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      downloadUrl.value = url;
    })
    .catch((error) => {
      console.error("Error merging PDFs:", error);
      alert(`An error occurred while merging PDFs. ${error.message}`);
    })
    .finally(() => {
      isUploading.value = false;
    });
};

const validExtensionsString = () => {
  const upperExtensions = validExtensions.map((ext) =>
    ext.toUpperCase().replace(".", "")
  );
  return upperExtensions.join(", ");
};
</script>

<template>
  <div class="h-full bg-[#2e3440] text-[#d8dee9] p-8 font-['MakoP']">
    <div
      class="max-w-4xl max-h-full mx-auto bg-[#3b4252] rounded-lg shadow-xl p-6 flex flex-col"
    >
      <h1 class="text-3xl font-bold text-[#88c0d0] mb-6 tracking-wide">
        PDF Merger
      </h1>

      <!-- File Upload -->
      <div v-if="fileItems.length === 0" class="mb-6">
        <div class="flex items-center justify-center w-full">
          <div
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
            :class="[
              'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors border-[#4c566a] hover:border-[#88c0d0]',
              isDragging ? 'border-[#88c0d0] bg-[#4c566a]' : 'bg-[#434c5e]',
            ]"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                class="w-8 h-8 mb-4 text-[#88c0d0]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p class="mb-2 text-sm text-[#d8dee9]">
                <span class="font-semibold">Drag and drop</span> files here
              </p>
              <p class="text-xs text-[#d8dee9] opacity-70">
                {{ validExtensionsString() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- File List -->
      <div
        v-else
        class="mb-6 border-2 border-transparent rounded-lg transition-colors flex-1 min-h-0 flex flex-col"
        :class="{ 'border-[#88c0d0] bg-[#4c566a] bg-opacity-20': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <h2 class="text-xl font-semibold text-[#88c0d0] mb-3 px-2">
          Selected Files ({{ fileItems.length }})
        </h2>
        <ul class="space-y-0.5 overflow-y-auto pr-2 py-1 px-2 flex-1">
          <li
            v-for="(file, index) in fileItems"
            :key="file.id"
            @dragover.prevent="onDragOverItem(index)"
            @drop="onDropReorder(index)"
            class="relative flex items-center justify-between bg-[#434c5e] px-3 rounded border border-[#4c566a] transition-all duration-200"
            :class="{ 'opacity-50': draggedItemIndex === index }"
          >
            <div
              v-if="
                draggedItemIndex !== null &&
                dragOverIndex === index &&
                draggedItemIndex !== index
              "
              class="absolute left-0 right-0 h-1 bg-[#88c0d0] rounded-full pointer-events-none z-10"
              :class="draggedItemIndex > index ? '-top-1' : '-bottom-1'"
            ></div>

            <!-- Drag Handle -->
            <div
              class="mr-3 cursor-move text-[#d8dee9] hover:text-[#88c0d0] transition-colors"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragend="onDragEnd"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>

            <div class="flex items-center truncate flex-1 mr-4">
              <span class="text-[#88c0d0] text-sm font-mono mr-3"
                >{{ index + 1 }}.</span
              >
              <span class="truncate text-sm">{{ file.file.name }}</span>
              <span class="ml-2 text-xs text-[#d8dee9] opacity-60"
                >({{ (file.file.size / 1024 / 1024).toFixed(2) }} MB)</span
              >
            </div>
            <div class="flex space-x-2">
              <button
                @click="moveUp(index)"
                :disabled="index === 0"
                class="p-1.5 rounded hover:bg-[#4c566a] text-[#d8dee9] hover:text-[#88c0d0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                @click="moveDown(index)"
                :disabled="index === fileItems.length - 1"
                class="p-1.5 rounded hover:bg-[#4c566a] text-[#d8dee9] hover:text-[#88c0d0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <button
                @click="removeFile(index)"
                class="p-1.5 rounded hover:bg-[#4c566a] text-[#bf616a] hover:text-[#d08770] transition-colors"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div class="flex gap-6">
        <!-- Controls -->
        <div
          class="flex-1 flex flex-col md:flex-row gap-6 bg-[#434c5e] p-4 rounded-lg border border-[#4c566a]"
        >
          <div class="flex-1">
            <label class="block text-sm font-medium text-[#d8dee9] mb-2">
              Output Filename
            </label>
            <input
              v-model="outputFilename"
              type="text"
              class="w-full bg-[#3b4252] border border-[#4c566a] rounded px-3 py-2 text-[#d8dee9] focus:outline-none focus:border-[#88c0d0] transition-colors"
              placeholder="merged.pdf"
            />
          </div>

          <div class="flex-1 flex items-end space-x-4">
            <button
              @click="merge_files"
              :disabled="fileItems.length === 0 || isUploading"
              class="flex-1 bg-[#a3be8c] text-[#2e3440] font-bold py-2 px-4 rounded hover:bg-[#b1d196] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
            >
              <span v-if="isUploading" class="mr-2">
                <svg
                  class="animate-spin h-5 w-5 text-[#2e3440]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{ isUploading ? "Merging..." : "Merge Files" }}
            </button>

            <button
              @click="clearFiles"
              :disabled="fileItems.length === 0"
              class="bg-[#bf616a] text-[#2e3440] font-bold py-2 px-4 rounded hover:bg-[#d08770] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <!-- Output File -->
        <div
          v-if="downloadUrl"
          class="flex flex-col items-center justify-center bg-[#434c5e] p-4 rounded-lg border border-[#4c566a] aspect-square"
        >
          <label class="block text-sm font-medium text-[#d8dee9] mb-2"
            >Output file</label
          >
          <a
            :href="downloadUrl"
            :download="outputFilename"
            class="h-[42px] w-[42px] flex items-center justify-center rounded text-[#88c0d0] hover:bg-[#88c0d0] hover:text-[#2e3440] transition-colors"
            title="Download Merged PDF"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
