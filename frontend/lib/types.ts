export type Sentiment = "positive" | "negative" | "neutral" | string;

export interface Restaurant {
  id?: string;
  owner_id: string;
  restaurant_name: string;
  brand_name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  google_review_link: string;
  rating_threshold: number;
}

export interface DashboardMetrics {
  total_reviews: number;
  average_rating: number;
  positive_reviews: number;
  negative_reviews: number;
  neutral_reviews: number;
}

export interface RecentReview {
  customer_name?: string;
  rating: number;
  review_text?: string;
  sentiment?: Sentiment;
}

export interface DashboardResponse {
  success: boolean;
  metrics: DashboardMetrics;
  recent_reviews: RecentReview[];
}

export interface AiDraftResponse {
  drafts?: string[];
  [key: string]: unknown;
}
