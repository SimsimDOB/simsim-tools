import api from "@/services/api";

export function useMultiSummonsesCount() {
  const countSummonses = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("pdfs", file);
    });

    const response = await api.post("/v1/multi-summonses-count", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  return {
    countSummonses,
  };
}
