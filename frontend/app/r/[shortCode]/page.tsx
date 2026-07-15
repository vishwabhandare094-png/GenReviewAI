import CustomerFlowClient from "./CustomerFlowClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "https://genreviewai-backend.onrender.com";

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
