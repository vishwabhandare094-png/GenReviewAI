import type { MetadataRoute } from "next";

const siteUrl = "https://genreviewai-frontend.onrender.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
