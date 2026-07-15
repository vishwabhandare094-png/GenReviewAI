import { Metadata } from "next";
import CustomerFlowClient from "./CustomerFlowClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "https://genreviewai-backend.onrender.com";

type Props = {
  params: { shortCode: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.shortCode;
  if (!code || code === "_") {
    return {
      title: "Rate & Review | GenReviewAI",
      description: "Scan your receipt QR code and rate your dining experience."
    };
  }
  
  try {
    const res = await fetch(`${BASE_URL}/restaurant/short-code/${code}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.restaurant) {
        const name = data.restaurant.restaurant_name || "Restaurant";
        return {
          title: `Rate & Review ${name} | GenReviewAI`,
          description: `Help ${name} improve! Share your experience, rate food and service, and get AI-drafted Google reviews.`,
          openGraph: {
            title: `Rate & Review ${name} | GenReviewAI`,
            description: `Share your dining experience at ${name}. Rate food, service, and draft reviews.`,
          }
        };
      }
    }
  } catch (e) {
    console.error("Error generating dynamic metadata:", e);
  }
  
  return {
    title: "Rate & Review | GenReviewAI",
    description: "Scan your receipt QR code and rate your dining experience."
  };
}

export async function generateStaticParams() {
  const params = [{ shortCode: "_" }];
  try {
    const res = await fetch(`${BASE_URL}/restaurant/short-codes`, {
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const code of data) {
          params.push({ shortCode: code });
        }
      }
    }
  } catch (e) {
    console.error("Error fetching static params:", e);
  }
  return params;
}

export default function CustomerFlowPage() {
  return <CustomerFlowClient />;
}
