import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "邻剪｜社区理发排队平台",
    description: "附近找理发师、当天线上取号、动态查看进度，排到再出发。",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "邻剪｜排到再出发",
      description: "社区理发实时排队平台",
      type: "website",
      images: [{ url: imageUrl, width: 1680, height: 945, alt: "邻剪社区理发排队平台" }],
    },
    twitter: { card: "summary_large_image", title: "邻剪｜排到再出发", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
