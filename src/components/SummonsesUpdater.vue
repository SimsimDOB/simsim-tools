<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import {
  errorMessage,
  isNotFound,
  useSummonsesUpdater,
  type JobSnapshot,
  type LogEntry,
  type LogKind,
} from "@/composables/useSummonsesUpdater";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const POLL_MS = 1000;

const { start, poll, cancel, download } = useSummonsesUpdater();

type Phase = "idle" | "running" | "finished";

const phase = ref<Phase>("idle");
const file = ref<File | null>(null);
const isDragging = ref(false);
const isStarting = ref(false);
const startError = ref<string | null>(null);
const jobId = ref<string | null>(null);
const totalRows = ref(0);
const filename = ref("");
const snapshot = ref<JobSnapshot | null>(null);
const logEntries = ref<LogEntry[]>([]);
const nextCursor = ref(0);
const showFullLog = ref(false);
const downloadUrl = ref<string | null>(null);
const elapsedSeconds = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);
const logPanel = ref<HTMLElement | null>(null);

let timer: ReturnType<typeof setInterval> | null = null;
let polling = false;

const stopTimer = () => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
};

const revokeDownload = () => {
  if (downloadUrl.value?.startsWith("blob:")) {
    URL.revokeObjectURL(downloadUrl.value);
  }
  downloadUrl.value = null;
};

const clear = () => {
  stopTimer();
  revokeDownload();
  phase.value = "idle";
  file.value = null;
  jobId.value = null;
  totalRows.value = 0;
  filename.value = "";
  snapshot.value = null;
  logEntries.value = [];
  nextCursor.value = 0;
  showFullLog.value = false;
  elapsedSeconds.value = 0;
  if (fileInput.value) fileInput.value.value = "";
};

onUnmounted(() => {
  stopTimer();
  revokeDownload();
});

// --- file selection -------------------------------------------------------

const acceptFile = (candidate: File | undefined) => {
  if (!candidate) return;
  if (!candidate.name.toLowerCase().endsWith(".xlsx")) return;
  file.value = candidate;
  startError.value = null;
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  acceptFile(e.dataTransfer?.files?.[0]);
};

const onFileInput = (e: Event) => {
  acceptFile((e.target as HTMLInputElement).files?.[0]);
};

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

// --- job lifecycle --------------------------------------------------------

const tick = async () => {
  elapsedSeconds.value += 1;
  if (polling || !jobId.value) return;
  polling = true;
  try {
    const snap = await poll(jobId.value, nextCursor.value);
    if (snap.log.length > 0) {
      logEntries.value.push(...snap.log);
    }
    nextCursor.value = snap.next;
    snapshot.value = snap;
    if (snap.status !== "running") {
      stopTimer();
      if (snap.status === "done" || snap.status === "cancelled") {
        const blob = await download(jobId.value);
        revokeDownload();
        downloadUrl.value = URL.createObjectURL(
          new Blob([blob], { type: XLSX_MIME }),
        );
      }
      phase.value = "finished";
    }
  } catch (error) {
    if (isNotFound(error)) {
      clear();
      startError.value = "The server restarted mid-run — please upload again";
    } else {
      console.error("Summonses updater poll failed:", error);
    }
  } finally {
    polling = false;
  }
};

const startJob = async () => {
  if (!file.value || isStarting.value) return;
  isStarting.value = true;
  startError.value = null;
  try {
    const response = await start(file.value);
    jobId.value = response.job_id;
    totalRows.value = response.total_rows;
    filename.value = response.filename;
    logEntries.value = [];
    nextCursor.value = 0;
    snapshot.value = null;
    elapsedSeconds.value = 0;
    phase.value = "running";
    stopTimer();
    timer = setInterval(tick, POLL_MS);
  } catch (error) {
    startError.value = errorMessage(error);
  } finally {
    isStarting.value = false;
  }
};

const cancelJob = async () => {
  if (!jobId.value) return;
  try {
    await cancel(jobId.value);
  } catch (error) {
    console.error("Summonses updater cancel failed:", error);
  }
};

