import type {
  TaxReturn,
  TaxReturnCreate,
  FormData,
  CalculationResponse,
  GenerateResponse,
  FormInfo,
  FormSchema,
} from "@/types/tax";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ----------------------------------------------------------------
// Fetch helper
// ----------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("sb-access-token")
      : null;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ----------------------------------------------------------------
// Returns
// ----------------------------------------------------------------

export async function createReturn(data: TaxReturnCreate): Promise<TaxReturn> {
  return apiFetch<TaxReturn>("/returns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listReturns(): Promise<{ returns: TaxReturn[] }> {
  return apiFetch<{ returns: TaxReturn[] }>("/returns");
}

export async function getReturn(id: string): Promise<TaxReturn> {
  return apiFetch<TaxReturn>(`/returns/${id}`);
}

export async function deleteReturn(id: string): Promise<void> {
  return apiFetch<void>(`/returns/${id}`, { method: "DELETE" });
}

// ----------------------------------------------------------------
// Form Data
// ----------------------------------------------------------------

export async function getFormData(
  returnId: string,
  formName: string,
): Promise<FormData> {
  return apiFetch<FormData>(`/returns/${returnId}/forms/${formName}`);
}

export async function saveFormData(
  returnId: string,
  formName: string,
  data: Record<string, unknown>,
): Promise<FormData> {
  return apiFetch<FormData>(`/returns/${returnId}/forms/${formName}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

// ----------------------------------------------------------------
// Calculation
// ----------------------------------------------------------------

export async function calculateReturn(
  returnId: string,
): Promise<CalculationResponse> {
  return apiFetch<CalculationResponse>(`/returns/${returnId}/calculate`, {
    method: "POST",
  });
}

// ----------------------------------------------------------------
// PDF Generation
// ----------------------------------------------------------------

export async function generatePdfs(
  returnId: string,
): Promise<GenerateResponse> {
  return apiFetch<GenerateResponse>(`/returns/${returnId}/generate`, {
    method: "POST",
  });
}

export async function downloadPdf(
  returnId: string,
  filename: string,
): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("sb-access-token")
      : null;

  const res = await fetch(
    `${API_URL}/api/returns/${returnId}/download/${filename}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------
// Schema
// ----------------------------------------------------------------

export async function listFormSchemas(): Promise<FormInfo[]> {
  return apiFetch<FormInfo[]>("/schema/forms");
}

export async function getFormSchema(formName: string): Promise<FormSchema> {
  return apiFetch<FormSchema>(`/schema/forms/${formName}`);
}
