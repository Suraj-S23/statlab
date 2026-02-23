import type { UploadResponse } from "../types"

const BASE_URL = "http://localhost:8000/api"

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }

  return response.json()
}