// --- derived view state ---------------------------------------------------

const currentRow = computed(() => snapshot.value?.current_row ?? 1);
const rowTotal = computed(() => snapshot.value?.total_rows ?? totalRows.value);
const progress = computed(() =>
  rowTotal.value > 0 ? Math.min(currentRow.value / rowTotal.value, 1) : 0,
);
const elapsedText = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60);
  const s = elapsedSeconds.value % 60;
  return `${m} min ${s} s`;
});
const counts = computed(
  () =>
    snapshot.value?.counts ?? {
      looked_up: 0,
      changed: 0,
      no_record: 0,
      skipped: 0,
      errors: 0,
    },
);
const tiles = computed(() => [
  { label: "Looked up", value: counts.value.looked_up },
  { label: "Changed", value: counts.value.changed },
  { label: "No record", value: counts.value.no_record },
  { label: "Skipped", value: counts.value.skipped },
  { label: "Errors", value: counts.value.errors },
]);
const changes = computed(() => snapshot.value?.changes ?? []);
const problems = computed(() => snapshot.value?.problems ?? []);
const finishedStatus = computed(() => snapshot.value?.status ?? "done");
const failureText = computed(() => snapshot.value?.error ?? "The job failed");

const logClass = (kind: LogKind) => {
  switch (kind) {
    case "skipped":
    case "bad_date":
    case "invalid":
      return "opacity-45";
    case "changed":
      return "text-[#a3be8c]";
    case "no_record":
      return "text-[#ebcb8b]";
    case "error":
      return "text-[#bf616a]";
    default:
      return "";
  }
};

watch(
  () => logEntries.value.length,
  async () => {
    await nextTick();
    const el = logPanel.value;
    if (el) el.scrollTop = el.scrollHeight;
  },
);

const onDownloadDragStart = (event: DragEvent) => {
  if (event.dataTransfer && downloadUrl.value) {
    event.dataTransfer.setData(
      "DownloadURL",
      `${XLSX_MIME}:${filename.value}:${downloadUrl.value}`,
    );
    event.dataTransfer.effectAllowed = "copy";
  }
};
</script>

