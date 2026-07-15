import CustomerFlowClient from "./CustomerFlowClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export async function generateStaticParams() {
  const params = [{ restaurantId: "_" }];
  try {
    const res = await fetch(`${BASE_URL}/restaurant/short-codes`, {
      next: { revalidate: 0 }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const code of data) {
          params.push({ restaurantId: code });
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
