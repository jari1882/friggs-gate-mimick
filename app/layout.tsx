import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { content } from "./config/content";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: content.app.title,
  description: "Central interface to the Life Nervous System cognitive architecture",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${montserrat.className} h-full`}>
        <div
          className="flex flex-col h-full"
          style={{ background: "#ffffff" }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