<template>
  <div class="h-full bg-[#2e3440] text-[#d8dee9] p-8 font-['MakoP']">
    <div
      class="max-w-4xl max-h-full mx-auto bg-[#3b4252] rounded-lg shadow-xl p-6 flex flex-col"
    >
      <h1 class="text-3xl font-bold text-[#88c0d0] mb-6 tracking-wide">
        Summonses Updater
      </h1>

      <!-- Idle -->
      <template v-if="phase === 'idle'">
        <div class="mb-6">
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInput?.click()"
            :class="[
              'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors border-[#4c566a] hover:border-[#88c0d0] cursor-pointer',
              isDragging ? 'border-[#88c0d0] bg-[#4c566a]' : 'bg-[#434c5e]',
            ]"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <i class="pi pi-cloud-upload text-4xl text-[#88c0d0] mb-2"></i>
              <p class="mb-2 text-sm text-[#d8dee9]">
                <span class="font-semibold">Drag and drop</span> the AVPS
                workbook here, or click to choose
              </p>
              <p class="text-xs text-[#d8dee9] opacity-70">XLSX</p>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx"
            class="hidden"
            @change="onFileInput"
          />
          <p v-if="startError" class="mt-3 text-sm text-[#bf616a]">
            {{ startError }}
          </p>
        </div>

        <div
          v-if="file"
          class="mb-6 flex items-center justify-between bg-[#434c5e] px-3 py-2 rounded border border-[#4c566a]"
        >
          <div class="flex items-center truncate flex-1 mr-4">
            <i class="pi pi-file-excel text-[#a3be8c] mr-3"></i>
            <span class="truncate text-sm">{{ file.name }}</span>
            <span class="ml-2 text-xs text-[#d8dee9] opacity-60"
              >({{ formatSize(file.size) }})</span
            >
          </div>
          <button
            @click="file = null"
            class="p-1.5 rounded hover:bg-[#2e3440] text-[#bf616a] hover:text-[#d08770] transition-colors leading-none"
            title="Remove"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div
          class="flex flex-col md:flex-row md:items-center gap-4 bg-[#434c5e] p-4 rounded-lg border border-[#4c566a]"
        >
          <p class="flex-1 text-sm text-[#d8dee9] opacity-80">
            Looks up every summons on the NYC ECB ticket finder and fills in
            <em>Results of Hearing</em> (column Q). Takes a few minutes.
          </p>
          <button
            @click="startJob"
            :disabled="!file || isStarting"
            class="bg-[#a3be8c] text-[#2e3440] font-bold py-2 px-6 rounded hover:bg-[#b1d196] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
          >
            <i v-if="isStarting" class="pi pi-spin pi-spinner mr-2"></i>
            {{ isStarting ? "Uploading..." : "Start" }}
          </button>
        </div>
      </template>

      <!-- Running -->
      <template v-else-if="phase === 'running'">
        <div class="mb-2 flex items-center justify-between text-sm">
          <span>
            Row <span class="font-mono">{{ currentRow }}</span> of
            <span class="font-mono">{{ rowTotal }}</span>
            <span class="opacity-60"> · {{ elapsedText }} elapsed</span>
          </span>
          <span class="truncate ml-4 text-xs opacity-60">{{ filename }}</span>
        </div>
        <div class="w-full h-2 bg-[#2e3440] rounded mb-6 overflow-hidden">
          <div
            class="h-full bg-[#88c0d0] transition-[width] duration-500"
            :style="{ width: `${progress * 100}%` }"
          ></div>
        </div>

        <div class="grid grid-cols-5 gap-3 mb-6">
          <div
            v-for="tile in tiles"
            :key="tile.label"
            class="bg-[#434c5e] rounded-lg border border-[#4c566a] p-3 text-center"
          >
            <div class="text-2xl font-bold font-mono text-[#88c0d0]">
              {{ tile.value }}
            </div>
            <div class="text-xs opacity-70">{{ tile.label }}</div>
          </div>
        </div>

        <div
          ref="logPanel"
          class="bg-[#2e3440] rounded-lg border border-[#4c566a] p-3 font-mono text-xs text-left max-h-64 overflow-y-auto custom-scrollbar mb-6"
        >
          <div v-if="logEntries.length === 0" class="opacity-50">
            Starting…
          </div>
          <div
            v-for="entry in logEntries"
            :key="entry.i"
            :class="logClass(entry.kind)"
          >
            B{{ entry.row }} · {{ entry.number }} · {{ entry.text }}
          </div>
        </div>

        <div class="flex justify-end">
          <button
            @click="cancelJob"
            class="bg-[#bf616a] text-[#2e3440] font-bold py-2 px-6 rounded hover:bg-[#d08770] cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </template>

      <!-- Finished -->
      <template v-else>
        <div class="mb-6 text-lg">
          <span v-if="finishedStatus === 'done'" class="text-[#a3be8c]">
            Done · {{ rowTotal }} rows in {{ elapsedText }}
          </span>
          <span v-else-if="finishedStatus === 'cancelled'" class="text-[#ebcb8b]">
            Cancelled at row {{ currentRow }}
          </span>
          <span v-else class="text-[#bf616a]">Failed</span>
          <span class="ml-3 text-xs opacity-60">{{ filename }}</span>
        </div>

        <div class="grid grid-cols-5 gap-3 mb-6">
          <div
            v-for="tile in tiles"
            :key="tile.label"
            class="bg-[#434c5e] rounded-lg border border-[#4c566a] p-3 text-center"
          >
            <div class="text-2xl font-bold font-mono text-[#88c0d0]">
              {{ tile.value }}
            </div>
            <div class="text-xs opacity-70">{{ tile.label }}</div>
          </div>
        </div>

        <div
          v-if="problems.length > 0"
          class="mb-6 border-l-4 border-[#ebcb8b] bg-[#4c566a] rounded-r-lg p-3 text-sm text-left"
        >
          <div class="font-semibold text-[#ebcb8b] mb-1">
            {{ problems.length }} row{{ problems.length === 1 ? "" : "s" }} could
            not be checked
          </div>
          <ul class="font-mono text-xs space-y-0.5">
            <li v-for="p in problems" :key="p.row">B{{ p.row }}: {{ p.reason }}</li>
          </ul>
        </div>

        <div class="flex gap-5 mb-6">
          <div
            class="flex-1 flex items-center bg-[#434c5e] p-4 rounded-lg border border-[#4c566a] text-left"
          >
            <p v-if="finishedStatus === 'failed'" class="text-sm text-[#bf616a]">
              {{ failureText }}
            </p>
            <p v-else class="text-sm opacity-80">
              The updated workbook is ready — click or drag the icon to save it.
            </p>
          </div>
          <div
            v-if="downloadUrl"
            class="flex flex-col items-center justify-center bg-[#434c5e] p-4 rounded-lg border border-[#4c566a]"
          >
            <label class="block text-sm font-medium text-[#d8dee9] mb-2"
              >Output file</label
            >
            <a
              :href="downloadUrl"
              :download="filename"
              class="h-[42px] w-[42px] flex items-center justify-center rounded text-[#88c0d0] hover:bg-[#88c0d0] hover:text-[#2e3440] transition-colors cursor-grab active:cursor-grabbing"
              title="Download updated workbook"
              draggable="true"
              @dragstart="onDownloadDragStart"
            >
              <i class="pi pi-file-excel text-3xl"></i>
            </a>
          </div>
        </div>

        <h2 class="text-xl font-semibold text-[#88c0d0] mb-3">
          Changed cells ({{ changes.length }})
        </h2>
        <div
          v-if="changes.length > 0"
          class="max-h-72 overflow-auto custom-scrollbar rounded-lg border border-[#4c566a] mb-6"
        >
          <table class="w-full border-collapse text-left text-sm">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#4c566a] text-[#eceff4]">
                <th class="p-3 font-bold w-24">Row</th>
                <th class="p-3 font-bold w-40">Number</th>
                <th class="p-3 font-bold">Before</th>
                <th class="p-3 font-bold">After</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#4c566a]">
              <tr
                v-for="c in changes"
                :key="c.row"
                class="hover:bg-[#434c5e] transition-colors"
              >
                <td class="p-3 font-mono">B{{ c.row }}</td>
                <td class="p-3 font-mono">{{ c.number }}</td>
                <td class="p-3">
                  <span v-if="c.before === null || c.before === ''" class="opacity-60"
                    >(blank)</span
                  >
                  <span v-else>{{ c.before }}</span>
                </td>
                <td class="p-3 text-[#a3be8c]">{{ c.after }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm opacity-60 mb-6">No cells were changed.</p>

        <div class="flex items-center justify-between">
          <button
            @click="showFullLog = !showFullLog"
            class="text-sm text-[#88c0d0] hover:underline cursor-pointer"
          >
            {{ showFullLog ? "Hide log" : "Show full log" }}
          </button>
          <button
            @click="clear"
            class="bg-[#bf616a] text-[#2e3440] font-bold py-2 px-6 rounded hover:bg-[#d08770] cursor-pointer transition-colors"
          >
            Clear
          </button>
        </div>
        <div
          v-if="showFullLog"
          class="mt-4 bg-[#2e3440] rounded-lg border border-[#4c566a] p-3 font-mono text-xs text-left max-h-64 overflow-y-auto custom-scrollbar"
        >
          <div
            v-for="entry in logEntries"
            :key="entry.i"
            :class="logClass(entry.kind)"
          >
            B{{ entry.row }} · {{ entry.number }} · {{ entry.text }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
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
