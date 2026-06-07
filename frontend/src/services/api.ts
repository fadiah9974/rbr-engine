import { getBearerToken } from "@/lib/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ApiOptions = RequestInit & {
  token?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string | null;

  constructor(message: string, status: number, code?: string | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(path: string, options: ApiOptions = {}) {
  const { token, headers: optionHeaders, ...fetchOptions } = options;

  const headers = new Headers(optionHeaders);

  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", getBearerToken(token));
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Request gagal";

    const code =
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      typeof data.code === "string"
        ? data.code
        : null;

    throw new ApiError(message, response.status, code);
  }

  return data as T;
}

export type ApiDataResponse<T> =
  | T
  | {
      message?: string;
      data: T;
    };

export function unwrapData<T>(response: ApiDataResponse<T>): T {
  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    "data" in response
  ) {
    return response.data;
  }

  return response as T;
}