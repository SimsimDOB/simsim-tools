import api from "@/services/api";

export function usePdfMerge() {
  const mergePdfs = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post("/v1/pdf-merge", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    });

    return response.data;
  };

  return {
    mergePdfs,
  };
}
