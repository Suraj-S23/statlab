export interface Column {
  name: string
  type: "numeric" | "categorical"
  missing: number
}

export interface UploadResponse {
  filename: string
  rows: number
  columns: Column[]
  preview: Record<string, string | number>[]
}