import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/user/", "/api/"],
    },
    sitemap: "https://vksautoservices.org/sitemap.xml",
  };
}
