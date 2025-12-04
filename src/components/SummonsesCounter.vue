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
  <div class="app-container">
    <div class="header">
      <h1 class="title">Sim Summonses Counter</h1>
    </div>

    <div class="main-content">
      <div class="pdf-table-container" @drop="onDrop" @dragover="onDragOver">
        <table class="pdf-table">
          <thead>
            <tr>
              <th class="col-file">File</th>
              <th class="col-count">Count</th>
              <th class="col-deleted">Deleted</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="files.length === 0">
              <td colspan="3" class="empty-message">
                Drag and drop PDF files here
              </td>
            </tr>
            <tr v-for="(file, index) in files" :key="index">
              <td>{{ file.name }}</td>
              <td class="text-center">
                {{ file.count !== null ? file.count : "-" }}
              </td>
              <td class="text-center">
                <button class="delete-btn" @click="removeFile(index)">X</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="bottom-layout">
      <div class="buttons">
        <button @click="countSummonses">Count</button>
        <button @click="resetSummonses">Reset</button>
      </div>
      <div class="count-label">Total Summonses: {{ totalSummonses }}</div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "MakoP";
  src: url("/fonts/MakoP.ttf") format("truetype");
}

.app-container {
  background-color: #2e3440;
  color: #d8dee9;
  font-family: "MakoP", sans-serif;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px; /* Match python app height roughly */
  width: 100%;
  max-width: 800px; /* Match python app width */
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #88c0d0;
  margin: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.pdf-table-container {
  flex: 1;
  background-color: #3b4252;
  border: 1px solid #4c566a;
  border-radius: 5px;
  overflow: auto;
  min-height: 300px;
}

.pdf-table {
  width: 100%;
  border-collapse: collapse;
}

.pdf-table th {
  background-color: #4c566a;
  padding: 6px;
  color: #eceff4;
  font-weight: bold;
  text-align: left;
  position: sticky;
  top: 0;
}

.pdf-table td {
  padding: 6px;
  border-bottom: 1px solid #4c566a;
}

.col-file {
  width: auto;
}

.col-count {
  width: 75px;
  text-align: center;
}

.col-deleted {
  width: 75px;
  text-align: center;
}

.text-center {
  text-align: center;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #6fa0b0;
}

.bottom-layout {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

button {
  background-color: #88c0d0;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: #2e3440;
  font-weight: bold;
  cursor: pointer;
  font-family: "MakoP", sans-serif;
  font-size: 14px;
}

button:hover {
  background-color: #81a1c1;
}

button:active {
  background-color: #5e81ac;
}

.delete-btn {
  background-color: transparent;
  color: #bf616a;
  padding: 2px 6px;
}
.delete-btn:hover {
  background-color: #4c566a;
}

.count-label {
  text-align: center;
  font-size: 24px; /* Slightly smaller than 48px to fit better in web context, but can be adjusted */
  font-weight: bold;
  color: #88c0d0;
}
</style>
