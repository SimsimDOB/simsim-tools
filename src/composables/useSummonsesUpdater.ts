import axios from "axios";
import api from "@/services/api";

export type JobStatus = "running" | "done" | "cancelled" | "failed";

export type LogKind =
  | "skipped"
  | "changed"
  | "same"
  | "no_record"
  | "error"
  | "invalid"
  | "bad_date";

export interface Counts {
  looked_up: number;
  changed: number;
  no_record: number;
  skipped: number;
  errors: number;
}

export interface LogEntry {
  i: number;
  row: number;
  number: string;
  kind: LogKind;
  text: string;
}

export interface Change {
  row: number;
  number: string;
  before: string | null;
  after: string;
}

export interface Problem {
  row: number;
  reason: string;
}

export interface StartResponse {
  job_id: string;
  total_rows: number;
  filename: string;
  sheet: string;
}

export interface JobSnapshot {
  status: JobStatus;
  current_row: number;
  total_rows: number;
  counts: Counts;
  started_at: string;
  finished_at: string | null;
  error: string | null;
  log: LogEntry[];
  next: number;
  changes: Change[];
  problems: Problem[];
}

/** Human-readable text for a failed request: the API's `detail` when it is a plain string. */
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return error instanceof Error ? error.message : String(error);
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function useSummonsesUpdater() {
  const start = async (file: File): Promise<StartResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<StartResponse>(
      "/v1/summonses-updater",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  };

  const poll = async (jobId: string, after: number): Promise<JobSnapshot> => {
    const response = await api.get<JobSnapshot>(
      `/v1/summonses-updater/${jobId}`,
      { params: { after } },
    );
    return response.data;
  };

  const cancel = async (jobId: string): Promise<void> => {
    await api.delete(`/v1/summonses-updater/${jobId}`);
  };

  const download = async (jobId: string): Promise<Blob> => {
    const response = await api.get<Blob>(
      `/v1/summonses-updater/${jobId}/file`,
      { responseType: "blob" },
    );
    return response.data;
  };

  return { start, poll, cancel, download };
}
