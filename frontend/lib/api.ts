const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gr_token") : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail ? JSON.stringify(body.detail) : detail;
    } catch {
      /* no-op */
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (body: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
  }) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ access_token?: string; token?: string; user?: unknown }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) }
    ),

  // Restaurant
  createRestaurant: (body: Record<string, unknown>) =>
    request("/restaurant/create", { method: "POST", body: JSON.stringify(body) }),

  getGoogleReviewUrl: (restaurantId: string) =>
    request<{ google_review_link?: string; url?: string }>(
      `/restaurant/${restaurantId}/google-review-url`
    ),

  // QR
  generateQr: (restaurantId: string) =>
    request(`/qr/generate/${restaurantId}`, { method: "POST" }),

  // Review
  submitReview: (body: {
    restaurant_id: string;
    customer_name: string;
    rating: number;
    review_text: string;
  }) => request("/review/submit", { method: "POST", body: JSON.stringify(body) }),

  submitPrivateFeedback: (body: {
    restaurant_id: string;
    customer_name: string;
    rating: number;
    feedback_text: string;
  }) =>
    request("/review/private-feedback", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // AI
  generateReview: (body: {
    restaurant_id: string;
    rating: number;
    selected_tags: string[];
  }) => request("/ai/generate-review", { method: "POST", body: JSON.stringify(body) }),

  // Tags
  getTags: (restaurantId: string) =>
    request<string[] | { tags: string[] }>(`/tags/${restaurantId}`),

  // RAG
  addKnowledge: (body: { restaurant_id: string; content: string }) =>
    request("/rag/knowledge", { method: "POST", body: JSON.stringify(body) }),

  searchKnowledge: (body: { restaurant_id: string; query: string }) =>
    request<{ success: boolean; knowledge: unknown }>("/rag/search", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Dashboard
  getDashboard: (restaurantId: string) =>
    request(`/dashboard/${restaurantId}`),

  // Analytics
  getAnalytics: (restaurantId: string) =>
    request(`/analytics/${restaurantId}`),
};

export { ApiError, BASE_URL };
