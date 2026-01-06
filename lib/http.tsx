import envConfig from "@/next.config";

export interface CustomOptions {
  headers?: HeadersInit;
  baseUrl?: string;
  cache?: RequestCache;
}

export type HttpResponse<T> = {
  status: number;
  payload: T;
};

export type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

export type JsonBody = Record<string, any>;

export type RequestBody =
  | JsonBody
  | FormData
  | string
  | URLSearchParams
  | Blob
  | null;

export class HttpError<T = unknown> extends Error {
  status: number;
  payload: T;

  constructor(status: number, payload: T, message = "Http Error") {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError<EntityErrorPayload> {
  constructor(payload: EntityErrorPayload) {
    super(422, payload, payload.message);
  }
}

async function request<Response>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  options?: CustomOptions,
  body?: RequestBody
) {
  const isFormData = body instanceof FormData;
  const isBodyInit =
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof URLSearchParams;

  const headers: HeadersInit = {
    ...(isFormData || isBodyInit || body == null
      ? {}
      : { "Content-Type": "application/json" }),
    ...options?.headers,
  };

  const fetchBody: BodyInit | null =
    body == null
      ? null
      : isFormData || isBodyInit
        ? body
        : JSON.stringify(body);

  const baseUrl =
    (options?.baseUrl ?? process.env.NEXT_PUBLIC_API_ENDPOINT) ||
    "http://localhost:3001";
  console.log({baseUrl});
  const fullUrl = url.startsWith("/")
    ? `${baseUrl}${url}`
    : `${baseUrl}/${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: fetchBody,
    cache: options?.cache,
    next: options?.cache === "force-cache" ? { revalidate: 30 } : undefined,
  });

  const payload = await res.json();

  if (!res.ok) {
    return {
      status: res.status,
      payload: null,
      mess: "Lỗi khi fetch dữ liệu",
    };
  }

  return {
    status: res.status,
    payload,
  };
}

const http = {
  get<Response>(url: string, options?: CustomOptions) {
    return request<Response>("GET", url, options);
  },

  post<Response>(url: string, body?: RequestBody, options?: CustomOptions) {
    return request<Response>("POST", url, options, body);
  },

  put<Response>(url: string, body?: RequestBody, options?: CustomOptions) {
    return request<Response>("PUT", url, options, body);
  },

  del<Response>(url: string, options?: CustomOptions) {
    return request<Response>("DELETE", url, options);
  },
};

export default http;
